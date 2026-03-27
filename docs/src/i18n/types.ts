export type Locale = "en" | "ko" | "ja" | "zh-CN";

export const LOCALES: Locale[] = ["en", "ko", "ja", "zh-CN"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  ja: "日本語",
  "zh-CN": "简体中文",
};

export const DEFAULT_LOCALE: Locale = "en";
