import { setRequestLocale } from "next-intl/server";
import { CustomerAuthForm } from "@/components/storefront/customer-auth-form";

export default async function CustomerLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <h1 className="font-display mb-1 text-2xl font-bold">
          {locale === "ne" ? "लग इन" : "Log in"}
        </h1>
        <p className="mb-6 text-sm text-muted-foreground">
          {locale === "ne"
            ? "अर्डर हेर्न र छिटो चेकआउट गर्न।"
            : "Track orders and check out faster."}
        </p>
        <CustomerAuthForm locale={locale} />
      </div>
    </div>
  );
}
