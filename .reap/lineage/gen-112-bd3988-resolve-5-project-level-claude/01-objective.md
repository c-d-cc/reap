# Objective

## Goal
resolve #5: Project-level `.claude/commands/`가 Claude Code skills list에 로드되지 않는 문제 해결. Claude Code가 `.claude/commands/`에서 `.claude/skills/`로 skill discovery를 마이그레이션했으므로, REAP 커맨드를 `.claude/skills/{name}/SKILL.md` 형식으로 설치하도록 변경한다.

## Completion Criteria
1. session-start.cjs가 `~/.reap/commands/reap.*.md`를 `.claude/skills/{name}/SKILL.md`로 복사한다
2. SKILL.md에 `name`, `description` frontmatter가 포함된다
3. 레거시 `.claude/commands/reap.*` 파일이 자동 정리된다
4. .gitignore가 `.claude/skills/reap.*`로 업데이트된다
5. update.ts의 project-level sync도 `.claude/skills/` 사용으로 변경된다
6. `bun test`, `bunx tsc --noEmit`, `npm run build` 통과

## Requirements

### Functional Requirements
1. session-start.cjs Step 0: `~/.reap/commands/reap.*.md` 파일의 frontmatter에서 `description` 파싱
2. 각 커맨드 파일을 `.claude/skills/{name}/SKILL.md`로 변환 (name = 파일명에서 .md 제거, e.g. `reap.objective`)
3. SKILL.md frontmatter에 `name`과 `description` 필드 포함
4. SKILL.md body는 원본 커맨드 파일의 body와 동일
5. 레거시 `.claude/commands/reap.*` 파일 자동 삭제
6. .gitignore 엔트리를 `.claude/commands/reap.*`에서 `.claude/skills/reap.*`로 변경
7. update.ts의 project-level sync (라인 182-210)를 `.claude/skills/` 사용으로 변경
8. 레거시 `.claude/commands/reap.*` 정리 로직 추가

### Non-Functional Requirements
1. session-start.cjs는 Node.js fs sync API만 사용 (.cjs 파일)
2. update.ts는 async/await 사용 (TypeScript)
3. 글로벌 `~/.claude/`에는 설치하지 않음 — 프로젝트 레벨만

## Design

### Approaches Considered

| Aspect | Approach A: Skills 디렉토리 | Approach B: 기존 commands 유지 |
|--------|-----------|-----------|
| Summary | `.claude/skills/{name}/SKILL.md` 형식으로 마이그레이션 | `.claude/commands/` 유지하면서 다른 방법 탐색 |
| Pros | Claude Code의 새 skill discovery와 호환 | 변경 최소화 |
| Cons | 두 파일(session-start.cjs, update.ts) 수정 필요 | Claude Code가 더이상 commands를 로드하지 않아 문제 미해결 |
| Recommendation | **선택** | 불가 |

### Selected Design
Approach A: `.claude/skills/{name}/SKILL.md` 형식으로 마이그레이션

- 커맨드 파일 `reap.objective.md` → `.claude/skills/reap.objective/SKILL.md`
- frontmatter 파싱하여 `name`(파일명 기반), `description`(원본에서 추출) 포함
- 레거시 정리 + .gitignore 업데이트 포함

### Design Approval History
- 2026-03-22: Issue #5 분석 기반으로 설계 확정

## Scope
- **Related Genome Areas**: AgentAdapter, hooks, CLI commands
- **Expected Change Scope**: `src/templates/hooks/session-start.cjs`, `src/cli/commands/update.ts`
- **Exclusions**: `~/.reap/commands/` source of truth는 변경하지 않음. init.ts는 변경 불필요 (adapter.installCommands()를 통해 `~/.reap/commands/`에 설치).

## Genome Reference
- ADR-004: AgentAdapter 추상화 + 멀티 에이전트 지원

## Backlog (Genome Modifications Discovered)
None

## Background
Claude Code가 skill discovery를 `.claude/commands/`에서 `.claude/skills/`로 마이그레이션하면서, REAP의 프로젝트 레벨 커맨드 파일이 AI 에이전트의 Skill 도구에 노출되지 않게 되었다. 이 문제를 해결하기 위해 REAP 커맨드 설치 경로를 `.claude/skills/{name}/SKILL.md` 형식으로 변경한다.

