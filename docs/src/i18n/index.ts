import { useLanguage } from "./context";
import { en, type Translations } from "./translations/en";
import { ko } from "./translations/ko";
import { zhCN } from "./translations/zh-CN";
import { de } from "./translations/de";
import { ja } from "./translations/ja";

const translations: Record<string, Translations> = { en, ko, "zh-CN": zhCN, de, ja };

export function useT(): Translations {
  const { locale } = useLanguage();
  return translations[locale] ?? translations.en;
}

export { LanguageProvider, useLanguage } from "./context";
export { LOCALES, LOCALE_LABELS, type Locale } from "./types";
