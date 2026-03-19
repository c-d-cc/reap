# Planning

## Summary
Git worktree로 multi-branch 병렬 generation을 시뮬레이션하고 DAG 정합성을 검증하는 E2E 테스트 추가.

## Technical Context
- **Tech Stack**: Bash, git worktree, sha256sum, reap CLI
- **Constraints**: OpenShell sandbox 내에서 실행 필수

## Tasks
1. worktree-dag-e2e.sh 작성 (sandbox 환경 체크 + worktree DAG 검증)
2. migration-e2e.sh 환경 체크 통일 (openshell → sandbox 내부 도구 체크)
3. sandbox에서 테스트 실행

## Dependencies
Task 1 → Task 3
