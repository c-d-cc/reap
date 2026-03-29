import { describe, test, expect } from "bun:test";

describe("languages", () => {
  test("detects TypeScript from .ts extension", async () => {
    const { detectLanguage } = await import("../src/indexer/languages.js");
    expect(detectLanguage("src/index.ts")).toBe("typescript");
  });

  test("detects Python from .py extension", async () => {
    const { detectLanguage } = await import("../src/indexer/languages.js");
    expect(detectLanguage("main.py")).toBe("python");
  });

  test("detects TSX from .tsx extension", async () => {
    const { detectLanguage } = await import("../src/indexer/languages.js");
    expect(detectLanguage("App.tsx")).toBe("tsx");
  });

  test("returns null for unknown extension", async () => {
    const { detectLanguage } = await import("../src/indexer/languages.js");
    expect(detectLanguage("data.csv")).toBeNull();
  });

  test("getLanguageConfig returns config with wasmFile and queryFile", async () => {
    const { getLanguageConfig } = await import("../src/indexer/languages.js");
    const config = getLanguageConfig("typescript");
    expect(config).not.toBeNull();
    expect(config!.wasmFile).toContain("tree-sitter-typescript.wasm");
    expect(config!.queryFile).toContain("typescript-tags.scm");
  });

  test("supportedLanguages returns all supported languages", async () => {
    const { supportedLanguages } = await import("../src/indexer/languages.js");
    const langs = supportedLanguages();
    expect(langs).toContain("typescript");
    expect(langs).toContain("python");
    expect(langs).toContain("go");
    expect(langs).toContain("rust");
    expect(langs.length).toBeGreaterThanOrEqual(14);
  });
});
