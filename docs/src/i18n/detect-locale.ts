/**
 * Which of the five translations a browser's language preferences ask for.
 *
 * This is NOT how the app decides which locale to render — the URL is, and
 * only the URL (see `locale-path.ts`). This answers a narrower question, asked
 * in exactly one place: a visitor has landed on `/`, the site root, which is
 * English because that is the address English owns. Should they be sent to
 * their own language once?
 *
 * Keeping the two apart is the whole point. When `navigator.language` decided
 * what to render, five languages shared one URL, a crawler could index only
 * one of them, and the ambient environment picked the language during a server
 * render. Here it decides a one-time client-side move between two URLs that
 * both exist and both stay indexable.
 *
 * A pure function of the tag list so that it is testable without a browser;
 * `main.tsx` supplies `navigator.languages`.
 */
import { LOCALES, DEFAULT_LOCALE, type Locale } from "./types";
import { localeHref } from "./locale-path";

/**
 * The first tag that names a translation we have, or null.
 *
 * Tags are BCP-47: `ko`, `ko-KR`, `zh-Hans-CN`. Matching is on the primary
 * subtag, since `de-AT` should get German, with Chinese as the one exception —
 * `zh-CN` is Simplified, and sending a Traditional reader (`zh-TW`, `zh-HK`)
 * to it would be a worse answer than leaving them on English, which they can
 * change with the selector in the navbar. So Traditional matches nothing and
 * the next tag in the list gets its turn.
 */
export function preferredLocale(tags: readonly string[]): Locale | null {
  for (const raw of tags) {
    // `navigator.languages` is a string list in every browser; a non-string
    // here would throw, and the throw would be outside the caller's try —
    // taking hydration down with it. Skipping costs one comparison.
    if (typeof raw !== "string") continue;
    const tag = raw.trim().toLowerCase();
    if (!tag) continue;
    const [primary, ...rest] = tag.split("-");

    if (primary === "zh") {
      const script = rest.join("-");
      if (script === "" || script === "cn" || script === "sg" || script.startsWith("hans")) {
        return "zh-CN";
      }
      continue;
    }

    const hit = LOCALES.find((l) => l === primary);
    if (hit) return hit;
  }
  return null;
}

/**
 * Where a visitor standing on `/` should be sent, or null to leave them there.
 *
 * Deliberately narrow, in three ways, and each one is load-bearing:
 *
 *   - **`/` and nothing else.** Not `/docs/*`, not a locale root. Those
 *     addresses were chosen — by a link, a search result, a README — and
 *     moving someone off an address they asked for is how a redirect becomes a
 *     thing people fight. `/` is the only address nobody picked a language at.
 *   - **Only on the tab's FIRST page.** `tabHasSeenAPage` is the caller's
 *     record of having already served this tab something. An arrival at `/`
 *     after that is a move the visitor made — clicking English in the navbar,
 *     clicking the logo — and moving them back is overruling a choice with a
 *     browser default.
 *
 *     This started as "have we redirected before", which is a narrower fact
 *     and the wrong one. A Korean visitor arriving at `/ko/` from a search
 *     result had never been redirected, so picking English took them to `/`
 *     and this function sent them straight back to `/ko/` — measured in a
 *     browser for all four locales. The second click worked, because the
 *     bounce itself recorded the redirect, which is a worse symptom than a
 *     button that never works.
 *   - **Never for English.** `/` already is English. Returning it would be a
 *     redirect to the current page.
 *
 * `suffix` is the query string and fragment, carried across verbatim. Without
 * it `/?utm_source=x` became `/ko/` and `/#top` became `/ko/` — every campaign
 * parameter and every anchor on a shared root link discarded, but only for
 * non-English visitors, which is the kind of asymmetry nobody notices. It is a
 * parameter rather than a `location` read so that this stays a pure function
 * and the behaviour is testable without a browser.
 *
 * The prerendered `/` stays English whatever this returns: it runs in a
 * browser, after the bytes a crawler sees have already been served. That is
 * why it is a client-side move and not a build-time or hosting-level one.
 */
export function rootRedirectTarget(
  pathname: string,
  tags: readonly string[],
  tabHasSeenAPage: boolean,
  suffix = "",
): string | null {
  if (pathname !== "/") return null;
  if (tabHasSeenAPage) return null;
  const locale = preferredLocale(tags);
  if (!locale || locale === DEFAULT_LOCALE) return null;
  return localeHref(locale, "/") + suffix;
}
