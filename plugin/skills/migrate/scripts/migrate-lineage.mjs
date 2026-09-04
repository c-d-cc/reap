#!/usr/bin/env node
// migrate-lineage — v0.17 lineage(46세대 + pre-reap-history)를 v0.18 archive/generations/로 승계한다.
// 의존 없음. 인자: <project-root> [--dry-run]
//
// - .reap-v0_17/lineage/<v0.17 gen 항목> → .reap/archive/generations/gen-0NNN-exec-<slug>.md
// - .reap-v0_17/lineage/pre-reap-history.md → gen-0000-exec-pre-reap-history.md
// - .reap/sequence/generation.md에 행을 append (append-only, 이미 있는 id는 건너뛴다)
// - startCommit·endCommit은 쓰지 않는다 — 모르는 커밋 해시를 지어내지 않는다
//
// 재실행 안전: sequence/generation.md에 이미 있는 id는 다시 만들지 않는다.

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync, appendFileSync } from "node:fs";
import { join, basename } from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const root = args.find((a) => !a.startsWith("--"));
if (!root) {
  console.error("usage: migrate-lineage.mjs <project-root> [--dry-run]");
  process.exit(1);
}

const lineageDir = join(root, ".reap-v0_17", "lineage");
const archiveGenDir = join(root, ".reap", "archive", "generations");
const registryPath = join(root, ".reap", "sequence", "generation.md");

if (!existsSync(lineageDir)) {
  console.error(`lineage 없음: ${lineageDir}`);
  process.exit(1);
}

// ── YAML(meta.yml/frontmatter) 최소 파서 — 이 데이터가 실제로 쓰는 모양만 다룬다 ──
// top-level 스칼라(quoted 여러 줄 folding 포함), 블록(중첩 매핑) 추출.

function isClosedQuote(s, q) {
  if (!s.endsWith(q)) return false;
  let i = s.length - 2, backslashes = 0;
  while (i >= 0 && s[i] === "\\") { backslashes++; i--; }
  return backslashes % 2 === 0;
}

// idx 줄의 `key: <rest>`에서 스칼라 값을 읽는다. quoted면 닫는 따옴표가 나올 때까지
// 다음 줄들을 trim해 스페이스로 접는다(YAML double-quoted scalar folding과 같은 동작).
function readScalar(lines, idx) {
  const line = lines[idx];
  const m = /^\s*[A-Za-z0-9_]+:[ \t]?(.*)$/.exec(line);
  if (!m) return { value: null, next: idx + 1 };
  const rest = m[1];
  if (rest === "") return { value: "", next: idx + 1 }; // 블록 값 — 호출부가 따로 처리
  const q = rest[0];
  if (q === '"' || q === "'") {
    let buf = rest.slice(1);
    let j = idx;
    while (!isClosedQuote(buf, q) && j + 1 < lines.length) {
      j++;
      buf += ` ${lines[j].trim()}`;
    }
    if (isClosedQuote(buf, q)) buf = buf.slice(0, -1);
    const value = q === '"' ? buf.replace(/\\"/g, '"').replace(/\\\\/g, "\\") : buf.replace(/''/g, "'");
    return { value, next: j + 1 };
  }
  return { value: rest.trim(), next: idx + 1 };
}

// 들여쓰기 없는(top-level) key만 찾는다 — 중첩된 같은 이름 키와 혼동하지 않기 위해.
function getTopField(text, key) {
  const lines = text.split("\n");
  const idx = lines.findIndex((l) => new RegExp(`^${key}:`).test(l));
  if (idx < 0) return null;
  const { value } = readScalar(lines, idx);
  return value || null;
}

// `key:`로 시작해 값이 비어 있는 줄(블록 헤더) 다음부터, 들여쓰기 없는 줄이 나오기 전까지를 블록으로 본다.
function getBlock(text, key) {
  const lines = text.split("\n");
  const startIdx = lines.findIndex((l) => new RegExp(`^${key}:\\s*$`).test(l));
  if (startIdx < 0) return null;
  let end = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (/^\S/.test(lines[i])) { end = i; break; }
  }
  return lines.slice(startIdx + 1, end);
}

function getFieldInBlock(block, key) {
  if (!block) return null;
  const idx = block.findIndex((l) => new RegExp(`^\\s*${key}:`).test(l));
  if (idx < 0) return null;
  const { value } = readScalar(block, idx);
  return value || null;
}

function getTimelineAts(text) {
  const block = getBlock(text, "timeline");
  if (!block) return [];
  const ats = [];
  for (const l of block) {
    const m = /^\s*at:\s*(\S+)/.exec(l);
    if (m) ats.push(m[1]);
  }
  return ats;
}

function firstBodyDate(text) {
  const m = /\d{4}-\d{2}-\d{2}/.exec(text);
  return m ? `${m[0]}T00:00:00Z` : null;
}

// ── frontmatter/body 분리 (single-file 형식용) ──
function splitFrontmatter(text) {
  const lines = text.split("\n");
  if (lines[0] !== "---") return { meta: "", body: text };
  const closeIdx = lines.findIndex((l, i) => i > 0 && l === "---");
  if (closeIdx < 0) return { meta: "", body: text };
  return { meta: lines.slice(1, closeIdx).join("\n"), body: lines.slice(closeIdx + 1).join("\n") };
}

// 본문의 첫 `# 제목` 줄을 찾아 `## 제목`으로 한 단계 내린다. 그 줄이 없으면 그대로 둔다.
function demoteFirstHeading(text) {
  const lines = text.split("\n");
  const idx = lines.findIndex((l) => /^# /.test(l));
  if (idx < 0) return { text, heading: null };
  const heading = lines[idx].slice(2).trim();
  lines[idx] = `#${lines[idx]}`;
  return { text: lines.join("\n"), heading };
}

// ── 레지스트리(sequence/generation.md) — id.ts와 같은 형식 ──
function escapeCell(text) {
  return text.replaceAll("&", "&amp;").replaceAll("|", "&#124;").replaceAll("\r\n", "&#10;").replaceAll("\n", "&#10;");
}

function readExistingRegistryIds(path) {
  if (!existsSync(path)) return new Set();
  const ids = new Set();
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const t = line.trim();
    if (!t.startsWith("|")) continue;
    const cells = t.slice(1, t.endsWith("|") ? -1 : undefined).split("|");
    if (cells.length < 3) continue;
    const id = cells[0].trim();
    if (/^gen-\d{4,}-(?:plan|exec|fix)$/.test(id)) ids.add(id);
  }
  return ids;
}

// ── frontmatter 문서 조립 (형식은 doc.ts formatDoc과 같다) ──
function scalar(value) {
  const text = String(value);
  return /^[\s]|[\s]$|^["'#]|:\s/.test(text) ? JSON.stringify(text) : text;
}

function formatDoc(data, body) {
  const lines = [];
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;
    lines.push(`${key}: ${scalar(value)}`);
  }
  return `---\n${lines.map((l) => `${l}\n`).join("")}---\n> Migrated from REAP v0.17 lineage. Paths and commands in this record are as they were then.\n\n${body}`;
}

// ── slug — 파일명에서 뽑는다 (원본에 slug 필드가 없다. gen-NNN-hash- 접두부를 뗀 나머지가 원본 slug다) ──
const ENTRY_RE = /^gen-(\d{3})-([0-9a-f]{6})-(.+)$/;

function collectSourceEntries() {
  const names = readdirSync(lineageDir).sort();
  const entries = [];
  for (const name of names) {
    if (name === "pre-reap-history.md") continue; // 별도 처리
    const full = join(lineageDir, name);
    const isDir = statSync(full).isDirectory();
    const stem = isDir ? name : name.replace(/\.md$/, "");
    const m = ENTRY_RE.exec(stem);
    if (!m) {
      warnings.push(`인식 못한 lineage 항목 — 건너뜀: ${name}`);
      continue;
    }
    const [, num, hash, slug] = m;
    entries.push({ name, full, isDir, num: Number(num), hash, slug });
  }
  entries.sort((a, b) => a.num - b.num);
  return entries;
}

const warnings = [];

function buildSingleFileEntry(entry) {
  const raw = readFileSync(entry.full, "utf8");
  const { meta, body } = splitFrontmatter(raw);
  let title = getTopField(meta, "goal");
  const { text: demotedBody, heading } = demoteFirstHeading(body);
  if (!title) {
    title = heading;
    if (title) warnings.push(`${entry.name}: goal 없음 — 본문 첫 # 제목으로 대체(${title})`);
  }
  if (!title) {
    title = entry.slug.replace(/-/g, " ");
    warnings.push(`${entry.name}: 제목을 못 찾음 — slug로 대체`);
  }
  const startedAt = firstBodyDate(raw);
  if (!startedAt) warnings.push(`${entry.name}: startedAt을 찾지 못함 — 생략`);
  return { title, startedAt, closedAt: null, body: demotedBody.replace(/^\n+/, "") };
}

function buildDirectoryEntry(entry) {
  const metaPath = join(entry.full, "meta.yml");
  const meta = existsSync(metaPath) ? readFileSync(metaPath, "utf8") : "";
  let title = getTopField(meta, "goal");

  const stages = ["01-learning.md", "02-planning.md", "03-implementation.md", "04-validation.md", "05-completion.md"];
  const parts = [];
  let firstHeading = null;
  for (const stage of stages) {
    const p = join(entry.full, stage);
    if (!existsSync(p)) continue;
    const { text, heading } = demoteFirstHeading(readFileSync(p, "utf8").replace(/\n+$/, ""));
    if (firstHeading === null && heading) firstHeading = heading;
    parts.push(text);
  }
  if (!title) {
    title = firstHeading;
    if (title) warnings.push(`${entry.name}: goal 없음 — 01-learning.md 첫 # 제목으로 대체(${title})`);
  }
  if (!title) {
    title = entry.slug.replace(/-/g, " ");
    warnings.push(`${entry.name}: 제목을 못 찾음 — slug로 대체`);
  }

  const ats = getTimelineAts(meta);
  const startedAt = ats.length > 0 ? ats[0] : null;
  const fitnessBlock = getBlock(meta, "fitnessFeedback");
  const fitnessText = getFieldInBlock(fitnessBlock, "text");
  const fitnessEvaluatedAt = getFieldInBlock(fitnessBlock, "evaluatedAt");
  const closedAt = ats.length > 0 ? ats[ats.length - 1] : fitnessEvaluatedAt;
  if (!startedAt) warnings.push(`${entry.name}: startedAt(timeline)을 찾지 못함 — 생략`);
  if (!closedAt) warnings.push(`${entry.name}: closedAt(timeline/fitnessFeedback)을 찾지 못함 — 생략`);

  if (fitnessText) parts.push(`## Fitness\n\n${fitnessText}`);

  const backlogDir = join(entry.full, "backlog");
  if (existsSync(backlogDir) && statSync(backlogDir).isDirectory()) {
    const files = readdirSync(backlogDir).filter((n) => n.endsWith(".md")).sort();
    if (files.length > 0) {
      const consumed = files.map((f) => readFileSync(join(backlogDir, f), "utf8").trim()).join("\n\n---\n\n");
      parts.push(`## Consumed backlog\n\n${consumed}`);
    }
  }

  return { title, startedAt, closedAt, body: parts.join("\n\n") };
}

function buildPreReapHistory() {
  const p = join(lineageDir, "pre-reap-history.md");
  if (!existsSync(p)) return null;
  const raw = readFileSync(p, "utf8");
  const startedAt = firstBodyDate(raw);
  if (!startedAt) warnings.push("pre-reap-history.md: startedAt을 찾지 못함 — 생략");
  const { text: body } = demoteFirstHeading(raw.replace(/\n+$/, ""));
  return {
    id: "gen-0000-exec",
    slug: "pre-reap-history",
    title: "REAP 이전 구현 이력",
    startedAt,
    closedAt: null,
    body,
    migratedFrom: ".reap-v0_17/lineage/pre-reap-history.md",
  };
}

// ── 실행 ──
mkdirSync(archiveGenDir, { recursive: true });
mkdirSync(join(root, ".reap", "sequence"), { recursive: true });

const existingIds = readExistingRegistryIds(registryPath);
const sourceEntries = collectSourceEntries();

const toWrite = [];
const preHistory = buildPreReapHistory();
if (preHistory) toWrite.push(preHistory);

for (const entry of sourceEntries) {
  const id = `gen-${String(entry.num).padStart(4, "0")}-exec`;
  const built = entry.isDir ? buildDirectoryEntry(entry) : buildSingleFileEntry(entry);
  toWrite.push({
    id,
    slug: entry.slug,
    title: built.title,
    startedAt: built.startedAt,
    closedAt: built.closedAt,
    body: built.body,
    migratedFrom: `.reap-v0_17/lineage/${entry.name}`,
  });
}

let moved = 0;
let skipped = 0;
const registryRows = [];

for (const item of toWrite) {
  if (existingIds.has(item.id)) {
    skipped++;
    continue;
  }
  const data = {
    id: item.id,
    slug: item.slug,
    type: "exec",
    title: item.title,
    startedAt: item.startedAt,
    closedAt: item.closedAt,
    status: "closed",
    migratedFrom: item.migratedFrom,
  };
  const fileName = `${item.id}-${item.slug}.md`;
  const filePath = join(archiveGenDir, fileName);
  const content = formatDoc(data, item.body.endsWith("\n") ? item.body : `${item.body}\n`);
  const dateCol = (item.closedAt || item.startedAt || "").slice(0, 10);
  registryRows.push(`| ${item.id} | ${escapeCell(item.title)} | ${dateCol} |\n`);
  if (!dryRun) {
    writeFileSync(filePath, content);
  }
  moved++;
}

if (!dryRun && registryRows.length > 0) {
  if (!existsSync(registryPath)) {
    const header = "<!-- reap:sequence(generation) — append only. 발급된 번호는 다시 발급되지 않는다. -->\n| id | title | createdAt |\n|---|---|---|\n";
    writeFileSync(registryPath, header);
  }
  let current = readFileSync(registryPath, "utf8");
  if (!current.endsWith("\n")) current += "\n";
  writeFileSync(registryPath, current);
  appendFileSync(registryPath, registryRows.join(""));
}

// 다음 번호 — 방금 쓴 것 포함, 등록된 gen 중 가장 큰 번호 + 1
const allIds = new Set([...existingIds, ...toWrite.map((i) => i.id)]);
let maxNum = 0;
for (const id of allIds) {
  const n = Number.parseInt(id.slice(4, 8), 10);
  if (!Number.isNaN(n)) maxNum = Math.max(maxNum, n);
}
const nextId = `gen-${String(maxNum + 1).padStart(4, "0")}`;

console.log(`옮긴 개수: ${moved}`);
console.log(`건너뛴 개수(이미 레지스트리에 있음): ${skipped}`);
console.log(`다음 세대 번호: ${nextId}`);
if (warnings.length > 0) {
  console.log(`경고 ${warnings.length}건:`);
  for (const w of warnings) console.log(`  - ${w}`);
} else {
  console.log("경고 없음");
}
if (dryRun) console.log("(--dry-run: 파일을 쓰지 않았다)");
