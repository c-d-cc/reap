import { createMiddleware } from "hono/factory";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "invenio-dev-secret";

type Env = {
  Variables: {
    userId: number;
  };
};

export const authMiddleware = createMiddleware<Env>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    c.set("userId", payload.sub as unknown as number);
    await next();
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
});
