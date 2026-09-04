/**
 * The locale set. Only `ko` until review adds `en` (see G10 in
 * docs/reap-plan/reap_v_0_18_release/07-i18n-docs-delegate.md). Every other
 * file in `i18n/` reads this list rather than naming a locale directly, so
 * adding one back is a matter of extending the union and this array.
 */
export type Locale = "ko";

export const LOCALES: Locale[] = ["ko"];

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
};

export const DEFAULT_LOCALE: Locale = "ko";
