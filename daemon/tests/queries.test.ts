import { describe, test, expect } from "bun:test";
import { readFileSync, existsSync } from "fs";
import { supportedLanguages, getLanguageConfig } from "../src/indexer/languages.js";

describe("query files", () => {
  for (const lang of supportedLanguages()) {
    test(`${lang} query file exists and is valid SCM`, () => {
      const config = getLanguageConfig(lang)!;
      expect(existsSync(config.queryFile)).toBe(true);
      const content = readFileSync(config.queryFile, "utf-8");
      expect(content.length).toBeGreaterThan(0);
      expect(content).toContain("@name.definition.");
    });
  }
});
