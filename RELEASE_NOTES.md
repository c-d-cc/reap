## What's New

- Session-start hook now shows release notes after auto-update
- Breaking change blocked message improved with user-friendly guidance (`⚠️ Run /reap.update to upgrade manually`)
- v0.16.0 upgrade hand-off: new binary invoked via `reap update --post-upgrade` after self-upgrade
- `lastCliVersion` field added to config.yml backfill
- E2E test fixes: stage-token Test 8 expectation corrected, migration-e2e graceful skip

## Generations

- **gen-172-f42ef1**: v0.16.0 전환 준비 패치 — hand-off, lastCliVersion, --post-upgrade
- **gen-173-3150ba**: E2E 테스트 실패 수정 — stage-token Test 8 기대값 + migration skip
- **gen-174-c395a2**: auto-update release notice 표시 + breaking change 안내 강화
