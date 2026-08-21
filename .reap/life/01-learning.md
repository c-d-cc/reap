# 01 — Learning (gen-096-c749d5)

**Goal**: docs 사이트를 라우트별 정적 HTML 로 prerender 하고 로케일을 URL 로 분리한다
**시작 시점**: 2026-08-21T10:55+0900, HEAD `8677ab7`
**Source backlog**: `docs-사이트가-페이지별-html-을-내지-않는다-prerender-가-필요하다.md` (consumed)

---

## Source Backlog

### 문제

`docs/` 는 Vite + React + wouter SPA 이고 GitHub Pages 로 배포된다. 라우팅이 전부 클라이언트에서
일어나므로 **서버가 내는 것은 모든 라우트에 대해 동일한 939바이트 셸 하나**다.

```
$ curl -sI https://reap.cc/docs/quick-start
HTTP/2 404
$ for u in /docs/quick-start / /아무거나xyz; do curl -s https://reap.cc$u | wc -c; done
939  939  939
```

404 는 `.github/workflows/docs.yml` 의 `cp docs/dist/public/index.html docs/dist/public/404.html`
때문이다 — SPA 라우팅을 위한 표준 GitHub Pages 우회이고, Pages 는 알 수 없는 경로에 `404.html` 을
**404 status 로** 내려준다. **브라우저에서는 정상으로 보인다** — 셸이 부팅해 wouter 가 클라이언트에서
라우팅하므로 사람 눈에는 완전한 페이지다.

### backlog 가 기록한 손해 (측정됨 / 미측정)

측정됨: `reap.cc/` 루트만 검색에 잡힌다 · `<title>` 이 `REAP` 하나뿐이고 meta description 이 없다 ·
README 5개가 거는 `reap.cc/docs/*` 링크가 링크 검사 도구에서 broken 으로 보고된다.
미측정: 검색 유입 규모(그래서 `priority: high` → `medium` 으로 낮춤) · 브라우저 외 클라이언트의 404 처리.

### backlog 의 해법과 미결정

해법 — 기존 앱에 prerender 단계 **추가**(재작성 아님). `react-dom/server` 로 전 라우트를 렌더해
`dist/public/<route>/index.html` 로 떨군다. 프레임워크 교체(Next.js / Astro)는 권하지 않으며 근거가
backlog 에 있다 (§ 프레임워크 교체 판단 참조).

미결정이었던 것 — 로케일 URL: **A** (en 만 prerender) vs **B** (`/ko/docs/…` URL 분리).
**사용자가 2026-08-21 에 B 를 택했다** (team lead 전달). 단 제약 하나: **영어에는 접두사를 붙이지 않는다** —
`README*.md` 5개가 `https://reap.cc/docs/*` 를 직접 걸고 그 README 는 npm tarball 에도 실리므로
`/en/` 을 붙이면 기존 링크가 전부 죽는다.

backlog 마지막 절: **배포된 사이트에 HTTP 요청을 보내는 게이트가 하나도 없다** — 고친 뒤 다시 깨져도
아무도 모른다. prerender 를 넣는다면 라이브 검사를 같이 만들어야 이 backlog 가 다시 열리지 않는다.

---

## 인계 문장 재확인 — 세 개 중 둘이 틀렸다

team lead 브리핑은 "인계받은 문장을 그대로 받지 말 것"을 지시했다. 실측 결과:

| 인계 문장 | 실측 | 판정 |
|---|---|---|
| 라우트 **25**개 | `grep -c '<Route path=' docs/src/App.tsx` → **23** | **틀림**. 23 (`/` + `/docs/*` 22) |
| 셸 **939바이트** | `wc -c dist/public/index.html` → **939** | 정확 |
| SSR 위험 **2파일** (`LanguageSelector.tsx`, `ui/sidebar.tsx`) | 두 파일 모두 **렌더 중에는 브라우저 API 를 만지지 않는다** | **틀림** — 아래 참조 |

따라서 페이지 수는 125 가 아니라 **23 × 5 = 115** 다.

---

## 핵심 발견

### 1. SSR 을 실제로 깨뜨리는 곳은 `i18n/context.tsx` 하나다 — [실행]

브리핑이 지목한 두 파일은 위험하지 않다:

- `LanguageSelector.tsx` — `document.addEventListener` 가 **`useEffect` 안**에 있다. `renderToString` 은 effect 를 돌리지 않는다
- `ui/sidebar.tsx` — `document.cookie` 는 **`setOpen` 콜백 안**, `window.addEventListener` 는 **`useEffect` 안**
- `hooks/use-mobile.tsx` — `matchMedia` 도 `useEffect` 안. 초기값 `undefined` → `!!undefined === false` 이므로 서버·클라이언트 첫 렌더가 일치한다 (하이드레이션 안전)
- `CodeBlock.tsx` — `navigator.clipboard` 는 클릭 핸들러 안
- `App.tsx` — `window.scrollTo` / `document.documentElement` 둘 다 `useEffect` 안

**실제로 터지는 곳**은 `docs/src/i18n/context.tsx:30`:

```ts
const [locale, setLocaleState] = useState<Locale>(detectLocale);
```

`detectLocale` 은 lazy initializer 라 **렌더 중에 실행**되고 첫 줄이 `localStorage.getItem(...)` 이다.

측정 방법 — 임시 SSR 엔트리를 만들어 `vite build --ssr` 후 node 로 실행 (probe 는 측정 후 삭제했다):

```
THREW: ReferenceError :: localStorage is not defined
```

`localStorage`/`navigator` 를 스텁하면 다음이 나온다:

```
THREW: ReferenceError :: location is not defined
```

이것은 wouter 가 `ssrPath` 없이 `location.pathname` 을 읽기 때문이며 `<Router ssrPath>` 를 주면 사라진다
(`node_modules/wouter/src/use-browser-location.js:44` — `ssrPath != null` 이면 `currentPathname` 을 호출하지 않는다).

셋 다 우회하면 **전 트리가 정상 렌더된다**:

```
OK len= 18554
...has QuickStart h1? <h1 class="text-2xl font-bold ...">빠른 시작
```

**18.5KB 의 실제 본문**이 나온다 — 컴포넌트 트리 자체는 SSR 가능하다. 남은 작업은 렌더 중 브라우저 읽기
두 곳(`localStorage`, `location`)을 제거하는 것뿐이다.

**부수 발견**: 스텁으로 `navigator.language = 'en-US'` 를 넣었는데도 **한국어가 렌더됐다** — Node 22 의
`navigator` 가 read-only 전역이라 대입이 무시되고 시스템 로케일이 읽혔다. 지금 설계는 로케일을
**주변 환경**이 정한다는 뜻이고, URL 로 옮기면 이 취약성이 함께 사라진다.

### 2. wouter 의 `base` + `ssrPath` 조합이 로케일 분리를 그대로 지원한다 — [실행]

`node_modules/wouter/src/paths.js` 의 `relativePath(base, path)`:

```js
!path.toLowerCase().indexOf(base.toLowerCase()) ? path.slice(base.length) || "/" : "~" + path
```

- `relativePath("/ko", "/ko/docs/quick-start")` → `/docs/quick-start`
- `<Link href="/docs/x">` 는 `router.base + targetPath` 로 href 를 만든다 (`index.js:304`)

따라서 **`<Router base="/ko">` 하나만 주면 안쪽 `<Switch>` 의 23개 라우트를 손대지 않아도** 되고
사이드바·네비바의 모든 `<Link>` 가 자동으로 `/ko/…` 를 가리킨다. 라우트를 115개로 늘릴 필요가 없다.

SSR 에서는 `<Router base="/ko" ssrPath="/ko/docs/quick-start">` 로 클라이언트와 **대칭**이 된다
(클라이언트는 `location.pathname` 이 `/ko/docs/quick-start`, base 가 잘라낸다). 하이드레이션 일치가
설계로 보장된다.

현재 `App.tsx:83` 은 `base={import.meta.env.BASE_URL.replace(/\/$/, "")}` 이고 `BASE_URL` 이 `/` 이므로
실효 base 는 `""` 다.

### 3. 라우트 목록이 두 곳에 있다 — 세 곳이 되기 전에 합친다

- `docs/src/App.tsx` — `<Route path=...>` 23개
- `docs/src/components/AppSidebar.tsx` — `useNavGroups()` 의 `href` 21개 (`/` 와 `/docs/introduction` 일부 차이)

`tests/unit/docs-wiring.test.ts` 가 **이 둘의 불일치를 잡으려고 존재한다**. prerender 스크립트가 라우트
목록을 또 갖게 되면 **세 번째 사본**이 생긴다. genome(`application.md` § 표식보다 공유가 낫다)이
"같은 값을 두 코드가 알면 하나가 소유하고 나머지가 import 한다"를 처방하므로, **라우트 매니페스트를
하나 만들어 App.tsx 와 prerender 가 함께 읽는 것**이 옳은 형태다.

### 4. 페이지 메타는 전부 기존 번역 문자열에서 끌어올 수 있다 — 예외 하나

23개 페이지 전부 `<DocPage title={t.X.title} breadcrumb={t.X.breadcrumb}>` 형태이고 대부분
`t.X.intro` 또는 `t.X.description` 을 갖는다. 문구를 지어낼 필요가 없다.

**예외 — `/docs/hooks` 와 `/docs/hook-reference` 가 같은 키를 쓴다**:

```
src/pages/HooksPage.tsx:10:         <DocPage title={t.hooks.title} breadcrumb={t.hooks.breadcrumb}>
src/pages/HookReferencePage.tsx:10: <DocPage title={t.hooks.title} breadcrumb={t.hooks.breadcrumb}>
```

두 페이지의 `<h1>` 이 이미 똑같이 "Hooks" 다 (기존 콘텐츠 문제이며 이 세대의 산물이 아니다).
`<title>` 을 고유하게 만들려면 구분이 필요한데, `AppSidebar.tsx` 가 이미
`{ title: "Hook Reference", href: "/docs/hook-reference" }` 라는 **기존 문자열**을 갖고 있다 —
지어내지 않고 그것을 쓸 수 있다.

### 5. `docs/public/` 에 `sitemap.xml` 도 `robots.txt` 도 없다 — [실행]

`ls docs/public/` → `architecture.png CNAME ctod-logo.png favicon.png favicon.svg opengraph.jpg
session-init-screenshot.png`. 둘 다 부재. 빌드 산출물에도 없다 (아래).

### 6. 현재 빌드 산출물 — [실행]

`rm -rf docs/dist && npx vite build`:

```
dist/public/index.html                        939 B   ← 유일한 HTML
dist/public/assets/index-7UFaXlnE.css      103.99 kB
dist/public/assets/index-vRb3yT8r.js       886.80 kB
+ 정적 이미지 6 + CNAME
```

**HTML 은 정확히 하나**이고 939바이트다. backlog 의 수치가 재현된다.

### 7. `CLIPage.tsx` 는 어느 라우트에도 연결돼 있지 않다

`docs/src/pages/CLIPage.tsx` 가 존재하지만 `App.tsx` 에 라우트가 없고 사이드바에도 없다. 이 세대의
scope 밖이며 prerender 대상도 아니다 — Next Generation Hints 에만 남긴다.

### 8. 워크플로와 게이트

`.github/workflows/docs.yml` — `main` push 에 `docs/**` · `media/**` · `README*.md` ·
워크플로 자신이 포함되면 발동. 단계: `npm ci` → `npx tsc --noEmit -p tsconfig.json` → `npx vite build`
→ `cp dist/public/index.html dist/public/404.html` → `upload-pages-artifact`.

`scripts/check-docs-version.sh` 는 번역 파일의 `releaseNotes` 배열만 읽는다 — 번역 구조를 건드리지
않는 한 이 세대와 무관하다.

---

## Clarity Level — **High**

- goal 이 명확하고 source backlog 가 조사·해법·근거를 이미 담고 있다
- 유일한 미결정(로케일 URL A/B)이 착수 전에 **B 로 확정**됐다
- 제약(영어 무접두사)이 명시적이고 그 이유가 검증 가능하다 (README 5개 실측)
- 프레임워크 교체 금지가 명시됐고 근거도 backlog 에 있다 — 읽었고 **동의한다**: 콘텐츠가 MD 가 아니라
  TS 객체(`i18n/translations/*.ts`)이고 gen-094·095 가 그 파일을 방금 정비했다. 같은 결과를 위한
  재작성이며 prerender 는 되돌리기가 빌드 단계 하나 제거로 끝난다

따라서 질문 최소화 · 자율 실행. 다만 두 가지는 planning 에서 판단을 명시하고 보고한다:
(a) `localStorage` 로케일 기억을 유지할 것인가, (b) `404.html` 의 처리.

## Pending Backlog 검토 (9건)

전부 이 세대의 goal 과 무관하다 — indexer 재설계 2건, `list-carriers.sh` orphan 오탐, `reap uninstall`
판정 문구, `--mark-migrated` 버전 하락, `source-map` 부재 검사, 자기진단 PATH 주석, 층2 게이트 하네스,
`checkAutoUpdateGuard` 배선. 하나도 docs 사이트를 건드리지 않는다. 소비하지 않는다.

**단, `층2-게이트-판정부에-자동-회귀-검사가-없다`** 는 이 세대가 만들 라이브 검사와 **같은 종류의 문제**를
다룬다 (bash 게이트에 회귀 검사가 없다). 이 세대도 bash 검사를 하나 추가하므로 같은 한계를 물려받으며,
그 사실을 validation artifact 에 명시한다. 소비는 하지 않는다 — scope 가 다르다.

## 워킹트리 상태 (내 작업이 아님)

team lead 가 staged 로 남긴 것이 있고 되돌리지 않는다:
- `.reap/vision/design/backlogs_v0.18/` 로 0.18 기획 backlog 6건 이동
- source backlog 재작성 (구 `reapccdocs-…404…` 삭제 + 신규 추가)

commit 단계의 `git add -A` 가 함께 담게 된다.
