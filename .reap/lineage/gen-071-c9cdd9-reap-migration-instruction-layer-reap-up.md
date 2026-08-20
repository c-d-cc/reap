---
id: gen-071-c9cdd9
type: embryo
goal: "REAP migration instruction layer — reap update 시 버전별 migration 지시 주입"
parents: ["gen-070-828bad"]
---
# gen-071-c9cdd9
**Goal**: REAP migration instruction layer 구현 — `reap update` 시 버전별 migration 지시를 agent context에 주입하여, 업그레이드 후 agent가 기존 artifact/memory를 새 기준으로 재조직할 수 있도록 한다.

**결과**: 완전 구현. 3-layer 아키텍처 (detection / injection / mark-migrated) 모두 동작.

**주요 변경 파일**:
- `src/core/migration.ts` (신규) — `detectPendingMigrations`, `buildPendingMigrationsSection`, semver 비교, templates 경로 해석
- `src/templates/migration/v0.17.1.md` (신규) — 첫 migration note: vision memory content-type 재분류 지시
- `src/types/index.ts` — `ReapConfig.lastMigratedVersion?: string` 추가
- `src/cli/commands/update.ts` — `--mark-migrated` 플래그, `markMigratedNow`, `detectPendingMigrations` emit
- `src/cli/commands/load-context.ts` — SessionStart context에 pending migrations 절 주입 (있을 때만)
- `src/core/dump-state-sync.ts` — `.session-state.md` sync dump에 동일 섹션 반영
- `src/cli/index.ts` — `--mark-migrated` 옵션 등록
- `.reap/reap-guide.md` + `src/templates/reap-guide.md` — Migration Instruction Layer 사용법 절 추가

**테스트**: typecheck pass / build 0.77MB / unit 445-0 / e2e 249-1 (pre-existing init-repair)