import { createPaths } from "../../core/paths.js";
import { emitOutput, emitError } from "../../core/output.js";
import { readAll, readRegistry, lookup, parseId, parseHashedId } from "../../core/sequence.js";
import { SEQUENCED_TYPES, type SequencedType } from "../../types/index.js";

/**
 * Read the identity registry — `reap sequence [type|id]`.
 *
 * This is what makes an opaque reference legible: `ds-007` in a memory's `to:`
 * is a lookup away from its title, so a reader is never stuck with a number.
 */
export async function execute(arg?: string): Promise<void> {
  const paths = createPaths(process.cwd());

  // A hashed id has no registry row by design — the item itself is the record.
  if (arg && parseHashedId(arg)) {
    emitOutput({
      status: "ok",
      command: "sequence",
      context: { id: arg, hashed: true },
      message: `${arg} is a hashed id — it has no registry row. Look for it in life/backlog/ or lineage/ (the frontmatter carries it).`,
    });
    return;
  }

  if (arg && parseId(arg)) {
    const entry = await lookup(paths.sequence, arg);
    if (!entry) emitError("sequence", `No registry entry for '${arg}'.`);
    emitOutput({
      status: "ok",
      command: "sequence",
      context: { entry },
      message: `${entry!.id} — ${entry!.title} (${entry!.createdAt})`,
    });
    return;
  }

  if (arg) {
    if (!SEQUENCED_TYPES.includes(arg as SequencedType)) {
      emitError("sequence", `'${arg}' has no registry. Numbered kinds: ${SEQUENCED_TYPES.join(", ")}. A backlog id is hashed and lives only in the item.`);
    }
    const entries = await readRegistry(paths.sequence, arg as SequencedType);
    emitOutput({
      status: "ok",
      command: "sequence",
      context: { type: arg, entries },
      message: entries.length
        ? entries.map((e) => `  ${e.id} — ${e.title}`).join("\n")
        : `No ${arg} ids yet.`,
    });
    return;
  }

  const all = await readAll(paths.sequence);
  const lines: string[] = [];
  const context: Record<string, unknown> = {};
  for (const [type, entries] of all) {
    context[type] = entries;
    if (entries.length === 0) continue;
    lines.push(`${type} (${entries.length}):`);
    for (const e of entries) lines.push(`  ${e.id} — ${e.title}`);
  }

  emitOutput({
    status: "ok",
    command: "sequence",
    context,
    message: lines.length ? lines.join("\n") : "No ids assigned yet.",
  });
}
