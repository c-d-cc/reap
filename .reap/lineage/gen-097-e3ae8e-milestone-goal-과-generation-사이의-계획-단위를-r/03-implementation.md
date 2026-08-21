# Implementation Log

## Completed Tasks

| Task | 무엇을 했나 | 검증 |
|---|---|---|
| **T001** | `src/types/index.ts` — `Milestone` · `MilestoneGeneration` 인터페이스, `GenerationState.milestoneId?` (`sourceBacklog` 옆) | `[실행]` typecheck |
| **T002** | `src/core/paths.ts` — `visionMilestones` | `[실행]` typecheck + T006 |
| **T003** | `src/core/milestone.ts` — 파싱. frontmatter + `## Exit Criteria` · `## Out of Scope` · `## Generations` | `[실행]` `bun test tests/unit/milestone.test.ts` |
| **T004** | 조회·검증. `listMilestones` / `mainMilestone` / `isValidMilestone` / `candidateMilestones` / `uncheckedGenerations` / `validateForMain` | `[실행]` 동일 |
| **T005** | 전이. `setMain`(이전 main 내림 포함) / `closeMilestone` / `createMilestone`. frontmatter 한 줄 치환 | `[실행]` 동일 |
| **T006** | `tests/unit/milestone.test.ts` — **32 케이스**. 거부 조건마다 개별 케이스 | `[실행]` 32 pass / 0 fail + `[negative]` 아래 |

### T003 — 절 분리를 정규식에서 줄 단위로 바꿨다

처음 쓴 것은 `^##\s+Heading\s*$([\s\S]*?)(?=^##\s|\Z)` 였다. **`\Z` 는 JavaScript 정규식에
없다** — 리터럴 `Z` 로 읽힌다. 결과:

- **파일의 마지막 절**(뒤에 `##` 이 없는)은 텍스트 어딘가의 `Z` 문자에서 멈추거나, `Z` 가
  없으면 아예 매칭되지 않는다
- `## Generations` 가 항상 마지막이므로 **generation 목록이 조용히 비어 있게 된다**

typecheck 도 통과했고 읽어서는 안 보였다. 줄 단위 `sectionLines()` 로 대체했다.

**`[negative]`** — 결함을 되돌려 red 를 확인했다:

```
(fail) parse > generations keep their checked state and order
(fail) parse > the LAST section is read even with no heading after it
(fail) close > marks completed in place, reports what was unfinished
29 pass / 3 fail   →  복원 후 32 pass / 0 fail
```

세 번째가 독립 관측자다 — `closeMilestone` 의 `uncheckedCount` 는 목록 파싱에 의존하므로
파싱이 죽으면 0을 보고한다.

`the LAST section` 케이스의 no-Z fixture 는 **손으로 만들었다**. 공유 fixture 의 ISO `createdAt`
이 `Z` 로 끝나 그것만으로는 조건이 성립하지 않는다(첫 실행에서 red 로 드러났다).

### T004 — validity 는 저장하지 않는다

`draft` 상태를 두지 않기로 한 계획의 귀결이다. 경계가 빈 milestone 은 "미완성 상태"가 아니라
**후보를 내지 못하는** milestone 이고, 그것은 내용을 물어보면 답이 나온다.

`mainMilestone` 은 `main: true` 이면서 **`status: open`** 인 것만 돌려준다. `closeMilestone` 이
플래그를 함께 내리므로 정상 경로에서는 생기지 않는 조합이지만, 사람이 파일을 직접 고칠 수 있는
파일 기반 상태에서는 조회 쪽이 방어해야 한다 (unit: `ignores a completed one that still carries
the flag`).

### T005 — frontmatter 한 줄만 바꾼다

`YAML.parse → stringify` 왕복은 주석·키 순서·따옴표를 잃는다(longterm). `setFrontmatterField` 는
줄 단위 치환이며, unit 이 **나머지 바이트가 그대로인지** 단언한다
(`preserves the rest of the file byte for byte`).

`setMain` 은 이전 main 을 **먼저** 내린다. 그 뒤 실패하면 main 이 둘이 아니라 **0개**로 남는다 —
`reap milestone list` 가 어느 상태인지 보여준다.

---

| Task | 무엇을 했나 | 검증 |
|---|---|---|
| **T007** | `make/milestone.ts` + `RESOURCES` 에 추가. `makeBacklog` 패턴 그대로 | `[실행]` e2e |
| **T008** | `cli/commands/milestone.ts` (`list`/`main`/`close`) + `cli/index.ts` 라우팅 | `[실행]` e2e + 수동 smoke |
| **T009** | `tests/e2e/milestone.test.ts` — 13 케이스. 거부 경로 개별 | `[실행]` 13 pass |
| **T010** | 문 1 — **채널이 셋이었다**(아래) | `[실행]` unit |
| **T011** | `tests/unit/milestone-prompt.test.ts` — 13 케이스 | `[실행]` + `[negative]` 3지점 |
| **T012** | 문 2 — `start` scan 후보 + `create --milestone` | `[실행]` e2e |
| **T013** | `tests/e2e/milestone-start.test.ts` — 13 케이스 | `[실행]` + `[negative]` |
| **T014** | 문 3 — `buildVisionGapAnalysis` 가 휴리스틱을 **대체** | `[실행]` unit |
| **T015** | `tests/unit/milestone-adapt.test.ts` — 10 케이스 | `[실행]` + `[negative]` |

## Discovered Tasks

### D1 — 문 1 은 하나가 아니라 셋이었다 (계획 수정)

02-planning.md 은 *"`buildBasePrompt` 하나만 고치면 `run/*.ts` 14개 전부에 도달한다"* 고 적었다.
**틀렸다.** 그 14는 `buildBasePrompt` 호출이 아니라 **"goal 을 언급하는 파일"** 을 센 것이었다
(learning 에서 `grep -rln "goal" src/cli/commands/run/*.ts` 의 결과를 잘못 읽었다).
`buildBasePrompt` 를 부르는 곳은 `evolve.ts` **하나**다.

실제 채널:

| 채널 | 코드 | 언제 |
|---|---|---|
| **A** dynamic context | `buildKnowledgeContext`(async) + `buildKnowledgeContextSync` — **byte-identical 규약** | SessionStart + 매 lifecycle 명령 후 |
| **B** subagent prompt | `buildBasePrompt` | `reap run evolve` |
| **C** stage prompt | 각 `run/*.ts` 의 `promptSections` | 해당 stage (문 2·3 이 여기다) |

**계획보다 일이 늘었다** — byte-identical 을 지켜야 하는 builder 가 둘이다. 텍스트가 세 곳에서
생기지 않도록 렌더러를 순수 함수 하나(`buildMilestoneSection`)로 뽑고 **읽기만** async/sync 로
갈랐다(`listMilestones` / `listMilestonesSync`). heading 깊이는 인자다 — 동적 컨텍스트는 `#`,
subagent prompt 는 `##` 를 쓴다.

`[negative]` 세 주입 지점을 각각 제거해 red 를 확인:

```
B  buildBasePrompt 제거      → 1 fail
A-async load-context 제거    → 2 fail  (byte-identity 가 함께 잡는다)
A-sync dump-state-sync 제거  → 2 fail
```

### D2 — `vision.ts` ↔ `milestone.ts` 순환 import

문 3 은 `vision.ts` 가 milestone 을 알아야 하는데, `milestone.ts` 가 goal 매칭을 위해
`parseGoals` 를 쓰고 있었다. `validateForMain` 이 **goals 파일 형식을 알 필요가 없다** —
`knownGoals: readonly string[]` 를 받게 바꾸고, 그 목록은 `vision.ts` 의 `goalIdentifiers()` 가
만든다. 정규화는 `milestone.ts` 한 곳에만 있다 (양쪽에 두면 어긋난다).

### D3 — `.action()` 뒤에 `.command()` 를 체이닝해 `cruise` 를 부숴뜨렸다

`milestone` 명령을 `program\n  .command("cruise")` 앞에 끼워 넣으면서 `program` 문을 새로 열지
않아, `cruise` 가 **`milestone` 의 하위 명령**이 됐다. `reap cruise 3` 이 아무것도 출력하지 않았다.

**잡은 것은 내 milestone e2e 가 아니라 기존 cruise 테스트 7건이다.** 새 기능의 테스트는 새 기능만
본다 — 옆에 있던 것이 깨진 것은 그 옆의 테스트가 잡았다. 전체 스위트를 돌리기 전까지는
milestone 관련 26 케이스가 전부 초록이었다.

## Architecture Decisions

### 문 3 은 "추가"가 아니라 "대체"다

`suggestNextGoals` 는 goal 제목과 backlog 제목의 **토큰 겹침 점수(≥0.2)** 로 다음 후보를 고른다.
milestone 이 있으면 다음 세대는 **추측이 아니라 이름 붙은 항목**이므로, 그 절을 통째로 바꾼다.

`withWork.length === 0` 이면(모든 항목이 체크됨 / 완료됨 / 경계 미충족) **기존 경로로 돌아간다** —
소진된 milestone 이 그 절을 비워버리지 않는다.

T015 의 판정 기준이 *"후보가 나온다"* 가 아니라 **"휴리스틱 블록이 사라졌는가"** 인 이유가
이것이다. 전자는 대체를 지워도 통과한다.

---

| Task | 무엇을 했나 | 검증 |
|---|---|---|
| **T016** | reflect prompt 에 Milestone Progress 지시(`servedMilestone` 있을 때만) + `05-completion.md` 템플릿 절 | `[실행]` scenario |
| **T017** | `archive.ts` — `meta.yml` 에 `milestoneId` (없으면 키 자체가 없다) | `[실행]` unit + scenario |
| **T018** | `integrity.ts` — `vision/milestones/` 구조 + **경계 미충족 open** 경고 + **main 파일만** 크기 guideline(~80줄) | `[실행]` unit 7 케이스 |
| **T019** | genome×2 · 배포 템플릿×2 · reap-guide×2 · `help.ts` topic | `[실행]` `fix --check` 0 error |
| **T020** | `tests/scenario/milestone.test.ts` — milestone 2개, gen 2개, **두 번째는 main 이 아닌 쪽에서** | `[실행]` 11 pass |

### T019 — 무엇을 어디에 썼고, 무엇을 일부러 미뤘나

| 파일 | 무엇 |
|---|---|
| `.reap/genome/evolution.md` | `### Milestones` 신설 · Vision 3분류 → 4분류 · **carrier 표식 심음** · pruning 중복 접기 |
| `src/templates/evolution.md` | 동일(영문) |
| `.reap/genome/application.md` | `vision/` 서술 확장 · **Static/Dynamic 표의 Dynamic 행 갱신** · dynamic 자격 기준 (b) 추가 |
| `src/templates/reap-guide.md` ↔ `.reap/reap-guide.md` ↔ `~/.reap/` | `### Milestone` 절 · 구조도 · CLI 목록 · 크기 guideline 행 |
| `src/cli/commands/help.ts` | `TOPICS_LIST` 에 `milestone` |
| `init/common.ts` · `update.ts` · `migrate.ts` | `vision/milestones/` 디렉토리 생성 |

**일부러 안 한 것 — docs 5 로케일.** v0.18 은 미발행이다. 지금 고치면 reap.cc 가 없는 기능을 설명한다.
v0.18 릴리즈 세대에서 migration note 와 함께 한다(계획의 범위 밖 항목 그대로).

**carrier 를 건드리지 않은 판단.** memory tier 표는 `memory-tier-classification` 으로 11개 파일이
함께 아는 사실이다. midterm 의 역할 변화를 그 **표에** 쓰면 5개 로케일과 어긋난다 — 그런데 표의
문장은 milestone 이 없는 프로젝트에서 여전히 참이다. 그래서 **표는 그대로 두고 경계 규칙은
Milestones 절에만** 뒀다. 그러면 carrier 는 11개 전부 일관된 채로 남는다.

발견: **`.reap/genome/evolution.md` 이 같은 표를 갖고도 표식이 없었다.** `src/templates/evolution.md`
에는 있다 — 표식 없는 carrier(#21/#22 의 상태)라 심었다.

낡은 수치 하나를 함께 고쳤다: reap-guide 의 *"evolution.md ships at ~193 lines"* 는 이미 219 일 때
쓰여 있었고 내 편집이 231 로 벌렸다.

### T019 — evolution.md 를 300줄 아래로 되돌린 방법

Milestones 절(약 18줄)을 넣으면 310줄이 되어 guideline(~300)을 넘는다. genome 가이드가 처방하는
대응은 *"300 을 넘으면 규칙이 중복이거나 environment 에 속할 서술을 담고 있다"* 이므로,
**`~/.reap/reap-guide.md` § Memory Pruning Policy 와 축자 중복인 18줄을 포인터 4줄로 접었다.**
둘 다 매 세션 자동 로드되므로 정보는 사라지지 않는다. 298줄.

## Deferred Items

- **docs 5 로케일** — 위 참조. v0.18 릴리즈 세대
- **migration note** — `check-docs-version.sh` § 5 가 note 버전 > 패키지 버전을 막는다. 본 세대는
  bump 하지 않으므로 milestone·plan·idea·memory 규칙을 한 note 로 묶어 v0.18 릴리즈 세대에서
- **memory 3-tier 재설계** — `backlogs_v0.18/` 의 별도 backlog. 본 세대는 경계 선언까지만

### D4 — evaluator prompt 에 우연히 들어갔고, 그대로 두기로 했다

`prompt.ts` 의 Memory 절 앵커가 **`buildBasePrompt` 와 `buildEvaluatorPrompt` 양쪽에 있었고**,
치환이 둘 다에 적용됐다. caller 전수 확인(gen-064 self-audit)에서 발견했다 — `buildMilestoneSection`
호출이 3개가 아니라 4개였다.

**되돌리지 않았다.** evaluator 는 독립 검토자이고 *"빌더가 범위를 지켰는가"* 를 판단하려면
`## Out of Scope` 를 알아야 한다. 우연히 옳은 자리에 들어간 것이다.

다만 **의도하지 않은 것을 의도한 것으로 만들었다** — 주석으로 이유를 남기고 관측자 2개를 붙였다
(`the out-of-scope list is in the evaluator's prompt` / `no milestones leaves the evaluator prompt as it was`).
그러지 않으면 다음 사람이 "이건 왜 여기 있지" 하고 지운다.

## Self-audit (fitness 전, gen-064 절차)

| 항목 | 결과 |
|---|---|
| (1) verification 시나리오가 테스트로 1:1 재현되는가 | 완료 기준 7개 중 6개가 테스트, 1개(genome 산문)는 `fix --check` |
| (2) **변경한 함수의 caller 를 전부 확인했는가** | 7개 함수 전수 grep → **D4 발견** |
| (3) 사용자가 따라할 명령 시퀀스를 테스트가 그대로 실행하는가 | scenario 가 `make → main → start scan → create → learning…commit → close` 를 그대로 실행 |
