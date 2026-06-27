## What's New

- **Evaluator Agent — validation phase** (opt-in) — set `evaluator: true` in `.reap/config.yml` to launch `reap-evaluate` as an independent reviewer during validation. Advisor model: the evaluator surfaces concerns to the user but the builder owns the lifecycle verdict. Enabled for Claude Code and OpenCode via `reap update` or `reap install-skills`.
- **Evaluator Agent — fitness phase + cruise auto-abort** — with `evaluator: true`, the evaluator also runs during the fitness phase. High-severity concerns recorded via `reap run validation --phase report-evaluator` automatically abort cruise mode, replacing the auto-fitness prompt with a supervised fallback so the user can review the concern before continuing.

## Evaluator Setup

```bash
npm install -g @c-d-cc/reap
```

Add to `.reap/config.yml`:

```yaml
evaluator: true   # default: false — enabling increases token usage
```

Then run `/reap.evolve` as normal. During validation and fitness, the builder launches `reap-evaluate` as an independent subagent (read-only, qualitative assessment). If you use cruise mode, high-severity evaluator concerns automatically pause cruise for human review.
