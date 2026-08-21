/**
 * The URL is the only place a locale comes from.
 *
 * Before gen-096 the locale was decided at runtime by `localStorage` and
 * `navigator.language`, which meant the five languages shared one URL and a
 * crawler could only ever index one of them. It also meant the ambient
 * environment picked the language: a server-side render of the app with
 * `navigator.language` stubbed to `en-US` still produced Korean, because the
 * stub did not take and the machine's own locale was read instead.
 *
 * English carries no prefix. That is not a style choice — `README*.md` in five
 * languages link `https://reap.cc/docs/*` directly, and those READMEs ship
 * inside the npm tarball. Adding `/en/` would break every one of them, in
 * copies already published.
 */
import { LOCALES, DEFAULT_LOCALE, type Locale } from "./types";

/** The path segment that identifies each locale. English has none. */
export const LOCALE_PREFIXES: Record<Locale, string> = {
  en: "",
  ko: "/ko",
  ja: "/ja",
  de: "/de",
  "zh-CN": "/zh-CN",
};

export function localePrefix(locale: Locale): string {
  return LOCALE_PREFIXES[locale];
}

/**
 * Split a full pathname into the locale that owns it and the route beneath it.
 *
 * `/ko/docs/quick-start` -> { locale: "ko", prefix: "/ko", route: "/docs/quick-start" }
 * `/docs/quick-start`    -> { locale: "en", prefix: "",    route: "/docs/quick-start" }
 * `/ko`                  -> { locale: "ko", prefix: "/ko", route: "/" }
 *
 * The prefix has to be followed by `/` or by nothing at all. Matching on the
 * bare string would make `/kotlin` Korean — wouter's own `relativePath` has
 * exactly that behaviour, which is why the decision is made here and the
 * result is handed to it rather than the other way round.
 */
export function parseLocalePath(pathname: string): {
  locale: Locale;
  prefix: string;
  route: string;
} {
  for (const locale of LOCALES) {
    const prefix = LOCALE_PREFIXES[locale];
    if (!prefix) continue;
    if (pathname === prefix || pathname.startsWith(prefix + "/")) {
      const route = pathname.slice(prefix.length) || "/";
      return { locale, prefix, route };
    }
  }
  return { locale: DEFAULT_LOCALE, prefix: "", route: pathname || "/" };
}

/**
 * The URL of `route` in `locale`.
 *
 * `route` is the locale-independent path — the same string the `<Route>`
 * declares and the sidebar links to.
 */
export function localeHref(locale: Locale, route: string): string {
  const prefix = LOCALE_PREFIXES[locale];
  // The locale root keeps its trailing slash so that it matches what wouter
  // itself produces for `<Link href="/">` under this base. Without it the page
  // would link to `/ko/` and declare `/ko` canonical, which are the same page
  // named two ways — the exact thing a canonical URL exists to prevent.
  if (route === "/") return prefix ? prefix + "/" : "/";
  return prefix + route;
}

/** The absolute URL of `route` in `locale`, for canonical/hreflang/sitemap. */
export function localeUrl(origin: string, locale: Locale, route: string): string {
  return origin + localeHref(locale, route);
}

/**
 * Drop a trailing slash, except from the site root.
 *
 * GitHub Pages answers `/docs/quick-start` with a 301 to `/docs/quick-start/`
 * when the page is a directory index, which every prerendered page is. So the
 * address the browser ends up at is not the one the prerenderer rendered:
 *
 *   $ curl -so /dev/null -w '%{http_code} %{redirect_url}' https://pages.github.com/versions
 *   301 https://pages.github.com/versions/
 *
 * Two rendered things read the location and would then disagree with the
 * server — the sidebar's `location === item.href` highlight and the language
 * selector's hrefs — which is a hydration mismatch on every page reached by a
 * direct link, and a sidebar that forgets which page you are on. Normalising
 * here rather than at each reader means a future reader inherits the fix
 * instead of having to know about it.
 *
 * It is done in the app rather than by writing `<route>.html` files, because
 * this works whether or not the host redirects, and the file layout would have
 * had to be right about a hosting behaviour to avoid 404-ing 80 published
 * README links.
 */
export function stripTrailingSlash(pathname: string): string {
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

/**
 * The address the router should match, given the address the browser is at.
 *
 * Two host behaviours are folded away here, both of which produce an address
 * that names a page the router has no route for:
 *
 *   - **`/dir` vs `/dir/`.** GitHub Pages 301s the first to the second, so the
 *     address the browser hydrates at is one slash away from the address the
 *     prerender rendered. Measured: 110 of 115 pages hydrated with the sidebar
 *     forgetting which page it was on.
 *   - **`/index.html`.** Pages serves the file directly, at 200, with the full
 *     prerendered home page in it — and the router has no `/index.html` route,
 *     so hydration mismatched (React #418) and the visitor landed on NotFound
 *     under a URL that had just delivered the home page. Before prerendering
 *     the same address also gave NotFound, but from an empty `#root`: no
 *     markup to disagree with, so no exception. The 404 is old; the error is
 *     ours. `/ko/index.html` and the other three locale roots are the same
 *     case, which is why the suffix is stripped before the slash.
 *
 * Not a redirect: the URL in the bar is left alone. This only decides what to
 * render, so a link someone already has keeps working and does not bounce.
 */
export function routablePath(pathname: string): string {
  const withoutIndex = pathname.endsWith("/index.html")
    ? pathname.slice(0, -"index.html".length)
    : pathname;
  return stripTrailingSlash(withoutIndex);
}
