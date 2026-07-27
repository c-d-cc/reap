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

- **Check, don't reason about it**: `grep -rn "fnName"` before deciding when something is called; a one-minute repro before trusting a framework's semantics (CLI parsing, library edge cases). This holds even when your conclusion is right — gen-077 correctly judged "the test is stale", then found a separate bug only by splitting that test into a case per code path. A correct diagnosis still has blind spots.
- **Test isolation: match the mechanism to the process boundary**: external tools need both a port axis and a path axis — either alone leaks into the user's environment. For paths, an env override only reaches a *spawned child*; bun's `os.homedir()` ignores `$HOME` in-process (node's follows it), so inject the directory rather than overriding the environment.
- **macOS path comparison needs `realpath()`**: `/var/folders` vs `/private/var/folders` symlink causes silent fixture-mismatch failures.
- **Disk-multi-file functions → e2e, not unit**: if a function takes a `paths` injection and reads >1 file, mock cost exceeds e2e cost. Plan testing level by file count.
- **Debug stash needs causal matching first**: before `git stash`, list changed files + match against failure cause via `git log`. Stash only when matching is ambiguous.
- **A test suite without a recorded baseline cannot be judged**: when a suite fails, "pre-existing or new regression?" is undecidable unless the last-known counts are written down. Record every suite's pass/fail in environment, including the known failures.
- **Never hardcode the release version in tests**: a version bump then breaks assertions that were never about the bump. Read it from `package.json`. The exception is an assertion about a *specific version's artifact* (e.g. the v0.17.1 migration note), where the literal is the point.
- **Changing a template only reaches new projects**: user-owned files (genome, config) are never overwritten by `update`/`repair` — by design. Shipping a rule change therefore needs a migration note, or existing projects end up holding the contradiction. Always ask "what reaches the projects that already exist?"
- **Build the check first and watch it fail before fixing anything**: a check written after the fix only proves it compiles. Run it against the broken state, confirm it reports the real defects, then fix. Same for each individual assertion — remove a good value and confirm it fails.
- **Verify the backlog's claims, don't just execute them**: a backlog is a snapshot of one investigation and can be wrong (gen-073's said RELEASE_NOTES was stale; it wasn't — the header scan had missed what `## What's New` meant). High clarity means act decisively, not accept premises unchecked.
- **A passing check is not a verified goal**: two ways to get this wrong. Skipping the new behaviour to make an old test green leaves it permanently unverified — walk the real path and cover every exit. And a perfectly deterministic verdict can still measure the wrong thing: gen-079's layer-2 check judged by a file appearing on disk and passed with every slash command deleted, because the agent fell back to the CLI and produced the same file. Ask what the observation *proves*.
- **A threshold without a recorded rationale cannot be evaluated**: REAP's genome limit sat at 100 while the template it ships was 193 lines — an impossible bar that survived because nobody could say where 100 came from. Derive each limit from what the thing is for, write that derivation next to the number, and when raising one, prove the check still catches what it should.
- **Pair a temporary workaround with its removal condition**: gen-072 narrowed a test filter and noted "delete this exception once fixed". That note became gen-075's completion criterion. An undated workaround is debt; one carrying its own exit test is a scheduled repair.
- **Don't reuse the previous generation's remedy on a look-alike**: two functions answering "is a REAP section here?" differently looked like the value-duplication that DI had just solved — but one decides whether to warn and the other decides what to overwrite. The asymmetry was correct; unifying them would have broken one side.
- **Declare shared facts where they live, don't list them elsewhere**: a list of "places to check" is maintained by whoever remembers it exists — REAP kept one, grew it from three entries to four, and #22 still slipped through because every entry was a document and #22 was code-vs-code. A marker beside the value (`reap:carrier(id)`) is found by grep, needs no maintenance, and admits kinds nobody anticipated. Share the value where you can; mark it where you cannot.
- **A gate you add must not come with something that blunts it**: when the new self-diagnosis flagged a legitimately-empty genome, the tempting fix was an allowlist. Allowlists grow, and a check that always reports something gets filtered — which is exactly how 19 warnings survived six generations. Fix the scenario instead.
