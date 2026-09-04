import { existsSync } from "node:fs";
import { en } from "./messages/en.ts";
import { ko } from "./messages/ko.ts";
import type { MessageKey } from "./messages/en.ts";
import { paths, readConfig } from "./store.ts";

export type { MessageKey };

const CATALOGS: Record<string, Record<MessageKey, string>> = { en, ko };

/** 해석 순서: `config.language` → `REAP_LANG` → en. root가 없거나 config를 못 읽으면 config는 건너뛴다. */
export function resolveLanguage(root: string | null | undefined, env: NodeJS.ProcessEnv = process.env): string {
  if (root && existsSync(paths(root).config)) {
    const lang = readConfig(root).language;
    if (lang) return lang;
  }
  return env.REAP_LANG?.trim() || "en";
}

/**
 * 카탈로그 조회. `root`가 있으면 그 프로젝트의 `config.language`를 따르고, 없으면
 * `REAP_LANG` → en. 카탈로그에 없는 언어는 en으로 접는다. `params`는 `{name}` 자리를 채운다.
 */
export function t(root: string | null | undefined, key: MessageKey, params?: Record<string, string | number>): string {
  const lang = resolveLanguage(root);
  const catalog = CATALOGS[lang] ?? CATALOGS.en!;
  const text = catalog[key] ?? CATALOGS.en![key];
  return params ? substitute(text, params) : text;
}

function substitute(text: string, params: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (whole, name: string) => (name in params ? String(params[name]) : whole));
}
