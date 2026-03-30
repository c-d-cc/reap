---
id: gen-037-5f3c11
type: embryo
goal: "validation에서 artifact 미작성 감지 + 보충 지시 기능 추가"
parents: ["gen-036-3a6158"]
---
# gen-037-5f3c11
validation stage에서 이전 stage artifact 미작성을 감지하고 보충 지시를 반환하는 기능을 구현했다 (GitHub Issue #13 해결).

주요 변경:
- **신규 파일 2개**: `artifact-check.ts` (core 모듈), `artifact-check.test.ts` (unit test 10개)
- **수정 파일 3개**: `validation.ts` (work phase에 artifact 검증 추가), `types/index.ts` (ReapOutput status에 `artifact-incomplete` 추가), `reap-guide.md` (보충 예외 규칙 추가)
- **총 340 tests 통과** (unit 216 + e2e 124)