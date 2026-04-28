import { setRequestLocale } from "next-intl/server";
import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/lib/db/queries/categories";
import { safeQuery } from "@/lib/db/safe";

export default async function NewProductPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const categories = await safeQuery(() => listCategories(), [], "new.cats");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display mb-6 text-2xl font-bold">New product</h1>
      <ProductForm locale={locale} categories={categories} />
    </div>
  );
}
