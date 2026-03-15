import { Hono } from "hono";
import { eq, and, isNull, sql, desc } from "drizzle-orm";
import { transactions, items, users } from "../db/schema";
import type { DbInstance } from "../db/index";
import { authMiddleware } from "../middleware/auth";

type Env = {
  Variables: {
    userId: number;
  };
};

export function getCurrentStock(db: DbInstance, itemId: number): number {
  const result = db
    .select({
      stock: sql<number>`coalesce(sum(case when ${transactions.type} = 'in' then ${transactions.quantity} else -${transactions.quantity} end), 0)`,
    })
    .from(transactions)
    .where(eq(transactions.itemId, itemId))
    .get();
  return result?.stock ?? 0;
}

function createTransactionRoutes(db: DbInstance) {
  const app = new Hono<Env>();

  app.use("*", authMiddleware);

  // Create transaction for an item
  app.post("/:id/transactions", async (c) => {
    const itemId = Number(c.req.param("id"));
    const userId = c.get("userId");
    const body = await c.req.json();
    const { type, quantity, memo } = body;

    if (!type || !quantity) {
      return c.json({ error: "Type and quantity are required" }, 400);
    }

    if (type !== "in" && type !== "out") {
      return c.json({ error: "Type must be 'in' or 'out'" }, 400);
    }

    if (quantity <= 0) {
      return c.json({ error: "Quantity must be positive" }, 400);
    }

    // Check item exists and is not deleted
    const item = db
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), isNull(items.deletedAt)))
      .get();

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    // For "out" transactions, check sufficient stock
    if (type === "out") {
      const currentStock = getCurrentStock(db, itemId);
      if (currentStock < quantity) {
        return c.json(
          { error: "Insufficient stock" },
          400
        );
      }
    }

    const result = db
      .insert(transactions)
      .values({
        itemId,
        type,
        quantity,
        memo: memo ?? null,
        createdBy: userId,
      })
      .returning()
      .get();

    return c.json(
      {
        data: {
          id: result.id,
          itemId: result.itemId,
          type: result.type,
          quantity: result.quantity,
          memo: result.memo,
          createdBy: result.createdBy,
          createdAt: result.createdAt,
        },
      },
      201
    );
  });

  // List transactions for an item
  app.get("/:id/transactions", async (c) => {
    const itemId = Number(c.req.param("id"));

    // Check item exists
    const item = db
      .select()
      .from(items)
      .where(and(eq(items.id, itemId), isNull(items.deletedAt)))
      .get();

    if (!item) {
      return c.json({ error: "Item not found" }, 404);
    }

    const rows = db
      .select()
      .from(transactions)
      .where(eq(transactions.itemId, itemId))
      .orderBy(desc(transactions.createdAt))
      .all();

    return c.json({
      data: rows.map((r) => ({
        id: r.id,
        itemId: r.itemId,
        type: r.type,
        quantity: r.quantity,
        memo: r.memo,
        createdBy: r.createdBy,
        createdAt: r.createdAt,
      })),
    });
  });

  return app;
}

export default createTransactionRoutes;
