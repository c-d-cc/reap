# 04 — Validation (gen-096-c749d5)

**HEAD** `8677ab7` (커밋 없음) · **로컬 macOS only** · 인수 라운드 2026-08-21 12:30~14:00 +0900

이 세대는 세 번 validation 을 지났다. 1차·2차는 직전 실행자가, **3차(이 문서)는 인수자가** 돌렸다.
1차·2차의 근거는 `03-implementation.md` 와 lineage 에 남고, **이 문서는 인수 라운드 이후의 현재 상태**다.
직전 라운드의 결론을 그대로 옮겨 적지 않았다 — 아래 수치는 전부 이 라운드에서 다시 측정했다.

---

## 0. 이 라운드가 바꾼 것

사용자 결정 4건(`404.html` / 루트 리디렉션 / description 20개 / 커밋 방식)과 2차 독립검토 7건.
**무엇을 어떻게 고쳤는가는 `03-implementation.md` § 인수 라운드**가 소유한다. 여기는 근거만 적는다.

---

## 1. 명령 실행 결과 — [실행] (2026-08-21 13:00~14:00 +0900)

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | exit 0 |
| `cd docs && npx tsc --noEmit -p tsconfig.json` | exit 0 |
| `npm run build` | exit 0 — `dist/cli/index.js` 0.63 MB, grammars 15 |
| `cd docs && rm -rf dist && npm run build` | `prerendered 115 page(s) … 2283 kB, plus 404.html, sitemap.xml and robots.txt` |
| `find docs/dist/public -name index.html \| wc -l` | **115** |
| `npm run test:unit` | **657 pass / 0 fail** |
| `npm run test:e2e` | **329 pass / 0 fail** |
| `npm run test:scenario` | **44 pass / 0 fail** |
| `bash scripts/check-docs-prerender.sh` | **PASSED**, exit 0 — **29 ok** |
| `bash scripts/check-docs-live.sh http://127.0.0.1:8088` | **PASSED**, exit 0 — 18 ok |
| `bash scripts/check-docs-live.sh` (실제 reap.cc) | **FAILED (18)**, exit 1 — 배포 전이므로 의도된 결과. § 4 참조 |
| `bash -n scripts/check-docs-live.sh` | exit 0 |
| `bash scripts/check-self-diagnosis.sh` | exit 0 — `Self-diagnosis passed for v0.17.6.` |
| `bash scripts/check-docs-version.sh` | exit 0 |
| `reap fix --check` | **0 error / 2 warning** (gen-052 상속분 — lineage parent 미발견 2건) |
| `bash scripts/list-carriers.sh --orphans` | orphan **1건** (기존분, `RELEASE_NOTES.md` 의 `id`) |

**unit baseline 은 추측하지 않고 재봤다.** 신규 블록을 파일에서 떼고 돌려 **649 pass** 를 확인했다 —
`environment/summary.md` 44행이 적고 있는 수와 정확히 같다. 3차 수정까지 포함해 **657** 이므로 이
라운드가 **8개**를 더했다. summary.md 의 baseline 은 reflect 에서 **657** 로 갱신한다.

**층2 로컬 실행에 함정이 하나 있었다** — 이전에 띄운 파이썬 서버가 **삭제된 dist 디렉토리를 잡은 채**
포트를 물고 있어서, 같은 포트에 새 서버가 뜨지 못하고 전 페이지가 404 로 나왔다. 스크립트는
`FAILED (12)` 를 냈다 — **호스트가 응답했으므로 측정은 됐고 측정 결과가 틀린 것**이라 SKIP 이 아닌 것이
맞다. `lsof -nP -iTCP:8095 -sTCP:LISTEN` 으로 원인을 확인하고 새 포트로 옮겼다. 층2 를 로컬로 돌릴 때는
**서버 PID 가 이번에 띄운 것인지** 확인할 것.

---

## 2. 실제 브라우저에서 눌러봤다 — [실행]

이 저장소에는 브라우저를 띄우는 것이 없다. **의존성을 추가하지 않고** 하나 띄웠다:
설치된 Chrome 을 `--headless=new --remote-debugging-port=9222` 로 실행하고 **node 22 의 내장
`WebSocket`** 으로 CDP 를 직접 구동했다(패키지 설치 0). GitHub Pages 의 두 동작(디렉토리 인덱스,
`/dir`→`/dir/` 301, 그리고 **`404.html` 을 404 status 로**)을 흉내내는 소형 파이썬 서버 위에서 돌렸다.

**재현 절차** (다음 세대가 그대로 다시 할 수 있도록):

```bash
cd docs && npm run build && cd ..
# Pages 흉내 서버: /dir -> 301 /dir/, 없는 경로 -> 404.html + 404 status
python3 <서버> docs/dist/public 8096 &
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  --headless=new --disable-gpu --no-first-run \
  --user-data-dir=$(mktemp -d) --remote-debugging-port=9222 about:blank &
# CDP: fetch http://127.0.0.1:9222/json/list -> webSocketDebuggerUrl -> new WebSocket(...)
#      Emulation.setUserAgentOverride { acceptLanguage: "ko-KR" } 로 navigator.language 설정
```

**27/27 통과.** 판정한 것:

| 시나리오 | 관측 |
|---|---|
| ko-KR 브라우저가 `/` 에 도착 | `/ko/` 로 이동, `document.documentElement.lang === "ko"`, 플래그 기록됨 |
| **뒤로가기** | `/` 에 착지하지 **않는다** — `location.replace` 가 그 항목을 대체했다 |
| `/ko/` 에서 언어 메뉴로 English 선택 | `/` 로 가서 **머문다**(전체 로드인데도 재이동 없음) |
| 그 상태에서 **새로고침** | `/` 유지 — 사용자의 명시적 선택이 브라우저 기본값에 덮이지 않는다 |
| 뒤로 → 앞으로 | `/ko/` → `/`, **루프 없음** |
| en-US 브라우저가 `/` 에 도착 | 움직이지 않는다 |
| 5개 주소에서 하이드레이션 | 로케일 루트 / 슬래시 없는 주소(301) / 슬래시 주소 / 영어 딥페이지 / **없는 주소(404.html)** — 전부 `__reactContainer` 부착 + **콘솔 에러 0** |
| `404.html` | 없는 주소에서 `<h1>404 Page Not Found</h1>` 를 그리고 **주소를 바꾸지 않는다** |

제외한 콘솔 에러 2종과 근거: Cloudflare 비콘(Origin 이 127.0.0.1 이라 거부 — 로컬 서빙의 성질),
그리고 일부러 없는 URL 의 404 status. 나머지는 제외하지 않았다.

### 부수 측정 — 인계받은 F1 서술이 과장이었다

04-validation 1차가 *"사이드바의 현재 위치 표시는 직접 링크·검색·README 로 들어온 **모든 방문에서
사라진다**"* 라고 적었다. F1 을 **일부러 되살린 빌드**(`stripTrailingSlash` 제거 + 불변식 비활성)에서 실측:

| | 결함 빌드 | 고친 빌드 |
|---|---|---|
| `/ko/docs/quick-start` 직접 방문, 첫 페인트 | 하이라이트 **있음**, 콘솔 **조용** | 있음, 조용 |
| 다른 페이지로 이동 → **뒤로** | 하이라이트 **사라짐** | **남음** |

**프로덕션 React 는 하이드레이션 중 속성을 비교하지 않는다** — 서버가 쓴 `text-primary` 가 그대로 살아남고
경고도 없다. 결함은 실재하지만 **그 주소에서 첫 리렌더** 때 드러난다. 두 가지 결론:

1. 1차의 문장은 **메커니즘은 맞고 파급을 지어냈다**. 정정해 `entry-server.tsx` docblock 에 실측을 적었다.
2. **내 브라우저 프로브도 이 결함을 통과시킨다.** 콘솔 에러·첫 화면으로는 못 잡는다 —
   `assertSlashInvariant` 의 바이트 비교가 잡는 이유가 이것이고, 그 근거가 이제 측정으로 뒷받침된다.

---

## 3. Negative — 이 라운드에서 손으로 돌린 것

### 3a. 층1 (`check-docs-prerender.sh` + `.mjs`) — fixture 격리

`docs/src`·`docs/public` 을 symlink 하고 `dist/public` 만 복사한 임시 ROOT 를 만들어 변형했다.
**변형 없는 fixture 는 exit 0** 이므로 fixture 자체가 red 를 만들지 않는다.

| 주입한 결함 | 관측된 red |
|---|---|
| `<loc>` 115개를 전부 홈 URL 로 (**NEW-1**) | `sitemap.xml lists 1 distinct URL(s): 114 missing, 0 unexpected` |
| 115장에서 module script 제거 (**NEW-2**) | `115 page(s) reference no /assets/*.js` |
| 로케일 `ko` 디렉토리 삭제 (**NEW-4**) | `23 locale/route combination(s) missing` + `locale ko: collected 0 title(s) from 23 route(s)` |
| `cp index.html 404.html` (**①의 회귀**) | `404.html: 5 problem(s)` |
| `404.html` 의 noindex 제거 | `404.html: 1 problem(s)` |
| `404.html` 에 canonical 추가 | `404.html: 1 problem(s)` |
| `404.html` 삭제 | `404.html is missing` |
| 루트를 한국어 페이지로 교체 (**②**) | `the site root is not the English page` (+ lang·canonical·selector·본문 4건) |
| description 1개를 빈 값으로 (**③**) | `1 page(s) have no usable meta description` |
| description 을 전 페이지에서 제거 | `115 page(s) have no usable meta description` |
| `dist` 의 index.html 전부 삭제 | `no pages were examined under …` (즉시 종료) |

### 3b. **NEW-3 — 첫 수정은 통과했다.** 검사를 고쳐야 잡혔다

`src/i18n/index.ts` 를 **실제 fallback 버그**(`return translations.en`)로 바꿔 **재빌드**했다.
마크업을 손질한 것이 아니라 검토자가 지목한 결함 그 자체다. head 는 정상 한국어, 셀렉터 마커도 정상.

- **`#root` 전체 텍스트 비교 → 통과했다.** 언어 셀렉터 버튼이 현재 로케일 라벨을 **텍스트로** 찍기 때문이다
  ("English" vs "한국어"). 번역이 하나도 안 돼도 본문이 달라진다
- **`<main>` 만 비교 → `92 page(s) show the English text under a non-English URL`, exit 1**
- 그리고 그것이 **유일한 실패**였다 — canonical·hreflang·셀렉터·active·title 은 전부 영어인 사이트에서
  전원 초록. 검토자의 지적이 정확했다는 증거이자, 이 줄이 유일하게 그 결함을 덮는다는 증거다
- 원상복구 후 재빌드 → 전원 초록 재확인

### 3c. 층2 (`check-docs-live.sh`)

| 주입한 결함 | 관측된 red |
|---|---|
| `<loc>` 전부 홈 URL (**NEW-1**) | `sitemap.xml lists 1 distinct path(s): 114 missing, 0 unexpected`, exit 1 |
| sitemap 호스트가 origin 과 다름 | `115 sitemap URL(s) name a different origin than …` |
| 로케일 전체가 404 (실 사이트) | `locale ko: <html lang> was not checked — no page returned 200` |

**호스트 단언 두 leg 는 fixture 로 돌렸다** — 스크립트 사본에서 `https://` 를 `http://` 로 한 글자 바꾸고
CNAME 을 로컬 주소로 둔 임시 ROOT. fail/pass 양쪽을 관측했다. **실제 배포 origin 에서는 아직 돌지 않았다**
(sitemap 이 404 라 그 분기에 닿지 않는다). 합성 fixture 임을 여기 적어둔다.

### 3d. unit (`tests/unit/docs-wiring.test.ts`)

신규 7개. **다섯 가지 변형이 각각 정확히 1개 테스트만** red 로 만든다 (단언이 겹치지 않는다):

| 변형 | red 가 된 테스트 |
|---|---|
| `pathname !== "/"` 가드 제거 | `only the site root redirects` |
| `alreadyRedirected` 가드 제거 | `it happens once, and never for English` |
| 번체를 간체에 매칭 | `Simplified Chinese matches; Traditional does not` |
| `location.replace` → `assign` | `the client entry replaces the history entry and records it first` |
| **플래그 기록을 navigate 뒤로 이동**(순서만) | 같은 테스트 |

마지막 것이 중요하다 — 이 저장소의 교훈("순서가 결정이면 순서 단언만이 그것을 지킨다")대로,
**기능은 그대로 두고 순서만 바꾼 변형**을 따로 돌려 red 를 확인했다.

### 3e. 빌드 불변식

`assertSlashInvariant` 를 비활성화하고 `useNormalizedLocation` 을 되돌려야 결함 빌드를 만들 수 있었다
— 즉 **하나만 되돌리면 빌드가 멈춘다**. 이것이 이 라운드에서 다시 관측한 불변식의 유효성 근거다.

---

## 4. 검사가 못 잡는 것

이 라운드에서 **줄어든 것과 늘어난 것**을 함께 적는다.

**여전히 못 잡는다**:

- **속성 수준 하이드레이션 불일치.** § 2 에서 측정했다 — 프로덕션 React 는 속성을 비교하지 않으므로
  콘솔도 첫 화면도 조용하다. 브라우저 프로브조차 F1 을 통과시킨다. `assertSlashInvariant` 의 바이트
  비교만이 잡는다
- **실제 GitHub Pages 동작.** 로컬 파이썬 서버는 두 동작만 흉내낸다. DNS/TLS·배포 워크플로가 빌드한 것을
  올렸는지는 배포 후 첫 층2 실행이 답한다
- **층1/층2 게이트 자신에 대한 자동 회귀 검사가 없다.** 위 negative 는 **손으로** 돌린 것이고, 다음 세대가
  게이트를 고칠 때 자동 재확인되지 않는다. 이 세대가 그 빈틈을 다시 늘렸다(층1 `.mjs` 에 5절, 층2 에 2절)
- **브라우저 프로브는 저장소에 없다.** 29개 판정은 scratchpad 의 일회성 스크립트다. 재현 절차는 § 2 에
  있지만 **다음에 누가 다시 돌린다는 보장은 없다**. team lead 에 저장소 편입 여부를 물었다
- **브라우저를 띄우는 것만으로는 부족하다 — 시나리오가 한 종류면 한 종류만 안다.** § 6b B1 이 그것이다.
  27개 판정이 전부 "`/` 에 도착"으로 시작했고, 진입 지점을 바꾸자 blocking 이 나왔다. 지금은 5종류
  (`/` / 4개 로케일 루트 / 딥페이지)를 돈다 — **여전히 열거이고, 다음 빈틈은 열거 밖에 있다**
- **ORIGIN 자기일치.** 층1 은 prerenderer 가 읽은 것과 **같은 CNAME** 을 읽으므로 잘못된 도메인은 자기
  자신과 일치한다. 층2 만이 그 도메인에 실제로 요청한다 (`.mjs` 헤더에 명시)
- **로케일이 서로 뒤바뀐 경우.** `<main>` 텍스트 비교는 "영어인가 아닌가"를 가른다. ko 페이지에 ja 본문이
  들어가면 두 층 다 통과한다
- **Tailwind 클래스 의존.** active 판정이 `text-primary font-medium` 문자열에 걸려 있다 — 재스타일하면
  깨지되 **닫히는 방향**이다
- **ja/de/zh-CN description 의 품질.** 원어민 검증 수단이 없다 (§ 5)

**이 라운드에 새로 덮인 것**: sitemap 의 **값**(두 층) / 페이지가 하이드레이션할 번들을 **참조하는지** /
**본문이 실제로 번역됐는지** / 페이지 0장·로케일 0장에서의 거짓 초록(두 층) / `404.html` 의 정체·noindex·
URL 부재 / 루트가 영어인지 / 모든 페이지에 description 이 있는지.

---

## 5. 사용자 결정 3건의 이행 상태

- **① `404.html`**: (B) 대로 이행. `cp` 제거, prerender 한 NotFound, noindex, canonical **없음**, og **없음**.
  층1 이 5가지를 단언하고 negative 4종이 red. **남는 흠 하나**: NotFound 본문이 개발자용 문구
  (*"Did you forget to add the page to the router?"*)이고 밝은 배경(`bg-gray-50`)이라 다크 사이트와 다르다.
  **이 세대의 회귀가 아니다** — 이전에도 클라이언트 렌더로 같은 화면이 나왔다. 다만 이제 정적으로 나가므로
  손볼 값어치가 커졌다. 5개 언어 문구가 필요하므로 hints 로 넘긴다
- **② 루트 1회 리디렉션**: 이행 + 브라우저 확인(§ 2). `/docs/*` 를 포함해 `/` 외 어떤 경로도 건드리지 않는다
- **③ description 20개**: 이행. 전문은 `05-completion.md`. **ja/de/zh-CN 은 `[독해]`**

---

## 6. 3차 독립 검토

genome (`evolution.md` § 독립 검토는 한 번으로 수렴하지 않는다) 이 "매 라운드의 결함은 직전 라운드의 수정
안에 있다"를 처방한다. 이 세대에서 그것이 **세 번 성립했다** — 1차가 F1 을, 2차가 1차 수정의 게이트 4종을,
그리고 이 라운드에서 **내 NEW-3 수정 자신이 통과했고**(§ 3b) **NEW-4 수정 옆칸에 같은 0/0 이 있었다**(§ 1).

### 6b. 3차가 낸 것 — **blocking 1 + fail-open 3 + 낡은 문장 5**. 전부 이 라운드가 만든 것 안에 있었다

#### B1 (blocking, 사용자 대면) — 리디렉션이 언어 선택을 되돌렸다

플래그를 **리디렉션이 실제로 일어났을 때만** 기록했다. 그래서 `/` 가 아닌 곳으로 들어온 탭에는 플래그가
없고 — 검색 결과로 `/ko/` 에 도착하는 방문자, 즉 **이 세대가 만들려는 바로 그 인구다** — 언어 메뉴에서
English 를 고르면 전체 로드로 `/` 에 도착해 `location.replace("/ko/")` 로 **되튕겼다.**

**[negative] 내가 먼저 재현했다** (헤드리스 Chrome, Pages 흉내 서버):

```
ko-KR  entered /ko/     -> click English -> /ko/     -> again -> /
ja-JP  entered /ja/     -> click English -> /ja/     -> again -> /
de-DE  entered /de/     -> click English -> /de/     -> again -> /
zh-CN  entered /zh-CN/  -> click English -> /zh-CN/  -> again -> /
en-US  entered /ko/     -> click English -> /        (영향 없음)
```

**두 번째 클릭은 된다** — 되튕기는 과정에서 플래그가 써지기 때문이다. "한 번은 안 먹고 두 번째엔 먹는"
증상은 아예 안 되는 것보다 진단하기 나쁘다.

**왜 § 2 의 27개 판정이 놓쳤는가**: 모든 행이 *"ko-KR 브라우저가 `/` 에 도착"* 으로 시작한다. 플래그가
이미 있는 상태만 시험했고 **진입 지점을 한 번도 바꾸지 않았다.** 브라우저를 띄운 것으로 충분하지 않았다 —
시나리오가 한 종류였다.

그리고 내 docblock 두 개가 **없는 보호를 있다고 적고 있었다**: *"플래그가 English 를 고르는 방문자를
지킨다"*, 그리고 언어 셀렉터를 *"a wouter navigation"* 이라고 서술했다 — 실제로는 plain `<a href>`
전체 로드다(T006 에서 그렇게 바꿨고, § 2 의 내 표에도 *"전체 로드인데도"* 라고 적혀 있다).
**메커니즘을 잘못 적은 것이 커버리지를 잘못 추론한 이유다.**

**수정**: 플래그를 **모든 페이지 로드에서, 판단하기 전에** 기록한다. 이름도 사실에 맞췄다
(`reap-docs-tab-seen` / `tabHasSeenAPage`) — 규칙이 *"이 탭이 이미 페이지를 받았는가"* 가 되어,
`/ko/` 로 들어온 탭은 처음부터 표시돼 있고 English 선택이 유지된다. 새 탭이 `/` 로 **직접** 오는
경우에만 이동한다.

**[실행] 수정 후 브라우저 재측정 — 29/29**:

| 시나리오 | 결과 |
|---|---|
| 새 탭이 `/` 에 도착 (ko-KR) | `/ko/` 로 이동, lang=ko, 플래그 기록, 하이드레이션 |
| 뒤로가기 | `/` 에 착지하지 않는다 |
| `/` 진입 후 English 선택 → 새로고침 | `/` 유지 |
| **`/ko/`·`/ja/`·`/de/`·`/zh-CN/` 진입 후 English 선택** | **4개 전부 `/` 로 가서 머문다** |
| `/docs/quick-start` 진입 → 로고 클릭 → **새로고침** | `/` 유지 |
| en-US 브라우저 | 움직이지 않는다 |
| 5개 주소 하이드레이션 + 콘솔 에러 | 전부 부착, 에러 0 |
| `404.html` | NotFound 를 그리고 주소를 바꾸지 않는다 |

#### M2 (moderate) — `<main>` 비교가 fail open 이었고 docblock 이 반대를 주장했다

`if (!enText) continue` — `visibleText()` 가 `<main>` 부재 시 `""` 를 반환하고 `""` 는 falsy 이므로
**그 라우트를 통째로 건너뛰었다.** docblock 은 *"부재 시 모든 비교가 같아져 red 가 된다"* 고 적고 있었다.

| 조작 | 수정 전 | 수정 후 |
|---|---|---|
| 92장의 `<main>` 을 영어 것으로 교체 | red | red |
| **같은 조작 + `<main>`→`<section>` 전면 개명** | **exit 0, 초록 문장** | `115 page(s) have no readable <main>` + `92 page(s) show the English text …` |

수정: `bodyText.has()` 로 **파일 부재**(missing-combination 이 소유)와 **`<main>` 부재**를 분리하고,
후자를 **별도 줄로 직접 단언**한다 — 동등성에 기대면 한 장만 잃었을 때 "번역 문제"로 보고된다.

#### M3 (moderate) — 실행되지 않는 참조가 통과했다

`(?:src|href)=` 로 세었으므로 `<link rel="modulepreload" href="/assets/x.js">` 도 만족시켰다.
번들을 내려받고 **실행은 하지 않는다** — 이 단언이 존재하는 이유 그 자체다.
**[negative]** 115장의 script 태그를 modulepreload 로 치환: **exit 0 → `115 page(s) reference no /assets/*.js`**.
수정: `<script[^>]+src="…\.js"`.

#### M4 (moderate) — 내가 40줄 위에서 고친 0/0 이 같은 파일의 대칭 케이스에 남아 있었다

`<loc>` 가 0개면 `off_host` 도 0이라 `every sitemap URL names …` 가 초록이었다.
**[negative]** `<loc>` 를 전부 지운 sitemap + deploy 모드: `sitemap host was not checked — the sitemap
listed no URLs` FAIL. 함께 발견된 것 하나 더 — `grep -cv "^$ORIGIN/"` 이 **ORIGIN 을 정규식으로** 읽어
`reap.cc` 가 `reapXcc` 를 받아들였다. `awk index()` 로 교체하고 격리 실측했다:

```
$ printf 'http://127X0.0.1:8090/\n...' > locs.txt ; ORIGIN=http://127.0.0.1:8090
old (grep, 정규식): off_host=0   ← "전부 올바른 호스트"
new (awk, 리터럴) : off_host=2
```

#### M5 — 낡은 문장 5건. 둘은 "숫자는 조용히 낡는다"를 설명하는 문단 **안**에 있었다

| 어디 | 무엇이 틀렸나 | 처리 |
|---|---|---|
| `check-docs-live.sh` 헤더 | *"14 failures"* — 지금 **18**. 그리고 9→14 를 설명하는 바로 그 문단이 14 를 들고 있었다 | 18 로 고치고 **9→14→18 각각의 이유**를 적었다 |
| `.mjs` `<main>` 비교 | *"최단 영어 페이지 1,645자"* — 그것은 **`#root`** 수치, 즉 **패배한 첫 버전**의 측정값 | `<main>` 기준 **1,207자**(`/docs/comparison`)로 정정 + 1,645 가 무엇이었는지 명시 |
| 층1 헤더 (③ 때문에 이번에 다시 쓴 문장) | *"no two pages share them"* — description 중복 검사는 **없다**. 그리고 실제로 공유한다 | 삭제 + `/docs/hooks`·`/docs/hook-reference` 가 `t.hooks.intro` 를 **의도적으로** 공유한다는 사실 명시 |
| `main.tsx` docblock | English 선택이 *"wouter navigation"* | plain `<a>` 전체 로드로 정정 (B1 의 원인) |
| `environment/summary.md` · `source-map.md` | 게이트가 `404.html` 을 안 본다 / description 없는 4개 라우트 / 3단계 빌드에 `404.html` 없음 | **reflect 에서 처리** — genome 이 generation 중 environment 직접 수정을 금한다 |

#### cosmetic

- `preferredLocale` 이 비-문자열 tag 에서 throw 했고 **그 throw 는 try 밖**이라 하이드레이션이 죽는다 → 가드 추가
- `04-validation.md` 의 `unit 640` 표기 정정 (파일은 **649**)
- 404 본문 단언이 `"404 Page Not Found"` 리터럴에 걸려 있다 — 그 문구를 5개 언어로 다시 쓰는 작업(§ 5 ①)을
  하는 사람은 게이트에 걸린다. **닫히는 방향**이라 두었고 hints 에 적는다

#### 3차가 깨뜨리지 못한 것 (재작업 불요)

`404.html` 하이드레이션(임의 주소 4종, 콘솔 에러 0, 주소 불변) / 404 게이트 블록(통과하는 잘못된
404 를 만들지 못함) / 층1 sitemap 집합 / "0 pages examined" 가드 / `cp` 제거의 부작용 / `preferredLocale`
경계 / unit 7개의 변별력(순서-only 변형 포함) / 리디렉션 범위(`/` 외 어떤 주소도 트리거하지 않음).

### 6c. 4차 독립 검토

결과는 아래에 기록한다.

---

## 7. Verdict

**pass**

- 사용자 결정 4건 중 3건(①②③)이 코드에 반영되고 각각 negative 로 뒷받침됐다. ④(커밋 방식)는 completion
  commit 단계에서 이행하며, 그 자리에서 실측 확인한다
- 2차 검토 지적 7건 전부 반영, 그중 NEW-1~4 는 **재현 → 수정 → 재현 실패** 순으로 확인
- 게이트 전종 통과, 테스트 세 스위트 0 fail, baseline 갱신치 확보
- 실 사이트 층2 는 **red 가 정상** — 아직 배포되지 않았다
- 3차 독립 검토의 blocking 1 + moderate 3 + 산문 5 를 **재현 → 수정 → 재현 실패** 로 닫았다.
  environment 2건만 reflect 로 넘긴다 (§ 6b M5)
