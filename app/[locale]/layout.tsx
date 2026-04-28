import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/lib/i18n/routing";
import { localeDirection, isLocale, type Locale } from "@/lib/i18n/config";
import { Toaster } from "@/components/ui/toaster";
import { CartProvider } from "@/components/providers/cart-provider";
import { OrganizationJsonLd } from "@/components/seo/organization-jsonld";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getTranslations({ locale, namespace: "site" });

  return {
    title: { default: t("name"), template: `%s | ${t("name")}` },
    description: t("description"),
    openGraph: {
      type: "website",
      locale: locale === "ne" ? "ne_NP" : "en_US",
      siteName: t("name"),
      title: t("name"),
      description: t("description"),
      url: `${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/${locale}`,
    },
    twitter: {
      card: "summary_large_image",
      title: t("name"),
      description: t("description"),
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: "/en",
        ne: "/ne",
        "x-default": "/en",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);

  const messages = (await import(`@/lib/i18n/messages/${locale}.json`))
    .default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <CartProvider>
        <div
          lang={locale}
          dir={localeDirection[locale as Locale]}
          className={locale === "ne" ? "font-nepali" : ""}
        >
          {children}
        </div>
        <Toaster />
        <OrganizationJsonLd locale={locale as Locale} />
      </CartProvider>
    </NextIntlClientProvider>
  );
}
