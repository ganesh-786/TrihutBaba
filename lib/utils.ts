import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNpr(
  amount: number | string,
  locale: "en" | "ne" = "en"
) {
  const value = typeof amount === "string" ? Number(amount) : amount;
  if (Number.isNaN(value)) return "—";
  const formatter = new Intl.NumberFormat(locale === "ne" ? "ne-NP" : "en-IN", {
    style: "currency",
    currency: "NPR",
    maximumFractionDigits: 0,
  });
  return formatter.format(value);
}

export function formatDate(
  date: Date | string,
  locale: "en" | "ne" = "en"
) {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale === "ne" ? "ne-NP" : "en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(d);
}

export function generateOrderNo(seq?: number) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const tail =
    seq !== undefined
      ? String(seq).padStart(4, "0")
      : Math.floor(1000 + Math.random() * 9000).toString();
  return `TRIHUT-${year}${month}-${tail}`;
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u0900-\u097F\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function truncate(text: string, max: number) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}
