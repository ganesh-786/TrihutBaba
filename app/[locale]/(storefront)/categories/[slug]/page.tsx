import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { ProductCard } from "@/components/storefront/product-card";
import { getCategoryBySlug } from "@/lib/db/queries/categories";
import { listProducts } from "@/lib/db/queries/products";
import { safeQuery } from "@/lib/db/safe";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const cat = await safeQuery(() => getCategoryBySlug(slug), null, "cat.meta");
  if (!cat) return {};
  const name = locale === "ne" ? cat.nameNe : cat.nameEn;
  return {
    title: name,
    description:
      (locale === "ne" ? cat.descriptionNe : cat.descriptionEn) ?? name,
    alternates: {
      canonical: `/${locale}/categories/${cat.slug}`,
      languages: {
        en: `/en/categories/${cat.slug}`,
        ne: `/ne/categories/${cat.slug}`,
      },
    },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const cat = await safeQuery(() => getCategoryBySlug(slug), null, "cat");
  if (!cat) notFound();

  const products = await safeQuery(
    () => listProducts({ categorySlug: slug, pageSize: 24 }),
    { rows: [], total: 0, page: 1, pageSize: 24 },
    "cat.products"
  );

  const name = locale === "ne" ? cat.nameNe : cat.nameEn;
  const desc = locale === "ne" ? cat.descriptionNe : cat.descriptionEn;

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">{name}</h1>
      {desc && <p className="mt-2 text-muted-foreground">{desc}</p>}

      <div className="mt-8">
        {products.rows.length === 0 ? (
          <p className="rounded-xl border-2 border-dashed bg-secondary/30 p-12 text-center text-sm text-muted-foreground">
            {locale === "ne"
              ? "यस वर्गमा अहिले उत्पादन छैन।"
              : "No products in this category yet."}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.rows.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
