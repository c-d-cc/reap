# Objective

## Goal
v0.16.0 전환 준비 패치: v0.15.x에서 v0.16.0으로의 원활한 업그레이드를 위해 (1) selfUpgrade/forceUpgrade 후 새 바이너리로 hand-off, (2) config.yml에 lastCliVersion backfill, (3) forceUpgrade 시 breaking change 경고를 구현한다.

## Completion Criteria
1. selfUpgrade() / forceUpgrade() 성공 후 `reap update --post-upgrade` 를 execSync로 호출하여 새 바이너리에 hand-off한다. try/catch로 감싸서 실패해도 무해하다.
2. hand-off 성공 시 v0.15의 updateProject() 실행을 건너뛴다 (return).
3. config.yml backfill에 `lastCliVersion` 필드를 현재 버전으로 기록한다.
4. update 커맨드에 `--post-upgrade` 옵션을 추가한다 (새 바이너리가 호출할 진입점).
5. 기존 E2E 테스트가 깨지지 않는다.
6. version bump: v0.15.16

## Requirements

### Functional Requirements
1. **FR-1**: selfUpgrade() 성공 후 `reap update --post-upgrade`를 execSync로 호출
2. **FR-2**: forceUpgrade() 성공 후 동일하게 hand-off
3. **FR-3**: hand-off 호출은 try/catch로 감싸서 실패 시 기존 로직으로 fallback
4. **FR-4**: hand-off 성공 시 현재 프로세스의 updateProject() 실행 건너뛰기 (return)
5. **FR-5**: ConfigManager.backfill()에 lastCliVersion 필드 추가 (getCurrentVersion() 값)
6. **FR-6**: `reap update --post-upgrade` 옵션 처리 (updateProject만 실행, selfUpgrade 건너뛰기)

### Non-Functional Requirements
1. v0.16.0이 아직 배포되지 않았으므로 hand-off 경로는 반드시 실패-안전해야 함
2. 기존 update 동작에 regression 없음

## Design

### Selected Design

**hand-off 메커니즘**:
- `src/cli/index.ts`의 update 커맨드 핸들러에서 upgrade 성공 후 execSync로 `reap update --post-upgrade` 호출
- `--post-upgrade` 옵션이 있으면 selfUpgrade를 건너뛰고 updateProject + integrity check + notice만 실행
- hand-off 성공 시 현재 프로세스는 return (중복 updateProject 방지)

**lastCliVersion backfill**:
- ConfigManager.backfill()의 defaults에 lastCliVersion 추가
- 값은 getCurrentVersion()으로 설정 (매 update마다 갱신)

## Scope
- **Related Genome Areas**: CLI commands, config management
- **Expected Change Scope**: src/cli/index.ts, src/cli/commands/update.ts, src/core/config.ts
- **Exclusions**: v0.16.0 migration 코드 자체, .reap/ 구조 변경, 새 테스트 작성

## Genome Reference
- conventions.md: 커밋 형식 `feat(gen-NNN-hash): [goal]`
- constraints.md: Node.js fs/promises, 외부 서비스 의존 없음

## Backlog (Genome Modifications Discovered)
None

## Background
notes/reap-v015-pre-v016-prep.md 참조. v0.16.0은 complete rewrite 버전으로, .reap/ 구조가 완전히 바뀜. v0.15 사용자가 업그레이드 시 새 바이너리의 migration이 실행되어야 하므로, v0.15에서 미리 hand-off 메커니즘을 준비한다.
