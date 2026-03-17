# Objective

## Goal
프로젝트별 commands/templates 복사를 제거하고, user-level 설치(`~/.claude/commands/`)로 전환한다. consumer 프로젝트의 `.reap/`에는 프로젝트 산출물(genome, life, lineage, environment)만 존재하도록 한다.

## Completion Criteria
- [ ] `reap init` 시 `.reap/commands/`, `.reap/templates/`, `.reap/hooks/`, `.claude/commands/`, `.claude/hooks.json` 복사 제거
- [ ] `reap init` 시 `~/.claude/commands/`에 slash commands 설치
- [ ] `reap init` 시 `~/.claude/hooks.json`에 SessionStart hook 등록
- [ ] `reap update` 시 `~/.claude/commands/` + `~/.claude/hooks.json` 대상으로 동기화
- [ ] hook 스크립트가 패키지 내부 경로에서 직접 실행 (프로젝트 `.reap/hooks/` 불필요)
- [ ] artifact 생성 시 template을 패키지 내부(`src/templates/artifacts/`)에서 직접 참조
- [ ] `~/.bun/bin/bun test` 전체 통과
- [ ] `~/.bun/bin/bunx tsc --noEmit` 통과

## Requirements

### Functional Requirements
- **FR-001**: `reap init` — commands를 `~/.claude/commands/`에 설치, 프로젝트에 복사하지 않음
- **FR-002**: `reap init` — `.reap/templates/` 생성하지 않음, artifact template은 패키지 내부에서 직접 참조
- **FR-003**: `reap update` — `~/.claude/commands/` 대상으로 동기화, `.reap/commands/` 및 `.claude/commands/` 동기화 제거
- **FR-004**: `paths.ts` — `.reap/commands/`, `.reap/templates/`, `.reap/hooks/`, `.claude/commands/`, `.claude/hooks.json` 경로 제거
- **FR-005**: `generation.ts` — artifact 생성 시 template 경로를 패키지 내부로 변경
- **FR-006**: `hooks.ts` — hook 등록/실행을 user-level `~/.claude/hooks.json`으로 변경, hook 스크립트는 패키지 내부에서 직접 실행
- **FR-007**: 기존 프로젝트 호환 — `reap update` 실행 시 프로젝트 내 `.reap/commands/`, `.reap/templates/`, `.reap/hooks/`, `.claude/commands/reap.*`, `.claude/hooks.json` 내 프로젝트 레벨 hook 잔여 파일 정리

### Non-Functional Requirements
- 기존 테스트 전부 통과

## Scope
- **Related Genome Areas**: conventions.md (Template Conventions 섹션), constraints.md (템플릿 복사 제약)
- **Expected Change Scope**: `src/core/paths.ts`, `src/cli/commands/init.ts`, `src/cli/commands/update.ts`, `src/core/generation.ts`, `src/core/hooks.ts`, `src/templates/hooks/session-start.sh`, tests
- **Exclusions**: genome 템플릿 초기 복사(init 시 `.reap/genome/`)는 유지

## Genome Reference
- `conventions.md` Template Conventions: "슬래시 커맨드: init 시 `.reap/commands/` + `.claude/commands/`로 복사" → 변경 대상
- `constraints.md`: "템플릿 원본은 `src/templates/`에만 존재, 런타임에 복사" → 복사 대상 축소

## Backlog (Genome Modifications Discovered)
- conventions.md Template Conventions 섹션 업데이트 필요 (commands/templates 복사 → user-level 설치로 변경)
- constraints.md "런타임에 복사" 제약 수정 필요

## Background
- selfview 프로젝트에서 `.reap/commands/`, `.reap/templates/`, `.claude/commands/`가 프로젝트마다 중복 존재하는 문제 발견
- commands는 reap 라이브러리 코드이지 프로젝트 산출물이 아님
- 사용자가 머신에 reap을 설치하면 user-level `~/.claude/commands/`에서 관리하는 것이 자연스러움
