import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { categories, items } from "../db/schema";
import type { DbInstance } from "../db/index";
import { authMiddleware } from "../middleware/auth";

type Env = {
  Variables: {
    userId: number;
  };
};

function createCategoryRoutes(db: DbInstance) {
  const app = new Hono<Env>();

  // List all categories - no auth required
  app.get("/", async (c) => {
    const rows = db.select().from(categories).all();
    return c.json({
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        createdAt: r.createdAt,
      })),
    });
  });

  // Create category - auth required
  app.post("/", authMiddleware, async (c) => {
    const body = await c.req.json();
    const { name } = body;

    if (!name) {
      return c.json({ error: "Name is required" }, 400);
    }

    const existing = db
      .select()
      .from(categories)
      .where(eq(categories.name, name))
      .get();

    if (existing) {
      return c.json({ error: "Category already exists" }, 409);
    }

    const result = db
      .insert(categories)
      .values({ name })
      .returning()
      .get();

    return c.json(
      {
        data: {
          id: result.id,
          name: result.name,
          createdAt: result.createdAt,
        },
      },
      201
    );
  });

  // Update category - auth required
  app.put("/:id", authMiddleware, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();

    const existing = db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .get();

    if (!existing) {
      return c.json({ error: "Category not found" }, 404);
    }

    const result = db
      .update(categories)
      .set({ name: body.name })
      .where(eq(categories.id, id))
      .returning()
      .get();

    return c.json({
      data: {
        id: result.id,
        name: result.name,
        createdAt: result.createdAt,
      },
    });
  });

  // Delete category - auth required, reject if items use this category
  app.delete("/:id", authMiddleware, async (c) => {
    const id = Number(c.req.param("id"));

    const existing = db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .get();

    if (!existing) {
      return c.json({ error: "Category not found" }, 404);
    }

    // Check if any items use this category
    const usage = db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(eq(items.category, existing.name))
      .get();

    if (usage && usage.count > 0) {
      return c.json(
        { error: "Cannot delete category that is in use by items" },
        409
      );
    }

    db.delete(categories).where(eq(categories.id, id)).run();
    return c.json({ data: { success: true } });
  });

  return app;
}

export default createCategoryRoutes;
