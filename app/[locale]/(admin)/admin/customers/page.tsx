import { setRequestLocale } from "next-intl/server";

export default async function AdminCustomersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display mb-6 text-2xl font-bold">Customers</h1>
      <p className="text-muted-foreground">Coming soon — customer accounts list.</p>
    </div>
  );
}
