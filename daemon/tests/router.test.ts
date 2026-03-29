import { describe, test, expect } from "bun:test";

describe("Router", () => {
  test("matches exact path", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    let called = false;
    router.get("/health", async () => {
      called = true;
      return { status: "ok" as const, data: "healthy" };
    });
    const result = await router.handle("GET", "/health");
    expect(called).toBe(true);
    expect(result).toEqual({ status: "ok", data: "healthy" });
  });

  test("matches path with params", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    let capturedParams: Record<string, string> = {};
    router.get("/projects/:id", async (params) => {
      capturedParams = params;
      return { status: "ok" as const, data: params.id };
    });
    const result = await router.handle("GET", "/projects/proj-abc123");
    expect(capturedParams.id).toBe("proj-abc123");
  });

  test("matches POST method", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    let receivedBody = null;
    router.post("/projects/register", async (_params, body) => {
      receivedBody = body;
      return { status: "ok" as const, data: "registered" };
    });
    const result = await router.handle("POST", "/projects/register", { path: "/test" });
    expect(receivedBody).toEqual({ path: "/test" });
  });

  test("returns 404 for unmatched route", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    const result = await router.handle("GET", "/nonexistent");
    expect(result).toEqual({ status: "error", error: "Not found: GET /nonexistent" });
  });

  test("returns 404 for wrong method", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    router.get("/health", async () => ({ status: "ok" as const, data: null }));
    const result = await router.handle("POST", "/health");
    expect(result).toEqual({ status: "error", error: "Not found: POST /health" });
  });

  test("parses query string", async () => {
    const { Router } = await import("../src/router.js");
    const router = new Router();
    let capturedQuery: Record<string, string> = {};
    router.get("/projects/:id/symbols", async (params, _body, query) => {
      capturedQuery = query;
      return { status: "ok" as const, data: null };
    });
    await router.handle("GET", "/projects/proj-abc/symbols?q=foo&type=function");
    expect(capturedQuery.q).toBe("foo");
    expect(capturedQuery.type).toBe("function");
  });
});
