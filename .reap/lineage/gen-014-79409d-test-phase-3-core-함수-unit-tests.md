---
id: gen-014-79409d
type: embryo
goal: "Test Phase 3: core 함수 unit tests"
parents: ["gen-013-d38c9a"]
---
# gen-014-79409d
core 모듈 5개(backlog, nonce, generation, archive, compression)에 대한 unit test 43개를 작성했다. 기존 lifecycle 12개와 합쳐 총 55개 unit test가 모두 통과.

### Changes
- tests/unit/backlog.test.ts: 22 tests (toKebabCase, createBacklog, scanBacklog, consumeBacklog)
- tests/unit/nonce.test.ts: 7 tests (generateToken, verifyToken)
- tests/unit/generation.test.ts: 7 tests (GenerationManager create/save/current/countLineage)
- tests/unit/archive.test.ts: 5 tests (archiveGeneration — artifact, backlog 분리, life 정리)
- tests/unit/compression.test.ts: 5 tests (compressLineage — threshold, 압축, recent 보호)

### Validation: PASS (typecheck, build, unit 55/55, e2e 9/9)