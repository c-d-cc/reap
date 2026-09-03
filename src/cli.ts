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
import pkg from "../package.json" with { type: "json" };

export type Result = { ok: boolean; message: string; data?: unknown; stderr?: string };

const USAGE = `사용법: reap <명령>

  --version
  init [--force] | init --check     (--check: 씨앗 그대로인 지식 파일을 보고만 한다)
  make loop       --type plan|design|uiux|idea --title "<제목>" [--slug <s>] [--from <id>] [--ref <ps-id>:<경로>]
  make milestone  --title "<제목>" [--slug <s>] [--from <loop-id>] [--ref <ps-id>:<경로>] [--focus]
  make generation --milestone <ms-id> --title "<제목>" [--slug <s>]
  make generation --backlog <bk-id> --title "<제목>" [--slug <s>]   (--milestone과 겸용 가능)
  make generation --fix  --title "<제목>" [--slug <s>]
  make backlog    --type <t> --title "<제목>" [--slug <s>] [--from <id>]
  make plan-source --root <path> --role "<역할>" [--slug <s>]
  make idea       --kind research|freememo|file --title "<제목>" [--slug <s>]
  make hook       --event <e> --name <n> [--type md|sh] [--condition <c>] [--order <n>]
  mark loop       <loop-id> --closed [--milestone <ms-id>]... | --aborted
  mark generation <gen-id> --closed | --aborted | --archived
  mark backlog    <bk-id> --consumed [--by <gen-id>] | --archived
  mark milestone <ms-id> --focus | --closed
  mark idea       <idea-id> --archived
  bind <gen-id>                   (열린 세대에 이 세션을 다시 묶는다)
  seq [generation|milestone|loop|source|<id>]
  carrier new <slug> | list [--orphans|--check]
  doctor                          (보고만 한다. 결함이 있으면 실패로 끝난다)
  index [update [--full] | status | impact <file>... | search <q> | callers <id> | callees <id>]
  orch claim <resource> [--ttl 30m] | release <resource> | barrier <name> --expect <N> --timeout <s> | roster | status   [--topic <t>]
  plan sources | convention <ps-id>
  ctx [--milestone <ms-id>] [--hook]`;

export async function run(argv: string[], cwd: string): Promise<Result> {
  const [command, ...rest] = argv;
  switch (command) {
    case undefined:
    case "--help":
    case "-h":
    case "help":
      return { ok: command === undefined ? false : true, message: USAGE };
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
        if (!rest[0]) throw new Error("bind <gen-id>");
        const bound = bindGeneration(requireRoot(cwd), rest[0]);
        return { ok: true, message: `묶었습니다: ${bound.id}`, data: bound };
      });
    case "carrier":
      return attempt(() => carrier(cwd, rest));
    case "index":
      return attemptAsync(() => index(cwd, rest));
    case "orch":
      return attemptAsync(() => orch(cwd, rest));
    case "doctor":
      return attempt(() => {
        const report = diagnose(requireRoot(cwd));
        return { ok: report.defects.length === 0, message: formatReport(report), data: report };
      });
    default:
      return { ok: false, message: `모르는 명령입니다: ${command}\n\n${USAGE}` };
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
    if (!arg || arg.startsWith("--")) throw new Error("orch claim <resource> [--ttl 30m]");
    const c = claim(root, topic, arg, parseTtl(flags.value("--ttl") ?? "30m"));
    return withHooks({ ok: true, message: `잡았습니다: ${c.resource} — ${c.holder}, 만료 ${c.expiresAt}`, data: c }, c.hooks);
  }
  if (sub === "release") {
    if (!arg || arg.startsWith("--")) throw new Error("orch release <resource>");
    release(root, topic, arg);
    return { ok: true, message: `놓았습니다: ${arg}` };
  }
  if (sub === "barrier") {
    if (!arg || arg.startsWith("--")) throw new Error("orch barrier <name> --expect <N> --timeout <초>");
    const expect = Number(flags.value("--expect"));
    const timeout = Number(flags.value("--timeout"));
    if (!Number.isInteger(expect) || expect < 1) throw new Error("--expect <N>이 필요합니다 (1 이상)");
    if (!Number.isFinite(timeout) || timeout <= 0) throw new Error("--timeout <초>는 필수입니다 — 오지 않는 참가자를 무한정 기다리지 않습니다");
    arrive(root, topic, arg, expect);
    const r = await waitBarrier(root, topic, arg, expect, timeout * 1000);
    if (r.released) return withHooks({ ok: true, message: `barrier ${arg} 통과 — ${r.barrier.arrived.map((a) => a.who).join(", ")}`, data: r }, r.hooks);
    const missing = r.missing.length ? `오지 않은 세션: ${r.missing.join(", ")}` : `도착 ${r.barrier.arrived.length}/${r.barrier.expect} — roster를 알 수 없어 누구인지는 모른다`;
    return { ok: false, message: `barrier ${arg} 시간 초과 (${timeout}s). ${missing}`, data: r };
  }
  if (sub === "roster") {
    const agents = roster(topic);
    return { ok: true, message: agents.length ? agents.map((a) => `${a.name}  ${a.state ?? "?"}  ${a.cwd ?? ""}`).join("\n") : `reap-${topic}-* 세션이 없거나 claude agents를 읽을 수 없다`, data: agents };
  }
  if (sub === "status") {
    const s = orchStatus(root, topic);
    const lines = [`topic ${topic} · 나 ${whoAmI(root)}`];
    lines.push(s.claims.length ? "claims:" : "claims: 없음", ...s.claims.map((c) => `  ${c.resource}  ${c.holder}  만료 ${c.expiresAt}`));
    lines.push(s.barriers.length ? "barriers:" : "barriers: 없음", ...s.barriers.map((b) => `  ${b.name}  ${b.arrived.length}/${b.expect}`));
    return { ok: true, message: lines.join("\n"), data: s };
  }
  throw new Error(`orch는 claim · release · barrier · roster · status입니다: ${sub ?? "(없음)"}`);
}

/** 질의는 먼저 인덱스를 HEAD에 맞춘다. 커밋 안 된 것은 없다 — 그런 것은 grep이다. */
async function index(cwd: string, argv: string[]): Promise<Result> {
  const root = requireRoot(cwd);
  const [sub = "update", ...rest] = argv;
  const ix = new Indexer(root);
  if (sub === "update") {
    const r = await ix.update(rest.includes("--full"));
    const m = ix.manifest();
    return { ok: true, message: `${r.mode} · 파일 ${r.files} · ${r.ms}ms\n${m ? formatStatus(m) : ""}`, data: r };
  }
  if (sub === "status") {
    await ix.ready();
    const m = ix.manifest();
    if (!m) throw new Error("인덱스가 없습니다.");
    return { ok: true, message: formatStatus(m), data: m };
  }
  await ix.ready();
  if (sub === "impact") {
    if (rest.length === 0) throw new Error("index impact <file>...");
    const r = ix.impact(rest.map((f) => relative(root, resolve(cwd, f))));
    const lines = [`직접 ${r.direct.length} · 간접 ${r.indirect.length} · 심볼 ${r.symbols.length}`];
    if (r.direct.length) lines.push("직접:", ...r.direct.map((f) => `  ${f}`));
    if (r.indirect.length) lines.push("간접:", ...r.indirect.map((f) => `  ${f}`));
    if (r.symbols.length) lines.push("심볼:", ...r.symbols.map((s) => `  ${s}`));
    const m = ix.manifest()!;
    if (m.stats.imports.attempted > 0 && m.stats.imports.resolved / m.stats.imports.attempted < 0.8) lines.push("(해석률이 낮다 — 빈 결과는 '모름'이다)");
    return { ok: true, message: lines.join("\n"), data: r };
  }
  if (sub === "search") {
    if (!rest[0]) throw new Error("index search <query>");
    const hits = ix.search(rest[0]);
    return { ok: true, message: hits.length ? hits.map((n) => `${n.id}  ${n.kind}  ${n.file}:${n.line}`).join("\n") : "없음 (커밋 안 된 것은 인덱스에 없다)", data: hits };
  }
  if (sub === "callers" || sub === "callees") {
    if (!rest[0]) throw new Error(`index ${sub} <symbolId>`);
    if (!ix.node(rest[0])) throw new Error(`모르는 심볼입니다: ${rest[0]} (index search로 id를 찾습니다)`);
    const edges = sub === "callers" ? ix.callers(rest[0]) : ix.callees(rest[0]);
    const ids = edges.map((e) => (sub === "callers" ? e.from : e.to)).sort();
    return { ok: true, message: ids.length ? ids.map((id) => { const n = ix.node(id); return n ? `${id}  ${n.file}:${n.line}` : id; }).join("\n") : "없음", data: ids };
  }
  throw new Error(`index는 update · status · impact · search · callers · callees입니다: ${sub}`);
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
    if (!sourceRoot) throw new Error("plan-source에는 --root <path>가 필요합니다.");
    if (!role) throw new Error("plan-source에는 --role \"<역할>\"이 필요합니다.");
    const made = makePlanSource(root, { root: sourceRoot, role, slug: flags.value("--slug"), now });
    return {
      ok: true,
      message: `plan-source ${made.id}\n  ${relative(root, made.path)}\n  ${relative(root, made.convention)}`,
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
  if (!title) throw new Error("--title이 필요합니다.");

  switch (kind) {
    case "loop": {
      const type = flags.value("--type");
      if (!type || !isLoopType(type)) {
        throw new Error(`loop에는 --type이 필요합니다: ${LOOP_TYPES.join(" · ")} (받은 값: ${type ?? "(없음)"})`);
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
      if (!type) throw new Error("backlog에는 --type이 필요합니다. 열거로 막지 않으므로 관례를 따릅니다(예: design).");
      const made = makeBacklog(root, { title, slug: flags.value("--slug"), type, from: flags.value("--from"), now });
      return made2result(root, "backlog", made);
    }
    case "idea": {
      const kind = flags.value("--kind");
      if (!kind || !isIdeaKind(kind)) {
        throw new Error(`idea에는 --kind가 필요합니다: research · freememo · file (받은 값: ${kind ?? "(없음)"})`);
      }
      const made = makeIdea(root, { title, slug: flags.value("--slug"), kind, now });
      return made2result(root, "idea", made);
    }
    default:
      throw new Error(`make는 loop · milestone · generation · backlog · idea · hook · plan-source를 만듭니다: ${kind ?? "(없음)"}`);
  }
}

function mark(cwd: string, argv: string[]): Result {
  const [kind, needle, ...rest] = argv;
  const root = requireRoot(cwd);
  const flags = parseFlags(rest);

  if (kind === "loop") {
    if (!needle) throw new Error("표시할 loop의 id가 필요합니다.");
    if (flags.has("--aborted")) {
      const marked = markLoop(root, needle, "aborted", timestamp());
      return { ok: true, message: `기록을 지웠습니다: ${marked.id}`, data: marked };
    }
    if (!flags.has("--closed")) throw new Error("--closed · --aborted 중 하나가 필요합니다.");
    const marked = markLoop(root, needle, "closed", timestamp(), flags.values("--milestone"));
    return { ok: true, message: `닫았습니다: ${marked.id}\n  ${relative(root, marked.path)}`, data: marked };
  }

  if (kind === "generation") {
    if (!needle) throw new Error("표시할 generation의 id가 필요합니다.");
    if (flags.has("--aborted")) {
      const marked = markGeneration(root, needle, "aborted", timestamp());
      return { ok: true, message: `기록을 지웠습니다: ${marked.id}`, data: marked };
    }
    if (flags.has("--archived")) {
      const marked = markGeneration(root, needle, "archived", timestamp());
      return { ok: true, message: `옮겼습니다: ${marked.id}\n  ${relative(root, marked.path)}`, data: marked };
    }
    if (!flags.has("--closed")) throw new Error("--closed · --aborted · --archived 중 하나가 필요합니다.");
    const marked = markGeneration(root, needle, "closed", timestamp());
    return withHooks({ ok: true, message: `닫았습니다: ${marked.id}`, data: marked }, marked.hooks);
  }

  if (kind === "backlog") {
    if (!needle) throw new Error("표시할 backlog의 id가 필요합니다.");
    if (flags.has("--archived")) {
      const marked = markBacklog(root, needle, "archived");
      return { ok: true, message: `옮겼습니다: ${marked.id}\n  ${relative(root, marked.path)}`, data: marked };
    }
    if (!flags.has("--consumed")) throw new Error("--consumed · --archived 중 하나가 필요합니다.");
    const marked = markBacklog(root, needle, "consumed", flags.value("--by"));
    return { ok: true, message: `소비 표시했습니다: ${marked.id}`, data: marked };
  }

  if (kind === "idea") {
    if (!needle) throw new Error("표시할 idea의 id가 필요합니다.");
    if (!flags.has("--archived")) throw new Error("idea는 --archived만 받습니다.");
    const marked = markIdea(root, needle, "archived");
    return { ok: true, message: `옮겼습니다: ${marked.id}\n  ${relative(root, marked.path)}`, data: marked };
  }

  if (kind === "milestone") {
    if (!needle) throw new Error("표시할 milestone의 id가 필요합니다.");
    if (flags.has("--focus")) {
      const marked = markMilestone(root, needle, "focus", timestamp());
      return { ok: true, message: `초점을 맞췄습니다: ${marked.id}`, data: marked };
    }
    if (flags.has("--closed")) {
      const marked = markMilestone(root, needle, "closed", timestamp());
      return withHooks({ ok: true, message: `닫고 옮겼습니다: ${marked.id}\n  ${relative(root, marked.path)}`, data: marked }, marked.hooks);
    }
    throw new Error("--focus 또는 --closed가 필요합니다.");
  }

  throw new Error(`mark는 loop · generation · backlog · milestone · idea를 표시합니다: ${kind ?? "(없음)"}`);
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
    throw new Error("REAP 프로젝트가 아닙니다. 먼저 reap init을 실행합니다.");
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
    if (!arg) throw new Error("carrier new <slug>");
    return { ok: true, message: newCarrier(root, arg) };
  }
  if (sub === "list") {
    const flags = parseFlags([arg ?? "", ...rest].filter(Boolean));
    if (flags.has("--check")) {
      const problems = checkCarriers(root);
      if (problems.length === 0) return { ok: true, message: "표식에 문제가 없습니다." };
      return { ok: false, message: problems.map((p) => `${p.kind}: ${p.detail}`).join("\n"), data: problems };
    }
    const all = scanCarriers(root);
    const shown = flags.has("--orphans") ? orphans(all) : all;
    return { ok: true, message: formatCarriers(shown), data: shown };
  }
  throw new Error(`carrier는 new <slug> · list [--orphans|--check]입니다: ${sub ?? "(없음)"}`);
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
  if (!isValid(needle)) throw new Error(`seq는 계열(${kinds.join(" · ")}) 또는 id를 받습니다. 레지스트리가 없는 계열(backlog·idea)은 조회할 것이 없습니다: ${needle}`);
  const kind = kindOf(needle)!;
  const row = readRegistry(root, kind).find((r) => r.id === needle);
  if (!row) throw new Error(`레지스트리에 없습니다: ${needle}`);
  return { ok: true, message: `${row.id}  ${row.title}  ${row.createdAt}`, data: row };
}

/** 읽기만 한다. 규약 본문을 그대로 내는 이유는 agent가 그것을 읽고 소스를 파악하기 위해서다. */
function plan(cwd: string, argv: string[]): Result {
  const [sub, needle] = argv;
  const root = requireRoot(cwd);
  if (sub === "sources") return { ok: true, message: formatSources(readSources(root)), data: readSources(root) };
  if (sub === "convention") {
    if (!needle) throw new Error("plan convention <ps-id>");
    const source = findSource(root, needle);
    if (!source) throw new Error(`등록되지 않은 plan source입니다: ${needle}`);
    const path = join(paths(root).plan, source.convention);
    if (!existsSync(path)) throw new Error(`규약 문서가 없습니다: ${relative(root, path)}`);
    return { ok: true, message: readFileSync(path, "utf8"), data: source };
  }
  throw new Error(`plan은 sources · convention <ps-id>를 읽습니다: ${sub ?? "(없음)"}`);
}

function made2result(root: string, label: string, made: { id: string; path: string; hooks?: RunHooksResult }): Result {
  return withHooks(
    {
      ok: true,
      message: `${label} ${made.id}\n  ${relative(root, made.path)}`,
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
function withHooks(result: Result, hooks?: RunHooksResult): Result {
  if (!hooks) return result;
  const out: Result = { ...result };
  if (hooks.outputs.length > 0) {
    const block = hooks.outputs.flatMap((o) => [`[${o.file}]`, o.text]);
    out.message = `${result.message}\n\n--- hooks ---\n${block.join("\n")}`;
  }
  if (hooks.failures.length > 0) {
    out.stderr = hooks.failures.map((f) => `hook 실패: ${f.file} — ${f.reason}`).join("\n");
  }
  return out;
}

function requireRoot(cwd: string): string {
  const root = findRoot(cwd);
  if (!root) throw new Error("REAP 프로젝트가 아닙니다. 먼저 reap init을 실행합니다.");
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
      message: "이미 초기화되어 있습니다. 빠진 것만 채우려면 --force를 씁니다.",
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

  return {
    ok: true,
    message: created.length > 0
      ? `초기화했습니다: ${root}\n  ${created.join("\n  ")}`
      : `빠진 것이 없습니다: ${root}`,
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
      ? `씨앗인 채 남은 파일:\n  ${seeds.map((f) => `.reap/${f}`).join("\n  ")}`
      : "씨앗인 채 남은 파일이 없습니다.",
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
