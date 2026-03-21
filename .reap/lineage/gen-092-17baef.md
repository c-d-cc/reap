---
id: gen-092-17baef
type: normal
parents:
  - gen-091-3fe671
goal: "Merge command 10개 Script Orchestrator 전환"
genomeHash: b726c9bf
startedAt: "2026-03-21T07:55:00.000Z"
completedAt: "2026-03-21T08:10:00.000Z"
---

# gen-092-17baef: Merge command 10개 Script Orchestrator 전환

## 결과
- merge-start, merge-detect, merge-mate, merge-merge, merge-sync, merge-validation, merge-completion, merge-evolve, merge(dispatcher), pull — 10개 command 전환
- 28개 slash command 전부 Script Orchestrator 패턴 전환 완료
- `backlog.ts`: consumed 마킹 시 legacy `consumed` 필드 제거
- 286 tests / 0 fail

## 주요 변경
- 신규: `src/cli/commands/run/{merge-start,merge-detect,merge-mate,merge-merge,merge-sync,merge-validation,merge-completion,merge-evolve,merge,pull}.ts`
- 10개 `.md` 파일 1줄 wrapper 전환
- dispatcher: 총 26개 command 등록
