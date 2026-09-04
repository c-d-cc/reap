/**
 * What is inside each prerendered page — the half of layer 1 that reads HTML.
 *
 * `check-docs-prerender.sh` counts files, checks sizes and paths, and runs
 * this. The split is by subject: the shell asks whether the right files exist,
 * this asks whether each one describes itself correctly.
 *
 * Ported from v0.17's `docs/` app (gen-096) to `site/`, ko-only, twelve routes
 * (ms-022). `LOCALES` and `DEFAULT_LOCALE` are read from `site/src/i18n/types.ts`,
 * which owns them — a second copy here would be the thing that goes stale.
 * When `LOCALES` has fewer than two entries, `LanguageSelector` renders
 * nothing (a single locale has nothing to switch to), so the selector checks
 * below are skipped rather than reported as a defect.
 *
 * `ORIGIN` is read from `site/public/CNAME` — the same file the prerenderer
 * read to build the URLs being checked. A wrong CNAME therefore agrees with
 * itself here and every canonical, hreflang and sitemap assertion below passes
 * while the whole site names a domain nobody owns. That is not fixable by
 * moving the read: the domain has exactly one owner in this repository and a
 * second copy would be the thing that goes stale. What catches it is layer 2,
 * which asks that domain for the pages.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative, sep } from "node:path";

const ROOT = process.argv[2];
const DIST = join(ROOT, "site", "dist", "public");
const SRC = join(ROOT, "site", "src");

const failures = [];
const fail = (msg, detail) => failures.push(detail ? `${msg}\n        ${detail}` : msg);
const ok = (msg) => console.log(`\x1b[32m  ok    ${msg}\x1b[0m`);

/** The locale list, from the file that owns it. */
function locales() {
  const src = readFileSync(join(SRC, "i18n", "types.ts"), "utf-8");
  const m = /export const LOCALES: Locale\[\] = \[([^\]]*)\]/.exec(src);
  if (!m) return [];
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

/** The default (unprefixed) locale, from the file that owns it. */
function defaultLocale() {
  const src = readFileSync(join(SRC, "i18n", "types.ts"), "utf-8");
  const m = /export const DEFAULT_LOCALE: Locale = "([^"]+)"/.exec(src);
  return m ? m[1] : null;
}

/** Every route the manifest declares. */
function routes() {
  const src = readFileSync(join(SRC, "routes.ts"), "utf-8");
  return [...src.matchAll(/^ {4}path: "([^"]+)"/gm)].map((x) => x[1]);
}

const LOCALES = locales();
const DEFAULT_LOCALE = defaultLocale();
const ROUTES = routes();

// Self-proving preamble. Every assertion below is "for each page, for each
// locale" — and both loops are empty if these parses fail, which would report
// a perfect run over nothing.
if (LOCALES.length < 1 || !DEFAULT_LOCALE || ROUTES.length < 10) {
  console.error(
    `\x1b[31m  FAIL  parsed ${LOCALES.length} locale(s), default "${DEFAULT_LOCALE}" and ${ROUTES.length} route(s) from site/src\x1b[0m`,
  );
  console.error(`\x1b[2m        every check below would pass vacuously\x1b[0m`);
  process.exit(1);
}
ok(`${LOCALES.length} locale(s) and ${ROUTES.length} route(s) read from site/src`);

const ORIGIN = `https://${readFileSync(join(ROOT, "site", "public", "CNAME"), "utf-8").trim()}`;

const prefixOf = (locale) => (locale === DEFAULT_LOCALE ? "" : `/${locale}`);
const hrefOf = (locale, route) =>
  route === "/" ? prefixOf(locale) + "/" : prefixOf(locale) + route;
const urlOf = (locale, route) => ORIGIN + hrefOf(locale, route);

/** Every index.html under DIST. */
function pages(dir = DIST, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) pages(full, out);
    else if (name === "index.html") out.push(full);
  }
  return out;
}

/** Which (locale, route) a file's position claims it is. */
function identify(file) {
  const rel = relative(DIST, file).split(sep).slice(0, -1); // drop index.html
  const locale = LOCALES.includes(rel[0]) && rel[0] !== DEFAULT_LOCALE ? rel[0] : DEFAULT_LOCALE;
  const rest = locale === DEFAULT_LOCALE ? rel : rel.slice(1);
  return { locale, route: rest.length ? "/" + rest.join("/") : "/" };
}

const seen = new Map(); // "locale route" -> file
const titlesByLocale = new Map();
const bodyText = new Map(); // "locale route" -> visible text of #root
let badLang = 0,
  badCanonical = 0,
  badAlternates = 0,
  badSelector = 0,
  badAsset = 0,
  noScript = 0,
  badActive = 0,
  badDescription = 0,
  unexpected = 0;
let firstLang,
  firstCanonical,
  firstAlternates,
  firstSelector,
  firstAsset,
  firstScript,
  firstActive,
  firstDescription;

/**
 * The words a reader would see in the page's own content: `<main>`, tags
 * removed, whitespace collapsed.
 *
 * `<main>` and not `#root` — the language selector prints the CURRENT
 * locale's label as its button text, which would make an all-untranslated
 * mutation pass the cross-locale comparison below. `<main>` excludes the
 * navbar entirely. With a single locale the selector renders nothing at all
 * (see the header note), so this distinction has no effect here, but the
 * function is kept as-is against the day a second locale is added.
 */
function visibleText(html) {
  const start = html.indexOf("<main");
  const end = html.lastIndexOf("</main>");
  if (start === -1 || end <= start) return "";
  return html
    .slice(start, end)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

for (const file of pages()) {
  const { locale, route } = identify(file);
  const where = relative(DIST, file);

  if (!ROUTES.includes(route)) {
    unexpected++;
    continue;
  }
  seen.set(`${locale} ${route}`, file);

  const html = readFileSync(file, "utf-8");

  if (!html.includes(`<html lang="${locale}"`)) {
    badLang++;
    firstLang ??= `${where} does not declare lang="${locale}"`;
  }

  const title = /<title>([\s\S]*?)<\/title>/.exec(html)?.[1] ?? "";
  if (!titlesByLocale.has(locale)) titlesByLocale.set(locale, []);
  titlesByLocale.get(locale).push(title);
  bodyText.set(`${locale} ${route}`, visibleText(html));

  // A description is what a search result shows under the title.
  const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "";
  if (description.trim().length < 20) {
    badDescription++;
    firstDescription ??= `${where}: description is ${description ? `"${description}"` : "absent"}`;
  }

  // (a) The canonical link is what tells a search engine which URL owns this
  // content. A page claiming another locale's URL asks to be dropped.
  const canonical = /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1];
  if (canonical !== urlOf(locale, route)) {
    badCanonical++;
    firstCanonical ??= `${where}: canonical is ${canonical}, expected ${urlOf(locale, route)}`;
  }

  // (b) Values, not a count. Each locale's alternate must name that locale's
  // URL of THIS route, and x-default must name the default locale's one.
  const alternates = new Map(
    [...html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );
  const expected = new Map([
    ...LOCALES.map((l) => [l, urlOf(l, route)]),
    ["x-default", urlOf(DEFAULT_LOCALE, route)],
  ]);
  let alternatesWrong = alternates.size !== expected.size;
  for (const [k, v] of expected) if (alternates.get(k) !== v) alternatesWrong = true;
  if (alternatesWrong) {
    badAlternates++;
    firstAlternates ??= `${where}: ${alternates.size} alternate(s); ${expected.get(locale)} expected for ${locale}, got ${alternates.get(locale)}`;
  }

  // The language selector, in the body. With a single locale `LanguageSelector`
  // renders nothing (it has nothing to switch to), so these checks are
  // meaningful only once a second locale exists — see report() calls below.
  if (LOCALES.length > 1) {
    const anchors = [
      ...html.matchAll(/<a href="([^"]*)" hrefLang="([^"]*)" class="([^"]*)"/g),
    ].map((m) => ({ href: m[1], locale: m[2], active: m[3].includes("text-primary font-medium") }));
    const selector = new Map(anchors.map((a) => [a.locale, a.href]));
    let selectorWrong = selector.size !== LOCALES.length;
    for (const l of LOCALES) if (selector.get(l) !== hrefOf(l, route)) selectorWrong = true;
    if (selectorWrong) {
      badSelector++;
      firstSelector ??= `${where}: selector offers ${selector.size} locale(s); expected ${hrefOf(locale, route)} for ${locale}, got ${selector.get(locale)}`;
    }

    const active = anchors.filter((a) => a.active);
    if (active.length !== 1 || active[0].locale !== locale) {
      badActive++;
      firstActive ??= `${where}: body was rendered for ${active.map((a) => a.locale).join(",") || "no"} locale, not ${locale}`;
    }
  }

  // (c) A page that renders but references a bundle that is not there is a
  // page that never hydrates: no navigation, no language menu, nothing.
  for (const m of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    if (!existsSync(join(DIST, m[1].slice(1)))) {
      badAsset++;
      firstAsset ??= `${where} references ${m[1]}, which does not exist`;
    }
  }
  // A <script> that can actually run, matched as one — `type="module"`
  // (what Vite emits), comments stripped first so a commented-out tag is not
  // mistaken for a live one.
  const runnable = html.replace(/<!--[\s\S]*?-->/g, "");
  const scripts = [
    ...runnable.matchAll(/<script[^>]*\btype="module"[^>]*\bsrc="(\/assets\/[^"]+\.js)"/g),
  ].length;
  if (scripts === 0) {
    noScript++;
    firstScript ??= `${where} references no /assets/*.js — it would render but never hydrate`;
  }
}

// The other half of the self-proving preamble. The parses above can succeed
// and this loop still examine nothing — an empty or half-written dist — and
// then every `report(0, ...)` below prints a green line about no pages at all.
// The run would be red from the counts, but the sentences would be false.
if (seen.size === 0) {
  console.error(`\x1b[31m  FAIL  no pages were examined under ${DIST}\x1b[0m`);
  console.error(`\x1b[2m        every check below would pass vacuously\x1b[0m`);
  process.exit(1);
}
ok(`${seen.size} page(s) examined`);

const report = (count, good, bad, detail) =>
  count === 0 ? ok(good) : fail(bad.replace("%d", count), detail);

report(unexpected, "every page is at a declared route", "%d page(s) are not at any declared route");
report(badLang, "every page declares the lang of its directory", "%d page(s) have the wrong <html lang>", firstLang);
report(badCanonical, "every page is canonical to its own locale's URL", "%d page(s) have the wrong canonical URL", firstCanonical);
report(badAlternates, "every page's hreflang links name the right URLs", "%d page(s) have wrong hreflang targets", firstAlternates);
if (LOCALES.length > 1) {
  report(badSelector, "every page's language selector points at its own translations", "%d page(s) have a wrong language selector", firstSelector);
  report(badActive, "every page's language selector marks its own locale as current", "%d page(s) mark the wrong locale as current", firstActive);
} else {
  ok("single locale — no language selector rendered, nothing to check");
}
report(badAsset, "every referenced asset exists", "%d asset reference(s) do not resolve", firstAsset);
report(noScript, "every page references a client bundle to hydrate with", "%d page(s) reference no /assets/*.js", firstScript);
report(badDescription, "every page carries a meta description", "%d page(s) have no usable meta description", firstDescription);

// Every combination present exactly once.
const missing = [];
for (const locale of LOCALES)
  for (const route of ROUTES) if (!seen.has(`${locale} ${route}`)) missing.push(`${locale} ${route}`);
if (missing.length === 0) ok(`all ${LOCALES.length * ROUTES.length} locale/route combinations present`);
else fail(`${missing.length} locale/route combination(s) missing`, missing.slice(0, 3).join(", "));

for (const locale of LOCALES) {
  const titles = titlesByLocale.get(locale) ?? [];
  const empty = titles.filter((t) => !t || t === "REAP").length;
  const distinct = new Set(titles).size;
  if (titles.length !== ROUTES.length)
    fail(`locale ${locale}: collected ${titles.length} title(s) from ${ROUTES.length} route(s)`);
  else if (empty > 0) fail(`locale ${locale}: ${empty} page(s) carry no page-specific <title>`);
  else if (distinct !== titles.length)
    fail(`locale ${locale}: ${titles.length - distinct} duplicate <title> value(s)`);
  else ok(`locale ${locale}: ${distinct} distinct <title> values`);
}

// ---------------------------------------------------------------------------
// The one comparison neither layer made: the same route, ACROSS locales.
// With a single locale there is nothing to compare against, so this is a
// no-op until a second locale is added — it stays written for that day.
// ---------------------------------------------------------------------------
const untranslated = [];
for (const route of ROUTES) {
  if (!bodyText.has(`${DEFAULT_LOCALE} ${route}`)) continue;
  const defaultText = bodyText.get(`${DEFAULT_LOCALE} ${route}`);
  for (const locale of LOCALES) {
    if (locale === DEFAULT_LOCALE) continue;
    const key = `${locale} ${route}`;
    if (bodyText.has(key) && bodyText.get(key) === defaultText) untranslated.push(key);
  }
}
const noMain = [...bodyText.entries()].filter(([, text]) => text === "").map(([k]) => k);
if (noMain.length === 0) ok(`every page has a readable <main> region`);
else
  fail(
    `${noMain.length} page(s) have no readable <main>`,
    `${noMain.slice(0, 3).join(", ")} — the cross-locale comparison below reads it`,
  );

if (LOCALES.length > 1) {
  if (untranslated.length === 0)
    ok(`every translated page's visible text differs from the default locale's one`);
  else
    fail(
      `${untranslated.length} page(s) show the default locale's text under another locale's URL`,
      untranslated.slice(0, 3).join(", "),
    );
}

// ---------------------------------------------------------------------------
// sitemap.xml — the URLs it lists, not how many.
// ---------------------------------------------------------------------------
const sitemapPath = join(DIST, "sitemap.xml");
if (!existsSync(sitemapPath)) {
  fail("sitemap.xml is missing", `${LOCALES.length * ROUTES.length} pages cannot be discovered without it`);
} else {
  const xml = readFileSync(sitemapPath, "utf-8");
  const listed = new Set([...xml.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]));
  const wanted = new Set(LOCALES.flatMap((l) => ROUTES.map((r) => urlOf(l, r))));
  const absent = [...wanted].filter((u) => !listed.has(u));
  const extra = [...listed].filter((u) => !wanted.has(u));
  if (absent.length === 0 && extra.length === 0) {
    ok(`sitemap.xml lists exactly the ${wanted.size} page URLs`);
  } else {
    fail(
      `sitemap.xml lists ${listed.size} distinct URL(s): ${absent.length} missing, ${extra.length} unexpected`,
      [...absent.slice(0, 2), ...extra.slice(0, 2)].join(", "),
    );
  }
}

// ---------------------------------------------------------------------------
// The site root is prerendered in the default locale.
// ---------------------------------------------------------------------------
const rootFile = join(DIST, "index.html");
if (!existsSync(rootFile)) {
  fail("the site root has no index.html");
} else {
  const rootHtml = readFileSync(rootFile, "utf-8");
  const rootCanonical = /<link rel="canonical" href="([^"]*)"/.exec(rootHtml)?.[1];
  if (rootHtml.includes(`<html lang="${DEFAULT_LOCALE}"`) && rootCanonical === `${ORIGIN}/`) {
    ok(`the site root is prerendered in ${DEFAULT_LOCALE} and canonical to itself`);
  } else {
    fail(
      "the site root is not the default-locale page",
      `lang="${/<html lang="([^"]*)"/.exec(rootHtml)?.[1]}", canonical=${rootCanonical}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 404.html — the page served at every address that has none.
// ---------------------------------------------------------------------------
const notFoundFile = join(DIST, "404.html");
if (!existsSync(notFoundFile)) {
  fail("404.html is missing", "GitHub Pages serves it for every address with no file");
} else {
  const nf = readFileSync(notFoundFile, "utf-8");
  const problems = [];
  if (existsSync(rootFile) && nf === readFileSync(rootFile, "utf-8")) {
    problems.push("it is byte-identical to index.html — the `cp` step is back");
  }
  if (/<link rel="canonical"/.test(nf)) {
    problems.push(
      `it declares a canonical URL (${/<link rel="canonical" href="([^"]*)"/.exec(nf)?.[1]}) — no URL is the right one for a page that does not exist`,
    );
  }
  if (/<meta property="og:url"/.test(nf)) problems.push("it carries an og:url");
  if (!/<meta name="robots" content="noindex"/.test(nf)) problems.push("it is not noindex");
  if (!nf.includes("404 Page Not Found")) {
    problems.push(`it does not render NotFound (title: ${/<title>([^<]*)<\/title>/.exec(nf)?.[1]})`);
  }
  if (problems.length === 0) ok("404.html is the NotFound page, noindex, and claims no URL");
  else fail(`404.html: ${problems.length} problem(s)`, problems.join("; "));
}

for (const f of failures) console.error(`\x1b[31m  FAIL  ${f}\x1b[0m`);
process.exit(failures.length === 0 ? 0 : 1);
