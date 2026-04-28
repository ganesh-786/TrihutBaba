import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckCircle2 } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ orderNo?: string; method?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const t = await getTranslations({ locale, namespace: "payment.success" });

  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-12 w-12 text-emerald-600" />
        </div>
        <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("desc")}</p>
        {sp.orderNo && (
          <p className="mt-4 rounded-md border bg-card p-3 font-mono text-sm">
            #{sp.orderNo}
          </p>
        )}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          {sp.orderNo && (
            <Button asChild size="lg">
              <Link href={`/account/orders/${sp.orderNo}`}>{t("track")}</Link>
            </Button>
          )}
          <Button asChild size="lg" variant="outline">
            <Link href="/products">{t("continue")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
