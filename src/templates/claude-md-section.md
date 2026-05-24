
## REAP

This project uses REAP (Recursive Evolutionary Autonomous Pipeline).
All work must follow genome principles.

### Knowledge Loading

Session-start hook automatically injects all REAP knowledge (genome, environment, vision, memory, guide) into the session context.

If context was compacted and REAP knowledge was lost, re-run the hook:
```
/reap.knowledge reload
```

### Manual Reference (fallback)

If the hook did not run, read these files manually:

- `~/.reap/reap-guide.md` — REAP tool usage, architecture, lifecycle, rules
- `.reap/genome/application.md` — Project architecture, conventions, tech stack
- `.reap/genome/evolution.md` — AI behavior guide, evolution principles
- `.reap/genome/invariants.md` — Absolute constraints (never violate)
- `.reap/environment/summary.md` — Source structure, build, tests, design decisions
- `.reap/vision/goals.md` — Project goals
- `.reap/vision/memory/longterm.md` — Project origin, key design lessons
- `.reap/vision/memory/midterm.md` — Ongoing large tasks and unresolved issues
- `.reap/vision/memory/shortterm.md` — Recent session summary and next session tasks

### Termination Paths

Generation은 세 가지 방식으로 종료할 수 있다:
- `/reap.abort` — 실패/취소. life/ 삭제, lineage 미기록.
- `/reap.early-close` — 부분 완료. lineage에 보존(`status: partial`), 미완 task는 자동 backlog 승계. implementation/validation에서만 호출 가능.
- 정식 completion — validation 후 자연 흐름.

사용자가 "중단/포기/스코프 축소" 의도를 표명하면 agent는 위 세 선택지를 안내하고 사용자가 선택하게 한다.

### Agent

When delegating a generation to a subagent, use `subagent_type: "reap-evolve"`. Dynamic context (generation state, vision, memory) is passed via prompt parameters.
