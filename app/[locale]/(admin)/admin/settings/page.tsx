import { setRequestLocale } from "next-intl/server";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="p-6 lg:p-8">
      <h1 className="font-display mb-6 text-2xl font-bold">Settings</h1>
      <div className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">
        <p>
          Store settings (shipping zones, business info) are configured via
          environment variables and will be exposed here in a follow-up.
        </p>
        <ul className="mt-3 list-disc pl-6">
          <li><code>OWNER_EMAIL</code> — receives new-order notifications</li>
          <li><code>OWNER_PHONE</code> — Sparrow SMS recipient</li>
          <li>eSewa / Khalti credentials — see <code>.env.example</code></li>
        </ul>
      </div>
    </div>
  );
}
