# Objective

## Goal
`reap update-genome` CLI subcommand를 slash command (`reap run update-genome`)로 변환한다.

## Completion Criteria
1. `reap update-genome` CLI subcommand가 제거됨
2. `reap run update-genome` (scan phase)이 정상 동작
3. `reap run update-genome --phase apply`가 정상 동작
4. slash command 템플릿 `reap.update-genome.md`가 존재
5. COMMAND_NAMES에 `reap.update-genome` 등록
6. genome (constraints.md, source-map.md) 업데이트
7. docs 업데이트 (CLIPage, translations)
8. 빌드 + 타입체크 통과

## Requirements

### Functional Requirements
1. `src/cli/commands/update-genome.ts` → `src/cli/commands/run/update-genome.ts`로 이동 및 `execute(paths, phase, argv)` 시그니처 적용
2. `src/cli/index.ts`에서 `program.command("update-genome")` 블록 및 import 제거
3. `src/cli/commands/run/index.ts`에 `"update-genome"` 등록
4. `src/templates/commands/reap.update-genome.md` 슬래시 커맨드 템플릿 생성
5. `src/cli/commands/init.ts`의 COMMAND_NAMES에 `"reap.update-genome"` 추가
6. genome 파일 업데이트: CLI subcommands 수 9→8, slash commands 수 +1
7. docs 업데이트: CLIPage에서 update-genome 섹션 제거, translations 수정

### Non-Functional Requirements
1. 기존 2-phase (scan/apply) 동작 로직 보존
2. 기존 emitOutput/emitError 패턴 유지

## Design

### Approaches Considered

| Aspect | Approach A (단순 이동) |
|--------|-----------|
| Summary | 기존 코드를 run command 패턴으로 변환하여 이동 |
| Pros | 최소 변경, 기존 로직 보존 |
| Cons | 없음 |
| Recommendation | 채택 |

### Selected Design
기존 `updateGenome(cwd, apply)` 함수를 `execute(paths, phase, argv)` 시그니처로 변환. phase 없음/"scan" → scan, phase "apply" → apply.

### Design Approval History
- 태스크 명세에서 사전 승인됨

## Scope
- **Related Genome Areas**: constraints.md (CLI subcommands, slash commands), source-map.md (CLI Commands)
- **Expected Change Scope**: 7개 파일 수정/이동, 1개 파일 신규, docs 4개 파일
- **Exclusions**: 코어 로직 변경 없음

## Genome Reference
- constraints.md: CLI Subcommands 9개, Slash Commands Normal 18개
- source-map.md: CLI Commands 테이블

## Backlog (Genome Modifications Discovered)
None

## Background
이전 세대(gen-145)에서 update-genome을 CLI subcommand로 구현했으나, 다른 명령어들과의 일관성을 위해 slash command 패턴으로 변환이 필요.
