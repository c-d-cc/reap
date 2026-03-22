---
type: task
status: consumed
consumedBy: gen-146-56b321
---

# reap update-genome을 CLI subcommand에서 slash command로 변환

## 변경

- `src/cli/commands/update-genome.ts` → `src/cli/commands/run/update-genome.ts` 이동
- `src/cli/index.ts`에서 CLI subcommand 제거
- `src/cli/commands/run/index.ts`에 dispatcher 등록
- `src/templates/commands/reap.update-genome.md` 슬래시 커맨드 템플릿 추가
- `src/cli/commands/init.ts` COMMAND_NAMES에 추가
- genome constraints.md: CLI 9→8, Slash Commands +1
- docs 업데이트 (CLI 레퍼런스 → 커맨드 레퍼런스로 이동)
