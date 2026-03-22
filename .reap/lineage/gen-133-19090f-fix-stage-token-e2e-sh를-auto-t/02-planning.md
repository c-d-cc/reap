# Planning

## Summary
stage-token-e2e.sh를 auto-transition 흐름에 맞게 재작성.

## Tasks
1. `reap run next <nonce>` 호출 제거, `--phase complete` 후 stage 자동 전환 검증으로 대체
2. phase nonce 검증 테스트 추가 (work 스킵 시 실패)
3. `reap run next` fallback 테스트 추가 (lastNonce 자동 읽기)
4. 전체 lifecycle chain 테스트 (objective → completion)
5. setup_project helper 추가로 코드 중복 제거
6. OpenShell sandbox에서 E2E 실행 및 전체 통과 확인

## Dependencies
- reap v0.14.0+ (auto-transition 지원)
