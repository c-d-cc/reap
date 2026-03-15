import { Hono } from "hono";
import { eq, sql } from "drizzle-orm";
import { units, items } from "../db/schema";
import type { DbInstance } from "../db/index";
import { authMiddleware } from "../middleware/auth";

type Env = {
  Variables: {
    userId: number;
  };
};

function createUnitRoutes(db: DbInstance) {
  const app = new Hono<Env>();

  // List all units - no auth required
  app.get("/", async (c) => {
    const rows = db.select().from(units).all();
    return c.json({
      data: rows.map((r) => ({
        id: r.id,
        name: r.name,
        label: r.label,
        createdAt: r.createdAt,
      })),
    });
  });

  // Create unit - auth required
  app.post("/", authMiddleware, async (c) => {
    const body = await c.req.json();
    const { name, label } = body;

    if (!name || !label) {
      return c.json({ error: "Name and label are required" }, 400);
    }

    const existing = db
      .select()
      .from(units)
      .where(eq(units.name, name))
      .get();

    if (existing) {
      return c.json({ error: "Unit name already exists" }, 409);
    }

    const result = db
      .insert(units)
      .values({ name, label })
      .returning()
      .get();

    return c.json(
      {
        data: {
          id: result.id,
          name: result.name,
          label: result.label,
          createdAt: result.createdAt,
        },
      },
      201
    );
  });

  // Update unit - auth required
  app.put("/:id", authMiddleware, async (c) => {
    const id = Number(c.req.param("id"));
    const body = await c.req.json();

    const existing = db.select().from(units).where(eq(units.id, id)).get();
    if (!existing) {
      return c.json({ error: "Unit not found" }, 404);
    }

    const updates: Record<string, unknown> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.label !== undefined) updates.label = body.label;

    const result = db
      .update(units)
      .set(updates)
      .where(eq(units.id, id))
      .returning()
      .get();

    return c.json({
      data: {
        id: result.id,
        name: result.name,
        label: result.label,
        createdAt: result.createdAt,
      },
    });
  });

  // Delete unit - auth required, reject if items use this unit
  app.delete("/:id", authMiddleware, async (c) => {
    const id = Number(c.req.param("id"));

    const existing = db.select().from(units).where(eq(units.id, id)).get();
    if (!existing) {
      return c.json({ error: "Unit not found" }, 404);
    }

    // Check if any items use this unit
    const usage = db
      .select({ count: sql<number>`count(*)` })
      .from(items)
      .where(eq(items.unit, existing.name))
      .get();

    if (usage && usage.count > 0) {
      return c.json(
        { error: "Cannot delete unit that is in use by items" },
        409
      );
    }

    db.delete(units).where(eq(units.id, id)).run();
    return c.json({ data: { success: true } });
  });

  return app;
}

export default createUnitRoutes;
