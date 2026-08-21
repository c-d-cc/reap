# 03 — Implementation (gen-096-c749d5)

**Goal**: docs 사이트를 라우트별 정적 HTML 로 prerender 하고 로케일을 URL 로 분리한다

---

## Completed Tasks

| # | Task | 결과 |
|---|---|---|
| T001 | `docs/src/i18n/locale-path.ts` 신설 | `LOCALE_PREFIXES` / `localePrefix` / `parseLocalePath` / `localeHref` / `localeUrl`. import 는 `./types` 뿐 |
| T002 | `docs/src/i18n/context.tsx` 재작성 | locale 을 prop 으로. `detectLocale`·`localStorage`·`navigator` 제거 → **SSR 크래시 원인 소멸** |
| T003 | `docs/src/routes.ts` 신설 | 23개 `{ path, component, meta(t) }`. 라우트 목록의 단일 소유자 |
| T004 | `docs/src/App.tsx` 재작성 | `App({ locale, ssrPath })`, `<Router base={prefix} ssrPath>`, 매니페스트에서 `<Route>` 생성 |
| T005 | `docs/src/main.tsx` | `parseLocalePath` + `#root` 자식 유무로 `hydrateRoot`/`createRoot` 분기 |
| T006 | `LanguageSelector.tsx` | 버튼 → `<a href>`. 드롭다운을 **조건부 렌더에서 `hidden` 클래스로** 바꿔 5개 링크가 항상 마크업에 있게 함 |
| T007 | `docs/index.html` | `<!--app-head-start/end-->` 마커, `<html lang="en" class="dark">` |
| T008 | `docs/src/entry-server.tsx` 신설 | `renderPage`/`renderAll`/`buildSitemap`/`buildRobotsTxt`. 치환 3종 전부 fail-closed |
| T009 | `docs/scripts/prerender.mjs` 신설 | I/O 전용 드라이버. origin 은 `docs/public/CNAME` 에서 읽어 주입 |
| T010 | `docs/package.json` | `build` = client → ssr → prerender 3단계 |
| T011 | `.github/workflows/docs.yml` | `npx vite build` → `npm run build`, 층1 게이트 추가, **`cp … 404.html` 유지** |
| T012 | `scripts/check-docs-prerender.sh` 신설 | 층1. 23×5 계산은 `routes.ts` 에서 파생 |
| T013 | `scripts/check-docs-live.sh` 신설 | 층2. pass / FAIL / amber SKIP |
| T014 | `tests/unit/docs-wiring.test.ts` (submodule) | 아래 § T014 |
| T015 | negative | 아래 § 검증 근거 |
| T016 | 기존 게이트 전종 | validation artifact 에 기록 |

---

## 빌드 산출물 — [실행]

```
$ cd docs && rm -rf dist && npm run build
dist/public/index.html                     1.23 kB      (템플릿, prerender 가 덮어씀)
dist/public/assets/index-*.css           104.33 kB
dist/public/assets/index-*.js            888.45 kB
dist/server/entry-server.js              643.08 kB
prerendered 115 page(s) at https://reap.cc — 2304 kB of HTML, plus sitemap.xml and robots.txt

$ find dist/public -name index.html | wc -l
115
$ find dist/public -name index.html -exec wc -c {} + | sort -n | head -1
15039 ./docs/comparison/index.html      ← 가장 작은 페이지가 15KB. 셸은 939B 였다
$ find dist/public -name index.html -exec wc -c {} + | sort -n | tail -2
45485 ./ja/docs/release-notes/index.html
```

`<title>` 실측:

```
index.html                       <title>REAP — Recursive Evolutionary Autonomous Pipeline</title>
docs/quick-start/index.html      <title>Quick Start — REAP</title>
ko/docs/quick-start/index.html   <title>빠른 시작 — REAP</title>
de/docs/genome/index.html        <title>Genome — REAP</title>
```

`ko/docs/genome/index.html` 의 `<head>`:

```html
<html lang="ko" class="dark">
  <title>Genome — REAP</title>
  <meta name="description" content="Genome은 REAP의 권위 있는 지식 소스입니다 — …" />
  <link rel="canonical" href="https://reap.cc/ko/docs/genome" />
  <link rel="alternate" hreflang="en"        href="https://reap.cc/docs/genome" />
  <link rel="alternate" hreflang="ko"        href="https://reap.cc/ko/docs/genome" />
  <link rel="alternate" hreflang="zh-CN"     href="https://reap.cc/zh-CN/docs/genome" />
  <link rel="alternate" hreflang="de"        href="https://reap.cc/de/docs/genome" />
  <link rel="alternate" hreflang="ja"        href="https://reap.cc/ja/docs/genome" />
  <link rel="alternate" hreflang="x-default" href="https://reap.cc/docs/genome" />
```

같은 파일의 사이드바 링크가 **전부 `/ko/` 접두사**를 갖는다 (24개) — `<Router base>` 만으로
`<Link>` 가 자동 변환된 결과이며, 컴포넌트를 하나도 고치지 않았다. 접두사가 없는 4개는 언어 셀렉터가
가리키는 다른 로케일 링크다.

---

## 설계 결정 — 구현 중 확정한 것

### `<Router base>` 하나로 로케일을 분리했다 — 라우트는 여전히 23개

계획대로 동작했다. `App.tsx` 는 `ROUTES.map` 으로 `<Route>` 를 만들고 `base` 만 로케일별로 달라진다.
115개 라우트 선언은 없다.

### 로케일 루트는 트레일링 슬래시를 갖는다 (`/ko/`)

처음엔 `localeHref(ko, "/")` 가 `/ko` 를 냈는데, 같은 페이지에서 wouter 의 `<Link href="/">` 는
`base + "/"` = `/ko/` 를 낸다. **내부 링크가 `/ko/` 인데 canonical 이 `/ko` 면 같은 페이지를 두 이름으로
부르는 것**이고 그것이 canonical 이 막으려는 바로 그 상황이다. `localeHref` 가 로케일 루트에만 슬래시를
붙이도록 고쳤고 파일 경로 계산도 슬래시를 흡수하도록 바꿨다.

`/ko` 로 들어와도 `parseLocalePath` 와 wouter 가 둘 다 route `/` 로 해석하므로 어느 형태든 동작한다.

### 언어 드롭다운을 조건부 렌더에서 `hidden` 클래스로 바꿨다

처음 구현은 `{open && (<div>…)}` 였다. 그러면 **prerender 결과에 다른 4개 언어 링크가 아예 없다** —
"크롤러가 따라갈 수 있는 실제 링크"라고 주석에 적어놓고 마크업에는 없는 상태가 된다. 항상 렌더하고
`hidden` 으로 감춘다. 덕분에 층1 게이트가 그것을 **검사할 수 있게** 됐다.

### `[autonomous]` OpenGraph / `class="dark"`

계획대로 추가. og 문구는 `<title>`/description 재사용이고 `og:image` 는 이미 저장소에 있으나 어디서도
참조되지 않던 `docs/public/opengraph.jpg` 다.

---

## Discovered Tasks

### D001 — macOS 의 bash 는 3.2 라 `mapfile` 이 없다

층1 게이트 초안이 `mapfile -t` 를 썼다. CI(ubuntu, bash 5)에서는 돌지만 **이 세대에서 로컬 실행이
불가능**해진다 — 즉 negative 를 관측할 수 없다. `while IFS= read -r` + heredoc 으로 교체했다.
`bash --version` → `3.2.57(1)-release (arm64-apple-darwin24)`.

### D002 — 층1 의 언어 셀렉터 단언이 **다른 것을 재고 있었다**

`grep -o 'href="[^"]*/docs/genome"'` 이 `10 distinct` 를 반환했다. 5개일 것으로 기대했는데 **head 의
`<link rel="alternate">` 6개까지 세고 있었다** — 즉 **셀렉터가 아무것도 렌더하지 않아도 통과**한다.
크롤러용 검사가 사람용 검사를 대신하게 두면 안 된다. `<a href="…" hrefLang="` 로 앵커에 고정하고
`-eq 5` 로 바꿨다. negative(N1)로 확인했다.

### D003 — 층2 의 근거 줄이 **다른 항목의 증거를 달고 있었다**

`first_bad` 하나를 세 종류의 실패가 공유해서, 루트 페이지의 바이트 수가
`22 page(s) did not return 200` 밑에 근거로 붙었다. 읽는 사람은 그 URL 이 404 였다고 믿는다.
`first_status` / `first_size` / `first_title` 로 분리했다.

---

## 검증 근거 — 종류를 구분해 적는다

### 층1 게이트 — fail → pass 를 이 세대에서 관측했다

**[negative]** prerender 없이(`npx vite build` 만) 만든 산출물에 돌렸다 = **gen-096 이전의 상태**:

```
FAIL  expected 115 page(s), found 1
FAIL  1 page(s) are shell-sized                 docs/dist/public/index.html
FAIL  1 page(s) have an empty #root
FAIL  English pages are not where the READMEs point
FAIL  locale en has 1 page(s), expected 23
FAIL  locale ko/ja/de/zh-CN has 0 page(s), expected 23
FAIL  sitemap.xml missing
FAIL  robots.txt missing
FAILED (12)                                      exit 1
```

**[실행]** 전체 빌드 후: `PASSED — the build produces 115 distinct pages`, exit 0.

**[negative]** 개별 단언마다 값을 깨뜨려 red 를 확인하고 복원했다 (6/6):

| # | 조작 | 결과 |
|---|---|---|
| N1 | 셀렉터 앵커만 삭제 (head hreflang 은 유지) | `language selector offers only 0 locale(s)` |
| N2 | `ja/docs/vision` 의 `<html lang>` 을 `en` 으로 | `locale ja: 1 page(s) have the wrong <html lang>` |
| N3 | `docs/advanced` 의 title 을 `Genome — REAP` 로 | `locale en has duplicate <title> values` |
| N4 | `de/docs/hooks` 에서 `zh-CN` hreflang 삭제 | `locale de: 1 page(s) do not link all 5 locales + x-default` |
| N5 | sitemap 에서 `<url>` 하나 제거 | `sitemap.xml lists 114 URL(s), expected 115` |
| N6 | `dist/public/en/` 디렉토리 생성 | `docs/dist/public/en exists` + 개수 116 |

복원 후 다시 `PASSED`.

**[negative]** 매니페스트가 파싱되지 않으면 **공허하게 통과하지 않고 실패**한다:
`routes.ts` 의 `path:` 를 `pathX:` 로 바꾸니 두 게이트 모두
`declares only 0 route(s) — the manifest failed to parse; every count below would be meaningless`
로 exit 1. (이것이 없으면 매니페스트가 깨진 날 `0 x 5 = 0` 을 기대하고 `0` 을 찾아 통과한다.)

### 층2 게이트 — FAIL 은 관측했고 PASS 는 관측할 수 없다

**[negative]** 2026-08-21T11:15+0900, **살아있는 배포본**에 실제로 실행 (117 요청, 32초):

```
ok    https://reap.cc answered — 200 https://reap.cc/ 0
note  GET https://reap.cc/docs/quick-start -> 404 https://reap.cc/docs/quick-start redirects=0
FAIL  locale en: 22 page(s) did not return 200      https://reap.cc/docs/introduction -> HTTP 404
FAIL  locale en: 1 page(s) are shell-sized          https://reap.cc/ -> 939B (shell was 939B)
FAIL  locale en: 1 page(s) carry no page-specific <title>
FAIL  locale ko: 23 page(s) did not return 200      https://reap.cc/ko/ -> HTTP 404
FAIL  locale ja/de/zh-CN: 23 page(s) did not return 200
FAIL  https://reap.cc/sitemap.xml returned 404
FAIL  https://reap.cc/robots.txt returned 404
FAILED (9)                                           exit 1
```

**[negative]** 도달 불가 origin 은 amber SKIP + exit 0:
`bash scripts/check-docs-live.sh https://reap-does-not-exist-96c749d5.invalid`
→ `SKIP could not reach … (curl exit 6)` / `This measured nothing.` / exit 0.
**검사 실패와 측정 실패를 구분한다** (gen-091 교훈).

**[독해]** PASS 는 이 세대에서 관측할 수 없다 — 배포가 없다. 배포 후 첫 실행 전까지 초록 줄은 전부
미검증이며 그 사실을 스크립트 헤더에 적었다.

**미측정 — 트레일링 슬래시**: 위 `note` 줄의 404 는 **파일이 없어서** 난 것이므로 GitHub Pages 가
`/docs/quick-start` 를 `…/index.html` 로 직접 주는지 `/docs/quick-start/` 로 301 하는지 **말해주지
않는다**. 어느 쪽이든 README 링크는 산다. 층2 가 `-L` 로 최종 URL 을 **출력**하므로 배포 후 첫 실행이
그 답을 로그에 남긴다.

### `.github/workflows/docs.yml` — [독해]

이 세대에서 CI 는 돌지 않는다. `npm run build` 로 바꾸고 층1 게이트를 upload 앞에 넣었으며
`cp … 404.html` 는 그대로 뒀다. YAML 파싱은 확인했다 (`yaml.safe_load` OK).

### D004 — 브리핑이 지목한 `ui/sidebar.tsx` 는 **어디서도 import 되지 않는다**

01-learning.md 은 "그 파일의 브라우저 API 는 `useEffect`/콜백 안이라 안전하다"고 적었다. 실측하니 그보다
강하다 — `grep -rln "from \"@/components/ui/sidebar\"" src` 가 **0건**이다. shadcn 보일러플레이트로
남아 있는 죽은 파일이고 렌더 경로에 아예 없다. `use-mobile.tsx` 의 유일한 importer 도 그 파일이므로
`matchMedia` 역시 렌더 경로에 없다. scope 밖이라 삭제하지 않는다 — hints 로만 남긴다.

### D005 — README 링크 커버리지를 층1 게이트에 추가했다

backlog 가 보고한 손해 중 하나가 "README 5개의 `reap.cc/docs/*` 링크가 링크 검사 도구에서 broken 으로
보고된다"였다. **115개 파일을 세는 것으로는 그 15개 경로가 그 안에 있음을 증명하지 못한다** — 라우트
하나가 이름을 바꾸면 개수는 그대로이고 링크만 죽는다. 그래서 README 에서 경로를 뽑아 파일 존재를 직접
단언한다.

실측: `grep -o 'reap\.cc/docs/'` 가 README 5개에서 **각 16개, 합 80개, distinct 15경로**.
(게이트 메시지에 처음 "75" 라고 적었다가 실측해 80 으로 고쳤다 — 세지 않은 숫자를 적을 뻔했다.)
15개 경로 전부 `routes.ts` 에 있다 (`comm -23` 결과 공집합).

---

## 추가 검증 — 렌더러 fail-closed / 결정성 — [negative]

`dist/server/entry-server.js` 를 직접 호출해 확인:

```
two renders identical: true | bytes 15134
unknown route throws:      prerender: no route declared for /docs/nope
missing head marker throws: prerender: head markers missing or out of order in the built index.html
missing #root throws:       prerender: app markup for /ko/docs/genome — marker not found …
```

마커가 사라지면 **조용히 셸 115장이 나가는** 것이 이 세대가 없애려는 바로 그 상태라, 치환 3종을 전부
throw 로 만들고 실제로 throw 하는 것을 확인했다.

## 층1 게이트 negative 추가분

| # | 조작 | 결과 |
|---|---|---|
| N7 | `localeHref` 가 로케일 루트에서 슬래시를 뗌 | unit 1 fail |
| N8 | 접두사를 bare string 으로 매칭 (`/kotlin` → 한국어) | unit 1 fail |
| N9 | `App.tsx` 에 `<Route path>` 재등장 | unit 1 fail |
| N10 | README 가 거는 `/docs/genome` 디렉토리 제거 | `1 of 15 README link(s) have no page` |
| N11 | README 추출 정규식이 0건을 반환 | `found only 0 reap.cc/docs link(s)` — **공허한 통과 아님** |

## dev 서버 — [실행]

`npx vite --port 5199` 로 띄워 확인: `/` 200, `/ko/docs/genome` 200, `#root` 는 **비어 있다**
→ `main.tsx` 의 `createRoot` 분기가 dev 에서 쓰인다. 마커 주석은 dev HTML 에 그대로 남고
`<title>REAP</title>` 가 fallback 으로 보인다 (의도).

빌드된 클라이언트 번들에 `hydrateRoot` 가 포함된 것도 확인했다.

## 기존 게이트 결과 — [실행] (2026-08-21, 로컬 macOS)

| 게이트 | 결과 |
|---|---|
| `npm run typecheck` | exit 0 |
| `npm run typecheck:docs` | exit 0 |
| `npm run build` | exit 0 — 번들 0.63MB, grammars 15 |
| `npm run test:unit` | **647 pass / 0 fail** (baseline 640 + 신규 7) |
| `npm run test:e2e` | **329 pass / 0 fail** (baseline 유지) |
| `npm run test:scenario` | **44 pass / 0 fail** (baseline 유지) |
| `scripts/check-self-diagnosis.sh` | 전 절 통과 (opencode 1.3.16) |
| `scripts/check-docs-version.sh` | `All document checks passed for v0.17.6` |
| `scripts/list-carriers.sh --orphans` | orphan **1건** (`RELEASE_NOTES.md` 의 `id` — 기존분) |
| `reap fix --check` | **0 error / 2 warning** (gen-052 상속분) |
| `scripts/check-docs-prerender.sh` | **PASSED** |
| `scripts/check-docs-live.sh` | **FAILED (9)** — 배포 전이므로 의도된 결과 |

---

# 수정 라운드 (validation 중, 독립 검토 이후)

독립 검토가 **blocking 1건 + 통과시키는 결함 4종 + 거짓 문장 6개**를 냈다. 전부 재현하고 처리했다.
상세 근거는 `04-validation.md` § 0 에 있고, 여기에는 **무엇을 어떻게 고쳤는가**만 적는다.

## 코드 변경

| 파일 | 변경 |
|---|---|
| `docs/src/i18n/locale-path.ts` | `stripTrailingSlash()` 추가 |
| `docs/src/App.tsx` | `useNormalizedLocation` — wouter 의 location hook 을 감싸 트레일링 슬래시 제거. `<Router hook={...}>`. docblock 의 거짓 문장 교체 |
| `docs/src/entry-server.tsx` | `renderPage` 에 optional `ssrPath` 추가. **`assertSlashInvariant`** — 모든 페이지를 두 주소로 렌더해 바이트 동일을 요구, 다르면 빌드 중단 |
| `docs/vite.config.ts` | `__BUILD_YEAR__` define |
| `docs/src/env.d.ts` | `__BUILD_YEAR__` 선언 |
| `docs/src/components/AppSidebar.tsx`, `Footer.tsx` | `new Date().getFullYear()` → `__BUILD_YEAR__` |
| `docs/index.html` | 마커 설명 주석을 치환 영역 **안**으로 (출력 2304 → 2278 kB) |
| `scripts/check-docs-prerender.mjs` | **신설** — 페이지 내부 값 검사. 기대값을 파일 경로에서 독립 재계산 |
| `scripts/check-docs-prerender.sh` | per-locale 절과 하드코딩 샘플 절 제거 → `.mjs` 호출. 로케일 수를 `types.ts` 에서 파생. `.mjs` 부재 시 명시적 FAIL |
| `scripts/check-docs-live.sh` | 헤더 재작성(로컬 PASS 관측 기록). 로케일을 `types.ts` 에서 파생. `<html lang>` 성공 줄 추가. 침묵하던 분기 제거 |
| `.github/workflows/docs.yml` | `paths:` 에 게이트 스크립트 2개 추가 |
| `tests/unit/docs-wiring.test.ts` | `stripTrailingSlash` 테스트 + 두 표기 round-trip 테스트. 거짓 주석 교체 |

## 왜 그 자리에 넣었는가

**슬래시 불변식은 게이트가 아니라 빌드에 있다.** 파일을 읽는 검사로는 이것을 볼 수 없다 — 두 주소가
**같은 파일**을 받고, 차이는 브라우저가 렌더할 때만 나타난다. 빌드는 우회 불가능한 경로다.

**`.mjs` 는 `entry-server.tsx` 를 import 하지 않는다.** 검사기가 검사 대상과 기대값을 공유하면
틀린 `localeUrl` 이 자기 자신과 일치해 아무것도 검사하지 않게 된다. 로케일 목록만 소유자
(`types.ts`)에서 읽고, 접두사 규칙 2줄은 **의도적으로 재서술**한다.

**로케일 목록은 이제 세 곳이 아니라 한 곳이 안다.** 두 bash 게이트가 `types.ts` 를 파싱한다.
층2 의 주석이 "로케일 접두사도 소스에서 온다"고 **거짓 주장**하고 있었는데, 주석을 고치는 대신
코드를 주장에 맞췄다.

## 파일 레이아웃을 바꾸지 않은 이유

`<route>.html` 로 쓰면 GitHub Pages 가 200 + 리디렉션 없이 서빙하므로 슬래시 문제가 원천 소멸한다
(평가자 실측). 채택하지 않았다 — **그 동작에 대해 틀리면 80개 published README 링크가 404 난다.**
앱에서 정규화하는 쪽은 호스트가 리디렉션하든 안 하든 동작한다.

---

# 인수 라운드 (implementation 재진입, 2026-08-21 12:30~13:40 +0900)

직전 실행자가 종료했고 **사용자 결정 4건 + 2차 독립검토 7건이 미반영**인 채 completion 까지 가 있었다.
`reap run back` 으로 implementation 까지 내려와 전부 반영했다. 아래는 이 라운드의 변경만 적는다.

## ① `404.html` — prerender 한 NotFound 로 교체 (사용자 결정 B)

`cp index.html 404.html` 이 prerender 이후 **28,069 B 영어 홈페이지**가 되어 존재하지 않는 모든 URL 이
`canonical: https://reap.cc/` 를 선언하고 소셜에서 홈 카드로 언펄됐다.

| 파일 | 변경 |
|---|---|
| `docs/src/entry-server.tsx` | `renderNotFound(template)` 신설. `NOT_FOUND_SSR_PATH = "/404"` 가 라우트로 선언되면 **throw**. head 는 `<title>` + `noindex` **둘뿐** — canonical·hreflang·og 를 **의도적으로 내지 않는다**(없는 주소에는 어떤 URL 값도 틀리다). `origin` 을 **인자로 받지 않는 것**이 그 사실의 증거다 |
| | `replaceHead()` 헬퍼 추출 — `renderPage` 와 공유(중복 금지) |
| `docs/scripts/prerender.mjs` | `404.html` 을 쓴다 |
| `.github/workflows/docs.yml` | `cp` 스텝 **삭제** |

실측: **2,065 B** / `rel="canonical"` 0건 / `og:` 0건 / `noindex` 있음 / 본문은 NotFound / `index.html` 과 다름.

**로케일 무관성이 안전 근거다** — NotFound 는 location 도 locale 도 읽지 않는 영어 리터럴이고 사이드바·
언어 셀렉터가 없다. 그래서 임의의 주소에서 하이드레이션해도 마크업이 같다. 브라우저에서 확인했다(§ 04 § 2).

## ② 루트에서만 1회 로케일 리디렉션 (사용자 결정)

직전 실행자는 자동 감지를 **완전히 제거**했다. 그 판단들(locale=prop / storage 를 URL 결정에서 제외 /
`detectLocale` 의 `"de"` 누락 버그 제거)은 **전부 유지**하고, `/` 하나에서만 도는 클라이언트 1회 이동을 얹었다.

| 파일 | 변경 |
|---|---|
| `docs/src/i18n/detect-locale.ts` | **신설**. `preferredLocale(tags)` — BCP-47 primary subtag 매칭, **번체(zh-TW/zh-HK)는 매칭시키지 않는다**(간체 하나뿐이므로 영어에 두는 편이 낫다). `rootRedirectTarget(pathname, tags, alreadyRedirected)` — 세 규칙(`/` 전용 / 탭당 1회 / 영어 제외)을 담은 순수 함수 |
| `docs/src/main.tsx` | `sessionStorage` 플래그 → **`location.replace`**. storage 예외 시 리디렉션 안 함(fail closed). 플래그를 **navigate 전에** 기록 |
| `docs/src/i18n/context.tsx` | docblock 에 "그럼에도 `navigator.language` 를 읽는 한 곳"을 명시 |

**`replace` 인 이유**: `assign` 이면 `/` 항목이 history 에 남고 뒤로가기 → `/` → 다시 `/ko/` 로 **빠져나갈 수
없는 루프**가 된다. **플래그인 이유**: `/ko/` 에서 English 를 고르면 전체 로드로 `/` 에 오는데, 플래그가
없으면 새로고침마다 브라우저 기본값이 사용자의 명시적 선택을 덮는다. 둘 다 실제 브라우저에서 눌러봤다.

## ③ description 20개 작성 (사용자 결정)

`quick-start` · `core-concepts` · `release-notes` · `advanced` × 5 로케일. 영어를 먼저 쓰고 넷을 번역했다.
**20개 전문은 `05-completion.md` 에 싣는다.**

**team lead 제안과 다르게 한 2건**(보고함): `advanced` 에 `signatureDesc` 를 재사용하지 않았다 — 그 페이지는
서명 잠금·lineage 압축·entry mode **세 절**인데 그 문자열은 첫 절만 서술한다. `core-concepts` 의
`fourAxisDesc` 도 쓰지 않았다 — **콜론으로 끝나는 도입부**라 검색 스니펫으로 잘린 문장처럼 보인다.

부수 효과: `RouteMeta.description` 을 **optional → required** 로 바꿨다. description 없는 라우트는
이제 컴파일되지 않는다 — optional 필드가 바로 다음 20장의 무설명 페이지가 나올 자리였다.
`entry-server.tsx` 의 `if (meta.description)` 분기 2개도 제거했다.

## ⑤ 2차 독립검토 4건 + 산문 3건

| # | 무엇이 틀렸나 | 어떻게 닫았나 |
|---|---|---|
| NEW-1 | sitemap 만 **개수**로 남아 있었다. `<loc>` 115개를 전부 홈으로 바꿔도 두 층 다 통과 | 층1: `.mjs` 가 이미 계산하는 `urlOf(locale, route)` **집합과 비교**. 층2: **경로 집합** 비교 + 실배포일 때만 호스트 비교(sitemap 은 CNAME 으로 만들어지므로 로컬 origin 과는 다르다). 층1 shell 의 개수 단언은 **삭제** |
| NEW-2 | `badAsset` 은 참조가 **있으면** 검증할 뿐 **있으라고 요구하지 않았다** — script 태그를 전부 지우면 통과 | 페이지당 `/assets/*.js` **최소 1개** 요구 |
| NEW-3 | `badActive` 가 재는 것은 **`locale` prop** 이지 번역된 텍스트가 아니다. `translations[locale] ?? en` fallback 은 prop 을 맞은 채 텍스트만 영어로 만든다 | 줄 이름을 실제 재는 것으로 정정(`selector marks its own locale`) **+ 같은 라우트의 로케일 간 본문 텍스트 비교**를 추가 |
| NEW-4 | 페이지 0개인 로케일이 `0 distinct <title> values` 초록 | `titles.length === ROUTES.length` 를 `ok` 앞에 |
| 산문 | ORIGIN 자기일치가 헤더에 없었다 | `.mjs` 헤더에 "독립적이지 않은 기대값 하나" 절 |
| 산문 | `assertSlashInvariant` 의 두 한계 | docblock 에 명시 (양쪽 렌더가 `ssrPath` 비-null → **브라우저가 안 타는 분기만 검사** / SSR 대 SSR 이라 두 엔트리 간 차이는 범위 밖) |
| 산문 | 층1 헤더가 "4개 라우트는 description 이 없다(의도적)" | ③ 으로 거짓이 됐다 — 다시 씀 |

### NEW-3 의 첫 수정은 통과했다 — 그것이 이 라운드에서 가장 중요한 발견이다

`#root` 전체 텍스트를 비교하도록 처음 짰고, **실제 fallback 버그를 넣고 재빌드했더니 통과했다.**
원인은 검사 자신이었다 — **언어 셀렉터 버튼이 현재 로케일의 라벨("English" vs "한국어")을 텍스트로 찍는다.**
번역이 한 글자도 안 됐어도 본문이 달라진다. 내가 보지 않으려던 바로 그 요소가 검사를 무력화했다.

`<main>` 만 비교하도록 바꾸니 **92/92 동일 → red**, 그리고 그것이 **유일한 실패**였다 — 나머지 검사는
전부 영어인 사이트에서 전원 초록이었다. 검토자의 지적이 정확했다는 뜻이고, negative 를 돌리지 않았다면
"고쳤다"고 적은 채 아무것도 잡지 못하는 줄을 남겼을 것이다.

### 층2 에서 스스로 찾은 fail-open 하나 — 같은 모양이 옆칸에 있었다

NEW-4 를 층1 에서 고친 직후, 층2 를 실제 reap.cc 에 돌리다 **똑같은 0/0 을 봤다**:

```
FAIL  locale ko: 23 page(s) did not return 200
ok    locale ko: <html lang="ko"> on every page      ← 존재하지 않는 23장에 대해
```

`<html lang>` 검사가 200 인 페이지에서만 돌기 때문에 0개 중 0개 틀림 = 초록이었다. 4개 로케일에서
거짓 초록이 나왔다. `fetched` 를 세어 **0이면 "not checked" FAIL**, 아니면 **표본 크기를 함께** 출력하도록
고쳤다 (`on all 23 page(s) fetched`). 실측: 실 사이트 실패 수 **14 → 18** — 사이트가 아니라 침묵하던
분기가 말하게 된 것이다.

같은 이유로 `.mjs` 에도 **"검사한 페이지 0장이면 즉시 FAIL"** 을 넣었다 — 파싱은 성공하고 dist 가 비면
모든 `report(0, …)` 이 초록 문장을 찍는다.

## 테스트 (submodule `tests/`)

`tests/unit/docs-wiring.test.ts` 에 `docs root redirect` 블록 **7개** 추가 → 파일 19 pass.
BCP-47 매칭 / 번체 배제 / `/` 전용 / 탭당 1회 / 영어 제외 / 타깃이 라우트 테이블의 로케일 루트인지 /
**클라이언트 배선**(`replace` 사용 + `assign`·`href=` 부재 + **플래그가 navigate 앞에 있는지**).

마지막 것은 소스 텍스트 단언이다. 브라우저를 띄우는 스위트가 없어서이며, **순서만 바꾼 변형도 red 가 되는지**
확인했다 (§ 04 § 3).
