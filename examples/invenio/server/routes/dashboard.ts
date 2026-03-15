import { Hono } from "hono";
import { isNull, sql, and, desc, eq } from "drizzle-orm";
import { items, transactions, users } from "../db/schema";
import type { DbInstance } from "../db/index";
import { authMiddleware } from "../middleware/auth";
import { getCurrentStock } from "./transactions";

type Env = {
  Variables: {
    userId: number;
  };
};

function createDashboardRoutes(db: DbInstance) {
  const app = new Hono<Env>();

  app.use("*", authMiddleware);

  app.get("/", async (c) => {
    const activeCondition = isNull(items.deletedAt);

    // Get all active items
    const activeItems = db
      .select()
      .from(items)
      .where(activeCondition)
      .all();

    const totalItems = activeItems.length;

    // Calculate total value and low stock items using transaction-based stock
    let totalValue = 0;
    const lowStockItems: Array<{
      id: number;
      name: string;
      sku: string;
      category: string;
      unit: string;
      quantity: number;
      currentStock: number;
      unitPrice: number;
      createdAt: string;
      updatedAt: string;
      createdBy: number;
    }> = [];

    for (const item of activeItems) {
      const currentStock = getCurrentStock(db, item.id);
      totalValue += currentStock * item.unitPrice;

      if (currentStock <= 10) {
        lowStockItems.push({
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          unit: item.unit,
          quantity: item.quantity,
          currentStock,
          unitPrice: item.unitPrice,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          createdBy: item.createdBy,
        });
      }
    }

    // Recent transactions (last 5)
    const recentTransactions = db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(5)
      .all()
      .map((t) => ({
        id: t.id,
        itemId: t.itemId,
        type: t.type,
        quantity: t.quantity,
        memo: t.memo,
        createdBy: t.createdBy,
        createdAt: t.createdAt,
      }));

    return c.json({
      data: {
        totalItems,
        totalValue,
        lowStockItems,
        recentTransactions,
      },
    });
  });

  return app;
}

export default createDashboardRoutes;
