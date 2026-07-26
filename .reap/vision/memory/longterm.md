# Longterm Memory

> Design lessons that prevent future generations from repeating mistakes. If a lesson is already in genome (application.md / evolution.md), it does not belong here. Bloat = pruning was skipped.

## Architecture Patterns

- **CLI-driven flow, minimal slash commands**: a single slash command + CLI emits "what to do next" on stdout (ping-pong). Avoid per-stage slash commands.
- **Static template + dynamic context**: agent definitions (`reap-evolve.md` etc.) are static — role/mindset/behavior only. Dynamic generation state goes through `buildBasePrompt()`.
- **Adapter dispatcher + client-native mechanism**: `getAdapter(agentClient)` returns an AdapterModule. Each client uses its native auto-load (`@` import for Claude Code, `instructions` for OpenCode). Mechanism differs per client; data-format may be single-source.
- **Single source when format matches**: if two adapters accept the same file format (e.g. Claude Code skills + OpenCode slash commands), keep ONE source dir. Split only when client-specific frontmatter is needed.
- **Template = single source of truth (marker-hash sync)**: `<!-- reap:start {hash} -->...<!-- reap:end -->` block in user-touchable files lets a template-only edit propagate to all installs automatically.
- **Termination paths live outside the transition graph**: abort / early-close are explicit `state.stage` guards, not graph edges. New escape paths copy abort.ts/early-close.ts pattern.
- **Nonce-graph external CLI = state side-channel**: append-only state writes (e.g. `report-evaluator`) bypass nonce graph and use plain state appends. Don't pollute the graph.
- **Opt-in integration pattern**: config flag (e.g. `daemon?: boolean`) → caller-side gate + dynamic import → silent-fail inside the function. Three layers guarantee zero regression for users who don't opt in.
- **Destructive-action safety belongs in structure, not flags**: to guarantee a check never deletes user data, put it only in the read-only path (`checkIntegrity`) and add nothing to the mutating one (`fixProject`). A conditional saying "don't delete" can be flipped later; an absent code path cannot.
- **A rule the agent must follow lives in the phase prompt, not only in the guide**: guides load early and compete with everything else in context; the phase prompt is read at the moment of action. Every behavioral rule needs a carrier at the point of use.

## Design Heuristics

- **Memory needs rules, not freedom alone**: "free to write whatever" produced inaction. Decision tree + reflect-phase mandatory cleanup = actual usage.
- **Design docs survive abort and anchor future generations**: when aborting, consciously decide whether to preserve the `vision/design/<topic>.md`. If preserved, an aborted track can resume cleanly many generations later.
- **Append-only state is simplest when entries are write-once**: skip resolve/dismiss CLI until cross-generation carry-over actually needs it. Premature optimization is real.
- **Pre-built hooks in stage N reduce planning cost in stage N+1**: when you build a branch you only partially use (e.g. `stage: "validation" | "fitness"` union), the future generation that activates the other branch pays near-zero planning cost. Use only when intent is clear — otherwise dead code.
- **Self-dogfooding timing is deliberate**: activate a new opt-in flag at the lifecycle stage where the same generation will be its first user (e.g. enable `evaluator: true` at end of implementation so validation is first user).

## Anti-patterns

- **"Bias analysis" framing is wrong**: work concentrating in one area is natural flow, not a problem. Don't measure or auto-correct.
- **Subagent calls as lifecycle gates**: an environment may lack Agent (Task) tool. Always advisor + fallback, never gate.
- **Cross-asset path helpers without dist/dev branching**: `__dirname.includes("dist") ? ... : ...` is mandatory for any helper resolving sibling assets. Check existing helpers in the same file first.
- **`YAML.parse → mutate → stringify` for user-authored frontmatter**: round-trip loses comments, key order, quote style, numeric inference. Use YAML.parse for *analysis only*; write with line-level manipulation.

## Process Heuristics

- **Read actual callers before deciding behavior**: `grep -rn "fnName"` first. Abstract reasoning about "when is this called" is unreliable.
- **Verify framework semantics with a minimal repro**: CLI option parsing, library edge cases — don't trust convention guesses. `/tmp/test-cli.ts` repro takes a minute and prevents a regression.
- **Causally coupled fixes go in the same generation**: if fix A without fix B makes intermediate generations repeat the same incident, ship them together. Split = new gap.
- **Discovered fix scope (verification infra generations)**: if the verification-target's bug prevents the new test from carrying signal, fix it in this generation (workaround-prohibited principle applied to test infra).
- **Test isolation needs port + path axes**: external tools that bind ports AND write files require env-overridable port + HOME override. Either axis alone leaks into user environment.
- **macOS path comparison needs `realpath()`**: `/var/folders` vs `/private/var/folders` symlink causes silent fixture-mismatch failures.
- **Pre-fitness self-audit checklist**: (1) does each backlog verification scenario have a 1:1 e2e mirror? (2) are all callers of changed functions verified? (3) does the e2e reproduce the user's exact command sequence?
- **Fitness signal includes user code review, not just e2e**: the user reading code directly catches gaps that abstract reasoning misses. Fitness phase has value beyond "did tests pass".
- **User UX entry-point checklist for new clients/integrations**: (1) static knowledge auto-load, (2) dynamic state refresh trigger, (3) entry-point file, (4) **native UI trigger (slash commands / shortcuts)**. (4) is the most-forgotten — explicitly verify.
- **Disk-multi-file functions → e2e, not unit**: if a function takes a `paths` injection and reads >1 file, mock cost exceeds e2e cost. Plan testing level by file count.
- **Debug stash needs causal matching first**: before `git stash`, list changed files + match against failure cause via `git log`. Stash only when matching is ambiguous.
- **A test suite without a recorded baseline cannot be judged**: when a suite fails, "pre-existing or new regression?" is undecidable unless the last-known counts are written down. Record every suite's pass/fail in environment, including the known failures.
- **Never hardcode the release version in tests**: a version bump then breaks assertions that were never about the bump. Read it from `package.json`. The exception is an assertion about a *specific version's artifact* (e.g. the v0.17.1 migration note), where the literal is the point.
- **Changing a template only reaches new projects**: user-owned files (genome, config) are never overwritten by `update`/`repair` — by design. Shipping a rule change therefore needs a migration note, or existing projects end up holding the contradiction. Always ask "what reaches the projects that already exist?"
