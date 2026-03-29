import { describe, test, expect } from "bun:test";

describe("ImportResolver", () => {
  test("resolves TypeScript/JS relative import", async () => {
    const { resolveImports } = await import("../src/indexer/import-resolver.js");
    const source = `import { foo } from "./utils";\nimport { Bar } from "../models/bar";`;
    const result = resolveImports("src/index.ts", "typescript", source, ["src/utils.ts", "models/bar.ts"]);
    expect(result).toContainEqual({ from: "src/index.ts", to: "src/utils.ts", names: ["foo"] });
    expect(result).toContainEqual({ from: "src/index.ts", to: "models/bar.ts", names: ["Bar"] });
  });

  test("resolves Python import", async () => {
    const { resolveImports } = await import("../src/indexer/import-resolver.js");
    const source = `from .utils import helper\nimport models.user`;
    const result = resolveImports("src/main.py", "python", source, ["src/utils.py", "models/user.py"]);
    expect(result.length).toBeGreaterThanOrEqual(1);
  });

  test("ignores node_modules / external imports", async () => {
    const { resolveImports } = await import("../src/indexer/import-resolver.js");
    const source = `import express from "express";\nimport { foo } from "./local";`;
    const result = resolveImports("src/app.ts", "typescript", source, ["src/local.ts"]);
    expect(result).toHaveLength(1);
    expect(result[0].to).toBe("src/local.ts");
  });

  test("handles re-exports", async () => {
    const { resolveImports } = await import("../src/indexer/import-resolver.js");
    const source = `export { default } from "./module";`;
    const result = resolveImports("src/index.ts", "typescript", source, ["src/module.ts"]);
    expect(result).toHaveLength(1);
  });
});
