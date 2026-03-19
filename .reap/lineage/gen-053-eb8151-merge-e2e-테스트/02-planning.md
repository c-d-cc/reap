# Planning

## Summary

OpenShell sandbox에서 Claude Code로 전체 merge workflow를 자동 실행하는 E2E 테스트 스크립트를 작성한다.

## Tasks

### T1: tests/e2e/merge-e2e.sh 작성
- 환경 체크 (node, npm, claude, reap)
- test project 생성 (mkdir + reap init + 간단한 TS 프로젝트 scaffolding)
- Step 1: main에서 claude -p로 gen-001 (common ancestor) 완료
- Step 2: branch-a, branch-b worktree 생성
- Step 3: branch-a에서 claude -p로 gen-002-a 완료
- Step 4: branch-b에서 claude -p로 gen-002-b 완료
- Step 5: branch-a에서 claude -p로 /reap.pull branch-b 실행
- Step 6: 결과 검증 (lineage, meta.yml, type:merge, parents)
- cleanup

### T2: tsc, bun test, build 검증 (기존 테스트 깨지지 않는지)

## Dependencies
```
T1 → T2
```
