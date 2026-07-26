---
type: task
status: pending
priority: high
createdAt: 2026-07-26T02:05:01.700Z
---

# backlog 작성 시 interview 기능 추가 (모호성 제거 반복 질문)

## Problem

REAP 에서 **backlog 는 다음 generation 의 지시문 역할**을 한다. `reap run start --backlog <file>` 로 소비되어 그 세대 전체의 작업 범위를 규정한다. 그런데 현재 `reap make backlog` 는 **템플릿 파일을 생성하고 "채워라"라고 지시하는 것이 전부**다:

```
src/cli/commands/make/... → 템플릿 3섹션(Problem / Solution / Files to Change) 생성
emitOutput.prompt: "You MUST now use the Edit tool to fill in these sections..."
```

의도의 모호함을 제거하는 절차가 없다. 결과적으로:

- 사용자가 한 줄로 던진 요청이 그대로 backlog 가 되고, agent 가 추측으로 빈칸을 채운다
- 그 추측이 다음 generation 의 planning/implementation 까지 그대로 흘러간다 (gen-064 사례: planning 단계의 잘못된 가정이 implementation 까지 전파, fitness 직전 사용자 코드 검토에서야 발견)
- scope 가 큰지 작은지, 무엇이 out-of-scope 인지가 backlog 에 남지 않아 다음 세대 agent 가 재추측한다

REAP 에는 이미 `clarity.ts` 가 high/medium/low 를 판정하고 evolution.md 가 "clarity 낮으면 적극 interaction" 을 지시하지만, **그 판정이 실제 질문 루프로 이어지는 코드 경로가 없다**. 지시만 있고 메커니즘이 없는 상태.

비교 대상인 ouroboros / superpowers 는 이 지점에 **수렴할 때까지 반복 질문하는 명시적 루프**를 두고 있다. REAP 도 같은 것을 backlog 작성 시점에 둔다.

## Solution

`reap make backlog` 에 interview 루프를 추가한다. **설정으로 on/off 가능하며 기본값 on**, 이번 업데이트를 받는 기존 사용자도 자동 활성화된다.

### S1. Config — `interview?: boolean`, 기본 on

- `ReapConfig.interview?: boolean` 추가
- **기본값 on 이며 기존 사용자 자동 활성화** — 이 요구사항은 구현 방식에 제약을 건다. `daemon` / `evaluator` 같은 기존 opt-in 플래그는 "미설정 = off" 규약이라 그대로 흉내내면 안 된다.
  - 판정식: `config.interview !== false` (미설정 → on)
  - `CONFIG_DEFAULTS` (`src/cli/commands/update.ts:35`) 에 `interview: true` 를 넣을지는 **신중 판단 필요**. gen-071 이 `lastMigratedVersion` 을 CONFIG_DEFAULTS 에서 뺀 이유가 "모든 기존 프로젝트에 spurious config diff 유발"이었다 (`update.ts:51-54` 주석). 같은 함정. 다만 이번엔 사용자가 명시적으로 "자동 활성화"를 요구했으므로, **backfill 로 필드를 눈에 보이게 넣어 사용자가 끄는 법을 알게 하는 것**이 오히려 낫다는 반론도 성립. 구현 시 두 안을 비교하고 결정 근거를 artifact 에 남길 것.
- off 일 때는 **현재 동작과 byte-identical** (회귀 0). daemon/evaluator 가 확립한 3층 게이트 패턴 준수.

### S2. Interview 루프 — CLI 는 진행자, 질문 생성은 agent

REAP 의 기존 구조(CLI 가 JSON+prompt 를 emit → agent 가 수행 → CLI 재호출)를 따른다. CLI 가 대화형 stdin 을 직접 처리하지 않는다 — `ReapOutput` JSON stdout 규약과 충돌하기 때문.

- `reap make backlog --title "..."` (interview on) → 파일 생성 + **interview prompt emit**
- agent 가 prompt 지시에 따라 `AskUserQuestion` 등으로 질문 → 답변 수집 → 파일의 3섹션을 채움
- 수렴 판정 후 종료

**질문 생성은 agent 몫, 진행 규율은 prompt 가 강제**한다. MCP 같은 별도 질문 생성 서버를 두지 않는다 (ouroboros 는 두지만 REAP 은 zero-dependency + 파일 기반 원칙).

### S3. Interview prompt 상세 — ouroboros / superpowers 리서치 결과

두 도구를 실제로 읽고 추출한 **이식 가치가 있는 메커니즘**. 출처:
- `~/.claude/plugins/cache/claude-plugins-official/superpowers/6.2.0/skills/brainstorming/SKILL.md`
- `~/.claude/plugins/cache/ouroboros/ouroboros/0.50.5/skills/interview/SKILL.md`
- `~/.claude/plugins/cache/ouroboros/ouroboros/0.50.5/docs/auto-interview-convergence-contract.md`

| 메커니즘 | 출처 | REAP 적용 |
|---|---|---|
| **한 번에 질문 하나** | superpowers ("Only one question per message") | 그대로 채용. 여러 질문 묶음은 사용자가 앞부분만 답하고 뒤를 흘린다 |
| **코드가 답할 수 있는 건 묻지 않는다** | ouroboros PATH 1a/1b/2 분류 | **REAP 에 특히 중요**. daemon(`config.daemon`) + Grep/Read 로 답 가능한 사실 질문은 자동 확정 후 "확인" 형태로 제시. 사람에게는 **판단이 필요한 것만** 묻는다 |
| **Ambiguity ledger** | 양쪽 공통 | 미해결 모호성 스레드를 **여러 개 병렬 추적**하고 몇 라운드마다 재방문. 한 세부 주제가 나머지를 밀어내는 것 방지(breadth check). REAP 은 이 ledger 를 backlog 파일의 임시 섹션으로 두었다가 종료 시 정리하는 방식 검토 |
| **Dialectic Rhythm Guard** | ouroboros | 코드/추론으로 자문자답이 **3회 연속되면 다음 질문은 반드시 사람에게**. agent 가 혼자 결론내는 것 방지 |
| **Refine gate** | ouroboros | 자유서술 답변을 구조화해 되읽어주고 확인. "제가 이해한 게 맞나요?" — scope/제약/결정이 담긴 답변에는 필수 |
| **Restate gate** | ouroboros | 종료 직전 **한 문장 goal 로 압축**해 명시 승인. 승인 없이 종료 금지 |
| **2-3개 접근안 + 추천** | superpowers | 설계 선택지가 갈릴 때 트레이드오프와 함께 제시하되 **추천안을 먼저** |
| **YAGNI ruthlessly** | superpowers | 모든 안에서 불필요 기능 제거 |
| **"너무 단순해서 불필요" 안티패턴 차단** | superpowers | "간단해 보이는 작업일수록 미검토 가정이 낭비를 만든다". 단, REAP 은 아래 S4 참조 — 무조건 강제는 REAP 철학과 충돌 |
| **자기 판단 종료 금지 (Acceptance Guard)** | ouroboros ("seed-ready 는 완료가 아니라 감사 허가") | agent 가 "충분히 물었다"고 스스로 종료하지 않는다. 종료 기준을 체크리스트로 명시 |
| **기존 코드베이스 우선 탐색** | superpowers | 질문 전에 프로젝트 구조/최근 커밋 확인 → 발견형("X 있나요?")이 아닌 확인형("X 를 봤는데 Y 로 가정할까요?") |

**채용하지 않을 것**:
- superpowers 의 visual companion (브라우저 mockup) — REAP scope 밖
- ouroboros 의 MCP 질문 생성 서버 — zero-dependency 원칙 위배
- ouroboros 의 lateral thinking subagent fan-out — 과잉

### S4. 종료 조건 — REAP 고유 설계 필요

superpowers 는 "모든 프로젝트가 예외 없이 이 과정을 거친다"고 HARD-GATE 를 건다. **REAP 에 그대로 가져오면 충돌한다**:

- REAP 은 clarity 기반으로 상호작용 깊이를 **자동 조절**하는 것이 genome 원칙(evolution.md § Clarity-driven Interaction)
- maturity(bootstrap/growth/cruise)에 따라 질문 비율이 60/30/10% 로 정해져 있음
- cruise mode 는 애초에 **질문 없는 자율 실행**이 목적 — 여기에 무조건 interview 를 걸면 cruise 가 무의미해진다

따라서 종료(및 시작) 조건을 REAP 문맥으로 재설계한다:

- `clarity.ts` 판정과 연동: **high → 짧게(확인 1~2문) / medium → 표준 / low → 깊게**
- maturity 연동: cruise 에서는 **interview skip 또는 최소화** (설계 결정 필요)
- 명시적 종료 조건 체크리스트 — 최소한 다음이 채워져야 종료:
  1. 문제 진술이 관찰 가능한 형태인가 (재현/근거)
  2. 완료 판정 기준이 있는가
  3. **out-of-scope 가 명시됐는가** (현재 템플릿에 없는 섹션 — 추가 검토)
  4. 미결 결정이 남았다면 backlog 에 열린 항목으로 기록됐는가
- 사용자가 "그만/충분해" 라고 하면 즉시 종료 (강제 게이트 아님)

### S5. 템플릿 확장 검토

interview 산출물을 담을 자리가 필요하다. 현재 3섹션(Problem / Solution / Files to Change)에 다음 추가 검토:
- **Out of Scope** — interview 의 핵심 산출물. 다음 세대 agent 가 범위를 재추측하지 않게 함
- **Open Decisions** — 미결 사항 (본 repo 가 이미 수기로 쓰고 있는 패턴을 정식화)
- **Acceptance** — 완료 판정 기준

템플릿 변경은 `reap make backlog` 산출물 형식 변경이므로 **기존 backlog 파일과의 호환**을 깨지 않는지 확인 (파서가 있는지, 단순 마크다운인지).

## Files to Change

- `src/types/index.ts` — `ReapConfig.interview?: boolean`
- `src/cli/commands/make/` (backlog 생성 핸들러) — interview on 시 prompt emit 분기. **off 시 기존 출력과 byte-identical**
- `src/core/prompt.ts` — interview prompt 빌더 (`buildInterviewPrompt`). `buildEvaluatorPrompt` (gen-066) 가 선례 — dynamic context 주입 + HARD-GATE 절 패턴 재사용
- `src/cli/commands/update.ts` — `CONFIG_VALID_FIELDS` 에 `interview` 추가 필수 (누락 시 backfill 의 deprecated-field pruning 이 **사용자 설정을 삭제**한다, `update.ts:32-37` 참조). `CONFIG_DEFAULTS` 포함 여부는 S1 판단
- `src/core/clarity.ts` — interview 깊이 결정에 clarity 연동 (읽기만 할지 확장할지 결정 필요)
- backlog 템플릿 파일 — S5 채택 시
- `src/templates/reap-guide.md` + `.reap/reap-guide.md` — interview 기능 문서화 (dog-fooding 동기화)
- `src/templates/evolution.md` + `.reap/genome/evolution.md` — interview 가 agent 행동 규율이므로 genome 반영 대상인지 판단
- `docs/src/i18n/translations/*.ts` — 5개 로케일 문서 갱신 (별도 backlog `release-직전-문서-버전-일치-검증-reapcc-문서-갱신.md` 와 연동)

## Verification

1. `interview` 미설정 프로젝트에서 `reap make backlog` → **interview prompt 노출** (기본 on 확인)
2. `interview: false` 프로젝트에서 `reap make backlog` → **기존과 byte-identical 출력** (회귀 0)
3. `reap update` 실행 후 `interview` 필드가 사용자 config 에서 **삭제되지 않음** (`CONFIG_VALID_FIELDS` 누락 회귀 방지)
4. clarity high/medium/low 별로 prompt 의 질문 깊이 지시가 달라지는지
5. cruise mode 에서의 동작이 설계 결정대로인지
6. prompt 에 S3 의 핵심 규율(한 번에 하나 / 코드 우선 / ledger / rhythm guard / refine / restate / 자기종료 금지)이 모두 포함
7. `npm run typecheck` + unit/e2e 회귀 없음
8. 실제 dog-fooding — **본 기능 자체를 interview 로 만든 backlog 로 다음 세대에서 소비**해보고 품질 체감 (gen-066 의 self-dogfooding timing 패턴)

## Open Decisions

- [ ] `CONFIG_DEFAULTS` 에 `interview: true` 를 넣을 것인가 (spurious diff vs 발견가능성)
- [ ] cruise mode 에서 interview 를 skip 할 것인가, 최소화할 것인가
- [ ] backlog 템플릿에 Out of Scope / Open Decisions / Acceptance 섹션을 추가할 것인가
- [ ] interview 를 `reap make backlog` 에만 둘 것인가, `reap run start --goal` 에도 확장할 것인가 (goal 도 지시문 역할을 함 — 다만 scope 확대이므로 별도 세대 후보)
