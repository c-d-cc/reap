# 02 — Planning (gen-096-c749d5)

**Clarity**: High (01-learning.md § Clarity Level). 질문 최소화·자율 실행. 단 아래 § 사용자에게 보고하는
판단 3건은 명시하고 team lead 에 보고한다.

---

## Spec

### 목표

빌드 때 전 라우트 × 전 로케일을 `react-dom/server` 로 렌더해 `docs/dist/public/<route>/index.html` 로
떨구고, 로케일을 URL 로 분리한다. 앱·라우팅·컴포넌트·i18n·호스팅은 유지한다 — **추가이지 재작성이 아니다**.

### 확정된 URL 형태

```
영어    /                      /docs/quick-start          ← 접두사 없음. 기존 URL 유지
한국어  /ko                    /ko/docs/quick-start
일본어  /ja                    /ja/docs/quick-start
독일어  /de                    /de/docs/quick-start
중국어  /zh-CN                 /zh-CN/docs/quick-start
```

**영어에 `/en/` 을 붙이지 않는 이유는 검증 가능하다** — `README*.md` 5개가 `https://reap.cc/docs/*` 를
직접 걸고 그 README 는 npm tarball 에 실린다. `grep -n "reap.cc" README*.md` 로 15개 링크 × 5 파일 확인.

라우트 23 × 로케일 5 = **115 페이지**. (브리핑의 125 는 라우트를 25 로 본 데서 나왔고, 실측은 23이다.)

### 접근 — 라우트를 늘리지 않고 `<Router base>` 로 분리한다

wouter 의 `relativePath(base, path)` 가 base 를 잘라내고 `<Link>` 는 `router.base + href` 로 링크를
만든다 (01-learning.md § 2, `node_modules/wouter/src/paths.js` 실측). 따라서:

- `<Router base="/ko" ssrPath="/ko/docs/quick-start">` → 안쪽 `<Switch>` 의 라우트 23개를 **그대로** 사용
- 사이드바·네비바의 모든 `<Link href="/docs/x">` 가 **자동으로** `/ko/docs/x` 를 가리킨다
- 클라이언트는 `location.pathname` 에서 같은 base 를 잘라내므로 **서버·클라이언트가 대칭**이다
  → 하이드레이션 일치가 설계로 보장된다

라우트를 115개로 선언하는 대안은 채택하지 않는다 — 유지 대상이 5배가 되고 얻는 것이 없다.

---

## Functional Requirements

| # | 요구 | 검증 |
|---|---|---|
| FR1 | 빌드가 23 라우트 × 5 로케일 = 115개 `<route>/index.html` 을 생성한다 | 층1 게이트 파일 수 |
| FR2 | 각 HTML 이 실제 렌더 본문을 담는다 (셸 939바이트가 아니다) | 층1 게이트 크기 하한 |
| FR3 | 각 HTML 이 페이지별 `<title>` 을 갖고 로케일 안에서 고유하다 | 층1 게이트 중복 검사 |
| FR4 | description 원본 문자열이 있는 라우트는 `meta description` 을 낸다 | 층1 게이트 |
| FR5 | `<html lang>` 이 로케일별로 정확하다 | 층1 게이트 |
| FR6 | 같은 페이지의 5개 로케일이 `hreflang` 으로 상호 링크되고 `x-default` 를 포함한다 (6개) | 층1 게이트 |
| FR7 | `sitemap.xml`(115 `<loc>`) 과 `robots.txt` 가 빌드 산출물에 생성된다 | 층1 게이트 |
| FR8 | 언어 전환이 같은 페이지의 다른 로케일 **URL 로 이동**하고, 로케일은 URL 에서만 결정된다 | unit + 코드 |
| FR9 | 영어 URL 이 접두사 없이 유지된다 | 층1 게이트 경로 단언 |
| FR10 | 배포 후 각 URL 이 200 + 고유 `<title>` 을 내는지 확인하는 검사가 존재한다 | 층2 스크립트 |

## Completion Criteria

1. `npm run build` (docs) 가 115개 라우트 HTML + `sitemap.xml` + `robots.txt` 를 낸다 — 파일 수·크기 실측
2. 로케일 내 `<title>` 이 전부 고유하고, 모든 HTML 이 셸보다 크다
3. `<html lang>` 과 hreflang 6개가 로케일별로 정확하다
4. 영어 라우트가 접두사 없이 `dist/public/docs/<slug>/index.html` 에 놓인다
5. `localStorage` 로케일 결정이 제거되고 URL 이 유일한 원천이다
6. **층1 게이트가 이 세대에서 fail → pass 로 관측된다** (negative first)
7. 기존 게이트 전종 통과 + 테스트 baseline 유지 (unit 640 / e2e 329 / scenario 44 — 재실측 후 갱신)

---

## 사용자에게 보고하는 판단 3건

### (a) `localStorage` 로케일 기억을 **제거한다**

team lead 가 내 판단에 맡긴 항목. 제거를 택한다.

- URL 이 진실의 원천이라면 `localStorage` 는 **두 번째 원천**이 된다. `/ko/docs/…` 를 열었는데 저장값이
  `de` 인 상황을 만들지 않는 유일한 방법은 저장값을 안 읽는 것이다
- `navigator.language` 자동 선택도 함께 제거한다. 검색엔진 권고가 자동 리디렉션 반대이고, 무엇보다
  01-learning.md § 1 의 부수 발견 — 지금은 **주변 환경**이 로케일을 정한다 — 이 그대로 남는다
- **기존 버그가 함께 사라진다**: `detectLocale` 의 저장값 검사가 `"de"` 를 빠뜨려
  (`stored === "en" || "ko" || "ja" || "zh-CN"`) 독일어를 고른 사용자는 새로고침마다 잃었다
- **비용**: 한국어 브라우저로 `/` 에 오면 영어가 뜬다. 전환은 네비바 우측 셀렉터 한 번.
  이것이 받아들일 수 없다면 되돌리는 방법은 "루트에서만 `navigator.language` 로 1회 리디렉션"이며
  별도 판단거리다 (Next Generation Hints)

### (b) `404.html` — 워크플로의 `cp` 를 지시대로 유지하되, 남는 흠을 적어둔다

`.github/workflows/docs.yml` 의 `cp dist/public/index.html dist/public/404.html` 는 **지우지 않는다**
(team lead 지시). prerender 후 `index.html` 은 영어 Hero 페이지이므로 `404.html` 도 Hero 마크업이 된다.

결과: 진짜 없는 경로에서 **404 status + Hero 본문**이 나가고, 클라이언트는 하이드레이션 불일치를 만나
React 19 가 클라이언트 렌더로 폴백해 NotFound 를 그린다. **최종 화면은 지금과 같고** status 도 지금과
같다. 남는 것은 그 URL 들에서의 콘솔 경고와, 크롤러가 404 와 함께 Hero 본문을 받는다는 점이다.

더 깨끗한 형태는 NotFound 를 prerender 해 `404.html` 로 쓰고 `cp` 를 없애는 것이지만 지시와 충돌하므로
하지 않는다. Next Generation Hints 에 남긴다.

### (c) description 원본이 없는 라우트 4개는 **description 을 내지 않는다**

"문구를 지어내지 말라"는 지시를 따른다. 실측 결과 라우트 23개 중 4개가 페이지를 서술하는 기존 문자열을
갖고 있지 않다:

| 라우트 | 번역 키 | 가진 필드 |
|---|---|---|
| `/docs/quick-start` | `quickstart` | title, breadcrumb 뿐 |
| `/docs/core-concepts` | `concepts` | title, breadcrumb (+ `fourAxisDesc` — 절 설명이고 콜론으로 끝난다) |
| `/docs/release-notes` | `releaseNotes` | title, breadcrumb 뿐 |
| `/docs/advanced` | `advanced` | title, breadcrumb (+ `signatureDesc` — 한 절만 설명) |

`/docs/comparison` 은 `t.comparison.desc` 라는 온전한 문장이 있어 쓴다.

→ 이 4개(× 5 로케일 = 20 페이지)는 `<title>` 만 갖고 `meta description` 이 없다. 검색엔진은 본문에서
스니펫을 만든다. 5개 언어로 새 문구를 쓰는 것은 이 세대의 scope 가 아니며 **사용자 판단거리**다.

---

## Additional Findings

### 라우트 목록의 세 번째 사본을 만들지 않는다

지금 라우트는 `App.tsx`(23개 `<Route>`)와 `AppSidebar.tsx`(`href` 21개) 두 곳에 있고,
`tests/unit/docs-wiring.test.ts` 가 **그 불일치를 잡으려고** 존재한다. prerender 스크립트가 목록을 또
가지면 세 번째 사본이 된다.

genome (`application.md` § 표식보다 공유가 낫다) 이 "같은 값을 두 코드가 알면 하나가 소유하고 나머지가
import 한다"를 처방하므로 **`docs/src/routes.ts` 를 단일 소유자**로 만들고 `App.tsx` 와 prerender 가
함께 읽는다. 사이드바는 사람이 고르는 순서·그룹을 담으므로 여전히 별개이며, `docs-wiring.test.ts` 가
그 둘을 계속 대조한다 (대조 대상이 App.tsx → routes.ts 로 바뀐다).

### 모든 로직을 `src/` 에 두고 드라이버는 얇게

`docs/tsconfig.json` 의 `include` 가 `["src/**/*"]` 다 — `docs/scripts/` 는 **타입체크되지 않는다**.
따라서 렌더·메타·sitemap 생성은 전부 `docs/src/entry-server.tsx` (타입체크됨)에 두고,
`docs/scripts/prerender.mjs` 는 "받은 것을 파일로 쓴다"만 한다.

### 사이트 origin 은 CNAME 이 소유한다

`docs/public/CNAME` = `reap.cc`. canonical·hreflang·sitemap 에 필요한 origin 을 상수로 또 적으면
carrier 가 하나 늘어난다. 드라이버가 CNAME 을 읽어 `renderAll(origin)` 으로 **주입**한다 — 표식이 아니라
공유다.

### `<head>` 주입은 마커로 하고, 치환 실패는 fail closed

빌드된 `dist/public/index.html` 에 문자열 치환으로 주입한다. 마커가 없으면 조용히 셸이 나가므로
**세 치환 각각이 실제로 일어났는지 단언**하고 아니면 빌드를 실패시킨다 (gen-085 교훈: 어느 입력이 검사를
fail open 시키는지 먼저 묻는다).

- `<html lang="en"` → `<html lang="<locale>"`
- `<!--app-head-start-->…<!--app-head-end-->` → title·description·canonical·hreflang·og 블록
- `<div id="root"></div>` → `<div id="root">…</div>`

`class="dark"` 는 `index.html` 에 정적으로 넣는다 — 지금은 `useEffect` 로 붙으므로 prerender 결과에
없고, 없으면 첫 페인트가 밝은 테마로 번쩍인다.

### 하이드레이션 진입점

`main.tsx` 는 `#root` 에 자식이 있으면 `hydrateRoot`, 없으면 `createRoot` 를 쓴다 — dev 서버(`vite dev`)의
`index.html` 은 `#root` 가 비어 있으므로 분기가 필요하다.

### 층2 검사는 **지금 fail 을 관측할 수 있다**

현재 배포본 실측 (2026-08-21T11:1x+0900):

```
$ curl -sL -o /dev/null -w "%{http_code} %{url_effective} redirects=%{num_redirects}" https://reap.cc/docs/quick-start
404 https://reap.cc/docs/quick-start redirects=0
$ curl -s -o /dev/null -w "%{http_code}" https://reap.cc/sitemap.xml
404
```

따라서 층2 스크립트를 만든 직후 **살아있는 배포본에 돌려 FAIL 을 관측**할 수 있다 — 이것이 그 검사가
결함을 실제로 잡는다는 증거다. **관측할 수 없는 것은 PASS 다** (배포 전이므로). 그 구분을 스크립트 주석과
validation artifact 에 그대로 적는다.

### 트레일링 슬래시는 **미측정**이다

`dist/public/docs/quick-start/index.html` 형태로 쓰면 GitHub Pages 가 `/docs/quick-start` 를
`/docs/quick-start/` 로 301 할 수 있다. **확인할 방법이 배포 전에는 없다** — 위 실측은 파일이 없어서 난
404 라 리디렉션 동작을 말해주지 않는다. 어느 쪽이든 README 링크는 살아 있다(200 또는 301→200). 층2 검사는
`-L` 로 최종 status 를 보고 **실제 최종 URL 을 출력**해 다음 세대가 추측 대신 사실을 갖게 한다.

canonical·hreflang·sitemap 은 **슬래시 없는 형태**(README·내부 `<Link>` 와 같은 형태)를 쓴다.

---

## Tasks

- [ ] T001 `docs/src/i18n/locale-path.ts` 신설 — `LOCALE_PREFIXES` / `localePrefix()` / `parseLocalePath()` / `localeHref()`. 순수 문자열 함수만, import 는 `./types` 뿐 (bun 이 직접 import 할 수 있게). **테스트: unit (신규)**
- [ ] T002 `docs/src/i18n/context.tsx` — `LanguageProvider({ locale, children })` 로 변경, `detectLocale`·`localStorage`·`STORAGE_KEY` 삭제. **SSR 크래시의 원인 제거**. **테스트: 층1 게이트가 렌더 성공으로 간접 판정**
- [ ] T003 `docs/src/routes.ts` 신설 — 23개 `{ path, component, meta(t) }` 매니페스트. 라우트 목록의 단일 소유자. **테스트: unit (docs-wiring 갱신)**
- [ ] T004 `docs/src/App.tsx` — 매니페스트에서 `<Route>` 생성, `App({ locale, ssrPath? })`, `<Router base={prefix} ssrPath={ssrPath}>`, `LanguageProvider` 에 locale 전달. **테스트: 층1**
- [ ] T005 `docs/src/main.tsx` — `parseLocalePath(location.pathname)` 로 locale 결정, `#root` 에 자식 있으면 `hydrateRoot` 아니면 `createRoot`. **테스트: 수동(dev 서버) + 층1 이 마크업 존재를 보장**
- [ ] T006 `docs/src/components/LanguageSelector.tsx` — 버튼 대신 `<a href={localeHref(l, currentPath)}>`. 크롤러가 따라갈 수 있는 실제 링크가 된다. **테스트: 층1 (렌더된 HTML 에 5개 로케일 링크 존재)**
- [ ] T007 `docs/index.html` — `<!--app-head-start-->…<!--app-head-end-->` 마커 추가, `<html lang="en" class="dark">`. **테스트: 층1 (치환 단언)**
- [ ] T008 `docs/src/entry-server.tsx` 신설 — `renderPage(route, locale, origin)` / `renderAll(template, origin)` / `buildSitemap(origin)` / `ROBOTS_TXT`. 메타·hreflang·og·치환 단언 전부 여기. **테스트: 층1**
- [ ] T009 `docs/scripts/prerender.mjs` 신설 — CNAME 읽기 → 빌드된 `index.html` 템플릿 읽기 → `renderAll()` → 파일 쓰기. I/O 만. **테스트: 층1**
- [ ] T010 `docs/package.json` — `build` = `vite build && vite build --ssr src/entry-server.tsx --outDir dist/server && node scripts/prerender.mjs`. **테스트: 층1**
- [ ] T011 `.github/workflows/docs.yml` — `npx vite build` → `npm run build`, 그 뒤 층1 게이트 실행. `cp … 404.html` 는 **그대로 둔다**. **테스트: 독해 (CI 는 이 세대에서 안 돈다)**
- [ ] T012 `scripts/check-docs-prerender.sh` 신설 — **층1**. docs 빌드 산출물을 검사: 115 파일 · 크기 하한 · 로케일 내 title 고유 · `<html lang>` · hreflang 6 · sitemap `<loc>` 115 · robots · 영어 무접두사. **테스트: 이 세대에서 실행 + negative**
- [ ] T013 `scripts/check-docs-live.sh` 신설 — **층2**. 배포본에 HTTP. pass / FAIL / amber SKIP 3분기. 언제 처음 도는지를 주석에 명시. **테스트: 현재 배포본에 실행해 FAIL 관측 (negative)**
- [ ] T014 `tests/unit/docs-wiring.test.ts` 갱신 (submodule) — 대조 대상을 App.tsx → `routes.ts` 로, 사이드바 href 대조 유지, `locale-path.ts` 순수 함수 테스트 추가. **테스트: `npm run test:unit`**
- [ ] T015 negative — T012 를 prerender 이전 상태에서 돌려 fail 확인, 그리고 개별 단언마다 값을 일부러 깨뜨려 red 확인 후 복원. T013 은 현재 배포본에서 fail 확인
- [ ] T016 기존 게이트 전종 — `npm run typecheck` · `npm run typecheck:docs` · `npm run build` · unit/e2e/scenario · `check-self-diagnosis.sh` · `check-docs-version.sh` · `reap fix --check` · `list-carriers.sh --orphans`

### 의존 순서

```
T001 ─┬─ T002 ─┐
      └─ T006  │
T003 ───────── T004 ── T005
                 │
T007 ── T008 ────┴── T009 ── T010 ── T011
                              │
                              ├── T012 ── T015
                              └── T013 ──┘
T003/T001 ── T014
전부 ── T016
```

### 영향받는 기존 테스트

- **`tests/unit/docs-wiring.test.ts`** — `declaredRoutes()` 가 `App.tsx` 의 `<Route path="…">` 를 정규식으로 읽는다. T003/T004 후 App.tsx 에 그 리터럴이 사라지므로 **반드시 갱신**해야 하고, 갱신하지 않으면 "there is something to check" 가 red 가 된다 (그 테스트가 자기증명형으로 설계된 덕이다). `tests/` 는 submodule 이므로 안에서 먼저 커밋하고 `git add tests`
- **`scripts/check-docs-version.sh`** — 번역 파일의 `releaseNotes` 배열만 읽는다. 번역 구조를 건드리지 않으므로 무관. 그래도 T016 에서 돌린다
- **`scripts/check-self-diagnosis.sh`** — docs 와 무관하나 T016 에서 돌린다 (회귀 확인)

## Echo Chamber — 자율 추가 표기

- **`[autonomous]` OpenGraph / twitter:card 메타** — goal 의 "페이지별 메타" 직접 인과 범위 안이라고 판단.
  `docs/public/opengraph.jpg` 가 **이미 있는데 어디서도 참조되지 않는다**. 문구는 `<title>`/description 을
  재사용하므로 새로 지어내는 것이 없다. 사용자가 불필요하다고 보면 블록 하나 삭제로 끝난다
- **`[autonomous]` `class="dark"` 정적화** — prerender 의 직접 결과(테마 플래시)를 막는 것이므로 인과 범위 안
- 그 외 "있으면 좋겠다"(코드 스플리팅으로 886KB 번들 줄이기, `CLIPage.tsx` 연결, 404 페이지 개선)는
  **하지 않는다**. Next Generation Hints 로만 남긴다
