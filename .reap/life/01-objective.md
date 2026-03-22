# REAP MANAGED — Do not modify directly. Use reap run commands.
# Objective

## Goal
`reap init` 실행 직후 `.claude/skills/`에 sub-command가 설치되지 않는 버그 수정 (GitHub Issue #6)

## Completion Criteria
1. `reap init` 완료 직후 `.claude/skills/reap.*/SKILL.md` 파일이 생성되어야 함
2. `update.ts`와 `init.ts`의 skills sync 로직이 공통 함수로 추출되어 중복 없음
3. 기존 테스트 모두 통과 (`bun test`, `bunx tsc --noEmit`, `npm run build`)
4. 공통 함수에 대한 단위 테스트 존재

## Requirements

### Functional Requirements
1. `reap init` 실행 시 `~/.reap/commands/` 설치 후 즉시 `.claude/skills/{name}/SKILL.md`로 sync
2. frontmatter 파싱 → SKILL.md 생성 로직을 공통 함수로 추출
3. `update.ts`의 기존 skills sync 로직이 동일한 공통 함수를 호출하도록 리팩토링

### Non-Functional Requirements
1. 공통 함수는 `src/core/` 하위에 배치하여 재사용 가능하게 구성
2. 기존 동작에 대한 regression 없음

## Design

### Approaches Considered

| Aspect | Approach A: 공통 함수 추출 | Approach B: init에서 인라인 복제 |
|--------|-----------|-----------|
| Summary | skills sync 로직을 `src/core/skills.ts`로 추출, init/update 모두 호출 | init.ts에 update.ts의 로직을 복사 |
| Pros | DRY, 유지보수 용이, 테스트 용이 | 빠른 구현 |
| Cons | 파일 추가 필요 | 코드 중복, 동기화 문제 |
| Recommendation | **채택** | 비채택 |

### Selected Design
**Approach A**: `syncSkills()` 공통 함수를 `src/core/skills.ts`에 추출.
- `syncSkills(projectRoot: string, dryRun?: boolean)`: `~/.reap/commands/`에서 `reap.*.md` 파일을 읽어 frontmatter 파싱 후 `.claude/skills/{name}/SKILL.md`로 sync
- `init.ts`의 step 6 이후에 `syncSkills(projectRoot)` 호출
- `update.ts`의 step 5 (lines 182-215)를 `syncSkills()` 호출로 교체

### Design Approval History
- 초기 설계: 2026-03-22

## Scope
- **Related Genome Areas**: ADR-004 (AgentAdapter 추상화)
- **Expected Change Scope**: `src/core/skills.ts` (신규), `src/cli/commands/init.ts`, `src/cli/commands/update.ts`
- **Exclusions**: session-start hook 변경 없음, 다른 에이전트(OpenCode) skills 설치는 범위 외

## Genome Reference
- conventions.md: 파일 I/O는 `src/core/fs.ts` 유틸 사용
- constraints.md: 슬래시 커맨드 → AgentAdapter가 에이전트별 경로에 설치

## Backlog (Genome Modifications Discovered)
None

## Background
- `init.ts` line 152: `adapter.installCommands()` → `~/.reap/commands/`만 복사
- `update.ts` lines 182-215: `.claude/skills/` sync 로직 존재하나 init에서는 미호출
- session-start hook이 다음 세션에서 설치하지만, init 직후 현재 세션에서는 skills 부재
