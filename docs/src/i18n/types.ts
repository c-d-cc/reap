export type Locale = "en" | "ko";

export const LOCALES: Locale[] = ["en", "ko"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
};

export const DEFAULT_LOCALE: Locale = "en";
