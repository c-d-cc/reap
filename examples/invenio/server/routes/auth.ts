import { Hono } from "hono";
import { SignJWT } from "jose";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";
import type { DbInstance } from "../db/index";

const JWT_SECRET = process.env.JWT_SECRET || "invenio-dev-secret";

function createAuthRoutes(db: DbInstance) {
  const app = new Hono();

  async function generateToken(userId: number): Promise<string> {
    const secret = new TextEncoder().encode(JWT_SECRET);
    return new SignJWT({ sub: String(userId) })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(secret);
  }

  app.post("/sign-up", async (c) => {
    const body = await c.req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }

    // Check if user exists
    const existing = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (existing) {
      return c.json({ error: "Email already registered" }, 409);
    }

    const passwordHash = await Bun.password.hash(password);

    const result = db
      .insert(users)
      .values({ email, passwordHash, name })
      .returning()
      .get();

    const token = await generateToken(result.id);

    return c.json(
      {
        data: {
          token,
          user: { id: result.id, email: result.email, name: result.name },
        },
      },
      201
    );
  });

  app.post("/sign-in", async (c) => {
    const body = await c.req.json();
    const { email, password } = body;

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    const user = db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .get();

    if (!user) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const valid = await Bun.password.verify(password, user.passwordHash);
    if (!valid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const token = await generateToken(user.id);

    return c.json({
      data: {
        token,
        user: { id: user.id, email: user.email, name: user.name },
      },
    });
  });

  return app;
}

export default createAuthRoutes;
