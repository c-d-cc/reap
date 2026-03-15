import { describe, test, expect, beforeAll } from "bun:test";
import { Database } from "bun:sqlite";
import { createDb } from "../server/db/index";
import { runMigrations } from "../server/db/migrate";
import { createApp } from "../server/index";

let app: ReturnType<typeof createApp>;
let token: string;
let itemId: number;

beforeAll(() => {
  const sqlite = new Database(":memory:");
  const db = createDb(sqlite);
  runMigrations(db);
  app = createApp(db);
});

function req(method: string, path: string, body?: unknown, authToken?: string) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  const init: RequestInit = { method, headers };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return app.request(path, init);
}

describe("Auth", () => {
  test("POST /api/auth/sign-up creates a user", async () => {
    const res = await req("POST", "/api/auth/sign-up", {
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    });
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.token).toBeDefined();
    expect(json.data.user.email).toBe("test@example.com");
    expect(json.data.user.name).toBe("Test User");
    expect(json.data.user.id).toBeDefined();
    token = json.data.token;
  });

  test("POST /api/auth/sign-up rejects duplicate email", async () => {
    const res = await req("POST", "/api/auth/sign-up", {
      email: "test@example.com",
      password: "password123",
      name: "Another User",
    });
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  test("POST /api/auth/sign-in authenticates user", async () => {
    const res = await req("POST", "/api/auth/sign-in", {
      email: "test@example.com",
      password: "password123",
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.token).toBeDefined();
    expect(json.data.user.email).toBe("test@example.com");
    token = json.data.token;
  });

  test("POST /api/auth/sign-in rejects wrong password", async () => {
    const res = await req("POST", "/api/auth/sign-in", {
      email: "test@example.com",
      password: "wrongpassword",
    });
    expect(res.status).toBe(401);
  });
});

describe("Units", () => {
  test("GET /api/units lists seeded units without auth", async () => {
    const res = await req("GET", "/api/units");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBeGreaterThanOrEqual(5);
    const names = json.data.map((u: { name: string }) => u.name);
    expect(names).toContain("EA");
    expect(names).toContain("BOX");
    expect(names).toContain("KG");
  });

  test("POST /api/units creates a unit", async () => {
    const res = await req(
      "POST",
      "/api/units",
      { name: "PCS", label: "피스" },
      token
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.name).toBe("PCS");
    expect(json.data.label).toBe("피스");
  });

  test("POST /api/units rejects duplicate name", async () => {
    const res = await req(
      "POST",
      "/api/units",
      { name: "EA", label: "개" },
      token
    );
    expect(res.status).toBe(409);
  });

  test("DELETE /api/units/:id deletes unused unit", async () => {
    // Create a unit to delete
    const createRes = await req(
      "POST",
      "/api/units",
      { name: "TEMP", label: "임시" },
      token
    );
    const unitId = (await createRes.json()).data.id;

    const res = await req("DELETE", `/api/units/${unitId}`, undefined, token);
    expect(res.status).toBe(200);
    expect((await res.json()).data.success).toBe(true);
  });

  test("DELETE /api/units/:id rejects deletion of unit used by items", async () => {
    // First create an item using EA unit
    const itemRes = await req(
      "POST",
      "/api/items",
      { name: "Unit Test Item", sku: "UTI-001", unit: "EA", unitPrice: 10 },
      token
    );
    expect(itemRes.status).toBe(201);

    // Find the EA unit id
    const unitsRes = await req("GET", "/api/units");
    const unitsJson = await unitsRes.json();
    const eaUnit = unitsJson.data.find((u: { name: string }) => u.name === "EA");

    const res = await req("DELETE", `/api/units/${eaUnit.id}`, undefined, token);
    expect(res.status).toBe(409);
  });
});

describe("Categories", () => {
  test("GET /api/categories lists categories without auth", async () => {
    const res = await req("GET", "/api/categories");
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.data)).toBe(true);
  });

  test("POST /api/categories creates a category", async () => {
    const res = await req(
      "POST",
      "/api/categories",
      { name: "electronics" },
      token
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.name).toBe("electronics");
  });

  test("POST /api/categories rejects duplicate name", async () => {
    const res = await req(
      "POST",
      "/api/categories",
      { name: "electronics" },
      token
    );
    expect(res.status).toBe(409);
  });

  test("DELETE /api/categories/:id deletes unused category", async () => {
    const createRes = await req(
      "POST",
      "/api/categories",
      { name: "temp-cat" },
      token
    );
    const catId = (await createRes.json()).data.id;

    const res = await req("DELETE", `/api/categories/${catId}`, undefined, token);
    expect(res.status).toBe(200);
    expect((await res.json()).data.success).toBe(true);
  });
});

describe("Items", () => {
  test("POST /api/items creates an item with unit", async () => {
    const res = await req(
      "POST",
      "/api/items",
      {
        name: "Widget A",
        sku: "WDG-001",
        category: "widgets",
        unit: "BOX",
        unitPrice: 9.99,
      },
      token
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.name).toBe("Widget A");
    expect(json.data.sku).toBe("WDG-001");
    expect(json.data.unit).toBe("BOX");
    expect(json.data.currentStock).toBe(0);
    expect(json.data.unitPrice).toBe(9.99);
    itemId = json.data.id;
  });

  test("POST /api/items rejects duplicate SKU", async () => {
    const res = await req(
      "POST",
      "/api/items",
      {
        name: "Widget B",
        sku: "WDG-001",
      },
      token
    );
    expect(res.status).toBe(409);
  });

  test("POST /api/items requires auth", async () => {
    const res = await req("POST", "/api/items", {
      name: "No Auth",
      sku: "NA-001",
    });
    expect(res.status).toBe(401);
  });

  test("GET /api/items lists items", async () => {
    const res = await req("GET", "/api/items", undefined, token);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.items.length).toBeGreaterThanOrEqual(1);
    expect(json.data.total).toBeGreaterThanOrEqual(1);
    expect(json.data.page).toBe(1);
    expect(json.data.limit).toBe(20);
  });

  test("GET /api/items supports search", async () => {
    const res = await req("GET", "/api/items?q=Widget", undefined, token);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.items.length).toBeGreaterThanOrEqual(1);
  });

  test("GET /api/items/:id returns single item with currentStock", async () => {
    const res = await req("GET", `/api/items/${itemId}`, undefined, token);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.id).toBe(itemId);
    expect(json.data.name).toBe("Widget A");
    expect(json.data.currentStock).toBeDefined();
  });

  test("PUT /api/items/:id updates an item", async () => {
    const res = await req(
      "PUT",
      `/api/items/${itemId}`,
      { name: "Widget A Updated", unit: "KG" },
      token
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.name).toBe("Widget A Updated");
    expect(json.data.unit).toBe("KG");
  });

  test("DELETE /api/items/:id soft-deletes an item", async () => {
    const res = await req("DELETE", `/api/items/${itemId}`, undefined, token);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.success).toBe(true);

    // Verify it's gone from list
    const listRes = await req("GET", "/api/items", undefined, token);
    const listJson = await listRes.json();
    const found = listJson.data.items.find((i: { id: number }) => i.id === itemId);
    expect(found).toBeUndefined();
  });

  test("GET /api/items/:id returns 404 for deleted item", async () => {
    const res = await req("GET", `/api/items/${itemId}`, undefined, token);
    expect(res.status).toBe(404);
  });
});

describe("Transactions", () => {
  let txItemId: number;

  test("create item for transaction tests", async () => {
    const res = await req(
      "POST",
      "/api/items",
      {
        name: "Transaction Item",
        sku: "TX-001",
        category: "widgets",
        unit: "EA",
        unitPrice: 25.0,
      },
      token
    );
    expect(res.status).toBe(201);
    txItemId = (await res.json()).data.id;
  });

  test("POST /api/items/:id/transactions creates an 'in' transaction", async () => {
    const res = await req(
      "POST",
      `/api/items/${txItemId}/transactions`,
      { type: "in", quantity: 100, memo: "Initial stock" },
      token
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.type).toBe("in");
    expect(json.data.quantity).toBe(100);
    expect(json.data.memo).toBe("Initial stock");
  });

  test("Stock reflects 'in' transaction", async () => {
    const res = await req("GET", `/api/items/${txItemId}`, undefined, token);
    const json = await res.json();
    expect(json.data.currentStock).toBe(100);
  });

  test("POST /api/items/:id/transactions creates an 'out' transaction", async () => {
    const res = await req(
      "POST",
      `/api/items/${txItemId}/transactions`,
      { type: "out", quantity: 30, memo: "Sold" },
      token
    );
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.data.type).toBe("out");
    expect(json.data.quantity).toBe(30);
  });

  test("Stock calculation: in - out", async () => {
    const res = await req("GET", `/api/items/${txItemId}`, undefined, token);
    const json = await res.json();
    expect(json.data.currentStock).toBe(70);
  });

  test("Rejects 'out' transaction for insufficient stock", async () => {
    const res = await req(
      "POST",
      `/api/items/${txItemId}/transactions`,
      { type: "out", quantity: 999 },
      token
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain("Insufficient");
  });

  test("GET /api/items/:id/transactions lists transactions", async () => {
    const res = await req(
      "GET",
      `/api/items/${txItemId}/transactions`,
      undefined,
      token
    );
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.length).toBe(2);
  });

  test("Transactions require auth", async () => {
    const res = await req("POST", `/api/items/${txItemId}/transactions`, {
      type: "in",
      quantity: 10,
    });
    expect(res.status).toBe(401);
  });
});

describe("Dashboard", () => {
  test("GET /api/dashboard returns stats with transactions", async () => {
    // Create items with transactions for dashboard test
    const lsRes = await req(
      "POST",
      "/api/items",
      { name: "Low Stock Item", sku: "LS-001", unitPrice: 10 },
      token
    );
    const lsItemId = (await lsRes.json()).data.id;
    await req(
      "POST",
      `/api/items/${lsItemId}/transactions`,
      { type: "in", quantity: 5 },
      token
    );

    const nsRes = await req(
      "POST",
      "/api/items",
      { name: "Normal Stock", sku: "NS-001", unitPrice: 20 },
      token
    );
    const nsItemId = (await nsRes.json()).data.id;
    await req(
      "POST",
      `/api/items/${nsItemId}/transactions`,
      { type: "in", quantity: 50 },
      token
    );

    const res = await req("GET", "/api/dashboard", undefined, token);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data.totalItems).toBeGreaterThanOrEqual(2);
    expect(json.data.totalValue).toBeGreaterThan(0);
    expect(json.data.lowStockItems.length).toBeGreaterThanOrEqual(1);
    expect(json.data.recentTransactions).toBeDefined();
    expect(json.data.recentTransactions.length).toBeGreaterThan(0);

    const lowStockItem = json.data.lowStockItems.find(
      (i: { sku: string }) => i.sku === "LS-001"
    );
    expect(lowStockItem).toBeDefined();
    expect(lowStockItem.currentStock).toBe(5);
  });

  test("GET /api/dashboard requires auth", async () => {
    const res = await req("GET", "/api/dashboard");
    expect(res.status).toBe(401);
  });
});
