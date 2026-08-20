# 04 Validation — gen-094-61a545

**Goal**: daemon 서술을 사용자 대면 문서에서 전부 제거한다 — 폐기된 기능의 설치 안내와 회고가 남아 있다

> **4라운드.** 1라운드에서 evaluator 가 blocker 1건을 냈고, 넷 다 직접 재현한 뒤 **planning 까지 회귀**해 whitelist 를 고치고 재구현했다. 3라운드는 사용자 지시로 **이번 세대가 만든 backlog 2건을 소비**하며 `package-lock.json` 이 재생성됐다. 4라운드는 **ja/de/zh-CN 산문을 사람이 읽어** 미검증 축을 닫았고 결함 1건을 고쳤다. 이 문서의 수치는 전부 4라운드 것이다.

## 실행 결과 (3라운드, 전부 fresh)

| 명령 | 결과 |
|---|---|
| `npm run typecheck` | **통과** [실행] — `retired*` 4키 삭제 후 `DaemonPage.tsx` 참조가 남았는지 실제로 확인하는 검사다 |
| `npm run build` | 통과 — grammars bundled 15 |
| `npm ci --dry-run --ignore-scripts` | remove **40 → 0** [실행][negative] |
| `npm run test:unit` | **629 pass / 0 fail** (49 files, 1612 expect) |
| `npm run test:e2e` | **331 pass / 0 fail** (35 files, 1105 expect) |
| `npm run test:scenario` | **44 pass / 0 fail** (4 files, 82 expect) |
| `bash scripts/check-docs-version.sh` | 전 항목 ok |
| `cd docs && npx vite build` | ✓ built in 1.92s |
| `bash scripts/check-self-diagnosis.sh` | **전 절 통과** |
| `reap fix --check` | 0 error / 2 warning |

baseline: unit **627 → 629** (+2 신규 검사), e2e 331 유지, scenario 44 유지. 전부 0 fail.

## Completion Criteria

### C1 — 사용자 대면 집합에 daemon 0건, 제외 경로 명시 ✅

**대상이 존재함을 먼저 보였다** — 부재 주장은 스스로를 증명해야 한다.

```
$ for f in "${SET[@]}"; do [ -s "$f" ] || echo "EMPTY/MISSING $f"; done   # 출력 없음
files: 18, lines: 4522, bytes: 294038

$ grep -n -iE 'daemon|dämon|デーモン|데몬|守护进程|守护程序|17224|127\.0\.0\.1' "${SET[@]}"
hits exit=1        # 1 = 일치 없음
```

18개 파일에는 1라운드 목록에 더해 **evaluator 가 지적한 미열거 표면**을 포함했다 — `src/templates/migration/v0.17.{1,2,5}.md`, `src/templates/evolution.md`, `claude-md-section.md`, `CLAUDE.md`, `src/adapters/opencode/templates/agents.md`. 설치되는 slash command 19개(`src/adapters/claude-code/skills/*.md`)도 별도로 확인 — 0건.

**로케일 5개는 grep 이 아니라 파싱으로** 확인했다. 줄 단위 grep 은 `daemon: "Code Intelligence"` 에서 daemon 이 키인지 값인지 구분하지 못한다.

```
locale rendered string literals: 5853 | offenders: 0
```

**그리고 소스가 아니라 배포되는 산출물을 봤다** — `docs/dist/public/assets/index-*.js` (764,743자):

```
distinct daemon contexts in the shipped bundle: 13
  | s.jsx(Ie,{path:"/docs/daemon",component:yD})                    ← 라우트
  | daemonPage:{title:"Code Intelligence",...}          ×5 로케일   ← 키, 값은 "Code Intelligence"
  | hooks:"Hooks",daemon:"Code Intelligence",...        ×5 로케일   ← nav 키
  | {title:n.nav.items.daemon,href:"/docs/daemon"}                  ← 사이드바
  | function yD(){const a=ze().daemonPage;...}                      ← 식별자
```

**13건 전부 식별자·라우트이며 렌더링되는 산문은 0이다.** gen-090 이 링크 404 방지를 위해 `/docs/daemon` 라우트를 의도적으로 유지했고 그 결정을 따랐다.

**제외 경로와 근거**: 03-implementation.md § 명시적으로 제외한 경로 (정정된 표). lineage · `v0.17.6.md` 만 (v0.17.5 는 이제 범위 안) · `src/**/*.ts` 주석·식별자 · scripts/CI 주석 · `reapdev.*` skill · `vision/design/daemon/**` · `tests/**` 주석 · `package-lock.json`(backlog).
`.reap/environment/**` 와 `genome/evolution.md` 는 제외가 아니라 **reflect·adapt phase 로 연기** — 매 세션 로드되므로 그쪽에서 반드시 처리해야 한다.

### C2 — `check-docs-version.sh` 통과 ✅ [실행]

5절 전부 ok. 로케일 parity `24 entries` ×4 로케일. § 2 `What's New has 9 entries; previous release v0.17.5 archived`. § 5 는 파일명만 보므로 `v0.17.5.md` 의 내용 삭제와 무관 (파일은 유지).

### C3 — `vite build` 통과 + `/docs/daemon` 라우트 유지 ✅ [실행]

`✓ built in 1.92s`. 라우트는 `App.tsx` 1건 + `AppSidebar.tsx` 1건.

> **1라운드의 근거가 틀렸었다.** "빌드 통과 = dangling reference 부재"라고 적었으나 **`docs/package.json` 의 `build` 는 `vite build` 단독**이고 esbuild 는 transpile 만 한다. evaluator 가 `<p>{d.retiredTitle}</p>` 를 넣고 빌드가 그대로 통과함을 실측했다.
>
> 올바른 근거: `grep -rn "retired" docs/src/` → daemon 관련 참조 0건 (하나 남은 것은 v0.17.2 changelog 의 "retired lifespan-based memory model" 로 무관), 그리고 **배포 번들 스캔 13건이 전부 식별자**(위 C1).

### C4 — 두 `reap-guide.md` byte-identical ✅ [실행]

`diff -q` 동일, 41,929 bytes. **사람이 아니라 검사가 지킨다** — T002 의 unit test 가 매 실행마다 요구한다.

### C5 — 세 스위트 baseline 유지 ✅ [실행]

unit 629 / e2e 331 / scenario 44, 0 fail.

### C6 — 새 검사가 수정 전 fail ✅ [negative]

**세 번 확인했다.**

**(1) 구현 전** — T003 이전: `the guide does not mention the daemon at all` fail, offender 5줄 출력 (5 pass / 1 fail)

**(2) 살아있는 회귀 검사** — validation 에서 daemon 서술을 되살려:
```
$ printf '\n### There used to be a daemon\n\nIt ran on port 17224.\n' >> src/templates/reap-guide.md
(fail) the guide does not mention the daemon at all
(fail) the project's own copy of the guide matches the shipped one
 4 pass / 2 fail          → 복원 후 6 pass / 0 fail
```
**두 검사가 서로 다른 이유로 red** — 하나는 내용, 하나는 사본 불일치.

**(3) evaluator 의 독립 확인** — 나와 다른 문자열(`A background service listened on 17224.`)로 둘 다 red 를 재현했고, 별도로 `.reap/reap-guide.md` 에만 **daemon 과 무관한** 텍스트를 붙여 **byte-identity 검사만** red 가 되는 것을 확인했다. 두 검사가 독립적으로 동작한다는 근거다.

### C7 — build + `fix --check` 0 error / 2 warning ✅ [실행]

2 warning 은 gen-052 lineage parent 상속분으로 **불변**.

### C9 — `package-lock.json` 5개 기준 (3라운드 신설) ✅ [실행][negative]

backlog 가 적어둔 판정 기준을 **먼저 실패시켰다**: `npm ci --dry-run --ignore-scripts | grep -c '^remove '` → **40**.

| # | 기준 | 결과 |
|---|---|---|
| 1 | `version` == package.json | `lock=0.17.6 pkg=0.17.6` |
| 2 | `workspaces` 소멸 | 0건 |
| 3 | daemon 계열 + 네이티브 빌드 전이 의존 소멸 | exit 1 (없음) |
| 4 | root `dependencies` 직접 | `{"web-tree-sitter":"0.22.6","yaml":"^2.0.0"}` |
| 5 | `npm ci` remove | 40 → **0** |

**`npm install` 한 번으로는 3번이 통과하지 않았다** — npm 이 `"daemon"` 항목을 `"extraneous": true` 로 남긴다. lock 을 지우고 재생성해야 사라진다. 한 번에 통과했다고 보고했다면 기준 3이 거짓인 채 넘어갔을 것이다.

**의존 트리 변동**: before 48 → after 8 entries. **REMOVED 40, ADDED 0, VERSION CHANGED none** — 순수 감산. 그럼에도 세 스위트와 자기진단 게이트를 전부 재실행했다(예상이 검증을 대신하지 않는다).

### C10 — `reap-tree.md` 의 daemon 현재형 서술 (3라운드 신설) ✅ [실행]

`grep -n -iE 'daemon|데몬' .reap/vision/design/reap-tree.md` → exit 1.

`:253`(미결 결정 5번)은 **전제만** `reap index` 기준으로 다시 쓰고 **결정은 미결로 남겼다** — 지시는 "backlog 없이 소비"이지 "설계 결정을 지금 내려라"가 아니며, `.reap/.index/` 가 프로젝트별이라는 것은 확정된 사실이라 전제 교체에 새 판단이 필요 없다.

### C11 — ja / de / zh-CN 산문 검독 (4라운드 신설) ✅ **[독해]**

**근거 종류가 다르다.** 사람이 읽은 것이고 명령이 판정하지 않았다. 항목별 결과는 03-implementation.md § 4라운드 에 있다. 요약:

| 항목 | 결과 |
|---|---|
| (a) 잘린 절을 가리키는 앞뒤 연결어 | **해당 없음** — 절단면 4곳 × 3로케일 전부 문장 경계 + 굵은 소제목 시작 |
| (b) 열거 개수 | **해당 없음** — 개수 표현 전수 대조. daemon 은 열거의 원소가 아니라 독립 문단이었다 |
| (c) 목차·링크가 사라진 절을 가리킴 | **해당 없음** — 지운 것은 인라인 굵은 문단(앵커 없음). docs 페이지에 목차 컴포넌트 없음. `daemonPage` 키 5로케일 전부 21개로 동일 |
| (d) ko/en 의 수정을 같은 자리에 갖고 있는가 | **결함 1건 — 수정함** |

**(d) 가 잡아낸 것**: 자리는 맞았지만 **내가 넣은 삽입구가 네 언어에 영어 문장부호를 들여왔다.** 원문은 ko/ja/de/zh 모두 괄호를 쓰고 있었는데 em-dash 삽입구로 바꿨다. ja 는 연용형 뒤에 대시가 끼어 문장이 멈춘다. 네 언어를 각자의 관례(괄호)로 되돌렸고 **en 만 em-dash 유지**(영어 관례).

**이 결함은 3라운드까지의 모든 `[실행]` 근거가 초록인 상태에서 남아 있었다** — grep 0건, 문자열 리터럴 5,853개, 배포 번들 13건, exact-match assert, `git diff --stat` 대칭. 기계는 문자열이 거기 있는지를 보고, 그것이 그 언어로 읽히는지는 보지 못한다.

### C8 — 신규 프로젝트에 도달하는 daemon 줄 (2라운드 신설) ✅ [실행][negative]

**C1 의 `grep` 이 답하지 못하는 것을 답하는 검사다.** grep 은 "이 파일 집합에 문자열이 없다"를 말하고, 제외 집합이 틀리면 조용히 통과한다 — 1라운드에 실제로 그랬다.

격리된 신규 프로젝트(`mktemp -d` + `git init -b main` + 가짜 HOME + `reap init`), **저장소 빌드**로 측정:

```
BEFORE (절 복원, git stash):  context 27474 bytes | daemon 19줄
AFTER  (절 제거):             context 26613 bytes | daemon 13줄
```

사라진 6줄이 정확히 `## Also in v0.17.5 — action only if you use the daemon` 이다. 남은 13줄은 전부 `v0.17.6.md` — `daemon: true` 를 가진 프로젝트에 도달해야 하는 *제거* 지시이며 **의도된 예외**다.

같은 바이너리에서 두 상태를 재어 **probe 가 구분한다는 것**을 보였다. 한쪽만 재면 13이 낮다는 것만 알 뿐 무엇 때문인지 모른다.

> **첫 측정이 틀렸고 그것을 잡아냈다.** 수정 후 처음 잰 값이 여전히 19였다. 원인은 코드가 아니라 **probe 가 PATH 의 전역 설치(npm 의 0.17.6)를 재고 있었고 내 수정은 저장소 `dist/` 에 있었다.** `node "$PWD/dist/cli/index.js"` 로 바꿔 다시 쟀다. longterm 의 *"Reproduce the environment before trusting the reproduction"* 이 그대로 적용된 자리다.

## Evaluator — 1라운드 결과와 처리

`evaluator: true`. `reap-evaluate` 를 독립 검증자로 호출했다. **모든 지적을 나열한다 — 동의하지 않는 것도 포함해야 하지만, 넷 다 재현했고 넷 다 옳았다.**

### HIGH — `src/templates/migration/v0.17.5.md` 가 살아있는 daemon 설치 지시를 배포한다 → **수정함**

`## Also in v0.17.5 — action only if you use the daemon` 절이 `npm i -g @c-d-cc/reap-daemon` 을 지시하고, `reap daemon status` 를 안내한다.

내가 직접 재현한 것:
- `reap daemon status` → **출력 없음, exit 0** [실행]
- `src/core/migration.ts:113` 이 `lastMigratedVersion ?? "0.0.0"` 이고 `reap init` 은 그 필드를 쓰지 않는다 → **신규 프로젝트에도 surface 한다** [실행]
- 격리 프로젝트에서 `pendingMigrations: ['0.17.1','0.17.2','0.17.5','0.17.6']`, load-context daemon **19줄** [실행]

**내 판단이 왜 틀렸는가**: 제외 표에 `v0.17.{5,6}.md` 를 **한 행에 묶고 근거를 하나만 적었다.** 그 근거는 v0.17.6 에만 참이었다. **두 파일을 하나로 검증했고, 검증한 쪽이 무고한 쪽이었다.** 그리고 이것은 이 세대가 결함이라 판정해 삭제한 `## Daemon Setup` 과 **같은 종류**이며 도달 범위는 더 넓다.

처리: planning 까지 회귀 → whitelist 에 추가 → 절 삭제 → C8 신설. `report-evaluator --severity high` 로 fitness 에 기록.

### LOW ×3 — 전부 수정함

1. **C3 근거가 거짓** (`vite build` 는 타입 검사 안 함) → 위 C3 에 정정. 사실은 grep + 번들 스캔으로 다시 세웠다
2. **새 test 주석이 과장** (`.reap/reap-guide.md` 가 "agent 가 읽는 두 번째 답") → 재현 확인: `claude-md-section.md:21` 은 fallback 없는 `@~/.reap/reap-guide.md`, `integrity.ts:170` 은 에러 여부 판정에만 쓴다. dog-fooding 근거로 교체
3. **README allowlist 가 코드와 어긋남** — `REAP_HOME_ENTRIES` 는 3개인데 README 는 2개만 열거하고 "나머지는 그대로 둔다"고 말한다 → **열거 자체를 제거**했다. 다시 적으면 다시 어긋난다

### evaluator 의 관찰 — reflect/adapt 로 넘김

`.reap/environment/summary.md:44,46,210` · `source-map.md:178,204` · `genome/evolution.md:140` 이 매 세션 `@` 로드되며 daemon 서술을 담고 있다. 연기는 절차상 옳지만 **이 세대의 논거(매 세션 토큰 비용)가 여기에 가장 세게 적용된다. reflect/adapt 에서 빠뜨리면 goal 미달이다.**

### evaluator 가 독립적으로 확인해 준 것

- 세 스위트 수치 재현, `tsc --noEmit` clean, `fix --check` 0/2
- 두 신규 검사가 **자기 문자열로** 판별함을 확인 (내 negative 와 독립)
- e2e 부재 assertion 이 공허하지 않음을 확인 — `update.ts` 의 메시지를 무조건 출력하게 바꿔 red 를 봤다
- 자기 철자 목록(`dämon`/`守护程序`/`常駐`/`sqlite` 포함)으로 산문 전수 0건
- 내가 열거하지 않은 표면 확인: `skills/reap.*.md`, `templates/evolution.md`, `AGENTS.md`, `CLAUDE.md`, `package.json` — 전부 clean
- `reap index status` 313/313 imports resolved (100%) → blast radius 신뢰 가능. 변경된 `.ts` 2개의 impact = `src/cli/index.ts`, e2e 로 덮임

## 이 검증이 잡지 못하는 것

통과는 "검사 범위 안에서 문제없음"일 뿐이다.

1. ~~번역 품질~~ → **4라운드에서 닫았다** (C11). 다만 검독은 위 네 항목을 본 것이지 번역 전반의 품질 감수가 아니다 — daemon 절단이 남긴 흔적을 찾은 것이며, 그 문서들의 다른 부분은 이 세대가 건드리지 않았고 읽지도 않았다
2. **reap.cc 렌더링을 눈으로 보지 않았다.** `/docs/daemon` 에서 마지막 절이 사라진 뒤 여백이 어색한지는 확인하지 않았다
3. **철자 목록의 완전성은 보장되지 않는다.** 8개 철자로 확인했지만, daemon 을 다른 표현으로 지칭한 문장은 잡히지 않는다. `ja.ts` 의 가타카나 사례가 이 위험의 실증이다
4. **C8 은 claude-code adapter 만 잰다.** OpenCode 의 `.reap/.session-state.md` 경로는 같은 `buildPendingMigrationsSection` 을 공유하지만(코드 독해 [독해]) 실행해 보지는 않았다
5. **로컬 macOS 에서만 돌았다.** CI(리눅스)는 push 시점
6. **`tests/` submodule 이 아직 커밋되지 않았다** — completion commit 전에 submodule 안에서 먼저 커밋하고 `git add tests` 필요
7. **lock 재생성의 효과는 이 머신의 npm 10.9.4 에서만 확인했다.** CI(리눅스, `npm ci`)는 push 시점에 처음 돈다 — 순수 감산이고 자기진단 게이트가 `npm pack` → 격리 설치를 거치므로 위험은 낮지만, **측정한 것은 아니다**

## Verdict

**pass**

evaluator 의 high-severity 지적은 **수정 완료**됐고, 그 수정의 효과를 새 검사(C8)로 측정했다. 8개 completion criteria 전부 충족. 세 스위트 baseline 유지, 게이트 4개 전부 통과.
