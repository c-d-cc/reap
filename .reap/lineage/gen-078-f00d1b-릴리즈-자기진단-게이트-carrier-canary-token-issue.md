---
id: gen-078-f00d1b
type: embryo
goal: "릴리즈 자기진단 게이트 + carrier canary token — issue 21/22 재발 방지"
parents: ["gen-077-39d3c7"]
---
# gen-078-f00d1b
**Goal**: issue #21/#22 가 같은 유형으로 반복된 것에 대한 구조적 대책. 0.17.3 묶음 2/3.

**결과**: 두 축 모두 완료.

| 축 | 산출물 |
|---|---|
| 자기진단 게이트 | `scripts/check-self-diagnosis.sh` + release·CI 양쪽 연결 |
| carrier canary token | `scripts/list-carriers.sh` + 표식 2 carrier(19 files) + guide 문서화 |

**부수 수정**: `integrity.ts` placeholder 판정 — 배포되는 `invariants.md` 가 자기 검사를 통과 못 하던 문제

**검증**: typecheck 0 / 자기진단 pass / docs gate pass / 고아 0 / unit 470-0 / e2e 272-0 / scenario 44-0