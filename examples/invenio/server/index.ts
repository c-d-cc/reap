import { Hono } from "hono";
import { getDb } from "./db/index";
import { runMigrations } from "./db/migrate";
import createAuthRoutes from "./routes/auth";
import createItemRoutes from "./routes/items";
import createDashboardRoutes from "./routes/dashboard";
import createUnitRoutes from "./routes/units";
import createCategoryRoutes from "./routes/categories";
import createTransactionRoutes from "./routes/transactions";

const db = getDb();
runMigrations(db);

const app = new Hono();

app.route("/api/auth", createAuthRoutes(db));
app.route("/api/items", createItemRoutes(db));
app.route("/api/items", createTransactionRoutes(db));
app.route("/api/dashboard", createDashboardRoutes(db));
app.route("/api/units", createUnitRoutes(db));
app.route("/api/categories", createCategoryRoutes(db));

app.get("/", (c) => c.json({ message: "Invenio Inventory API" }));

export default {
  port: 3456,
  fetch: app.fetch,
};

export { app };
export function createApp(db: ReturnType<typeof getDb>) {
  const app = new Hono();
  app.route("/api/auth", createAuthRoutes(db));
  app.route("/api/items", createItemRoutes(db));
  app.route("/api/items", createTransactionRoutes(db));
  app.route("/api/dashboard", createDashboardRoutes(db));
  app.route("/api/units", createUnitRoutes(db));
  app.route("/api/categories", createCategoryRoutes(db));
  return app;
}
