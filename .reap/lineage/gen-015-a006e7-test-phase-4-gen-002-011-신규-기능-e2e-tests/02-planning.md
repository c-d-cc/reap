# Planning — gen-015-a006e7

## Goal
gen-002~011에서 추가된 7개 기능에 대한 e2e 테스트를 작성하여 CLI 통합 수준의 정상 동작을 검증한다.

## Completion Criteria
1. `test-init-claude-md.sh` — 3 시나리오 (empty dir, existing project no CLAUDE.md, existing CLAUDE.md) 모두 PASS
2. `test-make-backlog.sh` — backlog 생성 + frontmatter (type, status, priority, createdAt) 검증 PASS
3. `test-backlog-consume.sh` — start --backlog 후 consumed 상태 + consumedBy + consumedAt + sourceBacklog 검증 PASS
4. `test-archive-backlog.sh` — lifecycle 완료 후 lineage에 consumed만, life/backlog에 pending만 남는지 검증 PASS
5. `test-cli-commands.sh` — reap status, reap make backlog, reap cruise 등 주요 CLI 커맨드 에러 없이 실행 PASS
6. 기존 `test-init-basic.sh` 깨지지 않음
7. `tests/e2e/run.sh` 전체 실행 시 ALL E2E TESTS PASSED

## Scope
- 생성: `tests/e2e/test-init-claude-md.sh`, `test-make-backlog.sh`, `test-backlog-consume.sh`, `test-archive-backlog.sh`, `test-cli-commands.sh`
- 수정: 없음 (기존 파일 변경 불필요)
- Out of scope: unit test, src/ 코드 수정, archive full lifecycle (completion까지의 e2e는 복잡도가 높아 simplified 검증)

## Tasks
- [ ] T001 `tests/e2e/test-init-claude-md.sh` — CLAUDE.md 생성/append 3가지 시나리오 테스트
  - Scenario A: empty dir init → CLAUDE.md 생성 + `.reap/genome/` 참조 포함
  - Scenario B: 기존 프로젝트 (CLAUDE.md 없음) init → CLAUDE.md 생성
  - Scenario C: 기존 프로젝트 (CLAUDE.md 있음) init → REAP section append + 원본 보존
  - 추가: evolution.md에 "Clarity-driven" 텍스트 포함 검증
- [ ] T002 `tests/e2e/test-make-backlog.sh` — reap make backlog CLI 테스트
  - `reap make backlog --type task --title "test backlog"` → 파일 생성 확인
  - frontmatter: type=task, status=pending, priority=medium, createdAt 존재
  - invalid type 시 에러 반환
- [ ] T003 `tests/e2e/test-backlog-consume.sh` — --backlog consume 흐름 테스트
  - init → make backlog → start --backlog → consumed 상태 검증
  - consumedBy = gen ID, consumedAt = ISO timestamp
  - current.yml에 sourceBacklog 필드 존재
- [ ] T004 `tests/e2e/test-archive-backlog.sh` — archive 시 consumed/pending 분리 테스트
  - init → backlog 2개 생성 → start --backlog (1개 consume) → lifecycle stages 진행 → completion commit
  - lineage에 consumed backlog만 존재, life/backlog에 pending만 남음
- [ ] T005 `tests/e2e/test-cli-commands.sh` — CLI 커맨드 기본 동작 테스트
  - reap status (init 전 에러, init 후 정상)
  - reap make backlog --type task --title "x" (정상)
  - reap cruise 1 (정상)
  - reap --version (정상)
- [ ] T006 전체 e2e 실행 + tests/ submodule 커밋

## Dependencies
- T001~T005: 독립적, 병렬 구현 가능
- T006: T001~T005 완료 후 실행
- 모든 테스트는 `npm run build` 후 실행 (run.sh에서 처리)
