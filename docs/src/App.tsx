import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useEffect } from "react";
import { LanguageProvider } from "@/i18n";
import { type Locale } from "@/i18n/types";
import { localePrefix, stripTrailingSlash } from "@/i18n/locale-path";
import { useBrowserLocation } from "wouter/use-browser-location";
import { ROUTES } from "@/routes";

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
}

const queryClient = new QueryClient();

/**
 * wouter's own location hook, with the host's trailing slash taken off.
 *
 * The prerenderer renders `/docs/quick-start`; GitHub Pages serves that file
 * from a directory and 301s the browser to `/docs/quick-start/`. Without this
 * the two disagree, and `useLocation()` is read while rendering in two places
 * — so the disagreement is a hydration mismatch, not a cosmetic one.
 *
 * Replacing the hook rather than normalising at each caller means every
 * present and future reader of `useLocation()` sees one form. `<Link>` is
 * unaffected: it builds hrefs from `base + href`, never from the location.
 */
const useNormalizedLocation: typeof useBrowserLocation = (opts) => {
  const [path, navigate] = useBrowserLocation(opts);
  return [stripTrailingSlash(path), navigate];
};

function Router() {
  return (
    <Switch>
      {ROUTES.map((r) => (
        <Route key={r.path} path={r.path} component={r.component} />
      ))}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * `locale` and `ssrPath` are what makes this tree renderable on a server.
 *
 * The locale arrives as a prop because it is a fact about the URL, and the URL
 * is known in both places: the browser reads `location.pathname`, the
 * prerenderer knows which page it is building. Nothing has to be detected.
 *
 * `base` is the locale prefix, so the routes in `routes.ts` are declared once
 * rather than once per locale. wouter strips `base` from the location before matching and
 * prepends it to every `<Link>`, which means the sidebar and navbar point at
 * `/ko/docs/…` inside a Korean page without knowing that locales exist.
 *
 * `ssrPath` removes the last browser global from the render path: wouter only
 * reads the real `location` when `ssrPath` is absent.
 *
 * It is NOT the same path the browser will have, which is what an earlier
 * version of this comment claimed. The prerenderer writes `<route>/index.html`
 * and GitHub Pages answers `/route` with a 301 to `/route/`, so the browser
 * hydrates one slash away from what was rendered. `useNormalizedLocation`
 * above is what closes that gap, and `assertSlashInvariant` in entry-server.tsx
 * refuses to build if it ever stops closing it.
 */
function App({ locale, ssrPath }: { locale: Locale; ssrPath?: string }) {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  const base = import.meta.env.BASE_URL.replace(/\/$/, "") + localePrefix(locale);

  return (
    <LanguageProvider locale={locale}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <WouterRouter base={base} ssrPath={ssrPath} hook={useNormalizedLocation}>
            <ScrollToTop />
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </LanguageProvider>
  );
}

export default App;
