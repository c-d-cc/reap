# REAP Project

이 프로젝트는 REAP(Recursive Evolutionary Autonomous Pipeline)를 사용합니다.
모든 작업은 genome 원칙에 따라 수행해야 합니다.

<!-- reap:start e20588a0 -->

## REAP

This project uses REAP (Recursive Evolutionary Autonomous Pipeline).
All work must follow genome principles.

### Knowledge Loading

REAP knowledge is loaded in two layers:

1. **Static knowledge** (genome, environment, vision, memory, reap-guide) is auto-loaded by Claude Code via the `@` import references below — no hook required.
2. **Dynamic context** (current generation state, strict mode, language directive) is injected by the SessionStart hook (`reap load-context`).

If dynamic context was lost (e.g. after a context compaction), re-run the hook:
```
/reap.knowledge reload
```

### Static Knowledge (auto-imported)

@~/.reap/reap-guide.md
@.reap/genome/application.md
@.reap/genome/evolution.md
@.reap/genome/invariants.md
@.reap/environment/summary.md
@.reap/vision/goals.md
@.reap/vision/memory/longterm.md
@.reap/vision/memory/midterm.md
@.reap/vision/memory/shortterm.md

### Termination Paths

Generation은 세 가지 방식으로 종료할 수 있다:
- `/reap.abort` — 실패/취소. life/ 삭제, lineage 미기록.
- `/reap.early-close` — 부분 완료. lineage에 보존(`status: partial`), 미완 task는 자동 backlog 승계. implementation/validation에서만 호출 가능.
- 정식 completion — validation 후 자연 흐름.

사용자가 "중단/포기/스코프 축소" 의도를 표명하면 agent는 위 세 선택지를 안내하고 사용자가 선택하게 한다.

### Agent

When delegating a generation to a subagent, use `subagent_type: "reap-evolve"`. Dynamic context (generation state, vision, memory) is passed via prompt parameters.
<!-- reap:end -->
