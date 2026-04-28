import type { MetadataRoute } from "next";
import { db } from "@/lib/db/client";
import { products, categories } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { locales } from "@/lib/i18n/config";

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://trihutbaba.kesug.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = ["", "/products", "/categories", "/about", "/contact"];

  const entries: MetadataRoute.Sitemap = [];
  for (const locale of locales) {
    for (const p of staticPaths) {
      entries.push({
        url: `${SITE_URL}/${locale}${p}`,
        lastModified: new Date(),
        changeFrequency: p === "" ? "daily" : "weekly",
        priority: p === "" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            locales.map((l) => [l, `${SITE_URL}/${l}${p}`])
          ),
        },
      });
    }
  }

  if (process.env.DATABASE_URL) {
    try {
      const allProducts = await db
        .select({ slug: products.slug, updatedAt: products.updatedAt })
        .from(products)
        .where(eq(products.status, "active"));
      for (const p of allProducts) {
        for (const locale of locales) {
          entries.push({
            url: `${SITE_URL}/${locale}/products/${p.slug}`,
            lastModified: p.updatedAt ?? undefined,
            changeFrequency: "weekly",
            priority: 0.8,
            alternates: {
              languages: Object.fromEntries(
                locales.map((l) => [l, `${SITE_URL}/${l}/products/${p.slug}`])
              ),
            },
          });
        }
      }

      const allCats = await db.select({ slug: categories.slug }).from(categories);
      for (const c of allCats) {
        for (const locale of locales) {
          entries.push({
            url: `${SITE_URL}/${locale}/categories/${c.slug}`,
            lastModified: new Date(),
            changeFrequency: "weekly",
            priority: 0.6,
            alternates: {
              languages: Object.fromEntries(
                locales.map((l) => [l, `${SITE_URL}/${l}/categories/${c.slug}`])
              ),
            },
          });
        }
      }
    } catch {
      // DB unavailable — fall back to static-only sitemap
    }
  }

  return entries;
}
