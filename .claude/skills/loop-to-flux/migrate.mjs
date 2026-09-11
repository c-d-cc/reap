#!/usr/bin/env node
// loop → flux. 무엇을 바꿀지 보이고, --apply 를 줬을 때만 바꾼다.
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, mkdirSync, rmdirSync } from "node:fs";
import { join, dirname } from "node:path";

const root = process.argv.find((a) => a.startsWith("--root="))?.slice(7) ?? process.cwd();
const apply = process.argv.includes("--apply");
const reap = join(root, ".reap");
if (!existsSync(reap)) { console.error(`.reap/ 가 없다: ${root}`); process.exit(1); }

/** id는 참조의 키다. 이것을 안 바꾸면 가리키던 것이 전부 끊긴 참조가 된다. */
const ID = /\bloop-(\d{4,}-(?:plan|design|uiux|idea))\b/g;

function rewrite(text) {
  return text
    .replace(ID, "flux-$1")
    .replace(/life\/loops\//g, "life/flux/")
    .replace(/archive\/loops\//g, "archive/flux/")
    .replace(/sequence\/loop\.md/g, "sequence/flux.md")
    .replace(/reap:sequence\(loop\)/g, "reap:sequence(flux)")
    .replace(/\bmake loop\b/g, "make flux")
    .replace(/\bmark loop\b/g, "mark flux")
    .replace(/\/reap:loop\b/g, "/reap:flux");
}

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

const moves = [];
for (const [from, to] of [["life/loops", "life/flux"], ["archive/loops", "archive/flux"]]) {
  if (!existsSync(join(reap, from))) continue;
  for (const name of readdirSync(join(reap, from))) {
    if (name.endsWith(".md")) moves.push([join(from, name), join(to, name.replace(/^loop-/, "flux-"))]);
  }
}
if (existsSync(join(reap, "sequence/loop.md"))) moves.push(["sequence/loop.md", "sequence/flux.md"]);

const edits = walk(reap)
  .filter((p) => p.endsWith(".md"))
  .map((p) => [p, readFileSync(p, "utf8")])
  .filter(([, before]) => rewrite(before) !== before)
  .map(([p]) => p.slice(reap.length + 1));

console.log(`대상: ${root}\n`);
console.log(`옮길 것 ${moves.length}`);
for (const [f, t] of moves) console.log(`  ${f}  →  ${t}`);
console.log(`\n고칠 것 ${edits.length} — 기록 안의 loop id와 경로, make/mark loop`);
for (const p of edits) console.log(`  ${p}`);

if (!apply) {
  console.log(`\n적용하지 않았다. 위가 맞으면 같은 명령에 --apply 를 붙인다.`);
  process.exit(0);
}

for (const p of walk(reap)) {
  if (!p.endsWith(".md")) continue;
  const before = readFileSync(p, "utf8");
  const after = rewrite(before);
  if (after !== before) writeFileSync(p, after);
}
for (const [f, t] of moves) {
  const dest = join(reap, t);
  mkdirSync(dirname(dest), { recursive: true });
  renameSync(join(reap, f), dest);
}
// 빈 껍데기는 남기지 않는다. .gitkeep 하나만 남은 것도 비어 있는 것으로 본다
for (const d of ["life/loops", "archive/loops"]) {
  const p = join(reap, d);
  if (!existsSync(p)) continue;
  const rest = readdirSync(p);
  if (rest.length === 1 && rest[0] === ".gitkeep") { rmSync(join(p, ".gitkeep")); rest.pop(); }
  if (rest.length === 0) rmdirSync(p);
}
console.log(`\n적용했다. reap doctor 로 확인한다.`);
