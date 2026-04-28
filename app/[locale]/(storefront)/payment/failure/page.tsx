import { setRequestLocale, getTranslations } from "next-intl/server";
import { XCircle } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

export default async function PaymentFailurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "payment.failure" });

  return (
    <div className="container-x flex min-h-[60vh] items-center justify-center py-16">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100">
          <XCircle className="h-12 w-12 text-destructive" />
        </div>
        <h1 className="font-display text-3xl font-bold">{t("title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("desc")}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button asChild size="lg">
            <Link href="/checkout">{t("retry")}</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/cart">{t("back")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
