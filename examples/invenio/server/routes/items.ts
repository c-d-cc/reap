import { Hono } from "hono";
import { eq, and, isNull, like, or, sql } from "drizzle-orm";
import { items, transactions } from "../db/schema";
import type { DbInstance } from "../db/index";
import { authMiddleware } from "../middleware/auth";
import { getCurrentStock } from "./transactions";

type Env = {
  Variables: {
    userId: number;
  };
};

function createItemRoutes(db: DbInstance) {
  const app = new Hono<Env>();

  app.use("*", authMiddleware);

  // List items
  app.get("/", async (c) => {
    const page = Math.max(1, Number(c.req.query("page")) || 1);
    const limit = Math.min(100, Math.max(1, Number(c.req.query("limit")) || 20));
    const q = c.req.query("q");
    const offset = (page - 1) * limit;

    const conditions = [isNull(items.deletedAt)];
    if (q) {
      conditions.push(
        or(
          like(items.name, `%${q}%`),
          like(items.sku, `%${q}%`),
          like(items.category, `%${q}%`)
        )!
      );
    }

    const where = and(...conditions);

    const countResult = db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(where)
      .get();

    const total = countResult?.count ?? 0;

    const rows = db
      .select()
      .from(items)
      .where(where)
      .limit(limit)
      .offset(offset)
      .all();

    const mapped = rows.map((row) => mapItemWithStock(db, row));

    return c.json({
      data: { items: mapped, total, page, limit },
    });
  });

  // Get single item
  app.get("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const item = db
      .select()
      .from(items)
      .where(and(eq(items.id, id), isNull(items.deletedAt)))
      .get();

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    return c.json({ data: mapItemWithStock(db, item) });
  });

  // Create item
  app.post("/", async (c) => {
    const userId = c.get("userId");
    const body = await c.req.json();
    const { name, sku, category, unitPrice, unit } = body;

    if (!name || !sku) {
      return c.json({ error: "Name and SKU are required" }, 400);
    }

    // Check duplicate SKU
    const existing = db
      .select()
      .from(items)
      .where(eq(items.sku, sku))
      .get();

    if (existing) {
      return c.json({ error: "SKU already exists" }, 409);
    }

    const now = new Date().toISOString();
    const result = db
      .insert(items)
      .values({
        name,
        sku,
        category: category ?? "uncategorized",
        unit: unit ?? "EA",
        unitPrice: unitPrice ?? 0,
        createdAt: now,
        updatedAt: now,
        createdBy: userId,
      })
      .returning()
      .get();

    return c.json({ data: mapItemWithStock(db, result) }, 201);
  });

  // Update item
  app.put("/:id", async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();

    const existing = db
      .select()
      .from(items)
      .where(and(eq(items.id, id), isNull(items.deletedAt)))
      .get();

    if (!existing) {
      return c.json({ error: "Item not found" }, 404);
    }

    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };
    if (body.name !== undefined) updates.name = body.name;
    if (body.sku !== undefined) updates.sku = body.sku;
    if (body.category !== undefined) updates.category = body.category;
    if (body.unit !== undefined) updates.unit = body.unit;
    if (body.unitPrice !== undefined) updates.unitPrice = body.unitPrice;

    const result = db
      .update(items)
      .set(updates)
      .where(eq(items.id, id))
      .returning()
      .get();

    return c.json({ data: mapItemWithStock(db, result) });
  });

  // Soft delete item
  app.delete("/:id", async (c) => {
    const id = Number(c.req.param("id"));

    const existing = db
      .select()
      .from(items)
      .where(and(eq(items.id, id), isNull(items.deletedAt)))
      .get();

    if (!existing) {
      return c.json({ error: "Item not found" }, 404);
    }

    db.update(items)
      .set({ deletedAt: new Date().toISOString() })
      .where(eq(items.id, id))
      .run();

    return c.json({ data: { success: true } });
  });

  return app;
}

function mapItemWithStock(db: DbInstance, row: typeof items.$inferSelect) {
  const currentStock = getCurrentStock(db, row.id);
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    category: row.category,
    unit: row.unit,
    quantity: row.quantity,
    currentStock,
    unitPrice: row.unitPrice,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    createdBy: row.createdBy,
  };
}

export default createItemRoutes;
