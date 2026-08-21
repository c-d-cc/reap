import { useLocation } from "wouter";
import { useLanguage, LOCALES, LOCALE_LABELS, type Locale } from "@/i18n";
import { localeHref } from "@/i18n/locale-path";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

/**
 * Switching language is a navigation, so the entries are links.
 *
 * They used to be buttons that wrote to `localStorage` and re-rendered in
 * place, which left all five languages sharing one URL. Now each entry is the
 * address of this same page in that language — which also means a crawler
 * following them finds the other four translations, and the browser's back
 * button undoes a language change.
 *
 * `useLocation` returns the path with the locale prefix already removed, so
 * `localeHref` can put a different one on the front.
 */
export function LanguageSelector() {
  const { locale } = useLanguage();
  const [route] = useLocation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors text-sm cursor-pointer rounded px-1.5 py-1"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs hidden sm:inline">{LOCALE_LABELS[locale]}</span>
      </button>
      {/* Rendered whether or not the menu is open, and hidden with a class.
          A conditional render would keep the four translations out of the
          prerendered HTML entirely, which is the opposite of the point. */}
      <div
        className={`absolute left-0 top-full mt-2 bg-popover border border-border rounded-md shadow-md py-1 min-w-[120px] z-50 ${open ? "" : "hidden"}`}
      >
        {LOCALES.map((l: Locale) => (
          <a
            key={l}
            href={localeHref(l, route)}
            hrefLang={l}
            onClick={() => setOpen(false)}
            className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors ${l === locale ? "text-primary font-medium" : "text-foreground"}`}
          >
            {LOCALE_LABELS[l]}
          </a>
        ))}
      </div>
    </div>
  );
}
