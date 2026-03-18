import { useLanguage } from "./context";
import { en, type Translations } from "./translations/en";
import { ko } from "./translations/ko";
import type { Locale } from "./types";

const translations: Record<Locale, Translations> = { en, ko };

export function useT(): Translations {
  const { locale } = useLanguage();
  return translations[locale];
}

export { LanguageProvider, useLanguage } from "./context";
export { LOCALES, LOCALE_LABELS, type Locale } from "./types";
