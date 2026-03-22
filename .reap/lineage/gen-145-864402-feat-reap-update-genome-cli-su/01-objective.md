# Objective

## Goal

`reap update-genome` CLI subcommand 추가 — generation 없이 pending genome-change backlog를 `.reap/genome/`에 적용하는 CLI 명령어.

## Completion Criteria

1. `reap update-genome` 실행 시 active generation이 있으면 에러 출력 후 종료
2. pending `type: genome-change` backlog가 없으면 "no pending genome changes" 메시지 출력 후 종료
3. pending genome-change backlog가 있으면 JSON stdout으로 목록+내용을 AI에게 prompt 전달
4. AI가 genome 수정 후 `reap update-genome --apply` 호출 시 backlog consumed 마킹 (`consumedBy: "update-genome"`)
5. `--apply` 시 config.yml의 genomeVersion 증가
6. `reap update-genome --apply` 완료 후 JSON stdout으로 commit 지시 출력
7. genome-change backlog `genome-integrity-checker.md`가 completion 단계에서 적용됨

## Requirements

### Functional Requirements

1. **FR-01**: `src/cli/commands/update-genome.ts` 신규 파일 생성
2. **FR-02**: `src/cli/index.ts`에 `program.command("update-genome")` 등록
3. **FR-03**: active generation gate — `GenerationManager.current()` null 확인, 아니면 에러
4. **FR-04**: `scanBacklog()`로 pending genome-change backlog 필터링
5. **FR-05**: 2-phase flow: phase 1(scan+prompt) → AI 수정 → phase 2(`--apply`: consumed+version bump)
6. **FR-06**: `--apply` 시 `markBacklogConsumed()` 호출 (consumedBy: `"update-genome"`)
7. **FR-07**: `--apply` 시 `ConfigManager`로 genomeVersion 증가
8. **FR-08**: JSON stdout은 `emitOutput()` 패턴 사용 (`src/core/run-output.ts`)

### Non-Functional Requirements

1. **NFR-01**: 기존 코어 유틸 재사용 (scanBacklog, markBacklogConsumed, ConfigManager, emitOutput)
2. **NFR-02**: Node.js >=18 호환 (Bun API 미사용)

## Design

### Approaches Considered

| Aspect | Approach A: CLI subcommand | Approach B: run command |
|--------|---------------------------|------------------------|
| Summary | `reap update-genome` 독립 CLI subcommand | `reap run update-genome` script dispatcher 경유 |
| Pros | 직관적 명령, slash command 불필요 | 기존 run 패턴과 일관성 |
| Cons | index.ts에 새 command 등록 필요 | slash command도 필요, 과도한 인프라 |
| Recommendation | **선택** — generation 밖에서 실행하므로 run 패턴 부적합 | - |

### Selected Design

CLI subcommand 방식. `reap update-genome` (phase 1: scan) → `reap update-genome --apply` (phase 2: finalize).
- Phase 1: gate check → scan → JSON prompt 출력 (emitOutput)
- Phase 2: `--apply` flag → consumed 마킹 → genomeVersion 증가 → done JSON 출력

### Design Approval History

- 2026-03-23: task details에서 설계 확정됨 (subagent instructions)

## Scope
- **Related Genome Areas**: constraints.md (CLI Subcommands), source-map.md (CLI Commands)
- **Expected Change Scope**: 신규 1파일 (`update-genome.ts`), 수정 1파일 (`index.ts`)
- **Exclusions**: slash command 추가 없음, run command 추가 없음

## Genome Reference

- conventions.md: Script Orchestrator Pattern (emitOutput, 2-phase)
- constraints.md: CLI Subcommands 목록 (update-genome 추가 필요 — completion에서)
- source-map.md: CLI Commands 테이블 (update-genome 추가 필요 — completion에서)

## Backlog (Genome Modifications Discovered)
None (기존 genome-integrity-checker.md backlog는 completion에서 적용 예정)

## Background

task backlog `genome-apply-command.md`에서 요구사항이 정의됨. generation 공백기에 genome-change backlog를 적용하는 전용 CLI subcommand.
