# Planning

## Goal

validation stage에서 이전 stage artifact(01~03)의 내용이 template placeholder만 남아있는지 검증하고, 미작성 감지 시 subagent에게 명시적 보충 지시를 포함한 prompt를 반환한다.

## Completion Criteria

1. `checkArtifactsFilled()` 함수가 template placeholder 비율로 미작성 artifact를 정확히 감지한다
2. validation work phase에서 unfilled artifact가 있으면 `status: "artifact-incomplete"` 응답을 반환한다
3. unfilled artifact가 없으면 기존 validation prompt를 그대로 반환한다
4. 보충 지시 prompt에 미작성 artifact 목록과 보충 작업 안내가 포함된다
5. reap-guide.md에 validation 보충 예외 규칙이 추가된다
6. unit test: checkArtifactsFilled 함수 (template만, 채워진, 부분 채워진 케이스)
7. 빌드 및 기존 테스트 통과

## Approach

### artifact 미작성 감지 기준
- template의 `<!-- Core section. ... -->` placeholder 패턴을 카운트
- Core section placeholder가 하나라도 남아있으면 unfilled로 판정
- Optional section placeholder(`<!-- Optional — ... -->`)는 의도적으로 남길 수 있으므로 무시

### validation work phase 흐름 변경
```
기존: nonce 검증 → template 복사 → prompt 반환
변경: nonce 검증 → template 복사 → artifact 검증 → (unfilled 시 보충 prompt / filled 시 기존 prompt)
```

### 검증 대상
- normal: 01-learning.md, 02-planning.md, 03-implementation.md (validation 이전 3개)
- merge: 01-detect.md ~ 04-reconcile.md (validation 이전 4개)

## Tasks

- [ ] T001 `src/core/artifact-check.ts` — 신규 모듈 생성. `checkArtifactsFilled(lifePath, stages, isMerge)` 함수 구현
- [ ] T002 `src/cli/commands/run/validation.ts` — work phase에서 `checkArtifactsFilled()` 호출, unfilled 시 보충 prompt 반환
- [ ] T003 `src/templates/reap-guide.md` — validation 보충 예외 규칙 추가
- [ ] T004 `tests/unit/artifact-check.test.ts` — unit test 작성 (template만, 채워진, 부분 채워진, merge 타입)
- [ ] T005 빌드 및 기존 테스트 통과 확인

## Dependencies

- T002 depends on T001
- T004 depends on T001
- T005 depends on T001, T002, T003
