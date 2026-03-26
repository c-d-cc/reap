# Planning — gen-032-4baaef

## Goal

`reap destroy`와 `reap clean` 두 CLI 명령을 구현하여 v0.15 패리티를 달성한다.

- `reap destroy` — 프로젝트에서 REAP을 완전 제거
- `reap clean` — REAP 프로젝트 상태를 선택적으로 초기화

## Completion Criteria

1. `reap destroy --confirm` 실행 시 `.reap/`, CLAUDE.md REAP 섹션, `.gitignore` REAP 항목이 모두 제거된다
2. `reap destroy` (확인 없이) 실행 시 JSON prompt가 반환된다
3. `reap clean --lineage delete` 실행 시 lineage 디렉토리가 비워진다
4. `reap clean --lineage compress` 실행 시 epoch 파일로 압축된다
5. `reap clean --life` 실행 시 current.yml과 artifact 파일이 삭제된다 (backlog는 보존)
6. `reap clean --backlog` 실행 시 backlog 디렉토리가 비워진다
7. `reap clean --hooks reset` 실행 시 hooks 디렉토리가 초기화된다
8. genome/environment/vision은 clean에서 절대 건드리지 않는다
9. 모든 출력은 JSON (`ReapOutput`) 형식이다
10. e2e 테스트가 각 명령에 대해 존재하고 통과한다

## Approach

v0.16의 기존 패턴(fix.ts)을 따라 비즈니스 로직 + `execute()` 분리 구조로 구현한다. v0.15 코드를 참조하되, v0.16 API(createPaths, readTextFile 등)에 맞게 재작성한다.

### destroy 설계
- `--confirm` 없으면 `status: "prompt"` 반환 (프로젝트명 포함)
- `--confirm` 있으면 실행: .reap/ 삭제 → CLAUDE.md 정리 → .gitignore 정리
- 결과를 `{ removed, skipped }` 배열로 보고

### clean 설계
- 옵션 없으면 `status: "prompt"` 반환 (사용 가능한 옵션 안내)
- 옵션별 독립 실행 (여러 옵션 동시 지정 가능)
- `--lineage <compress|delete>`, `--life`, `--backlog`, `--hooks <reset>`
- 결과를 `{ actions }` 배열로 보고

## Scope

### 추가 파일
- `src/cli/commands/destroy.ts` — destroy 명령 구현
- `src/cli/commands/clean.ts` — clean 명령 구현
- `tests/e2e/destroy.test.ts` — destroy e2e 테스트
- `tests/e2e/clean.test.ts` — clean e2e 테스트

### 수정 파일
- `src/cli/index.ts` — 두 명령 등록

## Tasks

- [ ] T001 `src/cli/commands/destroy.ts` — destroy 명령 구현 (destroyProject 로직 + execute CLI entry)
- [ ] T002 `src/cli/commands/clean.ts` — clean 명령 구현 (cleanProject 로직 + execute CLI entry)
- [ ] T003 `src/cli/index.ts` — destroy, clean 명령 등록
- [ ] T004 `npm run build` — 빌드 확인
- [ ] T005 `tests/e2e/destroy.test.ts` — destroy e2e 테스트 (confirm prompt, 실행 결과, CLAUDE.md 정리, .gitignore 정리)
- [ ] T006 `tests/e2e/clean.test.ts` — clean e2e 테스트 (lineage compress/delete, life 정리, backlog 삭제, hooks reset, 옵션 없이 prompt)
- [ ] T007 전체 테스트 실행 (`bun test tests/`) — 기존 테스트 깨지지 않는지 확인

## Dependencies

T001, T002 → T003 → T004 → T005, T006 → T007
