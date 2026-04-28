import { setRequestLocale } from "next-intl/server";
import { CheckoutForm } from "@/components/storefront/checkout-form";

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CheckoutForm />;
}
