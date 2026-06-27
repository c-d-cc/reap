# Shortterm Memory

## 세션 요약 (gen-071, 2026-06-28 commit)

### gen-071: REAP migration instruction layer

backlog `reap-migration-instruction-layer-...md` 구현. 서브에이전트(abd2a7ce)가 세션 한도로 implementation 중 중단, 부모 에이전트가 이어받아 수정 + 완료.

**핵심 변경**:
- `src/core/migration.ts` (신규) — `detectPendingMigrations` / `buildPendingMigrationsSection` / semver 비교 / dist-dev 경로 분기
- `src/templates/migration/v0.17.1.md` (신규) — 첫 migration note (vision memory content-type 재분류)
- `src/types/index.ts` — `ReapConfig.lastMigratedVersion?: string`
- `src/cli/commands/update.ts` — `--mark-migrated` 플래그 + `markMigratedNow` + pending list emit
- `src/cli/commands/load-context.ts` — SessionStart pending migrations 절 주입 + `getPackageVersion()` 경로 fix (`../../../` 추가)
- `src/core/dump-state-sync.ts` — session-state.md 동기화
- `.reap/reap-guide.md` + `src/templates/reap-guide.md` — Migration Instruction Layer 사용법

**수정된 버그**:
- TypeScript 3개 (unreachable code / unused import ×2)
- `getPackageVersion()`이 `load-context.ts`에서 "0.0.0" 반환 (`../../` → `../../../` 경로 fix)
- `lastMigratedVersion: "0.0.0"` in CONFIG_DEFAULTS → spurious config diff → 제거

**결과**: typecheck pass / unit 445-0 / e2e 249-1 (pre-existing)

### 다음 세션 / 다음 generation

1순위: **v0.17.1 릴리즈** — gen-070 + gen-071 묶음. push + tag 대기 중.
2순위: **Evaluator Vision/Goal 위임** (evaluator 트랙 마지막)
3순위: **daemon 가이드 문서 강화** (MCP wrapper 대신)

### 새 migration 파일 추가 관례

새 REAP 버전 릴리즈 시 `src/templates/migration/v{X.Y.Z}.md` 추가. build 스크립트가 `dist/templates/migration/`으로 복사.

### Backlog 상태

pending: 0 (gen-071 consume 완료)
