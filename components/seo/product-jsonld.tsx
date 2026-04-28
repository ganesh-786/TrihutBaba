import type { ProductWithImages } from "@/lib/db/queries/products";
import type { Locale } from "@/lib/i18n/config";

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://trihutbaba.kesug.com";

export function ProductJsonLd({
  product,
  locale,
}: {
  product: ProductWithImages;
  locale: Locale;
}) {
  const name = locale === "ne" ? product.nameNe : product.nameEn;
  const description =
    (locale === "ne" ? product.descriptionNe : product.descriptionEn) ?? name;
  const data = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    sku: product.sku ?? undefined,
    brand: product.brand
      ? { "@type": "Brand", name: product.brand }
      : undefined,
    image: product.images.map((i) => i.url).filter(Boolean),
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/${locale}/products/${product.slug}`,
      priceCurrency: "NPR",
      price: Number(product.priceNpr),
      availability:
        product.stockQty > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: { "@type": "Organization", name: "Trihutbaba" },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function BreadcrumbJsonLd({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: it.url,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
