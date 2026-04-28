import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listProducts } from "@/lib/db/queries/products";
import { safeQuery } from "@/lib/db/safe";
import { formatNpr } from "@/lib/utils";
import { ProductRowActions } from "@/components/admin/product-row-actions";
import type { Locale } from "@/lib/i18n/config";

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  const result = await safeQuery(
    () => listProducts({ status: "active", pageSize: 100 }),
    { rows: [], total: 0, page: 1, pageSize: 100 },
    "admin.products"
  );
  const drafts = await safeQuery(
    () => listProducts({ status: "draft", pageSize: 100 }),
    { rows: [], total: 0, page: 1, pageSize: 100 },
    "admin.products.drafts"
  );
  const all = [...result.rows, ...drafts.rows];

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{t("products")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {all.length}{" "}
            {locale === "ne" ? "उत्पादनहरू" : "products"}
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/products/new">
            <Plus className="h-4 w-4" />
            {t("new_product")}
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Product</th>
              <th className="px-4 py-3 font-medium">SKU</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Stock</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {all.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-muted-foreground"
                >
                  No products yet. Click <strong>New product</strong> to add your
                  first one.
                </td>
              </tr>
            ) : (
              all.map((p) => (
                <tr key={p.id} className="border-b last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 overflow-hidden rounded-md bg-secondary">
                        {p.images?.[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.images[0].url}
                            alt={p.nameEn}
                            className="h-full w-full object-cover"
                          />
                        )}
                      </div>
                      <div>
                        <div className="font-medium">{p.nameEn}</div>
                        <div className="text-xs text-muted-foreground">
                          {p.nameNe}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.sku ?? "—"}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatNpr(Number(p.priceNpr), locale as Locale)}
                  </td>
                  <td className="px-4 py-3">
                    {p.stockQty > 0 ? (
                      <span>{p.stockQty}</span>
                    ) : (
                      <Badge variant="destructive">0</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        p.status === "active"
                          ? "success"
                          : p.status === "draft"
                            ? "warning"
                            : "outline"
                      }
                    >
                      {p.status}
                    </Badge>
                    {p.featured && (
                      <Badge variant="info" className="ml-1">
                        featured
                      </Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ProductRowActions productId={p.id} locale={locale} />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
