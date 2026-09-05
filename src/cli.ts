import { chmodSync, existsSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { assemble, hookEnvelope } from "./ctx.ts";
import {
  bindGeneration,
  isIdeaKind,
  makeBacklog,
  makeGeneration,
  makeHook,
  makeIdea,
  markIdea,
  makeLoop,
  makeMilestone,
  markBacklog,
  markGeneration,
  markLoop,
  markMilestone,
} from "./entries.ts";
import { isLoopType, LOOP_TYPES, isRegistered, isValid, kindOf, readRegistry } from "./id.ts";
import type { Kind } from "./id.ts";
import type { RunHooksResult } from "./hooks.ts";
import { findSource, formatSources, makePlanSource, readSources } from "./plan.ts";
import { diagnose, formatReport } from "./doctor.ts";
import { Indexer, formatStatus } from "./index/indexer.ts";
import { arrive, claim, parseTtl, release, roster, status as orchStatus, waitBarrier, whoAmI } from "./orch.ts";
import { checkCarriers, formatCarriers, newCarrier, orphans, scanCarriers } from "./carrier.ts";
import {
  DIRS,
  SEEDS,
  ensureDir,
  findRoot,
  paths,
  workspaceId,
  writeFileAtomic,
} from "./store.ts";
import { render, template } from "./templates.ts";
import { t } from "./i18n.ts";
import { formatSetup, isLegacyCommand, pluginInstalled, setup } from "./setup.ts";
import pkg from "../package.json" with { type: "json" };

export type Result = { ok: boolean; message: string; data?: unknown; stderr?: string };

export async function run(argv: string[], cwd: string): Promise<Result> {
  const root = findRoot(cwd);
  const [command, ...rest] = argv;
  switch (command) {
    case undefined:
    case "--help":
    case "-h":
    case "help":
      return { ok: command === undefined ? false : true, message: t(root, "cli.usage") };
    case "--version":
    case "version":
      return { ok: true, message: `reap ${pkg.version}`, data: { version: pkg.version } };
    case "init":
      return rest.includes("--check") ? attempt(() => checkSeeds(cwd)) : init(cwd, rest.includes("--force"));
    case "make":
      return attempt(() => make(cwd, rest));
    case "mark":
      return attempt(() => mark(cwd, rest));
    case "ctx":
      return attempt(() => ctx(cwd, rest));
    case "plan":
      return attempt(() => plan(cwd, rest));
    case "seq":
      return attempt(() => seq(cwd, rest));
    case "bind":
      return attempt(() => {
        if (!rest[0]) throw new Error(t(root, "cli.bind_usage"));
        const bound = bindGeneration(requireRoot(cwd), rest[0]);
        return { ok: true, message: t(root, "cli.bound", { id: bound.id }), data: bound };
      });
    case "carrier":
      return attempt(() => carrier(cwd, rest));
    case "index":
      return attemptAsync(() => index(cwd, rest));
    case "orch":
      return attemptAsync(() => orch(cwd, rest));
    case "doctor":
      return attempt(() => {
        const r = requireRoot(cwd);
        const report = diagnose(r);
        return { ok: report.defects.length === 0, message: formatReport(report, r), data: report };
      });
    case "setup":
      return attempt(() => {
        const result = setup();
        return { ok: result.ok, message: formatSetup(root, result), data: result };
      });
    default:
      // v0.17 명령이면 모른다고 하지 않는다 — 0.17 사용자가 0.18을 손으로 설치한 직후 옛 훅이 이 이름들을 부른다
      if (isLegacyCommand(command)) return { ok: true, message: t(root, "cli.legacy_command", { command, version: pkg.version }) };
      return { ok: false, message: `${t(root, "cli.unknown_command", { command: command! })}\n\n${t(root, "cli.usage")}` };
  }
}

async function attemptAsync(fn: () => Promise<Result>): Promise<Result> {
  try {
    return await fn();
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

/** 만남의 장소만 제공한다. 메시지는 클라이언트의 것이고 세션을 깨우지 않는다. */
async function orch(cwd: string, argv: string[]): Promise<Result> {
  const root = requireRoot(cwd);
  const [sub, arg, ...rest] = argv;
  const flags = parseFlags([arg ?? "", ...rest].filter(Boolean));
  const topic = flags.value("--topic") ?? process.env.REAP_TOPIC ?? "main";
  if (sub === "claim") {
    if (!arg || arg.startsWith("--")) throw new Error(t(root, "orch.claim_usage"));
    const c = claim(root, topic, arg, parseTtl(flags.value("--ttl") ?? "30m", root));
    return withHooks(root, { ok: true, message: t(root, "orch.claimed", { resource: c.resource, holder: c.holder, expiresAt: c.expiresAt }), data: c }, c.hooks);
  }
  if (sub === "release") {
    if (!arg || arg.startsWith("--")) throw new Error(t(root, "orch.release_usage"));
    release(root, topic, arg);
    return { ok: true, message: t(root, "orch.released", { resource: arg }) };
  }
  if (sub === "barrier") {
    if (!arg || arg.startsWith("--")) throw new Error(t(root, "orch.barrier_usage"));
    const expect = Number(flags.value("--expect"));
    const timeout = Number(flags.value("--timeout"));
    if (!Number.isInteger(expect) || expect < 1) throw new Error(t(root, "orch.expect_required"));
    if (!Number.isFinite(timeout) || timeout <= 0) throw new Error(t(root, "orch.timeout_required"));
    arrive(root, topic, arg, expect);
    const r = await waitBarrier(root, topic, arg, expect, timeout * 1000);
    if (r.released) return withHooks(root, { ok: true, message: t(root, "orch.barrier_passed", { name: arg, names: r.barrier.arrived.map((a) => a.who).join(", ") }), data: r }, r.hooks);
    const missing = r.missing.length ? t(root, "orch.barrier_missing", { names: r.missing.join(", ") }) : t(root, "orch.barrier_unknown_missing", { arrived: r.barrier.arrived.length, expect: r.barrier.expect });
    return { ok: false, message: t(root, "orch.barrier_timeout", { name: arg, timeout, missing }), data: r };
  }
  if (sub === "roster") {
    const agents = roster(topic);
    return { ok: true, message: agents.length ? agents.map((a) => `${a.name}  ${a.state ?? "?"}  ${a.cwd ?? ""}`).join("\n") : t(root, "orch.roster_empty", { topic }), data: agents };
  }
  if (sub === "status") {
    const s = orchStatus(root, topic);
    const lines = [t(root, "orch.status_line", { topic, me: whoAmI(root) })];
    lines.push(s.claims.length ? t(root, "orch.claims_header") : t(root, "orch.claims_none"), ...s.claims.map((c) => t(root, "orch.claim_line", { resource: c.resource, holder: c.holder, expiresAt: c.expiresAt })));
    lines.push(s.barriers.length ? t(root, "orch.barriers_header") : t(root, "orch.barriers_none"), ...s.barriers.map((b) => t(root, "orch.barrier_line", { name: b.name, arrived: b.arrived.length, expect: b.expect })));
    return { ok: true, message: lines.join("\n"), data: s };
  }
  throw new Error(t(root, "orch.unknown_sub", { sub: sub ?? t(root, "cli.none") }));
}

/** 질의는 먼저 인덱스를 HEAD에 맞춘다. 커밋 안 된 것은 없다 — 그런 것은 grep이다. */
async function index(cwd: string, argv: string[]): Promise<Result> {
  const root = requireRoot(cwd);
  const [sub = "update", ...rest] = argv;
  const ix = new Indexer(root);
  if (sub === "update") {
    const r = await ix.update(rest.includes("--full"));
    const m = ix.manifest();
    return { ok: true, message: `${t(root, "index.update_summary", { mode: r.mode, files: r.files, ms: r.ms })}\n${m ? formatStatus(m, root) : ""}`, data: r };
  }
  if (sub === "status") {
    await ix.ready();
    const m = ix.manifest();
    if (!m) throw new Error(t(root, "index.no_index"));
    return { ok: true, message: formatStatus(m, root), data: m };
  }
  await ix.ready();
  if (sub === "impact") {
    if (rest.length === 0) throw new Error(t(root, "index.impact_usage"));
    const r = ix.impact(rest.map((f) => relative(root, resolve(cwd, f))));
    const lines = [t(root, "index.impact_summary", { direct: r.direct.length, indirect: r.indirect.length, symbols: r.symbols.length })];
    if (r.direct.length) lines.push(t(root, "index.impact_direct_header"), ...r.direct.map((f) => `  ${f}`));
    if (r.indirect.length) lines.push(t(root, "index.impact_indirect_header"), ...r.indirect.map((f) => `  ${f}`));
    if (r.symbols.length) lines.push(t(root, "index.impact_symbols_header"), ...r.symbols.map((s) => `  ${s}`));
    const m = ix.manifest()!;
    if (m.stats.imports.attempted > 0 && m.stats.imports.resolved / m.stats.imports.attempted < 0.8) lines.push(t(root, "index.low_resolution_note"));
    return { ok: true, message: lines.join("\n"), data: r };
  }
  if (sub === "search") {
    if (!rest[0]) throw new Error(t(root, "index.search_usage"));
    const hits = ix.search(rest[0]);
    return { ok: true, message: hits.length ? hits.map((n) => `${n.id}  ${n.kind}  ${n.file}:${n.line}`).join("\n") : t(root, "index.search_none"), data: hits };
  }
  if (sub === "callers" || sub === "callees") {
    if (!rest[0]) throw new Error(t(root, "index.symbol_usage", { sub }));
    if (!ix.node(rest[0])) throw new Error(t(root, "index.unknown_symbol", { id: rest[0] }));
    const edges = sub === "callers" ? ix.callers(rest[0]) : ix.callees(rest[0]);
    const ids = edges.map((e) => (sub === "callers" ? e.from : e.to)).sort();
    return { ok: true, message: ids.length ? ids.map((id) => { const n = ix.node(id); return n ? `${id}  ${n.file}:${n.line}` : id; }).join("\n") : t(root, "index.callers_none"), data: ids };
  }
  throw new Error(t(root, "index.unknown_sub", { sub }));
}

/** 사용자 입력이 틀린 것은 예외가 아니라 결과다. 스택 트레이스를 사람에게 보이지 않는다. */
function attempt(fn: () => Result): Result {
  try {
    return fn();
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : String(error) };
  }
}

function make(cwd: string, argv: string[]): Result {
  const [kind, ...rest] = argv;
  const root = requireRoot(cwd);
  const flags = parseFlags(rest);
  const now = timestamp();

  // plan source는 제목이 아니라 역할과 위치로 등록된다
  if (kind === "plan-source") {
    const sourceRoot = flags.value("--root");
    const role = flags.value("--role");
    if (!sourceRoot) throw new Error(t(root, "make.plan_source_needs_root"));
    if (!role) throw new Error(t(root, "make.plan_source_needs_role"));
    const made = makePlanSource(root, { root: sourceRoot, role, slug: flags.value("--slug"), now });
    return {
      ok: true,
      message: t(root, "make.plan_source_result", { id: made.id, path: relative(root, made.path), convention: relative(root, made.convention) }),
      data: made,
    };
  }

  // hook은 제목이 아니라 이벤트·이름으로 조립된다
  if (kind === "hook") {
    const made = makeHook(root, {
      event: flags.value("--event") ?? "",
      name: flags.value("--name") ?? "",
      type: flags.value("--type"),
      condition: flags.value("--condition"),
      order: flags.value("--order"),
    });
    return made2result(root, "hook", made);
  }

  const title = flags.value("--title");
  if (!title) throw new Error(t(root, "make.title_required"));

  switch (kind) {
    case "loop": {
      const type = flags.value("--type");
      if (!type || !isLoopType(type)) {
        throw new Error(t(root, "make.loop_needs_type", { types: LOOP_TYPES.join(" · "), got: type ?? t(root, "cli.none") }));
      }
      const made = makeLoop(root, {
        title,
        slug: flags.value("--slug"),
        type,
        from: flags.value("--from"),
        refs: flags.values("--ref"),
        now,
      });
      return made2result(root, "loop", made);
    }
    case "milestone": {
      const made = makeMilestone(root, {
        title,
        slug: flags.value("--slug"),
        from: flags.value("--from"),
        refs: flags.values("--ref"),
        focus: flags.has("--focus"),
        now,
      });
      return made2result(root, "milestone", made);
    }
    case "generation": {
      const made = makeGeneration(root, {
        title,
        slug: flags.value("--slug"),
        milestone: flags.value("--milestone"),
        backlog: flags.value("--backlog"),
        plan: flags.has("--plan"),
        fix: flags.has("--fix"),
        now,
      });
      return made2result(root, "generation", made);
    }
    case "backlog": {
      const type = flags.value("--type");
      if (!type) throw new Error(t(root, "make.backlog_needs_type"));
      const made = makeBacklog(root, { title, slug: flags.value("--slug"), type, from: flags.value("--from"), now });
      return made2result(root, "backlog", made);
    }
    case "idea": {
      const kind = flags.value("--kind");
      if (!kind || !isIdeaKind(kind)) {
        throw new Error(t(root, "make.idea_needs_kind", { got: kind ?? t(root, "cli.none") }));
      }
      const made = makeIdea(root, { title, slug: flags.value("--slug"), kind, now });
      return made2result(root, "idea", made);
    }
    default:
      throw new Error(t(root, "make.unknown_kind", { kind: kind ?? t(root, "cli.none") }));
  }
}

function mark(cwd: string, argv: string[]): Result {
  const [kind, needle, ...rest] = argv;
  const root = requireRoot(cwd);
  const flags = parseFlags(rest);

  if (kind === "loop") {
    if (!needle) throw new Error(t(root, "mark.loop_needs_id"));
    if (flags.has("--aborted")) {
      const marked = markLoop(root, needle, "aborted", timestamp());
      return { ok: true, message: t(root, "mark.cleared", { id: marked.id }), data: marked };
    }
    if (!flags.has("--closed")) throw new Error(t(root, "mark.need_flag_closed_aborted"));
    const marked = markLoop(root, needle, "closed", timestamp(), flags.values("--milestone"));
    return { ok: true, message: t(root, "mark.closed", { id: marked.id, path: relative(root, marked.path) }), data: marked };
  }

  if (kind === "generation") {
    if (!needle) throw new Error(t(root, "mark.gen_needs_id"));
    if (flags.has("--aborted")) {
      const marked = markGeneration(root, needle, "aborted", timestamp());
      return { ok: true, message: t(root, "mark.cleared", { id: marked.id }), data: marked };
    }
    if (flags.has("--archived")) {
      const marked = markGeneration(root, needle, "archived", timestamp());
      return { ok: true, message: t(root, "mark.moved", { id: marked.id, path: relative(root, marked.path) }), data: marked };
    }
    if (!flags.has("--closed")) throw new Error(t(root, "mark.need_flag_gen"));
    const marked = markGeneration(root, needle, "closed", timestamp());
    return withHooks(root, { ok: true, message: t(root, "mark.gen_closed", { id: marked.id }), data: marked }, marked.hooks);
  }

  if (kind === "backlog") {
    if (!needle) throw new Error(t(root, "mark.backlog_needs_id"));
    if (flags.has("--archived")) {
      const marked = markBacklog(root, needle, "archived");
      return { ok: true, message: t(root, "mark.moved", { id: marked.id, path: relative(root, marked.path) }), data: marked };
    }
    if (!flags.has("--consumed")) throw new Error(t(root, "mark.need_flag_backlog"));
    const marked = markBacklog(root, needle, "consumed", flags.value("--by"));
    return { ok: true, message: t(root, "mark.backlog_consumed", { id: marked.id }), data: marked };
  }

  if (kind === "idea") {
    if (!needle) throw new Error(t(root, "mark.idea_needs_id"));
    if (!flags.has("--archived")) throw new Error(t(root, "mark.idea_only_archived"));
    const marked = markIdea(root, needle, "archived");
    return { ok: true, message: t(root, "mark.moved", { id: marked.id, path: relative(root, marked.path) }), data: marked };
  }

  if (kind === "milestone") {
    if (!needle) throw new Error(t(root, "mark.milestone_needs_id"));
    if (flags.has("--focus")) {
      const marked = markMilestone(root, needle, "focus", timestamp());
      return { ok: true, message: t(root, "mark.focused", { id: marked.id }), data: marked };
    }
    if (flags.has("--closed")) {
      const marked = markMilestone(root, needle, "closed", timestamp());
      return withHooks(root, { ok: true, message: t(root, "mark.closed_moved", { id: marked.id, path: relative(root, marked.path) }), data: marked }, marked.hooks);
    }
    throw new Error(t(root, "mark.need_flag_milestone"));
  }

  throw new Error(t(root, "mark.unknown_kind", { kind: kind ?? t(root, "cli.none") }));
}

/**
 * `--hook`일 때는 REAP 프로젝트가 아니어도 실패하지 않는다. 훅은 모든 세션에서 불리고,
 * **어떤 이유로도 세션 시작을 막아서는 안 된다.** 아무것도 내지 않으면 아무것도 주입되지 않는다.
 */
function ctx(cwd: string, argv: string[]): Result {
  const flags = parseFlags(argv);
  const hook = flags.has("--hook");
  const root = findRoot(cwd);
  if (!root) {
    if (hook) return { ok: true, message: "" };
    throw new Error(t(root, "cli.not_a_project"));
  }
  const context = assemble(root, flags.value("--milestone"));
  if (hook) return { ok: true, message: context === "" ? "" : hookEnvelope(context) };
  return { ok: true, message: context };
}

/** 표식이 곧 레지스트리다 — 발급도 조회도 리포를 훑는다. `new`는 아무것도 쓰지 않는다. */
function carrier(cwd: string, argv: string[]): Result {
  const root = requireRoot(cwd);
  const [sub, arg, ...rest] = argv;
  if (sub === "new") {
    if (!arg) throw new Error(t(root, "carrier.new_usage"));
    return { ok: true, message: newCarrier(root, arg) };
  }
  if (sub === "list") {
    const flags = parseFlags([arg ?? "", ...rest].filter(Boolean));
    if (flags.has("--check")) {
      const problems = checkCarriers(root);
      if (problems.length === 0) return { ok: true, message: t(root, "carrier.no_problems") };
      return { ok: false, message: problems.map((p) => `${p.kind}: ${p.detail}`).join("\n"), data: problems };
    }
    const all = scanCarriers(root);
    const shown = flags.has("--orphans") ? orphans(all) : all;
    return { ok: true, message: formatCarriers(shown, root), data: shown };
  }
  throw new Error(t(root, "carrier.unknown_sub", { sub: sub ?? t(root, "cli.none") }));
}

/** 레지스트리 조회. 표의 이스케이프를 되돌려 보여준다 — 사람이 읽는 것이다. */
function seq(cwd: string, argv: string[]): Result {
  const root = requireRoot(cwd);
  const [needle] = argv;
  const kinds: Kind[] = ["milestone", "generation", "loop", "source"];
  const render = (kind: Kind) => {
    const rows = readRegistry(root, kind);
    return `${kind} (${rows.length})\n${rows.map((r) => `  ${r.id}  ${r.title}  ${r.createdAt}`).join("\n")}`;
  };
  if (!needle) return { ok: true, message: kinds.map(render).join("\n\n") };
  if (kinds.includes(needle as Kind)) return { ok: true, message: render(needle as Kind) };
  if (isRegistered(needle as Kind)) return { ok: true, message: render(needle as Kind) };
  if (!isValid(needle)) throw new Error(t(root, "seq.invalid", { kinds: kinds.join(" · "), needle }));
  const kind = kindOf(needle)!;
  const row = readRegistry(root, kind).find((r) => r.id === needle);
  if (!row) throw new Error(t(root, "seq.not_found", { needle }));
  return { ok: true, message: `${row.id}  ${row.title}  ${row.createdAt}`, data: row };
}

/** 읽기만 한다. 규약 본문을 그대로 내는 이유는 agent가 그것을 읽고 소스를 파악하기 위해서다. */
function plan(cwd: string, argv: string[]): Result {
  const [sub, needle] = argv;
  const root = requireRoot(cwd);
  if (sub === "sources") return { ok: true, message: formatSources(readSources(root), root), data: readSources(root) };
  if (sub === "convention") {
    if (!needle) throw new Error(t(root, "plan.convention_usage"));
    const source = findSource(root, needle);
    if (!source) throw new Error(t(root, "plan.unregistered_source", { id: needle }));
    const path = join(paths(root).plan, source.convention);
    if (!existsSync(path)) throw new Error(t(root, "plan.convention_missing", { path: relative(root, path) }));
    return { ok: true, message: readFileSync(path, "utf8"), data: source };
  }
  throw new Error(t(root, "plan.unknown_sub", { sub: sub ?? t(root, "cli.none") }));
}

function made2result(root: string, label: string, made: { id: string; path: string; hooks?: RunHooksResult }): Result {
  return withHooks(
    root,
    {
      ok: true,
      message: t(root, "make.result", { label, id: made.id, path: relative(root, made.path) }),
      data: made,
    },
    made.hooks,
  );
}

/**
 * 훅 출력을 명령 message 뒤에 붙인다 — 빈 줄 + `--- hooks ---` + `[<file>]`과 텍스트.
 * failures는 stderr에 `hook 실패: <file> — <reason>`. skipped는 아무것도 안 낸다 —
 * 실패가 아니라 조건이 안 맞아 건너뛴 것이다. 훅이 실패해도 `ok`는 건드리지 않는다.
 */
function withHooks(root: string, result: Result, hooks?: RunHooksResult): Result {
  if (!hooks) return result;
  const out: Result = { ...result };
  if (hooks.outputs.length > 0) {
    const block = hooks.outputs.flatMap((o) => [`[${o.file}]`, o.text]);
    out.message = `${result.message}\n\n--- hooks ---\n${block.join("\n")}`;
  }
  if (hooks.failures.length > 0) {
    out.stderr = hooks.failures.map((f) => t(root, "cli.hook_failure", { file: f.file, reason: f.reason })).join("\n");
  }
  return out;
}

function requireRoot(cwd: string): string {
  const root = findRoot(cwd);
  if (!root) throw new Error(t(root, "cli.not_a_project"));
  return root;
}

/** `--flag value`와 `--flag=value` 둘 다 받는다. 같은 플래그가 여러 번 오면 전부 모은다. */
function parseFlags(argv: string[]) {
  const collected = new Map<string, string[]>();
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i]!;
    if (!token.startsWith("--")) continue;
    const at = token.indexOf("=");
    const name = at < 0 ? token : token.slice(0, at);
    let value: string | undefined = at < 0 ? undefined : token.slice(at + 1);
    if (value === undefined) {
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith("--")) {
        value = next;
        i++;
      }
    }
    const list = collected.get(name) ?? [];
    if (value !== undefined) list.push(value);
    collected.set(name, list);
  }
  return {
    has: (name: string) => collected.has(name),
    value: (name: string) => collected.get(name)?.[0],
    values: (name: string) => collected.get(name) ?? [],
  };
}

/** 초 단위까지. 밀리초는 기록을 읽는 사람에게 아무것도 말해주지 않는다. */
function timestamp(): string {
  return `${new Date().toISOString().slice(0, 19)}Z`;
}

/**
 * 저장 구조의 디렉토리를 전부 만들고 지식 레이어의 씨앗을 놓는다.
 * **이미 있는 파일은 건드리지 않는다** — 사람과 agent가 쓴 것이고, 도구가 다시 쓰면
 * 무엇이 사라졌는지 아무도 모른다.
 */
function init(cwd: string, force: boolean): Result {
  const root = resolve(cwd);
  const p = paths(root);
  if (existsSync(p.reap) && !force) {
    return {
      ok: false,
      message: t(root, "cli.already_initialized"),
    };
  }

  const created: string[] = [];
  ensureDir(p.reap);
  for (const dir of DIRS) ensureDir(join(p.reap, dir));

  if (!existsSync(p.config)) {
    writeFileAtomic(p.config, render(template(root, "config.yml"), { workspaceId: workspaceId(root) }));
    created.push(".reap/config.yml");
  }
  for (const [file, name] of Object.entries(SEEDS)) {
    const target = join(p.reap, file);
    if (existsSync(target)) continue;
    writeFileAtomic(target, template(root, name));
    created.push(`.reap/${file}`);
  }
  // 지식 씨앗(SEEDS)이 아니다 — `init --check`의 비교 대상에 넣으면 아무도 안 고치는
  // 게 정상인 조건 스크립트가 계속 "씨앗인 채"로 잡힌다.
  const always = join(p.hookConditions, "always.sh");
  if (!existsSync(always)) {
    writeFileAtomic(always, template(root, "condition-always.sh"));
    chmodSync(always, 0o755);
    created.push(".reap/hooks/conditions/always.sh");
  }
  if (ignoreLocal(root)) created.push(".gitignore");

  // 설치는 여기서 하지 않는다 — init은 프로젝트의 일이고 플러그인은 홈의 일이다. 없으면 `setup`을 가리킬 뿐이다
  const hint = pluginInstalled() === false ? `\n${t(root, "cli.setup_hint")}` : "";
  return {
    ok: true,
    message: (created.length > 0
      ? t(root, "cli.initialized", { root, created: created.join("\n  ") })
      : t(root, "cli.nothing_missing", { root })) + hint,
    data: { root, created },
  };
}

/**
 * 씨앗인지는 **번들 템플릿과 내용이 같은지**로 판정한다. 사람이 한 글자라도 쓴 파일은 씨앗이 아니다.
 * 보고만 하고 쓰지 않는다 — `init` skill이 무엇을 채울지 정할 때 쓴다.
 */
function checkSeeds(cwd: string): Result {
  const root = requireRoot(cwd);
  const p = paths(root);
  const seeds: string[] = [];
  for (const [file, name] of Object.entries(SEEDS)) {
    const target = join(p.reap, file);
    if (!existsSync(target)) continue;
    if (readFileSync(target, "utf8") === template(root, name)) seeds.push(file);
  }
  return {
    ok: true,
    message: seeds.length > 0
      ? t(root, "cli.seeds_remaining", { files: seeds.map((f) => `.reap/${f}`).join("\n  ") })
      : t(root, "cli.no_seeds_remaining"),
    data: { seeds },
  };
}

/**
 * `.session`은 worktree 로컬 상태다 — 커밋되면 다른 세션의 바인딩이 섞인다.
 * `.index/`는 파생 데이터다 — 커밋하면 그 인덱스를 담은 커밋을 다시 인덱싱해야 하고 끝나지 않는다.
 */
function ignoreLocal(root: string): boolean {
  const path = join(root, ".gitignore");
  const current = existsSync(path) ? readFileSync(path, "utf8") : "";
  const have = new Set(current.split("\n").map((l) => l.trim()));
  const missing = [".reap/.session", ".reap/.index/"].filter((l) => !have.has(l));
  if (missing.length === 0) return false;
  const prefix = current === "" || current.endsWith("\n") ? current : `${current}\n`;
  writeFileAtomic(path, `${prefix}${missing.join("\n")}\n`);
  return true;
}

if (import.meta.main) {
  const result = await run(process.argv.slice(2), process.cwd());
  (result.ok ? console.log : console.error)(result.message);
  if (result.stderr) console.error(result.stderr);
  process.exit(result.ok ? 0 : 1);
}
