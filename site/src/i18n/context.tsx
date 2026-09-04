import { createContext, useContext, type ReactNode } from "react";
import { DEFAULT_LOCALE, type Locale } from "./types";

/**
 * The locale is a prop, not state.
 *
 * It used to be `useState(detectLocale)`, where `detectLocale` read
 * `localStorage` and `navigator.language`. Two things were wrong with that.
 *
 * The visible one: it ran during render, so `renderToString` threw
 * `ReferenceError: localStorage is not defined` before producing a byte. That
 * single line was the whole of what stood between this app and being
 * prerenderable — every other browser API in the tree is inside a `useEffect`
 * or an event handler.
 *
 * The quieter one: it was a second source of truth. Once `/ko/docs/x` names the
 * locale, a stored value that disagrees can only produce German text under a
 * Korean URL. So the storage is gone rather than reconciled.
 *
 * Deleting `detectLocale` also removes a bug it had carried since it was
 * written: the stored-value check listed `en`, `ko`, `ja` and `zh-CN` but not
 * `de`, so anyone who chose German lost the choice on the next page load.
 *
 * `navigator.language` is still read, in one place and for a different
 * question: `rootRedirectTarget` in `detect-locale.ts` decides, once per tab
 * and only on `/`, whether to move the visitor to their own language's URL. It
 * chooses between two addresses; it never chooses what an address renders. The
 * distinction is the difference between five languages sharing one URL and
 * five languages each having one.
 */
interface LanguageContextValue {
  locale: Locale;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: DEFAULT_LOCALE,
});

export function LanguageProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LanguageContext.Provider value={{ locale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
