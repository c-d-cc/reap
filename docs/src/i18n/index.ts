import { useLanguage } from "./context";
import { en, type Translations } from "./translations/en";
import { ko } from "./translations/ko";
import { ja } from "./translations/ja";
import { zhCN } from "./translations/zh-CN";
import type { Locale } from "./types";

const translations: Record<Locale, Translations> = { en, ko, ja, "zh-CN": zhCN };

export function useT(): Translations {
  const { locale } = useLanguage();
  return translations[locale];
}

export { LanguageProvider, useLanguage } from "./context";
export { LOCALES, LOCALE_LABELS, type Locale } from "./types";
