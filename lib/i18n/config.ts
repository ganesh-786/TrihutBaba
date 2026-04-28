export const locales = ["en", "ne"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const localeNames: Record<Locale, string> = {
  en: "English",
  ne: "नेपाली",
};

export const localeDirection: Record<Locale, "ltr" | "rtl"> = {
  en: "ltr",
  ne: "ltr",
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}
