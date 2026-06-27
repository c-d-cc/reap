# Learning

## Project Overview

REAP는 generation 기반의 자가진화 개발 파이프라인이며, 현재 v0.17.1 (embryo, 70+ generations). 이번 generation은 backlog `reap-migration-instruction-layer-...` 를 consume — REAP 자체의 자기참조적(self-hosting) 진화에서 발생하는 갭을 메우는 작업.

**문제 구조**: REAP가 새 버전(예: v0.17.1)을 배포하면 reap-guide.md / genome 가이드는 갱신되지만, 기존 v0.17.0 프로젝트에서 일하던 agent는 "기존 artifact/memory를 새 기준에 맞게 재조직해야 한다"는 신호를 직접 받지 못한다. gen-070이 vision memory를 time-based → content-type-based로 재정의했지만, 다른 REAP 사용자 프로젝트는 이 변경을 모른다. migration instruction layer가 이 갭을 자동화한다.

## Source Backlog

`reap-migration-instruction-layer-reap-update-시-버전별-migration-지시-주입.md` (status: consumed by gen-071-c9cdd9, priority: high)

요약:
- `ReapConfig.lastMigratedVersion?: string` 필드 신설 → 프로젝트가 어디까지 migration됐는지 추적
- `src/templates/migration/v{version}.md` 디렉토리 신설 → 버전별 AI 행동 지시 보관
- `reap update`가 version gap 감지 → 해당 migration 지시들을 출력에 포함
- SessionStart(`load-context.ts`)에도 pending migration 주입
- `reap update --mark-migrated` 커맨드로 완료 시그널 (`lastMigratedVersion`을 현재 패키지 버전으로 갱신)
- 첫 migration file = `v0.17.1.md` (gen-070의 vision memory 재분류 지시)

## Key Findings

### 1. `ReapConfig` 확장 위치
`src/types/index.ts:88` — `ReapConfig` 인터페이스. 기존 opt-in pattern (`evaluator?: boolean`, `daemon?: boolean`) 과 동일하게 `lastMigratedVersion?: string` 추가. optional이므로 backward-compatible.

### 2. `update.ts` 구조 — backfillConfig 패턴
`src/cli/commands/update.ts`:
- `VALID_CONFIG_FIELDS` Set에 `lastMigratedVersion` 추가 필수 (안 그러면 pruning에서 삭제됨!)
- `backfillConfig()` 가 `YAML.parse → mutate → stringify` 로 동작. config.yml은 user-authored frontmatter 보존이 중요한 영역이 아니라 이 패턴 사용 중.
- migration 로직은 `getPackageVersion()` 호출 후 (`postUpgrade` 분기 이후) version gap 비교 → 출력 changes 배열에 append

### 3. `load-context.ts` / `dump-state-sync.ts` 이중성
dynamic context는 async (load-context) + sync (dump-state-sync) 두 builder가 byte-identical output을 유지해야 한다. 새 섹션 추가 시 두 곳 모두 수정. gen-068 daemon 섹션이 `buildDaemonStaticSection()` 헬퍼를 통해 sharing한 패턴 차용 → `buildPendingMigrationsSection(paths, config, currentVersion)` 헬퍼를 만들어 두 builder가 공유.

단, migration 섹션은 daemon과 달리 **gap이 있을 때만** 출력. `lastMigratedVersion` ≥ 현재 패키지 버전 → 섹션 omit.

### 4. Template path resolution — `__dirname.includes("dist")` 분기 mandatory
`src/adapters/opencode/install.ts:357` 의 `agentsTemplateDir()` 가 표준 패턴:
```ts
return __dirname.includes("dist")
  ? join(__dirname, "..", "templates", "agents")
  : join(__dirname, "..", "..", "templates", "agents");
```
migration 파일들도 같은 구조: `dist/templates/migration/` (bundle) vs `src/templates/migration/` (dev).

### 5. Build script — `cp -r src/templates dist/`
`scripts/build.sh:21` 가 `src/templates` 통째 복사. 따라서 `src/templates/migration/` 디렉토리 생성만으로 dist sync 자동.

### 6. 버전 비교 helper 존재 — semverGte
`src/cli/commands/check-version.ts` 에 `semverGte` 가 있음. update.ts에서 재사용.

### 7. dump-state 자동 트리거
`src/core/dump-state-sync.ts:14` `DUMP_COMMANDS` Set에 `update` 포함됨. 따라서 `reap update` 끝나면 `.session-state.md`가 자동으로 새 migration 섹션 반영. 추가 작업 불필요.

### 8. `update.ts` phase 매개변수 — 이미 존재
`update.ts:135` `execute(phase?: string, postUpgrade?: boolean)` 시그니처 이미 phase 받음. `--mark-migrated`는 새 phase로 추가 가능 (`reap run update --phase mark-migrated`... 아니, `reap update --mark-migrated`이 더 자연스러우니 flag로 처리).

## Previous Generation Reference

gen-070 (status: completed): vision memory 구조 재정의 + 1회성 cleanup. 본 generation의 **migration v0.17.1 파일은 gen-070의 자기-참조** — 즉 외부 REAP 사용자 프로젝트가 v0.17.0에서 v0.17.1로 올라올 때 "shortterm/midterm/longterm을 lifespan이 아니라 content-type 기준으로 재분류하라"는 지시를 받게 만드는 것이 본 generation 산출물의 첫 콘텐츠.

이 자기-참조적 dogfooding 패턴은 gen-070 longterm 교훈에 명문화: "Self-dogfooding timing is deliberate".

## Backlog Review

본 backlog 외 pending = 0. 다른 영향 없음.

## Technical Deep-Dive

### 설계 결정 (미결 질문 해소)

backlog의 4 미결 질문 해소:

1. **완료 시그널** = `reap update --mark-migrated` flag. agent가 migration 완료 후 호출. config의 `lastMigratedVersion` 을 현재 패키지 버전으로 갱신.

2. **SessionStart vs reap update 출력** = **둘 다**. `reap update` output context.pendingMigrations에 inline + load-context도 동일 섹션. idempotent — 같은 정보가 두 곳에서 보여도 무해.

3. **실패/부분 완료** = best-effort. agent가 `--mark-migrated` 호출 안 하면 다음 세션에 그대로 재주입. idempotent. 강제 차단 안 함.

4. **Migration file scope** = AI 행동 지시만. code-level 자동 변경 없음. agent 자체가 read → execute. 단순성 우선.

### 데이터 흐름

```
1. 사용자 reap update 실행
2. update.ts: backfillConfig → ensureDirectories → adapter sync
3. NEW: detectPendingMigrations(paths, currentPackageVersion):
     - read config.yml lastMigratedVersion (없으면 "0.0.0")
     - read migrationTemplatesDir() / v*.md
     - filter: lastMigratedVersion < fileVersion ≤ currentVersion
     - 정렬 (semver)
4. context.pendingMigrations = [{ version, instructions }, ...]
5. message에 pending migration count + reap update --mark-migrated 안내

load-context.ts / dump-state-sync.ts: 동일 detectPendingMigrations 호출 → # Pending Migrations 섹션 inline (gap 있을 때만)

reap update --mark-migrated:
- update.ts: markMigrated flag → backfillConfig 직후 lastMigratedVersion = currentPackageVersion → write
- emit OK message
```

### v0.17.1.md 콘텐츠 골격

```md
# v0.17.1 Migration — Vision Memory Content-Type Reorganization

## What changed
- vision memory tier 분류가 lifespan → content-type 으로 바뀜
- shortterm = session handoff / midterm = ongoing tracks / longterm = design lessons

## Required actions for AI agent
1. Read current .reap/vision/memory/{shortterm,midterm,longterm}.md
2. For each entry, apply the new decision tree (see reap-guide.md § Memory)
3. Move misclassified entries to the correct tier
4. Compress and delete entries that don't pass "still drives behavior?"
5. Once complete, run: reap update --mark-migrated

## Reference
- reap-guide.md § Memory — 3-tier structure
- .reap/genome/evolution.md § Vision 활용 원칙
```

## Context for This Generation

### Clarity Level: **HIGH**

- Backlog 명확, 설계 방향 구체적 (4 미결 question도 명확한 해소책 존재)
- 기존 패턴(opt-in flag, dist/dev path 분기, async/sync builder pair, daemon 섹션 helper sharing) 모두 차용 가능
- 첫 사용 콘텐츠 (v0.17.1 = gen-070 dogfooding) 명확

### 자가-참조 강점

본 generation 자체가 dogfooding. migration v0.17.1.md를 만들면서 본인 프로젝트의 `lastMigratedVersion`을 v0.17.1로 mark 하는 self-test 가능 → e2e 외 또 하나의 검증 layer.

### Scope 경계

- **포함**: `lastMigratedVersion` 필드 / migration 디렉토리 + v0.17.1.md / update.ts gap detection + --mark-migrated / load-context.ts + dump-state-sync.ts pending-migrations 섹션 / unit + e2e 테스트 / reap-guide.md 4 위치 sync
- **제외**: 사용자 프로젝트에 migration 파일 push (npm install로 자동) / code-level migration 자동화 (별도 트랙)
