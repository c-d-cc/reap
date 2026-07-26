# Completion

## Summary

**Goal**: `tests/scenario/multi-generation.test.ts` 를 gen-065 backlog gate 동작에 맞게 갱신해 scenario 스위트를 green 으로 만들고, gate 의 두 출구를 모두 커버한다.

**결과**: 완료. scenario **35 pass / 5 fail → 44 pass / 0 fail**.

**핵심 변경**: `tests/scenario/multi-generation.test.ts` 단일 파일.
- `gen2: start` 1개 → gate 흐름 3개로 분해 (gated → `--backlog` 소비 → consumed frontmatter)
- `gen2: backlog carried over` 를 파일 존재 확인에서 frontmatter 검증으로 강화
- `--no-backlog` 경로를 독립 describe 로 추가 (별도 temp 프로젝트, 2 case)

**소스 코드 변경 없음.** gate 는 올바른 동작이며 테스트가 낡은 것이었다.

**검증**: typecheck pass / build pass / unit 454-0 / e2e 263-1 (pre-existing) / scenario 44-0 / 문서 게이트 pass

## Lessons Learned

### 잘 된 것 — 우회하지 않고 gate 를 시나리오에 편입했다

backlog 가 제시한 A안(`--no-backlog` 한 줄 추가)이 가장 적은 변경이었지만, 그러면 **gate 자체는 영원히 scenario 로 검증되지 않는다.** 테스트를 통과시키는 것과 테스트가 의미를 갖게 하는 것은 다르다.

B안으로 "막힘 → 판단 → 재호출"이라는 실제 사용자 경로를 그대로 따라가되, A안이 커버하려던 `--no-backlog` 도 별도 case 로 넣었다. gate 는 출구가 둘이므로 하나만 검증하면 절반만 본 것이다.

결과적으로 gen-065 가 도입한 기능이 **처음으로 scenario 레벨 커버리지를 얻었다.**

### 잘 된 것 — assertion 을 추측이 아니라 실측에서 썼다

T001 에서 임시 프로젝트로 gate 를 실제 실행해 응답 JSON 을 확인한 뒤 assertion 을 작성했다. `phase` 값, `pendingBacklog` 구조, `completed` 배열 원소명(`backlog-consumed`), frontmatter 필드명(`consumedBy` / `consumedAt`) 모두 실측값이다.

1분 투자로 잘못된 assertion 을 예방했다. longterm 의 "Verify framework semantics with a minimal repro" 를 적용한 사례.

### 잘 된 것 — 부정 검증을 함께 넣었다

통과 조건만 확인하면 놓치는 것들이 있다:
- gate 가 prompt 를 반환하면서 **실제로는 generation 을 만들어버리는** 경우 → `current.yml` 부재 확인
- 소비가 frontmatter 전환이 아니라 **파일 삭제**로 구현되는 경우 → 파일 존재 + 본문 보존 확인
- `--no-backlog` 가 **조용히 소비해버리는** 경우 → `status: pending` 유지 + `consumedBy` 부재 확인

gen-073 의 "make it fail first" 와 같은 계열 — 검사가 실제로 무엇을 보장하는지 확인하는 습관이다.

### 개선점 — pre-existing 을 3세대째 넘기고 있다

e2e `init-repair` 1건이 gen-072/073/074 에서 계속 "pre-existing" 으로 처리되고 있다. scenario 5건도 정확히 같은 경로를 밟다가 결국 이 세대에서 고쳤다.

**"pre-existing 이니 무관"은 그 세대에서는 옳은 판단이지만, 반복되면 부채다.** baseline 에 기록해둔 덕에 판단 비용은 낮아졌으나 판단 자체는 매번 해야 한다. 다음 세대 hints 에 포함한다.

## Next Generation Hints

1. **다음(유저 지시 순서)**: `genome-line-threshold100-...` backlog — genome threshold(100)가 배포 템플릿(evolution.md, 현재 193줄)보다 작아 `reap init` 직후 warning 이 뜨는 문제. 0.17.2 에 포함
2. **0.17.2 릴리즈** — 위 세대 완료 후. **릴리즈 노트에 gen-074/075 내용 추가 필요** (현재 노트는 gen-072 시점 내용만 담고 있음). `check-docs-version.sh` 는 버전 일치만 보고 내용 완전성은 검사하지 않으므로 수동 확인 필요
3. **e2e `init-repair` 1 fail** — 3세대째 pre-existing. backlog 화 검토
4. interview 는 0.18.0, daemon 2건은 유저 보류

## Change Proposals

### genome 변경 없음

본 세대의 교훈("우회하지 말고 실제 경로를 검증하라", "부정 검증을 함께")은 이미 genome 에 있는 원칙의 적용 사례다:
- evolution.md § Workaround 금지 — 우회 대신 근본 처리
- evolution.md § "검사를 만들 때 — 먼저 실패시켜라" (gen-073 추가) — 검사가 무엇을 보장하는지 확인

새로 명문화할 것이 없다. **교훈이 있다고 매번 genome 에 추가하면 중복이 쌓인다** — gen-072/073 에서 longterm pruning 으로 genome 중복 9건을 삭제한 직후이므로 특히 주의했다.

### 신규 backlog 없음
