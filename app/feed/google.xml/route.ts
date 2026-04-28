import { db } from "@/lib/db/client";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";
export const revalidate = 3600;

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://trihutbaba.kesug.com";

function escape(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function GET() {
  let items: { sku: string | null; slug: string; nameEn: string; descriptionEn: string | null; priceNpr: string; stockQty: number; brand: string | null; image?: string }[] = [];
  try {
    if (process.env.DATABASE_URL) {
      const rows = await db.query.products.findMany({
        where: eq(products.status, "active"),
        with: { images: { limit: 1 } },
        limit: 1000,
      });
      items = rows.map((r) => ({
        sku: r.sku,
        slug: r.slug,
        nameEn: r.nameEn,
        descriptionEn: r.descriptionEn,
        priceNpr: r.priceNpr,
        stockQty: r.stockQty,
        brand: r.brand,
        image: r.images?.[0]?.url,
      }));
    }
  } catch {
    // DB unavailable
  }

  const xmlItems = items
    .map((p) => {
      const id = p.sku ?? p.slug;
      const link = `${SITE_URL}/en/products/${p.slug}`;
      const desc = (p.descriptionEn ?? p.nameEn).slice(0, 5000);
      return `
    <item>
      <g:id>${escape(id)}</g:id>
      <g:title>${escape(p.nameEn)}</g:title>
      <g:description>${escape(desc)}</g:description>
      <g:link>${link}</g:link>
      ${p.image ? `<g:image_link>${escape(p.image)}</g:image_link>` : ""}
      <g:availability>${p.stockQty > 0 ? "in_stock" : "out_of_stock"}</g:availability>
      <g:price>${p.priceNpr} NPR</g:price>
      <g:condition>new</g:condition>
      ${p.brand ? `<g:brand>${escape(p.brand)}</g:brand>` : "<g:brand>Trihutbaba</g:brand>"}
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Trihutbaba Store &amp; Machinery</title>
    <link>${SITE_URL}</link>
    <description>Agriculture tools, seeds, fertilizers and machinery in Nepal.</description>${xmlItems}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
