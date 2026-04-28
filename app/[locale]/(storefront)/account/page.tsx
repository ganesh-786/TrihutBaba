import { setRequestLocale, getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { getCurrentSession, getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { safeQuery } from "@/lib/db/safe";
import { formatNpr, formatDate } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "account" });
  const tOrder = await getTranslations({ locale, namespace: "order.status" });

  const sessionUser = await getCurrentSession();
  if (!sessionUser) redirect(`/${locale}/account/login`);
  const user = await getCurrentUser();

  const myOrders = await safeQuery(
    () =>
      db
        .select()
        .from(orders)
        .where(eq(orders.userId, user?.id ?? "00000000-0000-0000-0000-000000000000"))
        .orderBy(desc(orders.createdAt))
        .limit(20),
    [],
    "account.orders"
  );

  return (
    <div className="container-x py-10">
      <h1 className="font-display text-3xl font-bold">
        {t("welcome", {
          name: user?.name ?? user?.email ?? sessionUser.email ?? "",
        })}
      </h1>

      <h2 className="mt-8 font-display text-xl font-bold">{t("orders")}</h2>
      {!user && (
        <div className="mt-4 rounded-xl border bg-secondary/30 p-4 text-sm text-muted-foreground">
          {locale === "ne"
            ? "तपाईंको खाता प्रोफाइल डाटाबेसमा अझै सेटअप भएको छैन। DATABASE_URL सही राखेर माइग्रेशन चलाएपछि अर्डर इतिहास देखिन्छ।"
            : "Your profile database is not configured yet. Once DATABASE_URL is set correctly and migrations are applied, your order history will appear here."}
        </div>
      )}
      {myOrders.length === 0 ? (
        <div className="mt-4 rounded-xl border-2 border-dashed bg-secondary/30 p-12 text-center">
          <p className="text-muted-foreground">{t("no_orders")}</p>
          <Button asChild className="mt-4">
            <Link href="/products">
              {locale === "ne" ? "किनमेल गर्नुहोस्" : "Start shopping"}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {myOrders.map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.orderNo}`}
              className="flex items-center justify-between rounded-xl border bg-card p-4 transition-colors hover:border-primary"
            >
              <div>
                <div className="font-mono text-sm font-semibold">#{o.orderNo}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(o.createdAt, locale as Locale)}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">
                  {formatNpr(Number(o.total), locale as Locale)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {tOrder(o.status)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
