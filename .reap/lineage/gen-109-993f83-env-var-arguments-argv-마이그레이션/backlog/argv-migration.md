---
type: task
status: consumed
consumedBy: gen-109-993f83
---

# env var → $ARGUMENTS argv 마이그레이션

## 현상
- 현재 slash command → script 데이터 전달이 env var 기반 (`REAP_START_GOAL`, `REAP_BACK_TARGET` 등)
- env var는 사용자에게 생소하고, slash command에서 자연스럽지 않음
- Claude Code / OpenCode 모두 `$ARGUMENTS` (argv) 지원 확인됨

## 대상

| env var | command | 대체 방식 |
|---------|---------|-----------|
| `REAP_START_GOAL` | start | `reap run start <goal>` |
| `REAP_START_BACKLOG_FILE` | start | `reap run start --backlog <file>` |
| `REAP_MERGE_TARGET_BRANCH` | merge-start, merge | `reap run merge-start <branch>` |
| `REAP_BACK_TARGET` | back | `reap run back <target-stage>` |
| `REAP_BACK_REASON` | back | `reap run back <stage> --reason <text>` |
| `REAP_BACK_REFS` | back | `reap run back <stage> --refs <a,b,c>` |
| `REAP_PULL_TARGET_BRANCH` | pull | `reap run pull <branch>` |
| `REAP_ABORT_REASON` | abort | `reap run abort --reason <text>` |
| `REAP_ABORT_SOURCE_ACTION` | abort | `reap run abort --source-action <action>` |
| `REAP_ABORT_SAVE_BACKLOG` | abort | `reap run abort --save-backlog` |

## 설계 원칙
- 단일 값: positional argument (`reap run start <goal>`)
- 옵션 값: `--flag <value>` 패턴
- slash command .md: `reap run <cmd> $ARGUMENTS`
- env var는 완전 제거 (하위 호환 불필요 — 아직 사용자 대면 전)
- 기존 테스트 모두 업데이트

## Genome 수정 (Completion 단계)
- `.reap/genome/conventions.md` line 54: `env var로 AI → script 데이터 전달` → argv 패턴으로 업데이트

## 관련 코드
- `src/cli/commands/run/start.ts`
- `src/cli/commands/run/back.ts`
- `src/cli/commands/run/abort.ts`
- `src/cli/commands/run/merge-start.ts`
- `src/cli/commands/run/merge.ts`
- `src/cli/commands/run/pull.ts`
- `src/templates/commands/reap.*.md` — `$ARGUMENTS` 추가
- `src/cli/commands/run/index.ts` — argv 파싱 유틸
