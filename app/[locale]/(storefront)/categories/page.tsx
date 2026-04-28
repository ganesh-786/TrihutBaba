import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { listCategories } from "@/lib/db/queries/categories";
import { safeQuery } from "@/lib/db/safe";

export const revalidate = 600;

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "nav" });
  const categories = await safeQuery(() => listCategories(), [], "cats");

  return (
    <div className="container-x py-10">
      <h1 className="font-display mb-8 text-3xl font-bold sm:text-4xl">
        {t("categories")}
      </h1>
      {categories.length === 0 ? (
        <p className="text-muted-foreground">
          {locale === "ne" ? "अहिले कुनै वर्ग छैन।" : "No categories yet."}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/categories/${c.slug}`}
              className="group flex flex-col items-center gap-3 rounded-2xl border bg-card p-6 text-center transition-all hover:border-primary hover:shadow-md"
            >
              <span className="text-5xl">🌿</span>
              <span className="font-semibold group-hover:text-primary">
                {locale === "ne" ? c.nameNe : c.nameEn}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
