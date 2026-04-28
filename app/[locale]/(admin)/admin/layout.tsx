import { AdminSidebar } from "@/components/admin/sidebar";
import { requireAdmin } from "@/lib/auth";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  await requireAdmin(locale);

  return (
    <div className="flex min-h-screen bg-secondary/30">
      <AdminSidebar locale={locale} />
      <main className="flex-1 overflow-x-auto">{children}</main>
    </div>
  );
}
