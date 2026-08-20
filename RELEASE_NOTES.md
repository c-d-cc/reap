## What's New

The code-intelligence daemon is gone. The indexer that mattered ships with REAP, and it now returns answers that are not empty.

- **`reap index` replaces the daemon.** Nothing to install, no port, no background process: `reap index status`, `reap index impact <file>`, `reap index search <query>`, `reap index callers <symbolId>`, `reap index callees <symbolId>`. Fifteen languages, no native build — the Tree-sitter grammars are WebAssembly.
- **Blast radius used to return zero for every standard TypeScript project, and had for five months.** The resolver never mapped a `./x.js` specifier to the `x.ts` that produces it, so a NodeNext codebase produced an import graph with no edges in it. 130 tests passed, the release gate passed, CI was green throughout — because every check asked whether indexing had run and none asked whether the answer meant anything.
- **So `reap index status` reports the import resolution rate**, and the release gate now requires a known relationship to be found rather than a nonzero symbol count. The number that would have caught this on day one is on screen.
- **Indexing is keyed by commit.** The index records the SHA it describes, so deciding what to re-parse is one `git diff`. A full index of REAP itself takes ~0.3s against the daemon's 6.7s — most of the difference was a `git log` subprocess per file, for information the index needs one copy of. Queries refresh themselves when HEAD has moved, so the only eager trigger left is the commit at the end of `completion`. The trade-off: uncommitted work is not in the index.
- **The index lives in `.reap/.index/`**, gitignored, and goes when the project goes — not in your home directory.
- **If you used the daemon**, `reap update` removes `daemon` / `daemonBin` from `.reap/config.yml` and deletes `~/.reap/daemon/`. Remove the global package with `npm uninstall -g @c-d-cc/reap-daemon`; it is deprecated on npm. See the v0.17.6 migration note.
- **`reap uninstall`** removes what npm cannot. `npm uninstall -g @c-d-cc/reap` deletes the package and nothing else — the slash commands, agent definitions, `~/.reap/` and the SessionStart hook entries were written by REAP's own code, and `preuninstall`/`postuninstall` do not fire on npm 10 or 12. The leftover hook kept calling a command that no longer existed, on every session. Already removed the package? `npx @c-d-cc/reap uninstall --confirm`.
- **Agents are told to read `environment/source-map.md` before changing code**, and `reap init` now creates that file for greenfield projects. It never did — `adoption` writes one from a scan of your tree, greenfield had nothing to scan — so shipping the rule on its own would have sent every new project's agent looking for a file that does not exist. The rule matters because `summary.md` is loaded into context every session and source-map is not: a structure document nothing tells the agent to open is a structure document that sits there while the code it describes gets edited. Existing projects own their `genome/evolution.md` and `reap update` does not touch it, so the v0.17.6 migration note carries the rule to them, along with what to do when the file itself is missing. The note fixes the other half of that file in the same pass: it still told the reflect phase to keep the structure description in `summary.md`, so installing the reading rule on its own would have left an agent sent to a file that nothing is told to write — the state the note itself calls worse than an absent file.
- **Installing REAP into a project no longer changes your global install.** The auto-update asked `reap --version` for the currently installed version, which is whatever binary is first on PATH rather than the package the code belongs to, and then upgraded the global installation unconditionally. Install REAP into a project while an older one sits globally and the postinstall upgraded the global one — an installation the user never mentioned. It also meant the release gate diagnosed the published package instead of the tarball it had just packed, which is how this was found. REAP now reads its own `package.json`, and only a global installation upgrades itself: a project-local copy, an `npx` run and a source checkout are left alone. The version is read in one place now instead of five, four of which said in a comment that they were copies of each other.

Two analyses the daemon also carried — community detection and process tracing — are deliberately not ported. The first was connected components under another name, so its cohesion score was the constant 1.00; the second called every function whose callers could not be resolved an entry point.

---

## v0.17.5

This release is mostly about the code-intelligence daemon, which was documented from v0.16 but never actually usable on an npm install.

- **The daemon is now a separately published package.** If you use `daemon: true`, install it once: `npm i -g @c-d-cc/reap-daemon`. Several packaging problems that kept it from running are fixed along with it.
- **REAP tells you when the daemon is missing or too old** instead of silently doing nothing — `reap daemon status`, `reap fix --check` and the agent prompt all report it. The lifecycle is never blocked either way.
- **`daemonBin` when REAP cannot find an installed daemon.** The two are separate packages and meet only when they share a resolution root — a global REAP with a project-local daemon, two package managers, or a Node version switch does not qualify. Set `daemonBin` in `.reap/config.yml`, or `REAP_DAEMON_BIN` for a single command.
- **`reap run push` reports git's actual error** instead of a generic message about the remote and the network.
- **`reap help` lists `/reap.run` and `/reap.report`**, which it never did.
- **REAP installs its own integration on first run.** npm 12 blocks install scripts for global installs by default, which left the slash commands, agent definitions, guide and session hook unplaced — REAP looked installed and had no integration at all, with no error. Any `reap` command now places them once per version.

Releases now publish through npm trusted publishing (OIDC) rather than a long-lived token.

---

## v0.17.4

- **REAP now installs where OpenCode actually reads** — `~/.config` is only the default. OpenCode follows the XDG base directory spec, so anyone with `XDG_CONFIG_HOME` set was getting none of REAP's 19 slash commands and neither agent definition: the files went to `$HOME/.config/opencode/`, the client looked somewhere else, and nothing reported a problem. `opencode` started normally and simply had no REAP in it. Upgrade and re-run `reap install-skills` to place them correctly.
- **Slash command files no longer claim to be agents** — every installed `reap.*.md` carried `mode: subagent`, a field that describes something a command is not. OpenCode tolerates it; it was still wrong. Reinstalling clears them.
- **The self-diagnosis gate now asks both clients** — it already installed the publish tarball and required a clean `fix --check`, but only ever as a claude-code project, which is what `reap init` produces. It now also switches a project to `agentClient: opencode` and requires `opencode agent list` to load both REAP agents. A single unreadable file invalidates OpenCode's entire configuration, so that path shipping unverified is what took users' OpenCode offline in 0.17.3 — and the XDG defect above was caught by this check on its first run.
- **The test suite runs on every push again** — it lives in a private repository that CI could not fetch, so nothing enforced it and one e2e failure sat unnoticed for six generations. The suite now runs in that repository instead of here, which keeps the logs private and needs no token to read the tests. Three environment assumptions surfaced immediately: tests that commit without configuring a git identity, an initial branch inherited from `init.defaultBranch`, and a module mock leaking into every file loaded after it.

---

## v0.17.3

- **Installing REAP no longer breaks OpenCode** — REAP copied its agent definitions into `~/.config/opencode/agent/` without translating them, so OpenCode read Claude Code's frontmatter and rejected the file. A single invalid agent invalidates the entire OpenCode configuration: every `opencode` command failed with `Configuration is invalid` until the file was deleted, and reinstalling REAP put it back. The definitions are now converted to each client's schema on install; the Claude Code side is unchanged. If you hit this, upgrading and running `reap install-skills` clears it.
- **`fix --check` and `install-skills` no longer contradict each other** — the installer wrote 19 slash commands to `~/.claude/commands/` while the checker reported that exact path as a v0.15 leftover. No supported command could clear the warnings: reinstalling put the files straight back, and `reap fix` never touches the user-level directory. The path now has one owner (the adapter) and reaches the checker by injection, so the two can no longer drift apart. Fixes [#22](https://github.com/c-d-cc/reap/issues/22).
- **Two gates now stand between a build and a release** — `scripts/check-self-diagnosis.sh` unpacks the actual publish tarball into a throwaway HOME, initialises a project and requires `fix --check` to report nothing; a fresh install complaining about itself means the installer and the checker disagree, which is exactly what #22 was. `scripts/check-agent-integration.sh` then starts a headless agent and confirms `/reap.start` really creates a generation, because files can be installed perfectly and still never surface as commands. The first runs in CI on every push and before publish, the second before a release.
- Two smaller fixes surfaced by those gates: a freshly initialised project reported its own shipped `invariants.md` as placeholder-only, and `init --repair` reported a CLAUDE.md it had just rewritten as "already present". Internally, facts known in more than one place now carry a `reap:carrier(id)` marker so they can be found by grep — both #21 and #22 were one copy going stale while the others moved on.

---

## v0.17.2

- **Reflect-phase pruning policy** — the reflect prompt now tells the agent what to *remove*, not only what to write. Memory tiers are classified by content-type (session handoff / ongoing tracks / design lessons) rather than lifespan, with a 4-step decision tree and per-tier pruning: shortterm is replaced every generation, completed midterm tracks are deleted after their lessons are promoted, and longterm drops anything already covered by the genome. `environment/summary.md` gets a matching instruction to remove superseded content instead of accumulating per-generation changelogs.
- **Rules now reach existing projects** — `reap init` seeds the same classification into `genome/evolution.md`, and projects created earlier receive a `v0.17.2` migration note so their genome stops teaching the retired lifespan model. Fixes [#21](https://github.com/c-d-cc/reap/issues/21).
- **Size warnings, with rationale** — `reap fix --check` reports when a genome file, memory tier, or `environment/summary.md` grows past its guideline size. The genome thresholds are now per-file (`invariants` 50 / `application` 250 / `evolution` 300) instead of a shared 100-line limit that the shipped `evolution.md` could not itself meet — every project used to warn the moment `reap init` finished. Each value is derived from what its file holds, and the guidelines are documented in `reap-guide.md`. All size checks are warnings only; `reap fix` never rewrites these files.
- **Docs release gate** — `scripts/check-docs-version.sh` verifies that `RELEASE_NOTICE.md`, `RELEASE_NOTES.md`, and all five reap.cc locales agree with `package.json` before publish, including locale-parity so one language can no longer be left behind. reap.cc itself has been corrected: it no longer teaches the retired lifespan-based memory model, and its `environment/summary.md` size guidance now matches the code.
- **Scenario coverage for the backlog gate** — `run start` has refused to create a generation while a pending backlog is undecided since v0.16, but the multi-generation scenario still assumed the old behaviour and had been failing. It now walks the gate the way a user does — blocked, decided, re-invoked — and covers both exits (`--backlog` and `--no-backlog`).

---

## v0.17.1

- **Migration instruction layer** — `reap update` now detects version gaps and injects per-version migration instructions into the agent's SessionStart context. Agents receive actionable prompts to reorganize existing artifacts/memory when upgrading REAP. Mark migrations complete with `reap update --mark-migrated`.
- **Memory structure improvement** — Vision memory now uses content-type-based classification (session handoff / ongoing tracks / design lessons) instead of time-based tiers. A mandatory pruning policy was added to the reflect phase: shortterm is replaced every generation, midterm is cleaned on track completion, longterm is pruned periodically.

---

## v0.17.0

- **Code Intelligence Daemon** (opt-in) — set `daemon: true` in `.reap/config.yml` to activate a local Tree-sitter symbol graph (localhost:17224). REAP auto-indexes at generation start, implementation complete, and completion commit. Agents receive daemon query instructions (symbol search, caller/callee, blast-radius impact) in their prompts. `lastIndexedCommit` exposed on `/projects/:id/status` for staleness checks.
- **Evaluator Agent — fitness phase + cruise auto-abort** — with `evaluator: true`, the evaluator now runs during the fitness phase as well as validation. High-severity concerns recorded via `reap run validation --phase report-evaluator` automatically abort cruise mode, replacing the auto-fitness prompt with a supervised fallback so the user can review before continuing.

## Daemon Setup

```bash
npm install -g @c-d-cc/reap
```

Add to `.reap/config.yml`:

```yaml
daemon: true   # default: false
```

Then start the daemon and register your project:

```bash
reap daemon start
reap daemon status
```

The daemon runs at `localhost:17224`. REAP automatically triggers indexing at key lifecycle points. Agents receive symbol query guidance in their prompts when `daemon: true` is set.

## Evaluator Setup

Add to `.reap/config.yml`:

```yaml
evaluator: true   # default: false — enabling increases token usage
```

Then run `/reap.evolve` as normal. During validation and fitness, the builder launches `reap-evaluate` as an independent subagent (read-only, qualitative assessment). If you use cruise mode, high-severity evaluator concerns automatically pause cruise for human review.
