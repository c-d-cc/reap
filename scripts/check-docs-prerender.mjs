/**
 * What is inside each prerendered page — the half of layer 1 that reads HTML.
 *
 * `check-docs-prerender.sh` counts files, checks sizes and paths, and runs
 * this. The split is by subject: the shell asks whether the right files exist,
 * this asks whether each one describes itself correctly.
 *
 * Why this exists separately from the shell (gen-096, second round): the first
 * version of the gate counted things. It counted 115 files, 23 titles per
 * locale, 6 hreflang links per page — and an independent review built three
 * defective sites that all passed it with 24 green lines and exit 0:
 *
 *   (a) every Korean, Japanese, German and Chinese page serving the ENGLISH
 *       page, with only `<html lang>` corrected. Titles are compared within a
 *       locale, so 23 English titles under /ko/ are 23 distinct titles. The
 *       canonical link on every one of them pointed at the English URL, which
 *       is an instruction to de-index the whole translation.
 *   (b) all six hreflang links on all 115 pages pointing at the site root. The
 *       count was still six.
 *   (c) the client JS bundle deleted. Every page still rendered statically;
 *       nothing hydrated, no navigation, no language menu.
 *
 * The common shape is that a count is satisfied by the wrong values. So this
 * file asserts values, and it derives what they should be from the file's own
 * position on disk rather than from the code that wrote it — importing
 * `entry-server.tsx` would make a wrong `localeUrl` agree with itself.
 *
 * The locale list is read from `docs/src/i18n/types.ts`, which owns it. The
 * prefix rule (English bare, everything else `/<locale>`) is restated here in
 * two lines, deliberately: a checker that shares its expectations with the
 * subject is not checking anything. If that rule ever changes, this fails
 * loudly rather than silently agreeing.
 *
 * ONE EXPECTATION THAT IS NOT INDEPENDENT
 *
 * `ORIGIN` is read from `docs/public/CNAME` — the same file the prerenderer
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
const DIST = join(ROOT, "docs", "dist", "public");
const SRC = join(ROOT, "docs", "src");

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

/** Every route the manifest declares. */
function routes() {
  const src = readFileSync(join(SRC, "routes.ts"), "utf-8");
  return [...src.matchAll(/^ {4}path: "([^"]+)"/gm)].map((x) => x[1]);
}

const LOCALES = locales();
const ROUTES = routes();

// Self-proving preamble. Every assertion below is "for each page, for each
// locale" — and both loops are empty if these parses fail, which would report
// a perfect run over nothing.
if (LOCALES.length < 2 || ROUTES.length < 15) {
  console.error(
    `\x1b[31m  FAIL  parsed ${LOCALES.length} locale(s) and ${ROUTES.length} route(s) from docs/src\x1b[0m`,
  );
  console.error(`\x1b[2m        every check below would pass vacuously\x1b[0m`);
  process.exit(1);
}
ok(`${LOCALES.length} locale(s) and ${ROUTES.length} route(s) read from docs/src`);

const ORIGIN = `https://${readFileSync(join(ROOT, "docs", "public", "CNAME"), "utf-8").trim()}`;

const prefixOf = (locale) => (locale === "en" ? "" : `/${locale}`);
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
  const locale = LOCALES.includes(rel[0]) && rel[0] !== "en" ? rel[0] : "en";
  const rest = locale === "en" ? rel : rel.slice(1);
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
 * `<main>` and not `#root`, and that is not a detail. The first version of the
 * cross-locale comparison below read all of `#root` and the reviewer's
 * all-English mutation walked straight through it — because the language
 * selector prints the CURRENT locale's label as its button ("English" vs
 * "한국어"), which is text, which differs per locale, on every page, whether or
 * not a single word was translated. The check was defeated by the one element
 * it was written to look past. `<main>` excludes the navbar entirely.
 *
 * Missing or malformed `<main>` yields "", which makes every comparison equal
 * and the run red. That is the direction to be wrong in.
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

  // A description is what a search result shows under the title. Twenty pages
  // shipped without one until gen-096 wrote the missing four in five
  // languages; `RouteMeta.description` is required now, so the compiler stops
  // a route being added without one and this stops the value going empty.
  const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "";
  if (description.trim().length < 20) {
    badDescription++;
    firstDescription ??= `${where}: description is ${description ? `"${description}"` : "absent"}`;
  }

  // (a) The canonical link is what tells a search engine which URL owns this
  // content. A Korean page claiming the English URL asks to be dropped.
  const canonical = /<link rel="canonical" href="([^"]*)"/.exec(html)?.[1];
  if (canonical !== urlOf(locale, route)) {
    badCanonical++;
    firstCanonical ??= `${where}: canonical is ${canonical}, expected ${urlOf(locale, route)}`;
  }

  // (b) Values, not a count. Each locale's alternate must name that locale's
  // URL of THIS route, and x-default must name the English one.
  const alternates = new Map(
    [...html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)].map((m) => [
      m[1],
      m[2],
    ]),
  );
  const expected = new Map([
    ...LOCALES.map((l) => [l, urlOf(l, route)]),
    ["x-default", urlOf("en", route)],
  ]);
  let alternatesWrong = alternates.size !== expected.size;
  for (const [k, v] of expected) if (alternates.get(k) !== v) alternatesWrong = true;
  if (alternatesWrong) {
    badAlternates++;
    firstAlternates ??= `${where}: ${alternates.size} alternate(s); ${expected.get(locale)} expected for ${locale}, got ${alternates.get(locale)}`;
  }

  // The language selector, in the body. Route-sensitive AND locale-sensitive,
  // so this is also what catches a page whose head is right and whose body is
  // some other page's — the failure a single hardcoded sample page only found
  // by luck.
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

  // Which entry the selector shows as current is the one thing in the body
  // that depends on the LOCALE rather than on the route. Everything else — the
  // head, the links, the sizes — is identical between two locales of a page
  // whose body was rendered in the wrong language, which is how four pages of
  // an all-English site survived the check above.
  //
  // This reads a Tailwind class string, so restyling that entry breaks it. It
  // breaks closed, which is the direction that is safe to be wrong in.
  const active = anchors.filter((a) => a.active);
  if (active.length !== 1 || active[0].locale !== locale) {
    badActive++;
    firstActive ??= `${where}: body was rendered for ${active.map((a) => a.locale).join(",") || "no"} locale, not ${locale}`;
  }

  // (c) A page that renders but references a bundle that is not there is a
  // page that never hydrates: no navigation, no language menu, nothing.
  //
  // Two assertions, because the first one alone is satisfied by a page with no
  // references at all — and that page is precisely the failure being guarded
  // against. An independent review deleted every `<script src="/assets/*.js">`
  // from all 115 pages and this section reported "every referenced asset
  // exists", truthfully and uselessly, over an empty set.
  for (const m of html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)) {
    if (!existsSync(join(DIST, m[1].slice(1)))) {
      badAsset++;
      firstAsset ??= `${where} references ${m[1]}, which does not exist`;
    }
  }
  // A <script>, matched as a <script>. Counting any `/assets/*.js` reference
  // also counted `<link rel="modulepreload" href="…">`, which downloads the
  // bundle and never runs it — measured: swapping every script tag for a
  // modulepreload passed this section on all 115 pages.
  const scripts = [...html.matchAll(/<script[^>]+src="(\/assets\/[^"]+\.js)"/g)].length;
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
report(badSelector, "every page's language selector points at its own translations", "%d page(s) have a wrong language selector", firstSelector);
report(badActive, "every page's language selector marks its own locale as current", "%d page(s) mark the wrong locale as current", firstActive);
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
  // The count comes first. `0 distinct values` out of nothing is a green line
  // in a locale with no pages at all — the shape this repository has a name
  // for. The run is red anyway when a locale is missing, from the two counts
  // above, but a green line saying a deleted locale is fine is a sentence a
  // future reader will quote.
  if (titles.length !== ROUTES.length)
    fail(`locale ${locale}: collected ${titles.length} title(s) from ${ROUTES.length} route(s)`);
  else if (empty > 0) fail(`locale ${locale}: ${empty} page(s) carry no page-specific <title>`);
  else if (distinct !== titles.length)
    fail(`locale ${locale}: ${titles.length - distinct} duplicate <title> value(s)`);
  else ok(`locale ${locale}: ${distinct} distinct <title> values`);
}

// ---------------------------------------------------------------------------
// The one comparison neither layer made: the same route, ACROSS locales.
//
// Everything above reads one page at a time, and the strongest thing it can
// say about the language of a body is which entry the selector marks as
// current — which comes from the `locale` PROP, not from a translated word.
// The remaining way an all-English site passes is `translations[locale] ?? en`
// in `src/i18n/index.ts` returning the English bundle: the prop is still ko,
// the head is genuinely Korean, the selector marks ko, and every visible word
// is English. An independent review built exactly that and every check above
// went green.
//
// Two locales of one route cannot have the same visible text unless one of
// them was not translated. Measured on the real build: 0 of 92 pairs are
// equal, and the shortest English <main> is 1,207 characters (/docs/comparison),
// so this is not a close call. (1,645 was the figure for all of `#root`, which
// is what the first, defeated version of this comparison read.)
//
// Attributes are excluded by construction — `visibleText` strips tags — which
// matters because hrefs differ per locale on every page and would make an
// all-English site look different from itself.
// ---------------------------------------------------------------------------
const untranslated = [];
for (const route of ROUTES) {
  // `has`, not truthiness. `visibleText` returns "" when a page has no <main>,
  // and `if (!enText) continue` skipped the whole route for it — so renaming
  // <main> to <section> made an all-English site pass with a green line. The
  // absent FILE is the missing-combination check's job; an absent <main> has
  // to land in the comparison, where "" === "" is red.
  if (!bodyText.has(`en ${route}`)) continue;
  const enText = bodyText.get(`en ${route}`);
  for (const locale of LOCALES) {
    if (locale === "en") continue;
    const key = `${locale} ${route}`;
    if (bodyText.has(key) && bodyText.get(key) === enText) untranslated.push(key);
  }
}
// Said directly as well as implied. Equality catching a missing <main> depends
// on both sides missing it; this catches one page losing its content region,
// and it names the real problem instead of reporting it as a translation one.
const noMain = [...bodyText.entries()].filter(([, text]) => text === "").map(([k]) => k);
if (noMain.length === 0) ok(`every page has a readable <main> region`);
else
  fail(
    `${noMain.length} page(s) have no readable <main>`,
    `${noMain.slice(0, 3).join(", ")} — the cross-locale comparison below reads it`,
  );

if (untranslated.length === 0)
  ok(`every translated page's visible text differs from the English one`);
else
  fail(
    `${untranslated.length} page(s) show the English text under a non-English URL`,
    untranslated.slice(0, 3).join(", "),
  );

// ---------------------------------------------------------------------------
// sitemap.xml — the URLs it lists, not how many.
//
// This is the file the whole generation exists for: without it, 114 of the 115
// pages have no path from anywhere a crawler already knows to themselves. The
// shell used to assert `grep -c '<loc>' == 115`, and an independent review
// replaced every single `<loc>` with `https://reap.cc/` — 115 entries, one
// distinct URL, the home page listed 115 times — and both layers passed.
//
// `buildSitemap` and the canonical links share `localeUrl`, so one wrong
// function rots both; asserting the count on one of them and the value on the
// other left the shared half unwatched.
// ---------------------------------------------------------------------------
const sitemapPath = join(DIST, "sitemap.xml");
if (!existsSync(sitemapPath)) {
  fail("sitemap.xml is missing", "115 pages cannot be discovered without it");
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
// The site root is prerendered in English.
//
// Redundant with the per-page checks above, and named anyway, because it is
// the one page whose language is now also a runtime decision: `main.tsx` sends
// a visitor standing on `/` to their own language once per tab. That decision
// happens in a browser, after these bytes have been served, and a crawler
// never sees it. If it ever moved into the build — a redirect stub at `/`, a
// locale chosen at render time — the site would lose the address every README
// link and every existing search result points at, and this is the line that
// would say so.
// ---------------------------------------------------------------------------
const rootFile = join(DIST, "index.html");
if (!existsSync(rootFile)) {
  fail("the site root has no index.html");
} else {
  const rootHtml = readFileSync(rootFile, "utf-8");
  const rootCanonical = /<link rel="canonical" href="([^"]*)"/.exec(rootHtml)?.[1];
  if (rootHtml.includes('<html lang="en"') && rootCanonical === `${ORIGIN}/`) {
    ok("the site root is prerendered in English and canonical to itself");
  } else {
    fail(
      "the site root is not the English page",
      `lang="${/<html lang="([^"]*)"/.exec(rootHtml)?.[1]}", canonical=${rootCanonical}`,
    );
  }
}

// ---------------------------------------------------------------------------
// 404.html — the page served at every address that has none.
//
// Made by `cp index.html 404.html` in the deploy workflow until gen-096. That
// was right while the site was a shell and wrong the moment prerendering made
// `index.html` a real page: measured at 28,069 bytes of English HOME PAGE,
// declaring `<link rel="canonical" href="https://reap.cc/">` and carrying the
// home page's `og:url` and `og:title` — so every dead link on the site
// declared itself the canonical site root and unfurled in Slack as the front
// page.
//
// It is rendered now, and what is asserted is what that fixes: it is the
// NotFound page rather than the home page, it claims no URL, and it asks not
// to be indexed.
// ---------------------------------------------------------------------------
const notFoundFile = join(DIST, "404.html");
if (!existsSync(notFoundFile)) {
  fail("404.html is missing", "GitHub Pages serves it for every address with no file");
} else {
  const nf = readFileSync(notFoundFile, "utf-8");
  const problems = [];
  // Not the home page. Byte equality is what the `cp` produced, and the
  // canonical is what made it harmful; both are named so a partial regression
  // (a copy made some other way) still fails.
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
