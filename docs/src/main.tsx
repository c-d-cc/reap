import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App";
import { parseLocalePath } from "./i18n/locale-path";
import { rootRedirectTarget } from "./i18n/detect-locale";
import "./index.css";

document.documentElement.classList.add("dark");

/**
 * The one place a browser's language preference is consulted, and it moves
 * between two URLs rather than choosing what to render.
 *
 * `location.replace`, not `assign`: it overwrites the `/` entry in history
 * instead of pushing a new one, so Back from `/ko/` returns to wherever the
 * visitor came from. With `assign`, Back would land on `/` — which would
 * redirect again, and Back would be a loop the visitor cannot escape.
 *
 * The session flag records that this TAB HAS BEEN SERVED A PAGE, and it is
 * written on every load, before anything is decided. Not "we redirected once":
 * that was the first version and it was wrong in a way worth keeping written
 * down. The language entries in the navbar are plain `<a href>` — a full
 * document load, not a client-side navigation — so picking English runs this
 * file again, at `/`. A visitor who entered the site at `/ko/` from a search
 * result had no flag, and was thrown straight back to `/ko/`; the second click
 * worked, because the bounce had written the flag. Measured in a browser, in
 * all four non-English locales, by an independent review.
 *
 * With the flag written on arrival, the rule reads the way it is meant to: a
 * tab's FIRST page, if it is `/`, may be moved to the visitor's language.
 * Every later arrival at `/` is something the visitor did.
 *
 * Storage throwing (Safari private browsing, a locked-down profile) means no
 * redirect at all. That direction is deliberate: the alternative is redirecting
 * without being able to record it, which is the loop again.
 *
 * This is not the locale decision. `parseLocalePath` below reads the URL, as
 * it does on every page — a redirected visitor is simply a visitor at `/ko/`.
 */
const TAB_SEEN_FLAG = "reap-docs-tab-seen";

function redirectFromRootOnce(): void {
  let tabHasSeenAPage: boolean;
  try {
    tabHasSeenAPage = sessionStorage.getItem(TAB_SEEN_FLAG) !== null;
    // Written here, unconditionally and before the decision: every page this
    // tab is served marks it, so an arrival at `/` later is the visitor's own.
    sessionStorage.setItem(TAB_SEEN_FLAG, "1");
  } catch {
    return;
  }

  const tags = navigator.languages?.length ? navigator.languages : [navigator.language];
  const target = rootRedirectTarget(window.location.pathname, tags, tabHasSeenAPage);
  if (!target) return;

  window.location.replace(target);
}

redirectFromRootOnce();

const container = document.getElementById("root")!;
const { locale } = parseLocalePath(window.location.pathname);

// A production page arrives with markup already in it; `vite dev` serves an
// empty `#root`. Hydrating an empty container is not the same operation as
// rendering into one, so the branch is on what is actually there rather than on
// a build-time flag — which would be wrong in exactly one of the two cases.
//
// This runs even when a redirect is under way. `location.replace` does not stop
// the current script, and the alternative — returning early — would leave a
// static, unclickable page on the screen for the whole of the navigation, and
// permanently if the navigation were ever blocked.
if (container.firstChild) {
  hydrateRoot(container, <App locale={locale} />);
} else {
  createRoot(container).render(<App locale={locale} />);
}
