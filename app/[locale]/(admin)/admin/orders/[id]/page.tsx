import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/lib/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getOrderById } from "@/lib/db/queries/orders";
import { safeQuery } from "@/lib/db/safe";
import { formatDate, formatNpr } from "@/lib/utils";
import { OrderStatusActions } from "@/components/admin/order-status-actions";
import type { Locale } from "@/lib/i18n/config";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const tStatus = await getTranslations({ locale, namespace: "order.status" });
  const order = await safeQuery(() => getOrderById(id), null, "admin.order");
  if (!order) notFound();

  return (
    <div className="p-6 lg:p-8">
      <Link
        href="/admin/orders"
        className="mb-4 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3 w-3" /> Back to orders
      </Link>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold">#{order.orderNo}</h1>
          <p className="text-sm text-muted-foreground">
            {formatDate(order.createdAt, locale as Locale)} ·{" "}
            <Badge variant="outline" className="ml-1">
              {tStatus(order.status)}
            </Badge>
          </p>
        </div>
        <OrderStatusActions
          orderId={order.id}
          currentStatus={order.status}
          locale={locale}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Items
            </h2>
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="pb-2">Product</th>
                  <th className="pb-2 text-center">Qty</th>
                  <th className="pb-2 text-right">Price</th>
                  <th className="pb-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((it) => (
                  <tr key={it.id} className="border-b last:border-0">
                    <td className="py-3">{it.nameSnapshot}</td>
                    <td className="py-3 text-center">{it.qty}</td>
                    <td className="py-3 text-right">
                      {formatNpr(Number(it.priceSnapshot), locale as Locale)}
                    </td>
                    <td className="py-3 text-right font-medium">
                      {formatNpr(
                        Number(it.priceSnapshot) * it.qty,
                        locale as Locale
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-3 text-right text-muted-foreground">
                    Subtotal
                  </td>
                  <td className="pt-3 text-right">
                    {formatNpr(Number(order.subtotal), locale as Locale)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-1 text-right text-muted-foreground">
                    Shipping
                  </td>
                  <td className="pt-1 text-right">
                    {formatNpr(Number(order.shippingFee), locale as Locale)}
                  </td>
                </tr>
                <tr>
                  <td colSpan={3} className="pt-2 text-right text-base font-semibold">
                    Total
                  </td>
                  <td className="pt-2 text-right text-base font-bold text-primary">
                    {formatNpr(Number(order.total), locale as Locale)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Payments
            </h2>
            {order.payments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No payment records.</p>
            ) : (
              <ul className="divide-y text-sm">
                {order.payments.map((p) => (
                  <li key={p.id} className="py-2">
                    <div className="flex justify-between">
                      <span className="font-medium uppercase">{p.provider}</span>
                      <Badge
                        variant={
                          p.status === "completed"
                            ? "success"
                            : p.status === "pending"
                              ? "warning"
                              : "outline"
                        }
                      >
                        {p.status}
                      </Badge>
                    </div>
                    {p.providerTxnId && (
                      <p className="font-mono text-xs text-muted-foreground">
                        Txn: {p.providerTxnId}
                      </p>
                    )}
                    {p.pidx && (
                      <p className="font-mono text-xs text-muted-foreground">
                        pidx: {p.pidx}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Customer
            </h2>
            <p className="font-medium">{order.customerName}</p>
            <p className="text-sm text-muted-foreground">{order.customerPhone}</p>
            {order.customerEmail && (
              <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
            )}
          </div>
          <div className="rounded-xl border bg-card p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Shipping
            </h2>
            <p className="text-sm">
              {order.shippingArea}, {order.shippingCity}
              <br />
              {order.shippingDistrict}, {order.shippingProvince}
              {order.shippingLandmark && (
                <>
                  <br />
                  <span className="text-muted-foreground">
                    near {order.shippingLandmark}
                  </span>
                </>
              )}
            </p>
            {order.notes && (
              <div className="mt-3 rounded-md bg-muted p-2 text-xs">
                <strong>Note:</strong> {order.notes}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
