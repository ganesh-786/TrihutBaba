import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ProductCard } from "@/components/storefront/product-card";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { listProducts } from "@/lib/db/queries/products";
import { listCategories } from "@/lib/db/queries/categories";
import { safeQuery } from "@/lib/db/safe";

export const revalidate = 120;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return {
    title: t("products"),
    description:
      locale === "ne"
        ? "नेपालका किसानका लागि गुणस्तरीय कृषि औजार, बीउ, मल र मेसिनरी।"
        : "Quality agriculture tools, seeds, fertilizers and machinery for farmers in Nepal.",
  };
}

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function ProductsPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "nav" });

  const page = Math.max(1, Number(sp.page) || 1);
  const result = await safeQuery(
    () =>
      listProducts({
        q: sp.q,
        categorySlug: sp.category,
        sort: (sp.sort as never) || "newest",
        page,
        pageSize: 24,
      }),
    { rows: [], total: 0, page, pageSize: 24 },
    "products.list"
  );
  const categories = await safeQuery(() => listCategories(), [], "products.cats");

  const totalPages = Math.max(1, Math.ceil(result.total / result.pageSize));

  return (
    <div className="container-x py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {sp.q
              ? locale === "ne"
                ? `"${sp.q}" को परिणाम`
                : `Results for "${sp.q}"`
              : t("products")}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {result.total}{" "}
            {locale === "ne" ? "उत्पादनहरू भेटिए" : "products found"}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <aside className="space-y-6">
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {locale === "ne" ? "वर्गहरू" : "Categories"}
            </h3>
            <ul className="space-y-1">
              <li>
                <Link
                  href="/products"
                  className={`block rounded px-2 py-1.5 text-sm hover:bg-accent/30 ${
                    !sp.category ? "font-semibold text-primary" : ""
                  }`}
                >
                  {locale === "ne" ? "सबै उत्पादन" : "All products"}
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/products?category=${c.slug}`}
                    className={`block rounded px-2 py-1.5 text-sm hover:bg-accent/30 ${
                      sp.category === c.slug ? "font-semibold text-primary" : ""
                    }`}
                  >
                    {locale === "ne" ? c.nameNe : c.nameEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <section>
          {result.rows.length > 0 ? (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                {result.rows.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="mt-10 flex items-center justify-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => {
                    const p = i + 1;
                    const params = new URLSearchParams();
                    if (sp.q) params.set("q", sp.q);
                    if (sp.category) params.set("category", sp.category);
                    if (sp.sort) params.set("sort", sp.sort);
                    if (p > 1) params.set("page", String(p));
                    const qs = params.toString();
                    return (
                      <Button
                        key={p}
                        asChild
                        size="sm"
                        variant={p === page ? "default" : "outline"}
                      >
                        <Link href={`/products${qs ? `?${qs}` : ""}`}>{p}</Link>
                      </Button>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border-2 border-dashed bg-secondary/30 p-12 text-center text-sm text-muted-foreground">
              {locale === "ne" ? "कुनै उत्पादन भेटिएन।" : "No products found."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
