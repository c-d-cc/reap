## What's New
- `/reap.abort` 커맨드 추가 — 진행 중인 generation을 중단하고 rollback/stash/hold 선택, abort 메타를 backlog에 저장
- Lineage compression 재설계 — Level 2 epoch 싱글 파일 + hash chain으로 DAG 보존, fork guard (local + remote branch 스캔)
- `reap fix`에 genome 필수 파일 누락 검사/복구 추가 (principles, conventions, constraints, source-map)
- `reap update` 실행 시 npm 패키지 자동 업그레이드 추가
- 자동 version-bump 훅 제거 → `/reapdev.versionBump` 수동 커맨드로 전환
- `reap.start`에서 backlog consumed 마킹을 ID 생성 후로 이동 (순서 버그 수정)
- `reap.planning`에 E2E 테스트 시나리오 섹션 필수화 (lifecycle 변경 시)
- session-start 훅에서 프로젝트 커맨드 설치 시 symlink → 파일 복사로 변경

## Generations
- **gen-067-42f419**: session-start.cjs symlink → copy
- **gen-068-d71a5d**: update.ts legacy cleanup 제거
- **gen-069-3248cb**: reap update self-upgrade
- **gen-070-6dc521**: ghost reap.objective.md 조사
- **gen-071-7de266**: version-bump 훅 → reapdev.versionBump
- **gen-072-c59f0b**: reap fix genome 필수 파일 검사
- **gen-073-f3f842**: compression 재설계 (epoch hash chain + fork guard)
- **gen-074-de21ad**: reap.abort 커맨드 추가
- **gen-075-aaac1c**: reap.start consume 순서 수정 + planning E2E 필수화
