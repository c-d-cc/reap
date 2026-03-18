import { useLanguage, LOCALES, LOCALE_LABELS, type Locale } from "@/i18n";
import { Globe } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function LanguageSelector() {
  const { locale, setLocale } = useLanguage();
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
      {open && (
        <div className="absolute left-0 top-full mt-2 bg-popover border border-border rounded-md shadow-md py-1 min-w-[120px] z-50">
          {LOCALES.map((l: Locale) => (
            <button
              key={l}
              onClick={() => { setLocale(l); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 text-sm hover:bg-muted transition-colors ${l === locale ? "text-primary font-medium" : "text-foreground"}`}
            >
              {LOCALE_LABELS[l]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
