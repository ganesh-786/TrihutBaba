import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { listOrders } from "@/lib/db/queries/orders";
import { safeQuery } from "@/lib/db/safe";
import { formatNpr, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/config";

const statusVariant: Record<
  string,
  "default" | "success" | "warning" | "destructive" | "info" | "outline"
> = {
  pending: "warning",
  paid: "info",
  processing: "info",
  shipped: "info",
  delivered: "success",
  cancelled: "destructive",
  refunded: "outline",
};

export default async function AdminOrdersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "admin" });
  const tStatus = await getTranslations({ locale, namespace: "order.status" });

  const all = await safeQuery(
    () => listOrders({ status: sp.status, limit: 200 }),
    [],
    "admin.orders"
  );

  const filters = ["all", "pending", "paid", "processing", "shipped", "delivered", "cancelled"];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold">{t("orders")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{all.length} orders</p>

      <div className="mt-4 flex flex-wrap gap-2">
        {filters.map((f) => {
          const active = (sp.status ?? "all") === f;
          return (
            <Link
              key={f}
              href={f === "all" ? `/admin/orders` : `/admin/orders?status=${f}`}
              className={`rounded-full border px-3 py-1 text-xs ${
                active ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent/30"
              }`}
            >
              {f === "all" ? "All" : tStatus(f)}
            </Link>
          );
        })}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-card">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/40 text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Customer</th>
              <th className="px-4 py-3 font-medium">Method</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {all.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                  No orders yet.
                </td>
              </tr>
            ) : (
              all.map((o) => (
                <tr key={o.id} className="border-b last:border-0 hover:bg-secondary/30">
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="font-mono text-sm font-medium text-primary hover:underline"
                    >
                      #{o.orderNo}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customerName}</div>
                    <div className="text-xs text-muted-foreground">{o.customerPhone}</div>
                  </td>
                  <td className="px-4 py-3 text-xs uppercase">{o.paymentMethod}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatNpr(Number(o.total), locale as Locale)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={statusVariant[o.status] ?? "outline"}>
                      {tStatus(o.status)}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(o.createdAt, locale as Locale)}
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
