# Completion

## Summary

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

## Lessons Learned

**잘 된 것**: 중단된 서브에이전트 작업을 이어받아 TypeScript 오류 3개 + 테스트 실패 4개를 루트 코즈까지 추적해 수정. 특히 `getPackageVersion()` 경로 레벨 오류(`../../` vs `../../../`)를 감지한 것이 핵심.

**개선점**: `CONFIG_DEFAULTS`에 `lastMigratedVersion: "0.0.0"` 을 넣으면 기존 프로젝트에 spurious diff가 생긴다 — optional tracking 필드는 defaults에 넣지 말 것. detection 코드의 `?? "0.0.0"` fallback으로 충분.

## Next Generation Hints

1. **Evaluator Vision/Goal 위임** — adapt phase에서 evaluator가 gap 분석 + next goal 추천. `vision/design/evaluator-agent.md` 잔여 절. midterm 트랙 마지막 항목.
2. **daemon 가이드 문서 강화** — HTTP API 직접 활용 curl 패턴, 주요 쿼리 시나리오 docs에 추가. MCP wrapper 대신 선택.
3. **3 위치 reap-guide.md 자동 sync** — marker-hash 패턴(gen-054) 적용. template 수정 시 `.reap/reap-guide.md` + `~/.reap/reap-guide.md` 자동 propagate.

## Change Proposals

- `src/templates/migration/` 디렉토리는 새 REAP 버전 릴리즈 시 해당 버전의 `v{X.Y.Z}.md`를 추가하는 관례로 관리.
