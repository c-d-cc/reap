# 01 Learning — gen-094-61a545

**Goal**: daemon 서술을 사용자 대면 문서에서 전부 제거한다 — 폐기된 기능의 설치 안내와 회고가 남아 있다

## Source Backlog

`daemon-서술을-사용자-대면-문서에서-전부-제거한다-폐기된-기능의-설치-안내와-회고가-남아-있다.md` (type: task, priority: high, consumed by this generation)

핵심 지시 (사용자, 2026-08-21):

> *"daemon 과 관련된 서술 다 지웠으면 됨. **있다가 지웠음 이런 히스토리 서술 불필요.**"*

즉 **daemon 이 없던 것처럼 서술한다.** "폐기됐다"는 회고조차 남기지 않는다. 이것이 처음 읽는 것보다 엄격하다 — 현재 여러 문단이 *daemon 이 사라졌음을 말하기 위해* daemon 을 설명하고 있고, 그 전부가 대상이다.

backlog 가 지목한 두 종류:

1. **살아있는 설치 안내 — 결함.** `RELEASE_NOTES.md` 의 `## Daemon Setup` 절이 `daemon: true` 설정과 `reap daemon start` / `reap daemon status` 실행을 지시한다. **`reap daemon` 명령은 존재하지 않는다** (gen-089 에서 제거). 지금 이 안내를 따르면 실패한다.
2. **회고 서술 — 사용자가 불필요하다고 명시.** README ×5, reap-guide ×2, docs 로케일 ×5.

## Project Overview

- REAP v0.17.6 (**이미 발행됨**). 이번 세대는 발행된 릴리즈의 문서 정리이며 **버전 bump 없음**.
- gen-089 가 daemon(별도 패키지 `@c-d-cc/reap-daemon`, HTTP 17224, `daemon: true`)을 폐기하고 indexer 를 reap 패키지에 내장했다. gen-090 이 docs 사이트를 `reap index` 로 다시 썼다.
- 그 두 세대는 **회고를 남기는 방식**으로 문서를 고쳤다. 사용자가 그 방식 자체를 무른 것이 이번 goal 이다.

## Key Findings — 전수 조사

조사 명령: `grep -ril daemon . --exclude-dir={node_modules,.git,dist,.index}` → **152 파일**. 이를 성격별로 분류했다.

### A. 사용자 대면 문서 — 본 세대 대상 (17 파일)

| 파일 | 건수 | 내용 |
|---|---|---|
| `README.md` / `.ko` / `.ja` / `.de` / `.zh-CN` | 각 2 | `:78` uninstall 설명의 "(what the retired daemon left behind)" + `:335` **`Replacing the daemon (removed in v0.17.6)` 문단 통째** |
| `RELEASE_NOTES.md` | 14 | What's New 5건 + v0.17.5 항목 3건 + v0.17.0 항목 1건 + **`## Daemon Setup` 절 통째** |
| `RELEASE_NOTICE.md` | 6 | v0.17.6 en/ko + v0.17.5 en/ko + v0.17.0 en/ko |
| `src/templates/reap-guide.md` | 5 | `:392` uninstall 설명, `:470` "the retired daemon also carried", **`:472` `### There used to be a daemon` 절 통째**, `:479` `npm uninstall -g @c-d-cc/reap-daemon` |
| `.reap/reap-guide.md` | 5 | 위와 **byte-identical** (아래 C1 참조) |
| `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` | 각 9~10 | 아래 상세 |
| `docs/src/pages/DaemonPage.tsx` | 6 | `retired*` 4키 렌더링 + 주석 2줄 |

**`reap-guide.md` 가 가장 시급하다** — `~/.reap/` 로 설치되고 `CLAUDE.md` 가 `@` import 하므로 **모든 세션 컨텍스트에 들어간다.** 폐기된 기능의 회고가 매 세션 토큰을 쓴다.

#### 로케일 파일 상세 — 5개 완전 대칭 확인

`grep -in daemon` 으로 5개 로케일 전부를 대조한 결과 **구조가 동일**하다:

| 위치 | en | ko | ja | de | zh-CN | 처리 |
|---|---|---|---|---|---|---|
| `nav.items.daemon` (라벨 = "Code Intelligence") | 22 | 24 | 24 | 24 | 24 | **유지** (식별자, 산문 아님) |
| `uninstallNote` — "retired daemon left in ~/.reap/daemon/" | 300 | 303 | 303 | 303 | 303 | 회고 제거, 경로는 유지 |
| `// route stays /docs/daemon` 주석 | 827 | 830 | 829 | 829 | 829 | **유지** (경로 근거 설명) |
| `daemonPage` 키 | 828 | 831 | 830 | 830 | 830 | **유지** (라우트 연동) |
| `retiredTitle` | 864 | 867 | — | 866 | 866 | **삭제** |
| `retiredDesc` | 865 | 868 | 867 | 867 | 867 | **삭제** |
| `retiredCode` | 866 | 869 | 868 | 868 | 868 | **삭제** |
| `retiredNote` | 867 | 870 | 869 | 869 | 869 | **삭제** |
| `releaseNotes` v0.17.6 `notes` | 1038 | 1041 | 1040 | 1040 | 1040 | 재작성 |
| `releaseNotes` v0.17.5 `notes` | 1042 | 1045 | 1044 | 1044 | 1044 | 판단 필요 (§ 판단 1) |
| `releaseNotes` v0.17.0 `notes` | 1062 | 1065 | 1064 | 1064 | 1064 | 판단 필요 (§ 판단 1) |

**backlog 가 3개(`retiredTitle`/`retiredDesc`/`retiredCode`)만 적었으나 실제로는 4개다 — `retiredNote` 가 누락돼 있었다.** `DaemonPage.tsx:63` 이 렌더링한다. `ja.ts` 의 `retiredTitle` 은 문자열에 "daemon" 문자가 없어(`かつてはデーモンがありました`) grep 에 안 잡힌다 — **grep 단독으로는 로케일 대칭을 판정할 수 없다**는 실증이다. `grep -n "retired"` 로 재조사해 4×5=20 키 전부를 확인했다.

### B. 사용자 대면 CLI 출력 — 본 세대 대상 (2 문자열)

산문은 아니지만 **사용자가 화면에서 읽는 텍스트**이고, 내용이 정확히 "있다가 지웠음" 서술이다.

- `src/cli/commands/uninstall.ts:100` — `"~/.reap/reap-guide.md, ~/.reap/.install-stamp, ~/.reap/daemon/ (data the retired daemon left)"`
- `src/cli/commands/update.ts:289` — `` `removed retired daemon data: ${daemonLeftover}` ``

**경로 `~/.reap/daemon/` 자체는 유지해야 한다** — 실제로 지우는 대상이고 이름을 바꿀 수 없다. 제거 대상은 그 옆의 회고 문구다.

### C. 대상에서 제외 — 근거와 함께

| 제외 대상 | 건수 | 근거 |
|---|---|---|
| `.reap/lineage/**` | 39 파일 | **역사 기록.** lineage 는 세대별 아카이브이며 그 세대에 무엇을 했는지가 기록의 본질이다. 고치면 기록이 아니게 된다 |
| `src/templates/migration/v0.17.6.md`, `v0.17.5.md` | 2 | **산문이 아니라 실행 지시.** `daemon: true` 와 `~/.reap/daemon/` 을 아직 가진 프로젝트에 도달해야 한다. 지우면 그 사용자들이 설정과 데이터를 안고 남는다 (§ 판단 2 에서 검증) |
| `src/**/*.ts` 주석·식별자 | 9 파일 | `DAEMON_PACKAGE` 상수·`REAP_HOME_ENTRIES` 항목은 **동작하는 코드**이고, 주석은 *왜 코드가 폐기된 패키지 이름을 아는가*를 설명한다. 지우면 코드가 설명 불가능해진다. `tests/unit/shipped-docs-no-daemon.test.ts` 가 이미 이 경계를 명시적으로 그어 두었다 ("deliberately not source comments, which discuss the retirement and should") |
| `scripts/*.sh`, `.github/workflows/*.yml` 주석 | 5 파일 | 개발자 대면. 게이트가 왜 그 자리에 그 형태로 있는지의 근거 |
| `.claude/commands/reapdev.*.md` | 2 | 개발자 전용 skill. `--match` 없이 `git describe` 하면 `daemon-v*` 태그를 잡는다는 **지금도 유효한 실무 경고** (그 태그는 저장소에 남아 있다) |
| `.reap/vision/design/daemon/**` | 7 파일 | 설계 문서 아카이브. longterm 교훈 "Design docs survive abort and anchor future generations" |
| `.reap/life/backlog/*.md` | 5 | 미소비 backlog 는 그 자체가 과거 조사 기록. 소비 시 판단 |
| `package-lock.json` | — | **별건 결함. backlog 로 분리** (§ 발견 1) |

### D. environment / genome / memory — reflect·adapt phase 대상

`.reap/` 지식 파일은 generation 중 직접 수정이 금지된다(genome: Environment Immutability). 다만 이들도 **매 세션 컨텍스트에 들어가므로** reap-guide 와 같은 논리가 적용된다.

- `.reap/environment/summary.md:44,46,210` — 3건. `reflect` phase 에서 처리
- `.reap/environment/source-map.md:178,204` — 2건. `reflect` phase
- `.reap/genome/evolution.md:140` — 테스트 레벨 표의 `외부 도구 / subprocess / daemon 통합` 행. 1건. `adapt` phase
- `.reap/vision/memory/{shortterm,midterm}.md` — 각 1건. reflect 의 의무 pruning 에서 자연 처리
- `.reap/vision/design/reap-tree.md:17,185,253,274` — 미래 설계 문서인데 **daemon 을 현존 컴포넌트로 서술**한다 (`daemon/ 은 별도 앱이고`, `현재 daemon 은 project 별 등록이므로`). 이것은 회고가 아니라 **틀린 현재 서술**이다. 다만 vision/design 은 이 세대 goal 밖 → **backlog** (§ 발견 2)

## 이번 세대가 내려야 할 판단

### 판단 1 — 과거 버전 changelog 를 지울 것인가

대상: `RELEASE_NOTICE.md` 의 v0.17.5 / v0.17.0 항목(en·ko), 5개 로케일 `releaseNotes.versions[]` 의 같은 두 항목, `RELEASE_NOTES.md` 의 `## v0.17.5` / `## v0.17.0` 절.

내용이 `npm i -g @c-d-cc/reap-daemon` 설치를 지시하고 `reap daemon status` 를 안내한다. 오늘 읽는 사람에게 **deprecated 패키지를 설치하라는 지시**다.

- 삭제 쪽 근거: 사용자 지시("다 지워라") + genome 의 *"낡은 서술은 제거한다 — 갱신은 append-only 가 아니다"* + **실행 가능한 잘못된 지시라는 점**
- 보존 쪽 근거: changelog 는 "그 릴리즈가 무엇을 했는가"의 기록이지 조언이 아니다. 지우면 역사 기록을 바꾸는 것

**planning 에서 확정하고 근거를 남긴다.** 현재 기울기: 두 근거의 차이는 *실행 가능성*이다. 회고는 읽히고 끝나지만 `npm i -g <deprecated>` 는 **따라 할 수 있다**. changelog 의 목적(그 릴리즈가 무엇을 했는가)은 daemon 을 지목하지 않고도 서술 가능하다.

### 판단 2 — migration note 는 정말 범위 밖인가 (검증 완료)

team-lead 의 추론을 그대로 받지 말라는 지시가 있었다. 검증 결과 **범위 밖이 맞다**:

- `src/templates/migration/v0.17.6.md` 는 `detectPendingMigrations` 가 `(lastMigratedVersion, packageVersion]` 구간에서 선택해 **agent 에게 실행시키는 지시문**이다. 산문이 아니다
- 지우면 `daemon: true` 와 `~/.reap/daemon/` 을 가진 프로젝트에 아무것도 도달하지 않는다 — genome 의 *"규칙 변경이 기존 프로젝트에 도달하는가"* 가 정확히 이 경우다
- `scripts/check-docs-version.sh` § 5 가 migration note 존재를 전제로 검사한다
- 반대 논거("사용자가 note 를 읽고 daemon 을 알게 된다")는 성립하지만, **그 사용자는 이미 `daemon: true` 를 자기 config 에 갖고 있다.** 모르는 것을 알리는 게 아니라 가진 것을 치우는 지시다

### 판단 3 — CLI 출력 문자열(B)을 범위에 넣을 것인가

넣는다. 근거: 사용자가 `reap update` 를 돌리면 화면에 `removed retired daemon data: ...` 가 나온다. 이것은 문서가 아니지만 **사용자가 읽는 서술**이고 정확히 "있다가 지웠음"이다. 다만 `tests/e2e/update.test.ts:349` 가 `not.toContain("retired daemon")` 으로 부재를 검사하므로, 문구를 지우면 **그 assertion 이 공허해진다** (무엇을 해도 통과). 함께 고쳐야 한다.

## 발견 — 본 goal 밖 (backlog 대상)

### 발견 1 — `package-lock.json` 이 daemon workspace 를 아직 선언한다

```
"version": "0.17.5",           ← package.json 은 0.17.6
"workspaces": ["daemon"],      ← daemon/ 디렉토리는 존재하지 않는다
"daemon": { "name": "@c-d-cc/reap-daemon", ... better-sqlite3 ... }
"node_modules/@c-d-cc/reap-daemon": { "resolved": "daemon", "link": true }
```

`npm ci --dry-run --ignore-scripts` **[실행]** 결과: 실패하지 않고 `remove @c-d-cc/reap-daemon` 외 40 패키지를 제거하겠다고 보고한다. 즉 **오늘 npm 10.9.4 에서는 CI 가 깨지지 않는다** — 그래서 5세대를 살아남았다. 다만 root `dependencies` 에 `web-tree-sitter` 가 없고(그것은 daemon workspace 아래에만 있다) 존재하지 않는 workspace 를 가리키는 상태이므로, npm 버전이 바뀌면 조용히 깨질 수 있는 자리다. **산문이 아니므로 이 세대 goal 이 아니다.** backlog.

### 발견 2 — `vision/design/reap-tree.md` 가 daemon 을 현존 컴포넌트로 서술한다

4건. 회고가 아니라 **틀린 현재 서술**이라 성격이 다르다. tree 트랙을 착수할 때 함께 고치는 것이 맞다. backlog.

### 발견 3 — 두 `reap-guide.md` 사본의 동일성을 강제하는 검사가 없다

`.reap/reap-guide.md` 와 `src/templates/reap-guide.md` 는 오늘 byte-identical 이다 **[실행]** (`diff -q` → 동일). 그러나:

```
grep -rn "templates.*reap-guide\|reap-guide.*templates" tests/ scripts/ .github/   → 0건
```

**어떤 게이트도 둘을 비교하지 않는다.** 지금까지 사람이 손으로 맞춰 왔을 뿐이다. team-lead 는 "게이트가 검사한다"고 전달했으나 사실이 아니다.

이것은 **본 세대가 정확히 마주칠 위험**이다 — 한쪽만 고치면 아무도 모른다. genome 의 *"반복 누락은 지시가 아니라 검사로 막는다"* 와 *"인과로 묶인 검증 동작 fix 는 본 generation 에서 처리"* 가 함께 적용된다 → **본 세대에서 검사를 만든다.**

## 기존 검사 자산

`tests/unit/shipped-docs-no-daemon.test.ts` (gen-089 작성, 4 tests) 가 이미 존재한다. 현재 정책:

- agent 정의(`src/templates/agents/*.md`)는 `17224` / `curl .../projects/` **금지**
- guide 는 **회고 서술 허용**, 실행 가능한 명령만 금지 (`curl 127.0.0.1`, `npm i -g @c-d-cc/reap-daemon`)

**이 정책이 사용자 지시와 정면으로 충돌한다.** 파일 주석이 그 완화를 길게 정당화한다("The guide may — and should — say the daemon existed... a blanket ban on 17224 would go red on correct text"). 사용자가 그 전제를 무른 이상, guide 에 산문이 남지 않으므로 **blanket ban 이 이제 올바른 검사**다. 이 파일을 그에 맞게 강화하는 것이 본 세대의 산출물이다.

부수적으로 현재 assertion 의 구멍도 확인됐다: 금지 패턴이 `npm (i|install) -g @c-d-cc/reap-daemon` 이라 **guide 가 실제로 갖고 있는 `npm uninstall -g @c-d-cc/reap-daemon` 은 잡지 못한다** (`:479`). 실행 가능한 명령인데 통과하고 있다.

## 게이트 제약 (실행 전 확인 필요)

`scripts/check-docs-version.sh` 를 읽어 확인한 제약:

1. § 2 — `RELEASE_NOTES.md` 의 최상위 아카이브 헤딩이 `v0.17.5` 여야 한다(= 패키지 버전이 아니어야). **What's New 에 `- ` 항목이 1개 이상** 있어야 한다
2. § 3 — 5개 로케일 각각의 `releaseNotes.versions[0].version === "0.17.6"`
3. § 4 — **5개 로케일의 버전 집합이 완전히 동일**해야 한다 → 과거 항목을 지우려면 5개에서 동시에 지워야 한다
4. § 1 — `RELEASE_NOTICE.md` 최상위가 `## v0.17.6`
5. § 5 — migration note 최신 버전 ≤ 패키지 버전

`docs/` 는 TS 객체이므로 키 삭제 시 참조가 깨진다 → `cd docs && npx vite build` 필수.

## Context

- **Generation type**: embryo (genome 수정 허용 — 단 adapt phase 에서)
- **strictEdit: true** — `02-planning.md` 에 나열된 파일만 수정 가능
- **strictMerge: true** — `git pull/push/merge` 직접 실행 금지
- **evaluator: true** — validation·fitness 에서 독립 검증
- **버전 bump 없음** — 0.17.6 은 이미 발행됨
- Baseline: **unit 627 / e2e 331 / scenario 44**, 전부 0 fail. `fix --check` 0 error / 2 warning
- `tests/` 는 private submodule — 안에서 먼저 커밋 후 `git add tests`

## Clarity Level: **HIGH**

근거:
- 사용자 지시가 한 문장으로 명확하고 인용 가능하다
- source backlog 가 대상 파일과 검증 항목을 구체적으로 나열한다
- 작업 성격이 탐색-후-삭제이며 설계 판단이 거의 없다
- 남은 판단 2건(과거 changelog, CLI 문자열)은 planning 에서 근거를 적어 확정 가능한 범위다

**단, clarity high 가 "backlog 를 그대로 실행한다"를 뜻하지 않는다** (longterm: *"Verify the backlog's claims, don't just execute them"*). 실제로 backlog 의 키 목록이 1개 부족했고(`retiredNote`), team-lead 가 전달한 "게이트가 검사한다"는 사실이 아니었다.

## 위험 — 이 세대가 피해야 할 실패

1. **로케일 일부만 수정** — 이 저장소가 검사까지 만든 실패 유형(gen-073). 5개 전부, 매번
2. **한쪽 guide 만 수정** — 검사가 없다(발견 3). 본 세대에서 만든다
3. **완료 주장의 근거를 독해로 대체** — "전부 제거했다"의 근거는 `grep -ri daemon` 이 0을 반환하는 것이지 파일을 읽은 것이 아니다. 제외 경로를 명시적으로 말한다
4. **부재 assertion 이 스스로를 증명하지 않음** — grep 0건은 "파일이 없어서 0" 과 구분되지 않는다. 대상 파일 목록이 비지 않았음을 먼저 보인다
