import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await getCurrentUser();
  if (user?.role === "admin") {
    redirect(`/${locale}/admin/dashboard`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary/30 p-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-display text-xl font-bold">
            T
          </div>
          <h1 className="font-display text-2xl font-bold">
            {locale === "ne" ? "एडमिन लग इन" : "Admin sign in"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {locale === "ne"
              ? "स्टोर व्यवस्थापन गर्न लग इन गर्नुहोस्।"
              : "Sign in to manage the store."}
          </p>
        </div>
        <LoginForm locale={locale} />
      </div>
    </div>
  );
}
