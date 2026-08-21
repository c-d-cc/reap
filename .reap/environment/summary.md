# Environment

## Project

- Source: `~/cdws/reap/` (branch: main)
- Package: `@c-d-cc/reap` v0.17.6 — 단일 패키지
- Config language: korean

## Tech Stack

- Runtime: Bun (build), Node.js (execution)
- Build: `bun build` → single bundle (`dist/cli/index.js`, ~0.63MB) + `dist/grammars/` (15 wasm)
<!-- reap:carrier(zero-native-dependency) -->
- Dependencies: `yaml` v2 + `web-tree-sitter` 0.22.6 — **네이티브 빌드 0**. 후자는 번들에서
  `--external` 이며, 그 근거는 `scripts/build.sh` 주석이 소유한다 (인라인하면 깨진다는 것은
  **입증되지 않았다** — gen-089 가 시험했고 통과했다)
- Grammars: `tree-sitter-wasms` 는 **devDependency**. `scripts/build.sh` 가 REAP 이 인덱싱하는
  15개만 `dist/grammars/` 로 복사하며, **대상 목록을 `src/templates/tree-sitter/*-tags.scm` 에서
  파생**한다 — 목록을 두 곳이 알지 않는다. 발행 tarball +2.4MB(gzip), 전체 36개(+4.4MB)가 아니다
- CLI Framework: 자체 구현 (`src/libs/cli.ts`) — commander/yargs 대신
- Crypto: Node.js native `crypto` (nonce, hash)
- VCS: Git (child_process 직접 호출)
- Type System: TypeScript — 선언은 `^5.7.0`, **실제로 도는 것은 5.9.3** (caret 범위라 갈린다. 수치를 인용할 땐 `npx tsc --version` 을 볼 것). strict mode, ESM

## Source Structure

코드 구조·모듈별 역할·소유권은 **`environment/source-map.md`** 가 소유한다 (on-demand).
`summary.md` 는 자동 로드되므로 파일 수에 비례해 커지는 서술을 담지 않는다 — 그것이 이 절이 분리된 이유다.

**코드를 수정하기 전에 `environment/source-map.md` 를 열 것.** 무엇이 존재하고 무엇이 무엇을 부르는지는
`reap index` 가 답하지만, 각 모듈이 무엇을 위한 것이고 왜 그렇게 생겼는지는 그 문서에만 있다.

여기에 한 줄만 남기는 이유는 **새 사본을 만드는 것을 막기 위해서**다 (gen-092):
**우리 버전·패키지 루트·설치 종류를 아는 곳은 `src/core/package-info.ts` 하나다.**
버전만 해도 다섯 곳이 알고 있었고 넷은 서로의 사본이라고 주석에 스스로 적어두고 있었으며,
다섯째는 `execSync("reap --version")` 으로 **다른 질문에 답하고** 있었다. 필요하면 import 할 것 —
`packageVersion`(순수 버전, 사용자 config 에 기록됨) / `runningVersion`(+`+dev` 마커) /
`runningVersionOrNull`(행동을 결정하는 소비자용) 이 나뉜 이유는 그 파일이 설명한다.

## Tests

### tests/ submodule (reap-test repo, main branch)

현재 baseline — **unit 736 / e2e 355 / scenario 55, 세 스위트 모두 0 fail.** 이 수치와 다르면 회귀를 의심할 것 (다음 세대가 판단하는 기준이므로 변경 시 갱신).

`src/indexer/` 의 이식된 모듈(call-resolver/impact/scanner/parser/pipeline)에는 **unit test 가 없다** — 그쪽은 지금 e2e 로만 덮인다.

`tests/scenario/multi-generation.test.ts` 는 gen-065 backlog gate 를 시나리오로 커버한다 — pending 이 있으면 `run start` 가 `status: "prompt"` 로 막히고, `--backlog`(소비) 또는 `--no-backlog`(유지) 로 재호출해야 진행된다. 새 scenario 가 backlog 파일을 만든다면 같은 gate 를 거치므로 이 패턴을 참고할 것.

지원 자산:
- `tests/helpers/setup.ts` — `cli` / `cliRaw` / `setupProject` / `setupGitProject` / `advanceStage` / `cleanup`. 대부분의 e2e·scenario 가 여기만 import 한다. **`cli()` 는 HOME 을 격리하지 않는다** — CLI 진입점이 사용자 레벨 자산을 동기화하므로 스위트 실행이 개발자의 실제 `~/.claude/`·`~/.reap/` 에 버전당 1회 쓴다. 사용자 레벨을 다루는 테스트는 `cliWithHome`(각 파일 로컬, `XDG_CONFIG_HOME` 도 함께 제거) 을 쓴다
- `tests/unit/shipped-docs-no-daemon.test.ts` — **트리 전체를 훑어 폐기된 이름을 금지하는 검사.**
  대상은 `src` · `docs/src` · `scripts` · `.github` · genome 3파일 · **`tests/` 전부**.
  두 가지가 눈에 띄지 않는다: **`tests/` 는 submodule 이라 listing 을 그 안에서 떠야 하고**
  (루트에서 `git ls-files tests` 는 gitlink 한 줄만 낸다 — 아무것도 훑지 않으면서 통과한다),
  **`git ls-files` 는 `-z` 없이는 비-ASCII 경로를 C-quote 한다** (이 저장소의 backlog 파일명이 전부
  한글이다). 제외는 **경로 하나에 근거 하나**이며 묶으면 안 된다 — 묶인 항목은 그중 하나만 읽힌다.
  범위 밖: `README*` · `RELEASE_*` · `CLAUDE.md` · `AGENTS.md` · `.reap/environment/*` ·
  `.claude/commands/*` (전부 현재 clean 이지만 **검사는 없다**)
- `tests/unit/docs-wiring.test.ts` — `docs/src/App.tsx` 의 `<Route path>` 와 `AppSidebar.tsx` 의
  `href` 가 일치하는지 + 5개 로케일이 페이지 키를 각각 정확히 1회 갖는지. **라우트 불일치는 어떤
  언어에서도 타입 오류가 아니다** — 증상은 NotFound 로 가는 사이드바 항목뿐이라 테스트가 필요하다
- `tests/e2e/index-incremental.test.ts` — **판정 기준이 "incremental 결과 == full rebuild 결과"** 다. "incremental 이 돌았는가"만 묻던 판이 blocker 넷을 통과시켰다. `snapshot()` 은 집계가 아니라 **edge 집합 자체**를 비교하고 shard 는 `manifest.shards` 로 찾는다

버전 의존 assertion 주의: `tests/e2e/update-migration.test.ts` 는 패키지 버전을 `package.json` 에서 읽는다(`PKG_VERSION`). 릴리즈 버전을 하드코딩하면 bump 마다 깨진다 — 단, "특정 버전의 migration note"를 검증하는 케이스는 하드코딩이 맞다.

**격리가 닿지 않는 축 — 실측된 것 (genome 에서 이관, gen-090).** genome 은 "닿지 않는 축은 값을
주입하라"는 규칙만 갖는다. 무엇이 닿지 않는지는 런타임·플랫폼 사실이라 여기가 집이다:

- **`$HOME` 은 spawn 된 자식에게만 닿는다.** bun 의 `os.homedir()` 는 `$HOME` 을 무시한다(node 는
  따른다). in-process 코드에는 디렉토리를 **주입**해야 한다
- **macOS 의 `/var` 는 `/private/var` symlink 다.** 경로 비교가 어긋나므로 `realpath` / `pwd -P` 로
  양쪽을 정규화한다. gen-089 에서 코드와 게이트 양쪽에서 재발했고, 코드 쪽은 **사용자에게 빈 결과를
  주는 실제 결함**이었다
- **`XDG_CONFIG_HOME`** 은 아래 § OpenCode 경로 절 참조 — `HOME` 하나만 가짜로 주면 격리가 성립하지 않는다

**테스트는 머신 상태를 읽지 않는다 (gen-081)** — CI 를 붙이자 세 곳이 개발자 머신에 의존하고 있었다:
**git identity 는 저장소마다** 설정한다(clone·submodule 은 상속받지 못한다) / **`git init` 은 항상
`-b main`** (미명시 시 머신의 `init.defaultBranch`, 미설정이면 `master`) / **`mock.module` 은 프로세스
전역이며 되돌릴 수 없다** — 그래서 `test:unit` 이 `--isolate` 를 쓴다(`pull.test.ts` 주석이 근거를
소유한다). **bun 을 직접 불러 unit 을 돌리면 이 보호가 없다.**

리눅스 러너 조건은 `oven/bun:<ver>-debian` + `apt-get install git` + `-e GIT_CONFIG_GLOBAL=/dev/null` 로 만든다 (기본 `oven/bun` 에는 git 이 없다).

### scripts/ (프로젝트 루트)
- `scripts/build.sh` — bun build + 정적 자산 복사 (claude-code skills, opencode plugin/templates)
- `scripts/alpha-publish.sh` — alpha 배포 헬퍼
- `scripts/postinstall.sh` — npm postinstall hook
- `scripts/check-self-diagnosis.sh` — **자기진단 게이트**. `npm pack` → 격리 HOME/prefix 에 설치 → `reap init` → `fix --check` 가 **경고·에러 0** 을 요구. 8개 절: 빌드·설치·init·진단 / **인덱스** / install script 차단 / OpenCode / uninstall. init 절은 **greenfield 가 `environment/source-map.md` 를 실질 내용과 함께 쓰는지**도 요구한다 — 배포되는 genome 이 그 파일을 읽으라고 지시하므로, 전제를 installer 가 만들지 않으면 규칙이 허공을 가리킨다. release publish 앞 + CI 매 push 양쪽에서 실행. 대화로 채워지는 genome/goals 는 스크립트가 채운 뒤 진단 — 그것까지 요구하면 REAP 정상 동작에 fail 한다. 끄는 스위치는 두지 않는다 — 비용이 문제가 되면 release 전용으로 옮긴다
- `scripts/list-carriers.sh` — **carrier 표식 조회 (gen-078)**. `reap:carrier(<id>)` 마커를 grep 해 ID 별 파일 목록 출력. `--orphans` 는 1개 파일에만 있는 ID 탐지 — 표식 불필요이거나 **다른 carrier 를 빠뜨린 것**(#21/#22 의 상태)
<!-- reap:carrier(agent-integration-gate-verdicts) -->
- `scripts/check-agent-integration.sh` — **agent 통합 검증 / 층2 (gen-079, gen-091)**. 헤드리스 `claude -p` 로 `/reap.start` 를 시키고 **`current.yml` 생성 여부**로 판정한다. **격리하지 않는다** — Claude Code 는 로그인을 slash command 와 같은 `~/.claude/` 에 두므로 HOME 격리 시 인증을 잃는다. 현재 설치를 읽기만 하고 임시 프로젝트에만 쓴다(권한 허용 `Bash(reap:*)` 도 그 안에만). **~$0.25/회** 라 CI 아닌 릴리즈 전 (`reapdev.versionBump` Step 5-2).
  - **답이 셋이다** — pass / FAIL / **amber SKIP(exit 0)**. 세 번째는 `/reap.start` 가 시키는 `reap run` 명령이 거부됐을 때이며 *"검사가 아무것도 측정하지 못했다"* 를 뜻한다. **검사 실패와 측정 실패는 다르다** — gen-091 이전에는 그것을 FAIL 로, 그것도 `This is the gen-063 failure exactly` 로 단정해 릴리즈가 없는 결함을 쫓았다. 부재 FAIL 은 이제 원인을 열거하고 agent 응답과 거부 항목을 함께 싣는다.
  - **통과가 증명하는 것은 하나 반이다.** `CLI reachable` 은 생성된 generation 이 증명한다. `slash command 노출` 은 **agent 가 우회 금지 지시를 지켰을 때만** 성립한다 — 슬래시 커맨드는 CLI 의 wrapper 라 우회가 바이트 동일한 파일을 남긴다(gen-079 실측). **`@` import 로드와 SessionStart hook 발화는 증명하지 않는다** — `/reap.start` 는 둘 없이도 성공한다. 여섯 세대 동안 넷을 주장했다.
- `scripts/check-version-floors.sh` — **버전 하한 게이트**. reap 이 사용자에게 "이 버전으로 올려라"라고 말하는 숫자(`package.json` 의 `reap.autoUpdateMinVersion`)가 npm 에 **실제로 발행돼 있는지** 검사한다. 값은 소스에서 읽는다(carrier 표식). 네트워크 실패·비-JSON 은 amber SKIP, **패키지 자체가 없으면(`E404`) FAIL** — 그 둘을 구분하지 않으면 이름 오타가 조용히 통과한다. `release.yml` 의 `npm publish` 앞. **CI 에는 없다** — 매 push 마다 네트워크가 필요하고, 코드와 무관한 이유로 주기적으로 SKIP 을 내는 검사는 사람이 스크롤로 넘긴다
- `scripts/check-docs-prerender.sh` + `.mjs` — **docs prerender 게이트 / 층1 (gen-096)**. 빌드 산출물을 읽어 115 페이지가 실제로 놓였는지 본다: 개수·크기 하한·영어 무접두사·README 가 거는 15경로·sitemap·robots 는 `.sh` 가, **페이지 내부의 값**은 `.mjs` 가 본다 — canonical / hreflang **대상 URL** / 언어 셀렉터 href / 활성 로케일 / 참조 asset 존재. `.mjs` 는 기대값을 **파일의 디스크상 위치에서 재계산**하며 `entry-server.tsx` 를 import 하지 않는다 (검사기가 대상과 기대값을 공유하면 틀린 값이 자기 자신과 일치한다). 로케일 목록만 소유자 `docs/src/i18n/types.ts` 에서 읽는다. `docs.yml` 의 upload 앞에 있고 **`paths:` 에 이 두 파일이 들어 있다** — 없으면 게이트를 고쳐도 게이트가 안 돈다.
  - **못 보는 것**: 배포된 사이트에 대한 일체(층2 담당) · 실제 브라우저 하이드레이션 · `404.html`(게이트는 `cp` **앞**에서 돌고 `index.html` 만 센다) · description 이 없는 4개 라우트(원본 문자열이 없어 의도된 부재)
- **배포된 사이트가 실제로 무엇을 내는지 보는 것은 층2 뿐이고, 리디렉션이 브라우저에서 일어나는 것을 보는 것은 아무것도 없다** (gen-096 4차 F1). 소스 순서 단언 4개가 그 자리를 지키지만 그것들은 문자열 위치와 순수 함수를 볼 뿐이다. 브라우저를 띄우는 검사는 저장소에 없다 — gen-096 이 CDP 프로브를 만들어 B1 을 그것으로만 잡았으나 저장소에 들어가지 못했다
- `scripts/check-docs-live.sh` — **docs 배포본 게이트 / 층2 (gen-096)**. 115 URL 에 HTTP 를 보내 200 · 셸 아님 · `<html lang>` · 로케일 내 고유 `<title>` · sitemap · robots 를 본다. **답이 셋** — pass / FAIL / **amber SKIP(exit 0)**, 세 번째는 호스트가 응답하지 않을 때이며 *"검사가 아무것도 측정하지 못했다"* 를 뜻한다. **origin 을 인자로 받는다**: `python3 -m http.server` 로 `dist/public` 을 띄우면 **2초에 pass 를 관측할 수 있다** — 그 서버가 Pages 의 두 동작(디렉토리 인덱스, `/dir`→`/dir/` 301)을 재현하기 때문이다. 로컬 pass 가 증명하지 못하는 것은 실제 Pages 동작·DNS/TLS·배포 워크플로가 빌드한 것을 올렸는지다. CI 에 없다 — 배포 후 수동
- `scripts/check-docs-version.sh` — 릴리즈 문서 정합성 게이트. `RELEASE_NOTICE.md` / `RELEASE_NOTES.md` / 5개 로케일 changelog 가 `package.json` 과 일치하는지 + **로케일 간 항목 집합 동일성** + migration note 가 패키지 버전을 넘지 않는지 검사. `release.yml` 의 `npm publish` 앞과 `reapdev.versionBump` Step 5-1 에서 실행

### npm scripts
- `npm run build` — bun build → 단일 번들 + 정적 자산 복사 / `npm run dev` — bun 직접 실행(빌드 불필요) / `npm run typecheck` — tsc --noEmit (**`src/**` 만 본다**)
- `npm run typecheck:docs` — `cd docs && npx tsc --noEmit -p tsconfig.json`. **`docs/` 를 타입체크하는
  유일한 수단**이다: 루트 tsconfig 는 `src/**` 만 담고 `vite build` 는 esbuild 라 타입을 보지 않는다.
  `Translations = typeof en` + `Record<string, Translations>` 구조 덕에 **로케일 하나만 개명하면 red** 다.
  `.github/workflows/docs.yml` 이 배포 전에 같은 명령을 돌린다 (스크립트를 `cd docs` 형태로 둔 이유 —
  CI 호출과 철자를 하나로 유지한다)
- `npm run test:unit` — bun test **--isolate** tests/unit/ (격리 이유는 위 Tests 절)
- `npm run test:e2e` / `npm run test:scenario` / `npm run test` (전체)
- `postinstall` — skill 자동 설치 + v0.15 감지 안내

## Types (주요 타입)
- `HookResult` — hook 실행 결과 (name, event, type, status, exitCode, stdout, stderr, content, skipReason)
- `ReapHookEvent` — 라이프사이클 hook 이벤트 union type (14개 이벤트)
- `ReapOutput.status` — `"ok" | "prompt" | "error" | "artifact-incomplete"`
- `EvaluatorConcern` — `{ stage: "validation" | "fitness", severity: "low" | "high", summary: string, recordedAt: string }`. Validation→fitness signalling channel. severity는 binary (Goodhart 회피). high = cruise auto-abort 트리거. `GenerationState.evaluatorConcerns?: EvaluatorConcern[]` 로 노출.
- indexer 타입 — `SymbolNode` / `GraphEdge` / `FileNode`(경로·언어·**파일별 import 통계**) / `ImportStats` /
  **`SymbolReference`** (참조 하나) / **`ImportSpecifier`** (해석 전 import specifier). 뒤의 둘은
  스냅샷에 **저장된다** — call·import 해석이 전체 그래프 의존이라 incremental 이 재파싱하지 않은
  파일까지 재해석해야 하기 때문이다. 없으면 낡은 edge 가 살아남고 `status` 는 100%를 보고한다
- `IndexManifest` / `IndexStats` / `IndexSnapshot` (`src/indexer/store.ts`). `INDEX_FORMAT` 은
  **단일 소유자**이며 테스트도 그것을 import 한다 — 스냅샷 모양이 바뀌면 올린다. 모르는 format 은
  버리고 재구축(파생 데이터라 마이그레이션할 가치가 없다)
- `UpdateResult.mode` — `"full" | "incremental" | "up-to-date"`. `reap index update` 가 왜 그렇게 했는지
  스스로 설명하게 하는 값이며 e2e 의 판정 기준이기도 하다
- `ReapConfig.lastMigratedVersion?: string` — 이 프로젝트가 어디까지 migration 됐는지 추적. 미설정 시 "0.0.0" fallback. `reap update --mark-migrated` 가 현재 패키지 버전으로 갱신. **CONFIG_DEFAULTS에 포함 금지** — optional tracking 필드이며 spurious config diff 유발.
- `PendingMigration` — `{ version: string, instructions: string }`. `detectPendingMigrations` 반환 타입. `reap update` context + load-context SessionStart + dump-state.md sync 3곳에서 동일 데이터 emit.

## Carrier Markers (gen-078)

여러 곳이 아는 사실에는 그 사실을 아는 파일마다 `reap:carrier(<id>)` 주석을 심는다. 값을 바꾸기 전에 `grep -rn "reap:carrier(<id>)" .` 또는 `bash scripts/list-carriers.sh` 로 전부 찾는다.

등록된 ID 와 파일 목록은 **`bash scripts/list-carriers.sh` 가 출력한다** — 여기에 옮겨 적으면 그것이 곧 어긋날 목록이 된다(이 원칙이 생긴 이유 그대로). 그래서 적지 않는다.

**공유 가능하면 표식보다 공유가 낫다** — 같은 값을 두 코드가 알면 DI·import 로 하나로 만들어 carrier 수를 줄인다. 표식은 공유가 불가능한 경우(문서, 다국어, prompt 문자열, 반환값 union)를 위한 것이다.

<!-- reap:carrier(self-diagnosis-covered-incidents) -->
## CI / Release 게이트 (gen-073, gen-078, gen-079, gen-081, gen-083)

| 시점 | 검사 | 어디서 | 비용 |
|---|---|---|---|
| `ci.yml` (매 push) | build + **자기진단**(층1, claude-code + **OpenCode**) | reap | 무료 |
| `docs.yml` (docs 변경 시) | docs 빌드 + **prerender 게이트**(층1) | reap | 무료 |
| main push | **테스트 전체** (unit/e2e/scenario) | **reap-test** | 무료 |
| `release.yml` (`v*` 태그) | 문서 정합성 + **버전 하한** + 자기진단 + build + publish | reap | 무료 |
| 릴리즈 전 수동 (`reapdev.versionBump` 5-2) | **agent 통합**(층2) | 로컬 | ~$0.25 |

**층2 가 못 잡는 것** (gen-091 이 4라운드 독립 검토로 확정): (a) `@` import 로드와 hook 발화 — 검증 수단이 **없다**. (b) **판정의 절반이 agent 준수에 기댄다** — sentinel 없이 CLI 로 우회하면 통과한다. fail-open 둘(지정 토큰 오발화 / `reap run` 거부가 커맨드 부재와 겹침)과 반대 방향 누출(명령문 없는 거부 항목은 발화하지 않음)이 **전부 그 가정으로 환원된다**. `stream-json` 으로 구조적 판정이 가능한지는 미조사. (c) `permission_denials` 의 실제 동작을 **모른다** — 거부를 on-demand 로 재현할 방법이 없어(`--disallowedTools` 는 도구를 안 주고 `--permission-mode manual` 은 헤드리스에서 거부하지 않는다) negative 는 **합성 fixture** 뿐이고, 필드 leg 가 프로덕션에서 한 번도 발화하지 않을 수 있다. (d) **자동 회귀 검사가 없다** — 판정부 8개 분기 중 라이브가 지나는 것은 1~2개. bash 게이트용 테스트 하네스가 저장소에 없고 다른 게이트 3종도 같은 상태다.

**층1 vs 층2**: 층1 은 "파일이 올바른 위치에 올바른 내용으로 놓였는가", 층2 는 "클라이언트가 그것을 실제로 읽는가".

> 게이트에 대해 무엇을 어떻게 쓸 것인가(재현 확인, 부재 단언, 좁힌 명령, 끄는 스위치)는
> **처방이므로 `genome/evolution.md` § 게이트에 대해 쓰는 문장의 규율**이 소유한다.
> 아래는 각 게이트가 현재 무엇을 하고 무엇을 못 하는지의 서술이다.

### § 5 — 배포 산출물에서 인덱서를 돌린다 (gen-089)

**소스 트리를 보지 않는다** (거기서는 의존이 해석되므로 결함이 존재할 수 없다):
tarball → 격리 설치 → **node 로 실행**(가짜 `bun` 을 PATH 에 넣어 강제) → NodeNext fixture 인덱싱.
판정은 **알려진 관계**(`leaf → middle → top`)와 **절대수 해석률(2/2)** 이다.

**못 보는 것 둘**: (1) **incremental 을 건드리지 않는다** — fixture 를 한 번만 커밋하므로 두 번째
`index update` 는 `up-to-date` 다. gen-089 의 blocker 넷 중 셋이 그 경로였고 **게이트는 전부
통과시켰을 것이다**(그쪽은 `tests/e2e/index-incremental.test.ts` 담당). (2) **상주 프로세스를 보는
단언은 없다** — 있던 것은 한 포트 번호만 봐서 판별력이 없었고 gen-095 가 지웠다. 성공 문구도 그에 맞게
줄였다: 게이트가 검사하지 않는 것을 성공 문구가 주장하면 그것이 곧 과약속이다.

게이트 전체가 macOS 에서 **14~18초**(gen-088 실측). 네이티브 의존이 사라져 리눅스 컴파일 비용도 없다.

### § 6~8 이 무엇을 보는가 (그리고 못 보는가)

각 절이 왜 그 자리에 그 형태로 있는지는 **스크립트 자신의 주석이 소유한다.**
스크립트를 열지 않고 알아야 할 것만 적는다.

**§ 6 — install script 차단 (gen-087).** 같은 tarball 을 `--ignore-scripts` 로 한 번 더 설치한다.
npm 12 부터 전역 설치의 lifecycle script 는 기본 차단이고, REAP 의 사용자 레벨 자산은 그때까지
`postinstall` 하나에만 걸려 있었다 — 바이너리는 돌고 통합은 없고 오류도 없었다.
npm 버전으로 조건을 추론하지 않고 `--ignore-scripts` 로 **강제**한다.
**못 보는 것**: claude-code 만 본다. "차단 + OpenCode" 는 fake-home unit/e2e 로만 덮인다.

**§ 7 — 두 클라이언트 (gen-080, gen-082).** `agentClient: opencode` 로 바꿔 `install-skills` 한 뒤
`opencode agent list` 가 exit 0 이고 `reap-evolve`/`reap-evaluate` 를 **나열**할 것을 요구한다
(exit 0 만 보면 agent 가 하나도 없어도 통과한다). 필요한 이유는 실패 양상이 클라이언트마다
다르기 때문이다 — **OpenCode 는 설정 검증이 all-or-nothing 이라 REAP 이 쓴 파일 하나가
`opencode` 명령 전체를 죽인다.** 모델 호출이 없어 무료라 CI 에 있다. 클라이언트는
`npm i -g opencode-ai` 로 설치하며 **버전을 고정하지 않는다** — 묻는 것이 "현재의 OpenCode 가
받아들이는가"이므로 upstream 스키마 변경으로 red 가 되는 것이 의도된 신호다. 부재 시 amber SKIP.
**못 보는 것**: slash command 는 `opencode command list` 같은 CLI 표면이 없어 검증할 수 없다.

**§ 2 / § 8 — 자기가 pack 한 것을 설치하는가, 그리고 제거되는가 (gen-088).**
§ 2 는 설치 직후 **번들 sha 가 방금 pack 한 것과 같은지** 단언한다. 그 전까지는 아니었고
게이트가 **배포된 패키지를 진단하고 있었다** — postinstall 의 auto-update 가 같은 격리 prefix 로
재설치해 덮어썼기 때문이다. § 8 은 **진짜 전역 설치를 실제로 제거한다**: unit 은 npm 에 넘길
인자만 볼 수 있고 e2e 는 소스 체크아웃에서 도므로, npm 제거가 실제로 일어나는 것을 보는 유일한 자리다.

### OpenCode 경로는 `XDG_CONFIG_HOME` 을 따른다 (gen-082)

`~/.config/opencode/` 는 **기본값일 뿐**이다. OpenCode 는 XDG base directory 규격을 따르므로 `XDG_CONFIG_HOME` 이 설정되면 `$XDG_CONFIG_HOME/opencode/` 를 읽는다.

`opencodeConfigDir(home, xdgConfigHome)` 이 이 판정을 소유하고 `opencodeCommandsDir` / `opencodeAgentsDir` 가 경유한다. **`process.env` 를 직접 읽지 않고 매개변수로 받는다** — 테스트가 fake home 을 쓰면서 실제 값이 새어들면 임시 디렉토리 밖에 쓰게 된다. 빈 문자열/공백은 미설정으로 취급(XDG 규격).

**테스트에서 `HOME` 을 가짜로 줄 때는 `XDG_CONFIG_HOME` 도 함께 처리해야 한다** — 하나만 바꾸면 격리가 성립하지 않는다:
- unit: `beforeAll` 에서 삭제 + `afterAll` 복원
- e2e: 자식 프로세스 env 에서 제거 (`cliWithHome` 헬퍼 2곳)

이 결함은 **개발자 로컬에서 재현되지 않는다** (변수가 없으므로). CI 조건은 `XDG_CONFIG_HOME=/tmp/probe npm run test:...` 로 만들 수 있다. GitHub 러너는 `XDG_CONFIG_HOME=/home/runner/.config` 를 설정한다.

claude-code adapter 는 `~/.claude/` 를 쓰며 XDG 와 무관하다.

### 테스트는 reap-test 에서 돈다 (gen-081)

`tests/` 는 private submodule(`c-d-cc/reap-test`)이고 기본 `GITHUB_TOKEN` 으로 가져올 수 없다. PAT 으로 가져오는 것은 가능하나 **reap 이 public 이라 워크플로 로그가 공개**된다 — `bun test` 는 테스트 이름을 전부 출력하므로 private 으로 지킨 것이 로그로 새고, **한 번 나간 로그는 되돌릴 수 없다.**

그래서 실행 주체를 뒤집었다. reap 의 main push 가 `dispatch-tests` job 으로 `repository_dispatch` 를 보내고, `reap-test/.github/workflows/test.yml` 이 reap 을 `./reap` 로, 자기 자신을 `./reap/tests` 로 checkout 해 배치를 재현한 뒤 build + 세 스위트를 돌린다. 테스트가 `<reap>/tests/` 위치를 하드코딩하므로 checkout 두 번이면 테스트 코드 수정이 필요 없다.

- **tests SHA 는 그 커밋의 submodule pointer** — main HEAD 가 아니다. 개발자가 실제로 검증한 조합을 재현하므로 red 의 원인이 코드인지 테스트인지 분리된다. pointer 를 갱신하지 않으면 낡은 조합이 테스트되어 실패한다 (설계된 동작)
- **PR 에서는 dispatch 하지 않는다** — fork 는 secret 을 받지 못하므로 돌리면 모든 외부 PR 이 red 가 된다. fork PR 은 build + 자기진단만 받고 둘 다 secret 불필요
- secret `TEST_DISPATCH_TOKEN` — `c-d-cc/reap-test` Contents:RW fine-grained PAT. **부재/만료 시 job 이 red** (`curl -f` + 명시적 exit 1). 조용히 건너뛰지 않는다
- 결과 알림은 GitHub 기본 알림. reap 의 커밋 화면에는 표시되지 않는다

현재 baseline 은 리눅스 러너에서 그대로 재현된다 (제외 없음).

문서 게이트는 CI 에 없다 — 개발 중 `package.json` 이 문서보다 앞서는 것이 정상이라 상시 red 가 된다(gen-073 판단). 자기진단은 그런 성질이 없어 양쪽에 있다.

## Key Design Decisions

설계 원칙(파일 기반 상태 / JSON stdout / transition graph + nonce / 2-level compression / adapter pattern)은 **처방적이므로 `genome/application.md` 가 소유한다.** 여기에는 현재 상태로만 확인되는 두 가지만 남긴다.

<!-- reap:carrier(zero-native-dependency) -->
- **Zero *native* dependency** (원칙은 `genome/application.md` 가 소유한다): production dependency 는 `yaml` 과 `web-tree-sitter` 둘. 후자는 WASM 이라 node-gyp/prebuild 가 없다 — 그래서 인덱서가 패키지에 내장될 수 있다. CLI 프레임워크도 자체 구현(`src/libs/cli.ts`)
- **`reap make` pattern**: template 기반 resource 생성 (현재 `backlog`, `hook`)
