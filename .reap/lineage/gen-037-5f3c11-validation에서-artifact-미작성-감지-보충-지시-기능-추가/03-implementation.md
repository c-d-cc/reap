# Implementation Log

## Completed Tasks

### T001 `src/core/artifact-check.ts` — 신규 모듈
- `checkArtifactsFilled(artifactPath, isMerge)` 함수 구현
- Core section placeholder(`<!-- Core section. ... -->`) 패턴으로 미작성 감지
- Optional placeholder는 의도적으로 남길 수 있으므로 무시
- normal(01~03)과 merge(01~04) 모두 지원
- 반환: `{ filled: string[], unfilled: string[] }`

### T002 `src/cli/commands/run/validation.ts` — work phase 수정
- `checkArtifactsFilled()` 호출을 work phase에 추가
- unfilled artifact가 있으면 `status: "artifact-incomplete"` 응답 반환
- 보충 prompt에 미작성 artifact 목록과 보충 안내 포함
- unfilled가 없으면 기존 validation prompt 그대로 반환
- `src/types/index.ts` — ReapOutput status에 `"artifact-incomplete"` 추가

### T003 `src/templates/reap-guide.md` — 보충 예외 규칙 추가
- "Artifact completeness check" 섹션 추가
- validation에서 미작성 감지 시 이전 stage artifact 수정 허용 명시

### T004 `tests/unit/artifact-check.test.ts` — unit test 9개
- template만 있는 경우 (3개 모두 unfilled)
- 모두 채워진 경우 (3개 모두 filled)
- 부분 채워진 경우 (1개만 core placeholder 남음 → unfilled)
- 파일 누락 시 → unfilled
- Optional placeholder만 남은 경우 → filled
- merge 타입 (unfilled / filled)
- edge case: 빈 파일 → unfilled
- isMerge 미지정 시 기본 normal

### T005 빌드 및 테스트
- typecheck 통과
- build 통과 (0.46MB)
- unit test 215개 전체 통과 (기존 206 + 신규 9)
