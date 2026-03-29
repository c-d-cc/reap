import { describe, test, expect, beforeAll, afterAll } from "bun:test";

describe("SymbolExtractor", () => {
  let extractor: any;

  beforeAll(async () => {
    const { SymbolExtractor } = await import("../src/indexer/parser.js");
    extractor = new SymbolExtractor();
    await extractor.init();
  });

  afterAll(() => {
    extractor?.dispose();
  });

  test("extracts function definition from TypeScript", async () => {
    const result = await extractor.extract("src/index.ts", "typescript",
      `export function createUser(name: string): User {\n  return { name };\n}`
    );
    const defs = result.definitions;
    expect(defs.length).toBeGreaterThanOrEqual(1);
    const fn = defs.find((d: any) => d.name === "createUser");
    expect(fn).toBeDefined();
    expect(fn.kind).toBe("function");
    expect(fn.line).toBe(1);
  });

  test("extracts class and method from TypeScript", async () => {
    const result = await extractor.extract("src/service.ts", "typescript",
      `class UserService {\n  getUser(id: number): User { return {} as User; }\n}`
    );
    const cls = result.definitions.find((d: any) => d.name === "UserService");
    expect(cls).toBeDefined();
    expect(cls.kind).toBe("class");
    const method = result.definitions.find((d: any) => d.name === "getUser");
    expect(method).toBeDefined();
    expect(method.kind).toBe("method");
  });

  test("extracts interface and type from TypeScript", async () => {
    const result = await extractor.extract("src/types.ts", "typescript",
      `interface User { name: string; }\ntype Status = "active" | "inactive";`
    );
    const iface = result.definitions.find((d: any) => d.name === "User");
    expect(iface).toBeDefined();
    expect(iface.kind).toBe("interface");
    const type = result.definitions.find((d: any) => d.name === "Status");
    expect(type).toBeDefined();
    expect(type.kind).toBe("type");
  });

  test("extracts references", async () => {
    const result = await extractor.extract("src/main.ts", "typescript",
      `const svc = new UserService();\nconst user: User = svc.getUser(1);`
    );
    expect(result.references.length).toBeGreaterThanOrEqual(1);
    const ref = result.references.find((r: any) => r.name === "UserService");
    expect(ref).toBeDefined();
  });

  test("extracts Python function and class", async () => {
    const result = await extractor.extract("main.py", "python",
      `class Processor:\n    def process(self, data):\n        pass\n\ndef main():\n    p = Processor()\n    p.process([])`
    );
    const cls = result.definitions.find((d: any) => d.name === "Processor");
    expect(cls).toBeDefined();
    const fn = result.definitions.find((d: any) => d.name === "main");
    expect(fn).toBeDefined();
  });

  test("returns empty for unsupported content", async () => {
    const result = await extractor.extract("data.txt", "typescript", "just some text");
    expect(result.definitions).toBeDefined();
    expect(result.references).toBeDefined();
  });
});
