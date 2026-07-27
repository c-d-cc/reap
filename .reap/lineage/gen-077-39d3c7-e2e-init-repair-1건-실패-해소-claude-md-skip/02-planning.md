# Planning

## Goal

e2e `init-repair` 1건 실패를 해소해 **e2e 0 fail** 을 만든다. 원인은 테스트 fixture 가 gen-054 의 marker-hash sync 도입 이전 기준이라 낡은 것이며, 부수적으로 드러난 "판정 기준 이원화"는 통합 대신 근거를 명문화한다.

## Completion Criteria

1. `bun test tests/e2e/` → **0 fail**
2. 수정 근거가 artifact 에 기록됨 — 테스트를 고친 이유(구현이 옳음)를 명시
3. 실사용 영향 확인 결과 기록 — `init --repair` 반복 실행이 CLAUDE.md 를 반복 오염시키지 않음
4. 두 판정 기준이 다른 이유가 **양쪽 코드에 주석으로** 남음
5. 테스트가 marker / legacy-heading / 참조만 있는 경우 3가지를 모두 덮음
6. `.reap/environment/summary.md` baseline 이 `e2e 0 fail` 로 갱신
7. unit/scenario 회귀 없음 (470-0 / 44-0)

## Background

01-learning.md 참조. 요약:
- 테스트(2026-03-26) → marker-hash sync(2026-03-30). **테스트가 4일 먼저**였고 gen-054 가 판정 로직을 바꿨다
- fixture `"...Some content with .reap/genome/ reference."` 는 REAP **헤딩**이 없어 `detectLegacyReapSection` 이 못 잡는다
- integrity 는 문자열 포함(`includes(".reap/genome/")`)으로 느슨하게 판정 → 두 곳이 불일치

## Approach

### 판단 1 — 테스트를 고친다 (구현이 옳음)

`ensureClaudeMd` 의 엄격한 판정이 맞다. 이 함수는 **섹션을 덮어쓸 위치를 찾는다.** `.reap/genome/` 이라는 문자열이 본문 어딘가에 있다는 것만으로 "여기가 REAP 섹션"이라고 단정하면, 사용자가 자기 문서에서 REAP 을 언급한 문단을 통째로 갈아버릴 수 있다.

헤딩을 요구하는 것은 **파괴적 작업 앞의 보수적 판정**이며 타당하다.

### 판단 2 — 두 판정을 통합하지 않는다

같은 질문처럼 보이지만 목적이 다르다:

| | 묻는 것 | 오판의 대가 |
|---|---|---|
| `integrity` | "사용자에게 경고할 만큼 빠졌는가" | 불필요한 경고 (가벼움) |
| `ensureClaudeMd` | "여기에 덮어쓸 섹션이 있는가" | **남의 문단을 덮어씀** (무거움) |

느슨/엄격의 비대칭이 **의도적으로 옳다.** 통합하면 한쪽이 반드시 부적절해진다 — integrity 를 엄격하게 하면 헤딩 없이 참조만 넣은 사용자에게 매번 경고하고, ensureClaudeMd 를 느슨하게 하면 위 파괴 위험이 생긴다.

**gen-076 의 DI 처방을 여기 그대로 적용하면 안 된다.** #22 는 두 곳이 *같은 값*(설치 경로)을 알아야 했고, 여기는 *다른 판단*을 한다. 표면이 닮았다고 같은 해법을 쓰는 것은 오히려 퇴행이다.

→ 통합 대신 **왜 다른지를 양쪽 주석에 남긴다.** 지금은 설명이 없어 다음 사람이 또 조사한다(본 세대가 그 조사였다).

### 판단 3 — 실사용 영향은 수용 가능

헤딩 없이 `.reap/genome/` 참조만 있는 CLAUDE.md 는 `init --repair` 시 섹션이 append 된다. 그러나:

- 기존 내용을 지우지 않는다 (뒤에 붙임)
- **두 번째 실행부터는 marker 가 있어 `skipped`** — 반복 오염 없음
- `init --repair` 는 사용자가 명시적으로 부르는 복구 명령이다

일회성이고 비파괴적이므로 구현 변경은 과하다. 이 판단 근거를 artifact 에 남긴다.

### 테스트 재설계 — 실제 동작 3종을 덮는다

기존 1 case 를 3 case 로 나눈다. 각각이 실제 코드 경로에 대응한다.

| case | fixture | 기대 |
|---|---|---|
| marker 있고 최신 | `init --repair` 를 **두 번** 실행 | 2회차 `skipped` |
| legacy 헤딩 | `## REAP` 헤딩 포함 | `updated` (repaired) |
| 참조만 있음 | `.reap/genome/` 문자열만 | `appended` (repaired) — 현재 동작 문서화 |

**두 번 실행 방식을 쓰는 이유**: marker 는 템플릿 내용의 해시를 포함한다. fixture 에 해시를 하드코딩하면 템플릿이 바뀔 때마다 테스트가 깨진다. 첫 실행이 마커를 만들고 두 번째가 그것을 확인하게 하면 템플릿 변경에 영향받지 않는다.

세 번째 case 는 "이게 정상 동작"임을 고정한다 — 나중에 누가 이 동작을 보고 버그로 오인해 고치려 할 때, 테스트가 의도임을 알려준다.

## Risk Assessment

| 리스크 | 대응 |
|---|---|
| 두 번 실행이 느려짐 | e2e 1건이 2 CLI 호출 → 무시 가능 |
| 세 번째 case 가 나중에 "잘못된 동작을 고정"이 됨 | 주석에 판단 근거(비파괴적·일회성)를 명시. 판단이 바뀌면 테스트도 함께 고치라는 신호 |
| 주석만 남기고 통합을 미룬 것으로 오해 | "의도적 비대칭"임을 명확히 서술 |

## Scope

**변경 대상**
- `tests/e2e/init-repair.test.ts` — 1 case → 3 case
- `src/cli/commands/init/common.ts` `detectLegacyReapSection` — 판정이 엄격한 이유 주석
- `src/core/integrity.ts` `checkRequiredFiles` — 판정이 느슨한 이유 + 상대편 참조 주석
- `.reap/environment/summary.md` — baseline (reflect)

**out of scope**
- 두 판정의 통합 (판단 2)
- `detectLegacyReapSection` 동작 변경 (판단 1·3)
- 릴리즈 노트 — 0.17.3 묶음 완료 후 일괄
- CI 에 테스트 추가 — 다음 세대(`릴리즈-자기진단-게이트-...`)

## Tasks

- [ ] T001 `tests/e2e/init-repair.test.ts` — marker 최신(두 번 실행 → skipped)
- [ ] T002 동 — legacy 헤딩 → updated
- [ ] T003 동 — 참조만 → appended (현재 동작 고정 + 근거 주석)
- [ ] T004 `init/common.ts` — `detectLegacyReapSection` 에 엄격 판정 근거 주석
- [ ] T005 `core/integrity.ts` — 느슨 판정 근거 + 비대칭이 의도임을 주석
- [ ] T006 `bun test tests/e2e/` 0 fail 확인
- [ ] T007 회귀 확인 (unit/scenario) + typecheck + build
- [ ] T008 environment baseline 갱신 (reflect)

## Dependencies

T001~T003 → T006, T004~T005 → T007
