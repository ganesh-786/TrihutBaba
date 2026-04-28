import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProductForm } from "@/components/admin/product-form";
import { listCategories } from "@/lib/db/queries/categories";
import { getProductById } from "@/lib/db/queries/products";
import { safeQuery } from "@/lib/db/safe";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const product = await safeQuery(() => getProductById(id), null, "edit.p");
  if (!product) notFound();
  const categories = await safeQuery(() => listCategories(), [], "edit.cats");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display mb-6 text-2xl font-bold">Edit product</h1>
      <ProductForm locale={locale} categories={categories} product={product} />
    </div>
  );
}
