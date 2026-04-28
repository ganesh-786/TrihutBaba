import { setRequestLocale, getTranslations } from "next-intl/server";
import { listCategories } from "@/lib/db/queries/categories";
import { safeQuery } from "@/lib/db/safe";
import { CategoriesManager } from "@/components/admin/categories-manager";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });
  const categories = await safeQuery(() => listCategories(), [], "admin.cats");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display mb-6 text-2xl font-bold">{t("categories")}</h1>
      <CategoriesManager locale={locale} initial={categories} />
    </div>
  );
}
