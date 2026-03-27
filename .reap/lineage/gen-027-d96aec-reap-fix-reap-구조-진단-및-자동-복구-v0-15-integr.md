---
id: gen-027-d96aec
type: embryo
goal: "reap fix — .reap/ 구조 진단 및 자동 복구 (v0.15 integrity.ts 포팅)"
parents: ["gen-026-4e8861"]
---
# gen-027-d96aec
`reap fix` CLI 명령 구현 완료. v0.15의 integrity.ts를 v16 구조에 맞게 포팅.

### Changes
- `src/core/integrity.ts` — 신규. checkIntegrity(), checkUserLevelArtifacts() 구현 (~350줄)
- `src/cli/commands/fix.ts` — 신규. checkProject(), fixProject(), execute() 구현 (~145줄)
- `src/cli/index.ts` — `reap fix` 명령 등록 (import + command 정의)
- `tests/unit/integrity.test.ts` — 신규. 22개 단위 테스트
- `tests/e2e/fix.test.ts` — 신규. 6개 E2E 테스트

### Test Results
- 232 tests 전체 통과 (unit 148 + e2e 84)