import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/lib/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { ProductGallery } from "@/components/storefront/product-gallery";
import { AddToCartButton } from "@/components/storefront/add-to-cart-button";
import { ProductCard } from "@/components/storefront/product-card";
import { ProductJsonLd, BreadcrumbJsonLd } from "@/components/seo/product-jsonld";
import {
  getProductBySlug,
  getRelatedProducts,
} from "@/lib/db/queries/products";
import { safeQuery } from "@/lib/db/safe";
import { formatNpr } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";
import { ChevronRight } from "lucide-react";

export const revalidate = 120;

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const product = await safeQuery(() => getProductBySlug(slug), null, "meta");
  if (!product) return {};
  const name = locale === "ne" ? product.nameNe : product.nameEn;
  const desc =
    (locale === "ne"
      ? product.seoDescriptionNe ?? product.descriptionNe
      : product.seoDescriptionEn ?? product.descriptionEn) ?? name;
  return {
    title: name,
    description: desc?.slice(0, 160),
    openGraph: {
      title: name,
      description: desc?.slice(0, 160),
      images: product.images.map((i) => ({ url: i.url, alt: i.altEn ?? name })),
      type: "website",
    },
    alternates: {
      canonical: `/${locale}/products/${product.slug}`,
      languages: {
        en: `/en/products/${product.slug}`,
        ne: `/ne/products/${product.slug}`,
      },
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "product" });

  const product = await safeQuery(
    () => getProductBySlug(slug),
    null,
    "product.detail"
  );
  if (!product) notFound();

  const related = await safeQuery(
    () => getRelatedProducts(product.id, product.categoryId ?? null, 4),
    [],
    "product.related"
  );

  const name = locale === "ne" ? product.nameNe : product.nameEn;
  const desc = locale === "ne" ? product.descriptionNe : product.descriptionEn;
  const price = Number(product.priceNpr);
  const compare = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const hasDiscount = compare && compare > price;

  const SITE_URL =
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://trihutbaba.kesug.com";
  const breadcrumbs = [
    { name: locale === "ne" ? "गृहपृष्ठ" : "Home", url: `${SITE_URL}/${locale}` },
    {
      name: locale === "ne" ? "उत्पादनहरू" : "Products",
      url: `${SITE_URL}/${locale}/products`,
    },
    { name, url: `${SITE_URL}/${locale}/products/${product.slug}` },
  ];

  return (
    <>
      <ProductJsonLd product={product} locale={locale as Locale} />
      <BreadcrumbJsonLd items={breadcrumbs} />

      <div className="container-x py-6">
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-1 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-primary">
            {locale === "ne" ? "गृहपृष्ठ" : "Home"}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/products" className="hover:text-primary">
            {locale === "ne" ? "उत्पादनहरू" : "Products"}
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/categories/${product.category.slug}`}
                className="hover:text-primary"
              >
                {locale === "ne" ? product.category.nameNe : product.category.nameEn}
              </Link>
            </>
          )}
        </nav>

        <div className="grid gap-10 lg:grid-cols-2">
          <ProductGallery images={product.images} name={name} />

          <div className="space-y-5">
            {product.brand && (
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {product.brand}
              </span>
            )}
            <h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl">
              {name}
            </h1>
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-primary">
                {formatNpr(price, locale as Locale)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-base text-muted-foreground line-through">
                    {formatNpr(compare!, locale as Locale)}
                  </span>
                  <Badge variant="destructive">
                    {t("save", { amount: formatNpr(compare! - price, locale as Locale) })}
                  </Badge>
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {product.stockQty > 5 ? (
                <Badge variant="success">{t("in_stock")}</Badge>
              ) : product.stockQty > 0 ? (
                <Badge variant="warning">
                  {t("low_stock", { count: product.stockQty })}
                </Badge>
              ) : (
                <Badge variant="destructive">{t("out_of_stock")}</Badge>
              )}
              {product.sku && (
                <span className="text-xs text-muted-foreground">
                  {t("sku")}: {product.sku}
                </span>
              )}
            </div>

            {desc && (
              <div className="prose prose-sm max-w-none text-muted-foreground">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                  {t("description")}
                </h2>
                <p className="whitespace-pre-line">{desc}</p>
              </div>
            )}

            <AddToCartButton product={product} />

            <dl className="grid grid-cols-2 gap-3 border-t pt-4 text-sm">
              {product.brand && (
                <div>
                  <dt className="text-muted-foreground">{t("brand")}</dt>
                  <dd className="font-medium">{product.brand}</dd>
                </div>
              )}
              {product.weightKg && (
                <div>
                  <dt className="text-muted-foreground">{t("weight")}</dt>
                  <dd className="font-medium">{product.weightKg} kg</dd>
                </div>
              )}
              {product.category && (
                <div>
                  <dt className="text-muted-foreground">{t("category")}</dt>
                  <dd className="font-medium">
                    {locale === "ne" ? product.category.nameNe : product.category.nameEn}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-display mb-6 text-2xl font-bold">{t("related")}</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
