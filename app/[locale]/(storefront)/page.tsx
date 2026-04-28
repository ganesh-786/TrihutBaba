import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/storefront/hero";
import { FeatureStrip } from "@/components/storefront/feature-strip";
import { ProductCard } from "@/components/storefront/product-card";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/lib/db/queries/products";
import { listCategories } from "@/lib/db/queries/categories";
import { safeQuery } from "@/lib/db/safe";
import { ArrowRight } from "lucide-react";

export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "home" });

  const featured = await safeQuery(
    () => listProducts({ featured: true, pageSize: 8 }),
    { rows: [], total: 0, page: 1, pageSize: 8 },
    "home.featured"
  );

  const categories = await safeQuery(() => listCategories(), [], "home.categories");

  return (
    <>
      <Hero />
      <FeatureStrip />

      {categories.length > 0 && (
        <section className="container-x py-10">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">
              {t("shop_categories")}
            </h2>
            <Button asChild variant="ghost" size="sm">
              <Link href="/categories">
                {t("view_all")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {categories.slice(0, 12).map((c) => {
              const name = locale === "ne" ? c.nameNe : c.nameEn;
              return (
                <Link
                  key={c.id}
                  href={`/categories/${c.slug}`}
                  className="group flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-colors hover:border-primary"
                >
                  <span className="text-3xl">🌿</span>
                  <span className="text-sm font-medium group-hover:text-primary">
                    {name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="container-x py-10">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">
            {t("featured")}
          </h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/products">
              {t("view_all")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {featured.rows.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {featured.rows.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border-2 border-dashed bg-secondary/30 p-12 text-center text-sm text-muted-foreground">
            <p className="mb-2">No featured products yet.</p>
            <p>
              Once the admin adds products and marks them featured, they will
              appear here.
            </p>
          </div>
        )}
      </section>

      <section className="container-x my-16 rounded-3xl bg-primary p-10 text-primary-foreground sm:p-16">
        <div className="grid items-center gap-8 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold sm:text-4xl">
              {locale === "ne"
                ? "नेपालका किसानका लागि भरपर्दो साथी"
                : "A trusted partner for every Nepali farmer"}
            </h2>
            <p className="mt-3 text-primary-foreground/80">
              {locale === "ne"
                ? "गुणस्तरीय कृषि सामग्री, छिटो डेलिभरी, र विशेषज्ञ सल्लाह — एकै ठाउँमा।"
                : "Quality agriculture supplies, fast delivery, and expert advice — all in one place."}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 md:justify-end">
            <Button asChild size="lg" variant="secondary">
              <Link href="/products">
                {locale === "ne" ? "किनमेल गर्नुहोस्" : "Browse products"}
              </Link>
            </Button>
            <Button asChild size="lg" variant="accent">
              <Link href="/contact">
                {locale === "ne" ? "सम्पर्क" : "Contact us"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
