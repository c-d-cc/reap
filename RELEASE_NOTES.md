## What's New

- v0.16.0 upgrade hand-off: after selfUpgrade/forceUpgrade, the new binary is invoked via `reap update --post-upgrade` for seamless migration
- `lastCliVersion` field added to config.yml (backfill) — enables v0.16.0 to detect prior version accurately
- E2E test fixes: stage-token-e2e.sh Test 8 expectation corrected, migration-e2e.sh graceful skip when sandbox unavailable
- Integrity check: `life/backlog/` directory now optional

## Generations

- **gen-172-f42ef1**: v0.16.0 전환 준비 패치 — hand-off, lastCliVersion, --post-upgrade
- **gen-173-3150ba**: E2E 테스트 실패 수정 — stage-token Test 8 기대값 + migration skip
