export type Locale = "en" | "ko" | "zh-CN" | "de" | "ja";

export const LOCALES: Locale[] = ["en", "ko", "zh-CN", "de", "ja"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ko: "한국어",
  "zh-CN": "简体中文",
  de: "Deutsch",
  ja: "日本語",
};

export const DEFAULT_LOCALE: Locale = "en";
