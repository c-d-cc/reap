import { useLanguage } from "./context";
import { ko, type Translations } from "./translations/ko";

const translations: Record<string, Translations> = { ko };

export function useT(): Translations {
  const { locale } = useLanguage();
  return translations[locale] ?? translations.ko;
}

export { LanguageProvider, useLanguage } from "./context";
export { LOCALES, LOCALE_LABELS, type Locale } from "./types";
