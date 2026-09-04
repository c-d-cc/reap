/**
 * Everything the prerenderer does, except touching the filesystem.
 *
 * It lives under `src/` because `docs/tsconfig.json` includes `src/**` and
 * nothing else — a build step written in `docs/scripts/` is not typechecked by
 * anything in this repository. So the driver there does I/O and no decisions,
 * and every decision is here where `npm run typecheck:docs` sees it.
 */
import { renderToString } from "react-dom/server";
import App from "./App";
import { ROUTES, SITE_NAME } from "./routes";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "./i18n/types";
import { localeHref, localeUrl } from "./i18n/locale-path";
import { ko, type Translations } from "./i18n/translations/ko";

const TRANSLATIONS: Record<Locale, Translations> = { ko };

/** `og:locale` wants an underscore-joined language_TERRITORY pair. */
const OG_LOCALES: Record<Locale, string> = {
  ko: "ko_KR",
};

const HEAD_START = "<!--app-head-start-->";
const HEAD_END = "<!--app-head-end-->";
const ROOT_DIV = '<div id="root"></div>';
const HTML_LANG = `<html lang="${DEFAULT_LOCALE}"`;

export interface PrerenderedPage {
  /** Path relative to the build output root, e.g. `docs/skills/index.html`. */
  filePath: string;
  /** The URL this file will be served at, e.g. `/docs/skills`. */
  href: string;
  locale: Locale;
  route: string;
  html: string;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Replace `needle` and refuse to carry on if it was not there exactly once.
 *
 * A missing marker is the failure that would not announce itself: the
 * substitution silently does nothing, every file is written, and what ships is
 * 115 copies of the shell — which is the state this generation exists to end.
 * So it throws, and the build stops.
 */
function replaceOnce(haystack: string, needle: string, replacement: string, what: string): string {
  const first = haystack.indexOf(needle);
  if (first === -1) {
    throw new Error(`prerender: ${what} — marker not found in the built index.html: ${needle}`);
  }
  if (haystack.indexOf(needle, first + needle.length) !== -1) {
    throw new Error(`prerender: ${what} — marker appears more than once: ${needle}`);
  }
  return haystack.slice(0, first) + replacement + haystack.slice(first + needle.length);
}

/** Swap everything between the head markers for `head`. */
function replaceHead(html: string, head: string): string {
  const start = html.indexOf(HEAD_START);
  const end = html.indexOf(HEAD_END);
  if (start === -1 || end === -1 || end < start) {
    throw new Error(`prerender: head markers missing or out of order in the built index.html`);
  }
  return html.slice(0, start) + head + html.slice(end + HEAD_END.length);
}

/** The `<head>` contents for one page, in one locale. */
function headFor(route: string, locale: Locale, origin: string): string {
  const t = TRANSLATIONS[locale];
  const def = ROUTES.find((r) => r.path === route);
  if (!def) throw new Error(`prerender: no route declared for ${route}`);
  const meta = def.meta(t);
  const url = localeUrl(origin, locale, route);

  // Every route has a description — `RouteMeta.description` is required, so a
  // route added without one does not compile. Four of them had none until
  // gen-096 wrote them; the optional field and the branch that went with it
  // are gone, because an optional field is where the next twenty
  // description-less pages would have come from without anyone noticing.
  const lines: string[] = [
    `<title>${escapeHtml(meta.title)}</title>`,
    `<meta name="description" content="${escapeHtml(meta.description)}" />`,
    `<link rel="canonical" href="${url}" />`,
  ];

  // Every locale of this page points at every other one, itself included —
  // that is what the specification asks for, and a set that omits self is the
  // usual way this is got wrong.
  for (const l of LOCALES) {
    lines.push(
      `<link rel="alternate" hreflang="${l}" href="${localeUrl(origin, l, route)}" />`,
    );
  }
  lines.push(
    `<link rel="alternate" hreflang="x-default" href="${localeUrl(origin, DEFAULT_LOCALE, route)}" />`,
  );

  // [autonomous] Open Graph. `docs/public/opengraph.jpg` has been in the
  // repository unreferenced; nothing here is newly authored copy.
  lines.push(
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${escapeHtml(meta.title)}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:image" content="${origin}/opengraph.jpg" />`,
    `<meta property="og:locale" content="${OG_LOCALES[locale]}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
  );
  lines.push(`<meta property="og:description" content="${escapeHtml(meta.description)}" />`);

  return lines.join("\n    ");
}

/**
 * Render one route in one locale into a complete HTML document.
 *
 * `ssrPath` defaults to the canonical address of the page and is overridable so
 * that `renderAll` can render the same page at the address the host will
 * actually redirect the browser to — see the equality check there.
 */
export function renderPage(
  route: string,
  locale: Locale,
  template: string,
  origin: string,
  ssrPath?: string,
): string {
  const href = localeHref(locale, route);
  const body = renderToString(<App locale={locale} ssrPath={ssrPath ?? href} />);

  let html = replaceOnce(template, HTML_LANG, `<html lang="${locale}"`, `<html lang> for ${href}`);
  html = replaceHead(html, headFor(route, locale, origin));

  return replaceOnce(html, ROOT_DIV, `<div id="root">${body}</div>`, `app markup for ${href}`);
}

/** Every route in every locale. */
export function renderAll(template: string, origin: string): PrerenderedPage[] {
  const pages: PrerenderedPage[] = [];
  for (const locale of LOCALES) {
    for (const def of ROUTES) {
      const href = localeHref(locale, def.path);
      // `/` -> `index.html`,
      // `/docs/skills` -> `docs/skills/index.html`.
      const dir = href === "/" ? "" : href.replace(/^\//, "").replace(/\/$/, "") + "/";
      const filePath = dir + "index.html";
      const html = renderPage(def.path, locale, template, origin);
      assertSlashInvariant(def.path, locale, template, origin, href, html);
      pages.push({ filePath, href, locale, route: def.path, html });
    }
  }
  return pages;
}

/**
 * The page must render the same at both spellings of its own address.
 *
 * Every page here is written as `<dir>/index.html`, and GitHub Pages answers a
 * request for `<dir>` with a 301 to `<dir>/`:
 *
 *   $ curl -so /dev/null -w '%{http_code} %{redirect_url}' https://pages.github.com/versions
 *   301 https://pages.github.com/versions/
 *
 * So the address the browser hydrates at is not the one this file rendered.
 * Two rendered things read the location — the sidebar's active-item comparison
 * and the language selector's hrefs — and before `useNormalizedLocation` was
 * added to App.tsx they differed by six attributes per page, on 110 of the 115.
 *
 * What that looks like in a browser is worth knowing, because it is quieter
 * than it sounds and it is why this check is a byte comparison rather than a
 * browser test. Measured in headless Chrome against a build with the defect
 * deliberately put back: the first paint looks RIGHT and the console is
 * SILENT — a production React build does not compare attributes while
 * hydrating, so the server's `text-primary` survives. The disagreement shows
 * on the first re-render at that address: navigate away and press Back, and
 * the highlight is gone. On the same build with the fix, it is still there.
 * So neither a console error nor a screenshot of the first paint would have
 * caught this.
 *
 * The check is here, in the build, rather than in a gate script, because this
 * is the path that cannot be skipped: no docs build produces a page without
 * passing through it. A gate that reads the written files cannot see this at
 * all — both spellings serve the same file, and the difference only appears
 * when a browser renders it.
 *
 * Two things it does NOT establish, neither of them a defect today:
 *
 *   - Both renders pass a non-null `ssrPath`, so what is compared is wouter's
 *     server branch against itself. The browser takes the other branch —
 *     `useNormalizedLocation` reading the real `location` — and this says
 *     nothing about it. A future edit of the shape
 *     `opts.ssrPath ? strip(path) : path` would revive the original defect in
 *     browsers while leaving this invariant green.
 *   - It compares SSR output to SSR output, never to a CLIENT render. The two
 *     entries (`main.tsx` and this file) could diverge — a provider present in
 *     one and not the other — and nothing here would notice. Nothing in this
 *     repository runs a browser.
 */
function assertSlashInvariant(
  route: string,
  locale: Locale,
  template: string,
  origin: string,
  href: string,
  html: string,
): void {
  if (href === "/") return; // the site root has no other spelling
  const variant = href.endsWith("/") ? href.slice(0, -1) : href + "/";
  const alternate = renderPage(route, locale, template, origin, variant);
  if (alternate !== html) {
    throw new Error(
      `prerender: ${href} and ${variant} render differently (${html.length} vs ${alternate.length} bytes). ` +
        `The host redirects between these two spellings, so this is a hydration mismatch. ` +
        `See useNormalizedLocation in docs/src/App.tsx.`,
    );
  }
}

/**
 * The address `renderNotFound` renders at. It must match no route.
 *
 * wouter falls through to `<Route component={NotFound}>` when nothing matches,
 * so the whole of what makes this the 404 page is that this path is not in the
 * table. A route added here later would silently turn `404.html` into that
 * page, so the guard below says so instead.
 */
export const NOT_FOUND_SSR_PATH = "/404";

/**
 * The page GitHub Pages serves for an address that has no file behind it.
 *
 * Until gen-096 this file was `cp index.html 404.html` — correct while the
 * site was a shell that client-routed every URL, and wrong the moment each
 * route became a real file. What that copy produced after prerendering was a
 * 28 kB English HOME PAGE served under every non-existent URL, declaring
 * `<link rel="canonical" href="https://reap.cc/">` and carrying the home
 * page's `og:url` and `og:title`. Every mistyped or dead link would have
 * unfurled in Slack as the front page and told crawlers it was the site root.
 *
 * So it is rendered, not copied, and it deliberately carries NO URL of its
 * own:
 *
 *   - no canonical. The request is for an address that does not exist, so
 *     every possible value is wrong — including, especially, the site root.
 *   - no hreflang. There are no translations of a missing page.
 *   - no Open Graph. An unfurl is a promise that something is there.
 *   - `noindex`, so that a crawler that reaches it despite the 404 status —
 *     status codes are not the only path in — does not keep it.
 *
 * The body is the same NotFound component a visitor already saw here: before
 * this change the shell booted, wouter matched nothing, and rendered it. What
 * changes is that it now arrives rendered instead of after JavaScript runs.
 *
 * It hydrates at whatever address the visitor actually asked for, which is
 * unknown at build time. That is safe here and only here: NotFound reads
 * neither the location nor the locale — it is English literal text with no
 * sidebar and no language selector — so every address produces this markup.
 */
export function renderNotFound(template: string): string {
  if (ROUTES.some((r) => r.path === NOT_FOUND_SSR_PATH)) {
    throw new Error(
      `prerender: ${NOT_FOUND_SSR_PATH} is a declared route, so 404.html would be that page`,
    );
  }

  const body = renderToString(<App locale={DEFAULT_LOCALE} ssrPath={NOT_FOUND_SSR_PATH} />);
  const head = [
    `<title>Page Not Found — ${SITE_NAME}</title>`,
    `<meta name="robots" content="noindex" />`,
  ].join("\n    ");

  let html = replaceOnce(
    template,
    HTML_LANG,
    `<html lang="${DEFAULT_LOCALE}"`,
    `<html lang> for 404.html`,
  );
  html = replaceHead(html, head);
  return replaceOnce(html, ROOT_DIV, `<div id="root">${body}</div>`, `app markup for 404.html`);
}

/**
 * A sitemap listing every locale of every route, each naming its alternates.
 *
 * Generated rather than written by hand for the reason every such file is:
 * a hand-written one is correct on the day it is written and never again.
 */
export function buildSitemap(origin: string): string {
  const urls = LOCALES.flatMap((locale) =>
    ROUTES.map((def) => {
      const alternates = [
        ...LOCALES.map(
          (l) =>
            `    <xhtml:link rel="alternate" hreflang="${l}" href="${localeUrl(origin, l, def.path)}" />`,
        ),
        `    <xhtml:link rel="alternate" hreflang="x-default" href="${localeUrl(origin, DEFAULT_LOCALE, def.path)}" />`,
      ].join("\n");
      return `  <url>\n    <loc>${localeUrl(origin, locale, def.path)}</loc>\n${alternates}\n  </url>`;
    }),
  );
  return [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">`,
    ...urls,
    `</urlset>`,
    ``,
  ].join("\n");
}

export function buildRobotsTxt(origin: string): string {
  return [`User-agent: *`, `Allow: /`, ``, `Sitemap: ${origin}/sitemap.xml`, ``].join("\n");
}
