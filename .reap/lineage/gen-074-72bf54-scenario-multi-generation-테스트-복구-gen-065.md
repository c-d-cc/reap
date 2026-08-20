---
id: gen-074-72bf54
type: embryo
goal: "scenario multi-generation 테스트 복구 — gen-065 backlog gate 반영 + scenario baseline 기록"
parents: ["gen-073-cfbb45"]
---
# gen-074-72bf54
**Goal**: `tests/scenario/multi-generation.test.ts` 를 gen-065 backlog gate 동작에 맞게 갱신해 scenario 스위트를 green 으로 만들고, gate 의 두 출구를 모두 커버한다.

**결과**: 완료. scenario **35 pass / 5 fail → 44 pass / 0 fail**.

**핵심 변경**: `tests/scenario/multi-generation.test.ts` 단일 파일.
- `gen2: start` 1개 → gate 흐름 3개로 분해 (gated → `--backlog` 소비 → consumed frontmatter)
- `gen2: backlog carried over` 를 파일 존재 확인에서 frontmatter 검증으로 강화
- `--no-backlog` 경로를 독립 describe 로 추가 (별도 temp 프로젝트, 2 case)

**소스 코드 변경 없음.** gate 는 올바른 동작이며 테스트가 낡은 것이었다.

**검증**: typecheck pass / build pass / unit 454-0 / e2e 263-1 (pre-existing) / scenario 44-0 / 문서 게이트 pass