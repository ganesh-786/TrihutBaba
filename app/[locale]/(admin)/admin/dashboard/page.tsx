import { setRequestLocale, getTranslations } from "next-intl/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { orders, products } from "@/lib/db/schema";
import { safeQuery } from "@/lib/db/safe";
import { formatNpr } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ShoppingCart, AlertTriangle, TrendingUp } from "lucide-react";
import type { Locale } from "@/lib/i18n/config";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "admin" });

  const stats = await safeQuery(
    async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [orderStats] = await db
        .select({
          todayCount: sql<number>`count(*) FILTER (WHERE created_at >= ${today.toISOString()})::int`,
          paidRevenue: sql<number>`COALESCE(SUM(total) FILTER (WHERE status IN ('paid','processing','shipped','delivered')), 0)::numeric`,
          totalCount: sql<number>`count(*)::int`,
        })
        .from(orders);
      const [productStats] = await db
        .select({
          total: sql<number>`count(*)::int`,
          lowStock: sql<number>`count(*) FILTER (WHERE stock_qty < 5 AND status = 'active')::int`,
        })
        .from(products);
      return { orderStats, productStats };
    },
    {
      orderStats: { todayCount: 0, paidRevenue: 0, totalCount: 0 },
      productStats: { total: 0, lowStock: 0 },
    },
    "admin.dashboard"
  );

  const cards = [
    {
      title: t("today_orders"),
      value: stats.orderStats.todayCount,
      Icon: ShoppingCart,
      color: "bg-primary/10 text-primary",
    },
    {
      title: t("revenue"),
      value: formatNpr(Number(stats.orderStats.paidRevenue ?? 0), locale as Locale),
      Icon: TrendingUp,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      title: locale === "ne" ? "उत्पादन" : "Products",
      value: stats.productStats.total,
      Icon: Package,
      color: "bg-sky-100 text-sky-700",
    },
    {
      title: t("low_stock"),
      value: stats.productStats.lowStock,
      Icon: AlertTriangle,
      color: "bg-amber-100 text-amber-700",
    },
  ];

  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display text-2xl font-bold">{t("dashboard")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {locale === "ne"
          ? "तपाईंको स्टोरको आजको स्थिति।"
          : "An overview of your store today."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{c.title}</CardTitle>
              <div className={`flex h-9 w-9 items-center justify-center rounded-md ${c.color}`}>
                <c.Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{c.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>{locale === "ne" ? "स्वागत!" : "Welcome!"}</CardTitle>
          <CardDescription>
            {locale === "ne"
              ? "साइडबारबाट उत्पादन, अर्डर र वर्ग व्यवस्थापन गर्नुहोस्।"
              : "Use the sidebar to manage products, orders, and categories. Add new products, mark featured items, and track every order from here."}
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
