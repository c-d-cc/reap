import { afterEach, expect, test } from "bun:test";
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { cleanupTempDirs, tempDir } from "./helpers.ts";
import { run } from "../src/cli.ts";
import { resolveLanguage, t } from "../src/i18n.ts";
import type { MessageKey } from "../src/i18n.ts";
import { en } from "../src/messages/en.ts";
import { ko } from "../src/messages/ko.ts";

afterEach(cleanupTempDirs);

async function project(): Promise<string> {
  const root = tempDir();
  await run(["init"], root);
  return root;
}

function setLanguage(root: string, language: string): void {
  writeFileSync(join(root, ".reap", "config.yml"), `language: ${language}\nagentClient: claude-code\nworkspaceId: x\n`);
}

test("en·ko 카탈로그의 키 집합이 같다 — 왕복 검증", () => {
  const enKeys = Object.keys(en).sort();
  const koKeys = Object.keys(ko).sort();
  expect(koKeys).toEqual(enKeys);
});

test("두 카탈로그 모두 값이 비어 있지 않다", () => {
  for (const [key, value] of Object.entries(en)) expect(value.length, `en.${key}`).toBeGreaterThan(0);
  for (const [key, value] of Object.entries(ko)) expect(value.length, `ko.${key}`).toBeGreaterThan(0);
});

test("t()가 {param} 자리를 채운다 — root가 null이면 en", () => {
  expect(t(null, "cli.unknown_command", { command: "nope" })).toBe("Unknown command: nope");
});

test("t()가 등록되지 않은 언어면 en으로 접는다 — 런타임에서도 키 이름을 그대로 내지 않는다", async () => {
  const root = await project();
  setLanguage(root, "fr");
  expect(t(root, "cli.bound", { id: "gen-0001-exec" })).toBe(en["cli.bound"].replace("{id}", "gen-0001-exec"));
});

test("존재하지 않는 키를 넣어도 조용히 키 이름을 내지 않는다 — en으로 접힌다", () => {
  const bogus = "no.such.key" as MessageKey;
  const result = t(null, bogus);
  expect(result).not.toBe(bogus);
  expect(result).toBeUndefined();
});

test("resolveLanguage — config.language가 있으면 그것을 따른다", async () => {
  const root = await project();
  setLanguage(root, "ko");
  expect(resolveLanguage(root)).toBe("ko");
  setLanguage(root, "en");
  expect(resolveLanguage(root)).toBe("en");
});

test("resolveLanguage — config.language가 없거나 비어 있으면 REAP_LANG을 따른다", async () => {
  const root = await project();
  setLanguage(root, "");
  expect(resolveLanguage(root, {})).toBe("en");
  expect(resolveLanguage(root, { REAP_LANG: "ko" })).toBe("ko");
});

test("resolveLanguage — root가 없으면 REAP_LANG, 그것도 없으면 en", () => {
  expect(resolveLanguage(null, {})).toBe("en");
  expect(resolveLanguage(null, { REAP_LANG: "ko" })).toBe("ko");
  expect(resolveLanguage(undefined, {})).toBe("en");
});

test("REAP_LANG=ko가 .reap 없이도 usage를 한국어로 낸다", async () => {
  const root = tempDir();
  const before = process.env.REAP_LANG;
  process.env.REAP_LANG = "ko";
  try {
    const result = await run(["--help"], root);
    expect(result.message.split("\n")[0]).toBe(ko["cli.usage"].split("\n")[0]);
  } finally {
    if (before === undefined) delete process.env.REAP_LANG;
    else process.env.REAP_LANG = before;
  }
});

test("REAP_LANG이 없고 .reap도 없으면 usage가 en이다", async () => {
  const root = tempDir();
  const before = process.env.REAP_LANG;
  delete process.env.REAP_LANG;
  try {
    const result = await run(["--help"], root);
    expect(result.message.split("\n")[0]).toBe(en["cli.usage"].split("\n")[0]);
  } finally {
    if (before !== undefined) process.env.REAP_LANG = before;
  }
});

test("초기화된 프로젝트는 config.language를 따른다 — REAP_LANG보다 우선", async () => {
  const root = await project();
  setLanguage(root, "en");
  const before = process.env.REAP_LANG;
  process.env.REAP_LANG = "ko";
  try {
    const result = await run(["--help"], root);
    expect(result.message.split("\n")[0]).toBe(en["cli.usage"].split("\n")[0]);
  } finally {
    if (before === undefined) delete process.env.REAP_LANG;
    else process.env.REAP_LANG = before;
  }
});
