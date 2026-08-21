---
type: task
status: consumed
priority: medium
createdAt: 2026-08-20T23:28:10.939Z
consumedBy: gen-096-c749d5
consumedAt: 2026-08-21T01:55:44.302Z
---

# docs 사이트가 페이지별 HTML 을 내지 않는다 — prerender 가 필요하다

## 문제

`docs/` 는 Vite + React + wouter SPA 이고 GitHub Pages 로 배포된다. 라우팅이 전부 클라이언트에서 일어나므로 **서버가 내는 것은 25개 라우트 전부 동일한 939바이트 셸 하나**다.

```
$ curl -sI https://reap.cc/docs/quick-start
HTTP/2 404
server: GitHub.com

$ for u in /docs/quick-start / /아무거나xyz; do curl -s https://reap.cc$u | wc -c; done
939
939
939
```

404 는 `.github/workflows/docs.yml` 의 `cp docs/dist/public/index.html docs/dist/public/404.html` 때문이다 — SPA 라우팅을 위한 표준 GitHub Pages 우회이고, Pages 는 알 수 없는 경로에 `404.html` 을 **404 status 로** 내려준다.

**브라우저에서는 정상으로 보인다.** 셸이 부팅해 wouter 가 클라이언트에서 라우팅하므로 사람 눈에는 완전한 페이지다. 존재하지 않는 `/아무거나xyz` 도 마찬가지다.

## 실제 손해 — 측정된 것과 미측정을 구분한다

**측정됨**:
- `reap.cc/` 루트만 검색에 잡힌다. `/docs/*` 는 잡히지 않는다 (2026-08-21 실측)
- `docs/index.html` 의 `<title>` 이 `REAP` 하나뿐이다. **25개 페이지가 전부 같은 제목이고 meta description 이 없다**
- README 5개가 거는 `reap.cc/docs/*` 링크가 링크 검사 도구에서 전부 broken 으로 보고된다

**미측정**:
- 검색 유입이 실제로 얼마나 되는지, 따라서 색인 부재가 얼마나 손해인지. `priority: high` 로 잡았다가 이 근거로 medium 으로 낮췄다
- 브라우저 외 클라이언트(소셜 미리보기 fetcher, 문서 수집기)가 404 를 어떻게 다루는지

**status 를 고치는 것만으로는 절반이다.** 호스팅을 Cloudflare Pages 로 옮기면 SPA fallback 을 200 으로 낼 수 있지만, **본문은 여전히 25페이지가 동일**하고 제목도 전부 `REAP` 다. 크롤러가 받는 것이 달라지지 않는다.

## 해법 — 기존 앱에 prerender 단계 추가

빌드 때 `react-dom/server` 로 25개 라우트를 렌더해 `dist/public/<route>/index.html` 로 떨군다. 실제 파일이 있으면 GitHub Pages 가 200 + 그 파일을 낸다.

얻는 것: status 200 · 페이지별 실제 본문 · 페이지별 `<title>`/meta. 유지되는 것: 라우팅·컴포넌트·i18n·호스팅 전부.

필요한 작업:
- 빌드 스크립트 하나 — 라우트 목록 + wouter 의 `<Router ssrPath>` + `renderToString`
- SSR 위험 2파일 가드 — `docs/src/components/LanguageSelector.tsx`, `docs/src/components/ui/sidebar.tsx` 가 `window`/`document` 를 직접 만진다
- `404.html` 은 그대로 둔다 — 그때는 **진짜 없는 경로**에만 쓰이므로 올바른 동작이 된다

**추가일 뿐 재작성이 아니다.** 되돌리려면 빌드 스크립트에서 그 단계만 빼면 된다.

### 프레임워크 교체는 권하지 않는다

- **Next.js** — `output: 'export'` 로 결국 같은 SSG 결과에 도달하는데, 거기까지 wouter → app router 전환 + 파일 기반 라우팅으로 25페이지 재배치 + i18n 재배선이 필요하다. 같은 결과를 위한 재작성이고 얻는 Next 기능(서버 액션·ISR·미들웨어)은 정적 문서 사이트에 쓸 데가 없다
- **Astro** — 문서 사이트로는 장기적으로 더 나은 선택이지만 콘텐츠가 MD 가 아니라 **TS 객체**(`docs/src/i18n/translations/*.ts`)다. 25페이지 × 5로케일을 MD 로 재구조화해야 하고, gen-094·095 가 그 번역 파일을 방금 정비했다

## 함께 정할 것 — 로케일 URL

지금 5개 언어가 **한 URL 을 공유**하고 로케일은 `localStorage` + `navigator.language` 로 클라이언트에서 정해진다. 따라서 검색은 어차피 한 언어만 색인한다.

- **A** — `en` 으로 prerender 하고 클라이언트가 바꾼다. 라우트 25개 유지. 나머지 4개 언어는 계속 색인되지 않는다
- **B** — `/ko/docs/...` 처럼 URL 을 나눈다. 다국어 SEO 의 정석이지만 라우트가 25 → 125 가 되고 언어 전환 UI 가 URL 을 바꿔야 한다

이 결정이 prerender 스크립트의 모양을 정하므로 착수 전에 답해야 한다.

## 검사가 없다는 사실

**배포된 사이트에 HTTP 요청을 보내는 게이트가 하나도 없다.** 그래서 이 상태가 얼마나 오래 지속됐는지 알 수 없고, 고친 뒤에도 다시 깨지면 아무도 모른다. prerender 를 넣는다면 **각 라우트가 200 과 고유 `<title>` 을 내는지 확인하는 검사**를 같이 만든다 — 그것이 없으면 이 backlog 는 다시 열린다.
