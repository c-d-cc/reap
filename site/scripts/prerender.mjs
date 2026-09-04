/**
 * Write what `src/entry-server.tsx` renders to disk.
 *
 * This file does I/O and nothing else. It is not typechecked — `docs/tsconfig.json`
 * includes `src/**` only — so it holds no logic that could be wrong quietly.
 *
 * Run after both vite builds:
 *   vite build                                            -> dist/public   (client)
 *   vite build --ssr src/entry-server.tsx --outDir dist/server
 *   node scripts/prerender.mjs
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DOCS = dirname(dirname(fileURLToPath(import.meta.url)));
const PUBLIC_DIR = join(DOCS, "dist", "public");

// The site's own name is written down once, in the file that puts it in DNS.
// Repeating it as a constant here would be a second thing to keep in step with
// the first, for no gain.
const cname = (await readFile(join(DOCS, "public", "CNAME"), "utf-8")).trim();
if (!cname) throw new Error("prerender: docs/public/CNAME is empty — cannot build absolute URLs");
const origin = `https://${cname}`;

const template = await readFile(join(PUBLIC_DIR, "index.html"), "utf-8");

const { renderAll, renderNotFound, buildSitemap, buildRobotsTxt } = await import(
  pathToFileURL(join(DOCS, "dist", "server", "entry-server.js")).href
);

const pages = renderAll(template, origin);

for (const page of pages) {
  const target = join(PUBLIC_DIR, page.filePath);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, page.html, "utf-8");
}

await writeFile(join(PUBLIC_DIR, "sitemap.xml"), buildSitemap(origin), "utf-8");
await writeFile(join(PUBLIC_DIR, "robots.txt"), buildRobotsTxt(origin), "utf-8");

// GitHub Pages serves this file, with a 404 status, for any address that has
// no file. The deploy workflow used to make it with `cp index.html 404.html`,
// which after prerendering meant every dead URL served the home page and
// claimed to be the site root — see renderNotFound. That `cp` step is gone.
await writeFile(join(PUBLIC_DIR, "404.html"), renderNotFound(template), "utf-8");

const bytes = pages.reduce((sum, p) => sum + p.html.length, 0);
console.log(
  `prerendered ${pages.length} page(s) at ${origin} — ${(bytes / 1024).toFixed(0)} kB of HTML, plus 404.html, sitemap.xml and robots.txt`,
);
