---
type: task
status: pending
priority: high
createdAt: 2026-08-20T23:28:10.939Z
---

# reap.cc/docs/* 가 전부 HTTP 404 를 반환한다 — 문서 사이트가 검색에서 부재하다

## 재현

2026-08-21 측정. `curl -s -o /dev/null -w '%{http_code}' -L <url>`:

```
404  https://reap.cc/docs/introduction
404  https://reap.cc/docs/quick-start
404  https://reap.cc/docs/code-intelligence
404  https://reap.cc/docs/daemon        (존재하지 않는 라우트 — 같은 답)
200  https://reap.cc/
```

**존재하는 라우트와 존재하지 않는 라우트가 구분되지 않는다.** 브라우저에서는 SPA 가 부팅해 화면이
정상적으로 뜨므로 사람 눈에는 보이지 않는다. 바뀌는 것은 status 뿐이다.

## 원인

`.github/workflows/docs.yml` 이 빌드 산출물의 `index.html` 을 `404.html` 로 복사한다 (SPA fallback).
GitHub Pages 는 알 수 없는 경로에 `404.html` 을 내려주되 **HTTP status 는 404 로** 준다.
`docs/` 는 wouter 기반 클라이언트 라우팅이라 서버에는 `/docs/*` 에 해당하는 파일이 없고,
따라서 모든 문서 URL 이 fallback 경로를 탄다.

## 영향

- **검색엔진은 404 를 색인하지 않는다.** 문서 사이트가 검색에서 사실상 부재한다.
- README 5개(`README.md` + 4 로케일)가 `reap.cc/docs/*` 링크를 10개 넘게 건다.
- npm 패키지 페이지가 영문 README 를 그대로 싣는다 — npm 방문자가 보는 링크도 같다.
- 링크 검사기·크롤러·사내 위키 등 status 를 보는 모든 도구가 죽은 링크로 판정한다.

## 해법 후보

1. **라우트별 프리렌더** — 빌드 시 각 `/docs/<slug>/index.html` 을 생성. Pages 를 유지하면서
   200 을 돌려주는 유일한 방법. 라우트 목록이 필요하고 `App.tsx` 와 동기화돼야 한다
   (`tests/unit/docs-wiring.test.ts` 가 이미 그 목록을 파싱한다 — 재사용 가능).
2. **Pages 이탈** — Cloudflare Pages / Netlify 등 SPA rewrite(200)를 지원하는 호스팅.
   `CNAME` 과 배포 워크플로 교체.
3. **hash 라우팅** (`/#/docs/...`) — 가장 싸지만 URL 이 나빠지고 기존 링크가 전부 깨진다.

권고는 1번이다. 호스팅을 그대로 두면서 status 만 고치고, README 링크가 그대로 산다.

## 왜 5개월 넘게 안 걸렸는가

**어떤 게이트도 배포된 사이트에 HTTP 요청을 보내지 않는다.**

- `ci.yml` — build + 자기진단. 로컬 산출물만 본다
- `release.yml` — 문서 *정합성*(`check-docs-version.sh`)만 본다. 버전 문자열 비교이지 접근성이 아니다
- `docs.yml` — 빌드하고 배포한다. 배포 결과를 되묻지 않는다
- `tests/unit/docs-wiring.test.ts`(gen-095 신설) — 소스의 라우트/링크 정합성만 본다

즉 **소스는 전부 옳고 배포된 것만 틀린** 종류이며, 그 축을 보는 검사가 하나도 없다.
고칠 때 **배포 후 대표 URL 몇 개의 status 를 확인하는 단계**를 `docs.yml` 끝에 함께 넣을 것 —
그것이 없으면 같은 결함이 조용히 재발한다.

## 부수 사실

gen-095 가 `/docs/daemon` → `/docs/code-intelligence` 개명을 하면서, 개명을 3세대 동안 막고 있던
`DaemonPage.tsx` 의 문장 *"renaming it would 404 every link that already points here"* 를 검토했다.
**그 문장의 실질은 옳았고 근거로 든 단어(404)만 틀렸다** — 404 본문이 SPA 셸이므로 `/docs/daemon` 은
**오늘 정상 렌더되고** 개명 후 NotFound 가 된다. status 는 이 질문을 판정하지 못한다.

이것이 이 결함의 두 번째 얼굴이다: **status 가 내용과 무관해지면, 라우트의 존재 여부를 status 로
확인하려는 모든 시도가 조용히 무의미해진다.** 위 해법으로 status 를 고치면 그 판정 수단도 함께 돌아온다.

## Problem

`reap.cc` 의 **모든 문서 URL 이 HTTP 404 를 반환한다.** 화면은 정상이므로 사람은 눈치채지 못하고,
status 를 보는 것(검색엔진 크롤러·링크 검사기·사내 위키)만 영향을 받는다. 결과적으로 문서 사이트가
검색에서 사실상 부재하며, README 5개와 npm 패키지 페이지가 거는 링크가 전부 죽은 링크로 판정된다.
`https://reap.cc/` 루트만 200 이다. 위 § 재현 · § 원인 · § 영향 참조.

## Solution

**권고: 라우트별 프리렌더.** 빌드 시 각 `/docs/<slug>/index.html` 을 생성해 GitHub Pages 가 실제
파일을 200 으로 내려주게 한다. 호스팅을 그대로 두면서 status 만 고치고 README 링크가 그대로 산다.

라우트 목록은 **`docs/src/App.tsx` 의 `<Route path="...">` 에서 파싱**한다 — 목록을 두 곳이 알면
어긋난다. `tests/unit/docs-wiring.test.ts` 의 `declaredRoutes()` 가 이미 그 파싱을 갖고 있으므로
재사용한다.

대안 2종: **Pages 이탈**(Cloudflare Pages / Netlify — SPA rewrite 를 200 으로 지원. `CNAME` 과
배포 워크플로 교체) / **hash 라우팅**(`/#/docs/...` — 가장 싸지만 URL 이 나빠지고 기존 링크가 전부 깨진다).

**고칠 때 반드시 함께 넣을 것**: 배포 후 대표 URL 몇 개의 status 를 확인하는 단계를 `docs.yml` 끝에
추가한다. **지금 어떤 게이트도 배포된 사이트에 HTTP 요청을 보내지 않아 5개월 넘게 잡히지 않았다** —
그 축을 만들지 않으면 같은 결함이 조용히 재발한다.

## Files to Change

| 경로 | 무엇을 |
|---|---|
| `.github/workflows/docs.yml` | `cp index.html 404.html` 를 프리렌더 단계로 대체(또는 병행) + 배포 후 status 확인 단계 추가 |
| `docs/vite.config.ts` | 프리렌더 플러그인 또는 `build.rollupOptions.input` 다중 진입점 설정 |
| `docs/src/App.tsx` | 라우트 목록의 **단일 소유자**. 변경 없이 파싱 대상으로만 쓴다 |
| `tests/unit/docs-wiring.test.ts` | `declaredRoutes()` 를 프리렌더 대상 목록과 대조하는 단언 추가 — 라우트를 추가하고 프리렌더를 빠뜨리면 red |
| `docs/public/CNAME` | Pages 이탈(대안 2)을 택할 때만 |
