---
type: task
status: pending
priority: high
createdAt: 2026-07-26T02:05:01.700Z
---

# interview skill 신설 — 모호성을 제거하는 독립 대화 절차

> 이 backlog 는 `backlog-작성-시-interview-기능-추가-모호성-제거-반복-질문.md` 를 대체한다.
> 변경점: interview 를 `reap make backlog` 안의 기능이 아니라 **독립 skill** 로 만들고, 다른 step 들은 필요할 때 그것을 **호출하는 prompt** 만 갖는다.

## Problem

REAP 에는 **모호한 의도를 구체화하는 절차가 없다.**

`reap make backlog` 는 템플릿 3섹션(Problem / Solution / Files to Change)을 만들고 "채워라"라고 지시하는 것이 전부다. `reap run start --goal "<한 줄>"` 도 마찬가지로 그 한 줄을 그대로 세대의 범위로 삼는다. 그 결과:

- 사용자가 한 줄로 던진 요청을 **agent 가 추측으로 확장**하고, 그 추측이 planning·implementation 까지 그대로 흘러간다 (gen-064: planning 의 잘못된 가정이 implementation 까지 전파되어 fitness 직전 사용자 코드 검토에서야 발견)
- **무엇이 범위 밖인지**가 어디에도 남지 않아 다음 세대 agent 가 재추측한다
- 완료 판정 기준이 없어 "됐다"의 근거가 사람의 인상에 의존한다

`clarity.ts` 가 high/medium/low 를 판정하고 evolution.md 가 "clarity 낮으면 적극 interaction" 을 지시하지만, **그 판정이 실제 질문 루프로 이어지는 경로가 없다.** 지시만 있고 메커니즘이 없다.

### 왜 별도 skill 인가

앞선 backlog 는 이것을 `reap make backlog` 의 내부 기능으로 설계했다. 그 설계의 문제:

- **모호성은 backlog 작성 시점에만 생기지 않는다.** goal 을 정할 때, design 문서를 쓸 때, planning 에서 접근을 고를 때 모두 같은 절차가 필요하다. 한 명령에 묻으면 나머지에서 다시 만들어야 한다
- **사용자가 직접 부를 수 없다.** "지금 이 얘기 좀 정리하자"는 요구가 CLI 명령에 종속된다
- **한 곳에 묻으면 규율이 그 명령의 prompt 문자열에 갇힌다.** 같은 규율을 4곳에 복붙하는 순간 그것은 carrier 문제가 된다 (issue #21 과 같은 종류)

따라서 **interview 를 하나의 skill 로 독립시키고, 각 step 은 "필요하면 이것을 먼저 하라"고 가리키기만 한다.** 규율의 소유자는 한 곳이 된다.

## Solution

### S1. `reap.interview` skill 신설

- 위치: `src/adapters/claude-code/skills/reap.interview.md` — **claude-code 와 opencode 가 같은 소스를 공유**하는 기존 규약(single source, gen-064) 그대로
- 사용자 호출: `/reap.interview [주제]`
- agent 호출: 다른 step 의 prompt 가 "clarity 가 낮다 → interview 를 먼저 수행하라"고 지시
- **산출물 대상을 인자로 받는다** — backlog / goal / design 문서 / planning 접근안 중 무엇을 채우는 대화인지. 대상이 정해져야 종료 조건이 정해진다

> **주의**: `reap-배포-형태를-skill-나열에서-plugin-으로-전환.md` 와 같은 파일을 건드린다. plugin 전환이 먼저 일어나면 이 skill 은 plugin 번들 안에 들어가야 한다. **두 작업의 순서를 착수 전에 정할 것.**

### S2. interview 의 목적

사용자의 모호한 개념을 **(a) 구체화하고 (b) 기록으로 남기고 (c) 실제 구현 가능한 실행 계획으로 만든다.** agent 는 그 세 가지가 설 때까지 **집요하게(relentlessly)** 묻는다.

### S3. 인지 능력을 고려한 질문 형식 — 이 backlog 의 핵심

"집요하게 묻는다"와 "사람의 인지 능력을 고려한다"는 **긴장 관계**다. 해소 방법은 질문에 관대해지는 것이 아니라 **사람에게 갈 질문의 수를 줄이는 것**이다. 코드·문서·daemon 으로 답할 수 있는 것은 agent 가 스스로 확정하고, **판단이 필요한 것만 사람에게 간다.**

질문은 다음 형식을 **반드시** 따른다:

1. **한 번에 질문 하나.** 묶어 던지면 사람은 앞부분만 답하고 뒤를 흘린다
2. **선택지 2~4개 + 자유 입력.** 선택지가 5개를 넘으면 비교 자체가 부담이 된다. 자유 입력 경로는 **항상 열려 있어야** 한다 — 선택지는 사고를 돕는 장치이지 가두는 장치가 아니다
3. **각 선택지에 "고르면 무슨 일이 생기는가"를 한 줄로.** 이름만으로는 비교할 수 없다
4. **추천안을 제시하고 그 근거를 한 줄로 붙인다.** 추천을 맨 앞에 둔다
5. **모르겠다는 답은 막다른 골목이 아니다.** 사용자가 "모르겠다/알아서 해"라고 하면 추천안을 채택하고 그 사실을 기록한 뒤 진행한다. 되묻지 않는다
6. **끝이 보여야 한다.** 남은 모호성 개수 등 진행 상태를 함께 보여준다. 언제 끝날지 모르는 질문은 사람을 이탈시킨다

**추천의 함정 — 설계 시 반드시 고려**: 모든 질문에 추천을 붙이면 사용자가 추천만 누르게 되고(anchoring), 그러면 interview 는 형식만 남고 모호성은 그대로 남는다. 따라서:
- 추천은 **근거가 있을 때만** 붙인다. 근거는 코드·genome·기존 결정에서 나온 것이어야 한다
- **취향·우선순위를 묻는 질문에는 추천을 붙이지 않는다.** 그것은 사람이 결정해야 하는 것이고, 추천은 그 결정을 대신해버린다
- 추천이 채택됐는지 사용자가 다른 답을 냈는지를 **기록에 남긴다.** 전부 추천으로 채워진 산출물은 interview 가 작동하지 않았다는 신호다

**클라이언트 의존성**: Claude Code 는 선택지 UI(자유 입력 자동 제공)를 가진 질문 도구가 있고, OpenCode 는 다를 수 있다. **skill 은 특정 도구에 의존하지 않는다** — 도구가 있으면 쓰고, 없으면 번호 붙인 선택지를 평문으로 제시한다. 형식(선택지+자유+추천)은 어느 쪽이든 동일해야 한다.

### S4. 진행 규율 — ouroboros / superpowers 리서치 이식

두 도구를 실제로 읽고 추출한 것. 출처:
- `~/.claude/plugins/cache/claude-plugins-official/superpowers/6.2.0/skills/brainstorming/SKILL.md`
- `~/.claude/plugins/cache/ouroboros/ouroboros/0.50.5/skills/interview/SKILL.md`
- `~/.claude/plugins/cache/ouroboros/ouroboros/0.50.5/docs/auto-interview-convergence-contract.md`

| 메커니즘 | 출처 | REAP 적용 |
|---|---|---|
| **한 번에 질문 하나** | superpowers | S3-1 로 채용 |
| **코드가 답할 수 있는 건 묻지 않는다** | ouroboros PATH 분류 | **REAP 에 특히 중요.** daemon(`config.daemon`) + Grep/Read 로 답 가능한 사실은 자동 확정 후 "확인" 형태로 제시. 이것이 S3 의 인지부하 문제를 푸는 실질적 수단 |
| **기존 코드베이스 우선 탐색** | superpowers | 질문 전에 구조·최근 커밋 확인 → 발견형("X 있나요?") 대신 확인형("X 를 봤는데 Y 로 가정할까요?") |
| **Ambiguity ledger** | 양쪽 공통 | 미해결 모호성을 **여러 스레드로 병렬 추적**하고 몇 라운드마다 재방문. 한 세부 주제가 나머지를 밀어내는 것 방지. S3-6 의 "남은 개수"가 여기서 나온다 |
| **Dialectic Rhythm Guard** | ouroboros | 자문자답이 **3회 연속되면 다음은 반드시 사람에게.** agent 가 혼자 결론내는 것 방지 |
| **Refine gate** | ouroboros | 자유서술 답변을 구조화해 되읽어주고 확인. scope·제약·결정이 담긴 답변에는 필수 |
| **Restate gate** | ouroboros | 종료 직전 **한 문장으로 압축**해 명시 승인. 승인 없이 종료 금지 |
| **2~3개 접근안 + 추천** | superpowers | S3-4 로 채용하되 **추천의 함정** 단서를 붙임 |
| **YAGNI ruthlessly** | superpowers | 모든 안에서 불필요 기능 제거 |
| **자기 판단 종료 금지** | ouroboros ("seed-ready 는 완료가 아니라 감사 허가") | agent 가 "충분히 물었다"고 스스로 끝내지 않는다. 종료 기준을 체크리스트로 명시 |

**채용하지 않을 것**: superpowers 의 브라우저 mockup(scope 밖), ouroboros 의 MCP 질문 생성 서버(zero-dependency 위배), lateral thinking subagent fan-out(과잉).

### S5. 호출 지점 — 각 step 은 "가리키기만" 한다

각 호출 지점의 prompt 에는 **규율 본문이 아니라 호출 지시**만 넣는다. 규율은 skill 이 소유한다.

| 호출 지점 | 조건 | 산출물 |
|---|---|---|
| `reap make backlog` | 항상 (아래 S7 게이트) | backlog 3~6 섹션 |
| `reap run start --goal` | goal 이 한 줄이거나 모호할 때 | goal 문장 + 세대 범위 |
| `reap run learning --phase complete` | clarity low/medium | 학습 결과의 미결 항목 |
| `reap run planning` | 접근안이 갈릴 때 | 채택안 + 기각 사유 |
| 사용자 직접 호출 `/reap.interview` | 언제든 | 지정한 대상 |

### S6. 종료 조건 — REAP 고유 설계

superpowers 는 "모든 프로젝트가 예외 없이 거친다"는 HARD-GATE 를 건다. **REAP 에 그대로 가져오면 충돌한다**:
- clarity 기반으로 상호작용 깊이를 자동 조절하는 것이 genome 원칙
- maturity 에 따라 질문 비율이 60/30/10% 로 정해져 있음
- **cruise mode 는 애초에 질문 없는 자율 실행이 목적** — 여기에 무조건 interview 를 걸면 cruise 가 무의미해진다

따라서:
- **clarity 연동** — high: 확인 1~2문 / medium: 표준 / low: 깊게
- **cruise 연동** — skip 또는 최소화 (결정 필요, Open Decisions)
- **종료 체크리스트** — 아래가 서지 않으면 종료하지 않는다:
  1. 문제 진술이 **관찰 가능한 형태**인가 (재현 조건 또는 근거)
  2. **완료 판정 기준**이 있는가
  3. **범위 밖(out of scope)** 이 명시됐는가
  4. 미결 결정이 **열린 항목으로 기록**됐는가
  5. 실행 계획이 **다음 세대가 그대로 착수 가능한 수준**인가
- **사용자가 "그만/충분해"라고 하면 즉시 종료.** 단 **미해결 모호성을 버리지 않고 Open Decisions 로 기록**한다. 조용히 끝내면 추측이 다시 시작된다

### S7. Config — `interview?: boolean`, 기본 on

- 기본값 **on**, 이번 업데이트를 받는 기존 사용자도 자동 활성화
- 판정식은 `config.interview !== false` (미설정 → on). **`daemon`/`evaluator` 의 "미설정=off" 규약을 그대로 흉내내면 안 된다**
- `CONFIG_DEFAULTS` (`src/cli/commands/update.ts`) 포함 여부는 신중 판단 — gen-071 이 `lastMigratedVersion` 을 뺀 이유가 "모든 기존 프로젝트에 spurious config diff 유발"이었다. 다만 이번엔 **필드를 눈에 보이게 넣어 끄는 법을 알게 하는 것**이 낫다는 반론도 성립. 두 안을 비교하고 근거를 artifact 에 남길 것
- off 일 때 호출 지점의 출력은 **byte-identical** (회귀 0)

### S8. 템플릿 확장

interview 산출물을 담을 자리가 필요하다. 현재 3섹션에 추가 검토:
- **Out of Scope** — interview 의 핵심 산출물. 다음 세대가 범위를 재추측하지 않게 함
- **Open Decisions** — 미결 사항 (본 repo 가 이미 수기로 쓰는 패턴의 정식화)
- **Acceptance** — 완료 판정 기준

기존 backlog 파일과의 호환을 깨지 않는지 확인할 것 (파서가 있는지, 단순 마크다운인지).

## Files to Change

**skill (신설)**
- `src/adapters/claude-code/skills/reap.interview.md` — 규율의 단일 소유자. S3 형식 + S4 규율 + S6 종료 조건 전문
- opencode adapter 는 같은 소스를 재사용하므로 **파일 추가만으로 양쪽 배포** (기존 규약 확인 필요)

**호출 지점 (가리키기만)**
- `src/cli/commands/make/` (backlog 핸들러) — interview 호출 지시 emit. off 시 byte-identical
- `src/cli/commands/run/start.ts` — goal 모호 시 호출 지시
- `src/cli/commands/run/learning.ts`, `planning.ts` — clarity 연동
- `src/core/prompt.ts` — 호출 지시 문구를 **한 곳에서 생성** (4곳 복붙 금지). `buildEvaluatorPrompt` (gen-066) 가 선례

**config·타입**
- `src/types/index.ts` — `ReapConfig.interview?: boolean`
- `src/cli/commands/update.ts` — **`CONFIG_VALID_FIELDS` 에 `interview` 추가 필수.** 누락 시 backfill 의 deprecated-field pruning 이 **사용자 설정을 삭제**한다
- `src/core/clarity.ts` — 읽기만 할지 확장할지 결정 필요

**문서·genome**
- backlog 템플릿 — S8 채택 시
- `src/templates/reap-guide.md` ↔ `~/.reap/reap-guide.md` — Slash Commands 목록 + interview 절
- `src/templates/evolution.md` ↔ `.reap/genome/evolution.md` — interview 가 agent 행동 규율이므로 genome 반영 대상인지 판단
- `src/templates/migration/vX.Y.Z.md` — 기본 on 이 기존 프로젝트에 도달하려면 필요 (gen-072 교훈)
- `docs/src/i18n/translations/{en,ko,ja,de,zh-CN}.ts` — **5개 로케일 전부**

## Verification

1. `/reap.interview` 가 **양 클라이언트에서 실제로 노출**되는가 — 파일이 놓인 것과 클라이언트가 읽는 것은 별개다 (gen-063/079 교훈). claude-code 는 층2 검사, opencode 는 현재 slash command 검증 수단이 없음을 기록
2. `interview` 미설정 프로젝트에서 호출 지점이 **interview 를 가리키는가** (기본 on 확인)
3. `interview: false` 에서 **byte-identical** 출력 (회귀 0)
4. `reap update` 후 `interview` 필드가 사용자 config 에서 **삭제되지 않음**
5. clarity high/medium/low 별로 깊이 지시가 달라지는가
6. cruise mode 동작이 설계 결정대로인가
7. skill 본문에 S3 형식 6개 + S4 규율 전부가 포함됐는가
8. **호출 지시 문구가 한 곳에서 생성되는가** (복붙 시 carrier 문제 발생 — issue #21 과 같은 종류)
9. `npm run typecheck` + unit/e2e/scenario 회귀 없음
10. **dog-fooding** — 이 기능으로 만든 backlog 를 다음 세대가 소비해보고 품질을 체감 (gen-066 self-dogfooding timing 패턴)

## Open Decisions

- [ ] **plugin 전환 backlog 와의 순서** — 어느 쪽이 먼저인가. plugin 이 먼저면 이 skill 은 번들 안으로 들어간다
- [ ] `CONFIG_DEFAULTS` 에 `interview: true` 를 넣을 것인가 (spurious diff vs 발견가능성)
- [ ] cruise mode 에서 skip 인가 최소화인가
- [ ] backlog 템플릿에 Out of Scope / Open Decisions / Acceptance 를 추가할 것인가
- [ ] 호출 지점을 한 번에 5곳 다 붙일 것인가, `make backlog` 하나로 시작해 확장할 것인가 (**후자가 유력** — 규율이 실제로 작동하는지 한 곳에서 확인한 뒤 넓히는 편이 안전)
- [ ] interview 대화 기록 자체를 남길 것인가 (산출물만 남길 것인가). 남긴다면 어디에 — artifact? lineage? **남기지 않으면 "왜 그렇게 결정했는가"가 사라진다**
