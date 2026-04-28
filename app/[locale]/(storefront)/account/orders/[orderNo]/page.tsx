import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckCircle2, Package, Truck, Home, Clock } from "lucide-react";
import { getOrderByNo } from "@/lib/db/queries/orders";
import { safeQuery } from "@/lib/db/safe";
import { getCurrentUser } from "@/lib/auth";
import { verifyOrderToken } from "@/lib/order-tracking";
import { formatDate, formatNpr } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";

const lifecycle = ["pending", "paid", "processing", "shipped", "delivered"] as const;

const icons: Record<string, typeof Clock> = {
  pending: Clock,
  paid: CheckCircle2,
  processing: Package,
  shipped: Truck,
  delivered: Home,
};

export default async function CustomerOrderTrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; orderNo: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { locale, orderNo } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const tStatus = await getTranslations({ locale, namespace: "order.status" });

  const order = await safeQuery(() => getOrderByNo(orderNo), null, "track");
  if (!order) notFound();

  const user = await getCurrentUser();
  const ownsOrder = user && order.userId === user.id;
  const tokenValid = sp.token
    ? verifyOrderToken(sp.token).orderNo === order.orderNo
    : false;

  if (!ownsOrder && !tokenValid) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="font-display text-2xl font-bold">
          {locale === "ne" ? "अनुमति छैन" : "Access denied"}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {locale === "ne"
            ? "यो अर्डर हेर्न लिङ्कमा टोकन हुनुपर्छ वा खाताबाट लग इन गर्नुपर्छ।"
            : "Please sign in or open this order from the link in your email."}
        </p>
      </div>
    );
  }

  const idx = lifecycle.indexOf(order.status as (typeof lifecycle)[number]);

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold">#{order.orderNo}</h1>
      <p className="text-sm text-muted-foreground">
        {formatDate(order.createdAt, locale as Locale)}
      </p>

      <section className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="mb-6 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          {locale === "ne" ? "ट्र्याकिङ" : "Tracking"}
        </h2>
        {idx === -1 ? (
          <Badge variant="outline">{tStatus(order.status)}</Badge>
        ) : (
          <ol className="grid grid-cols-5 gap-2">
            {lifecycle.map((s, i) => {
              const Icon = icons[s];
              const reached = i <= idx;
              return (
                <li key={s} className="flex flex-col items-center text-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2",
                      reached
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <span
                    className={cn(
                      "mt-2 text-[11px] font-medium",
                      reached ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {tStatus(s)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {locale === "ne" ? "सामानहरू" : "Items"}
          </h2>
          <ul className="divide-y">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">{it.nameSnapshot}</div>
                  <div className="text-xs text-muted-foreground">
                    {formatNpr(Number(it.priceSnapshot), locale as Locale)} ×{" "}
                    {it.qty}
                  </div>
                </div>
                <div className="font-semibold">
                  {formatNpr(
                    Number(it.priceSnapshot) * it.qty,
                    locale as Locale
                  )}
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between border-t pt-4 text-base">
            <span className="font-semibold">
              {locale === "ne" ? "जम्मा" : "Total"}
            </span>
            <span className="font-bold text-primary">
              {formatNpr(Number(order.total), locale as Locale)}
            </span>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            {locale === "ne" ? "ढुवानी" : "Shipping"}
          </h2>
          <p className="text-sm">
            {order.customerName}
            <br />
            {order.customerPhone}
            <br />
            {order.shippingArea}, {order.shippingCity}
            <br />
            {order.shippingDistrict}, {order.shippingProvince}
          </p>
        </div>
      </section>
    </div>
  );
}
