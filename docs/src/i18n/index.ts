import { useLanguage } from "./context";
import { en, type Translations } from "./translations/en";
import type { Locale } from "./types";

// Translations will be added back when localization is complete
const translations: Record<string, Translations> = { en };

export function useT(): Translations {
  const { locale } = useLanguage();
  return translations[locale] ?? translations.en;
}

export { LanguageProvider, useLanguage } from "./context";
export { LOCALES, LOCALE_LABELS, type Locale } from "./types";
