import type { ApiResponse } from "./types.js";

type Params = Record<string, string>;
type Query = Record<string, string>;
type Handler = (params: Params, body: unknown, query: Query) => Promise<ApiResponse>;

interface Route {
  method: string;
  pattern: string;
  segments: string[];
  handler: Handler;
}

export class Router {
  private routes: Route[] = [];

  get(pattern: string, handler: Handler): void {
    this.addRoute("GET", pattern, handler);
  }

  post(pattern: string, handler: Handler): void {
    this.addRoute("POST", pattern, handler);
  }

  delete(pattern: string, handler: Handler): void {
    this.addRoute("DELETE", pattern, handler);
  }

  private addRoute(method: string, pattern: string, handler: Handler): void {
    const segments = pattern.split("/").filter(Boolean);
    this.routes.push({ method, pattern, segments, handler });
  }

  async handle(method: string, url: string, body?: unknown): Promise<ApiResponse> {
    const [pathname, queryString] = url.split("?");
    const urlSegments = pathname.split("/").filter(Boolean);
    const query = this.parseQuery(queryString ?? "");

    for (const route of this.routes) {
      if (route.method !== method) continue;
      const params = this.match(route.segments, urlSegments);
      if (params !== null) {
        return route.handler(params, body ?? null, query);
      }
    }

    return { status: "error", error: `Not found: ${method} ${pathname}` };
  }

  private match(routeSegments: string[], urlSegments: string[]): Params | null {
    if (routeSegments.length !== urlSegments.length) return null;
    const params: Params = {};
    for (let i = 0; i < routeSegments.length; i++) {
      const rs = routeSegments[i];
      if (rs.startsWith(":")) {
        params[rs.slice(1)] = urlSegments[i];
      } else if (rs !== urlSegments[i]) {
        return null;
      }
    }
    return params;
  }

  private parseQuery(qs: string): Query {
    const query: Query = {};
    if (!qs) return query;
    for (const pair of qs.split("&")) {
      const [key, value] = pair.split("=");
      if (key) query[decodeURIComponent(key)] = decodeURIComponent(value ?? "");
    }
    return query;
  }
}
