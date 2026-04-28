"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { Link } from "@/lib/i18n/routing";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function AdminSidebar({ locale }: { locale: string }) {
  const t = useTranslations("admin");
  const pathname = usePathname();

  const items = [
    { href: `/${locale}/admin/dashboard`, label: t("dashboard"), Icon: LayoutDashboard },
    { href: `/${locale}/admin/products`, label: t("products"), Icon: Package },
    { href: `/${locale}/admin/categories`, label: t("categories"), Icon: Tags },
    { href: `/${locale}/admin/orders`, label: t("orders"), Icon: ShoppingCart },
    { href: `/${locale}/admin/customers`, label: t("customers"), Icon: Users },
    { href: `/${locale}/admin/settings`, label: t("settings"), Icon: Settings },
  ];

  const onLogout = async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    window.location.href = `/${locale}/admin/login`;
  };

  return (
    <aside className="flex w-60 shrink-0 flex-col border-r bg-card">
      <div className="flex items-center gap-2 border-b p-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-display font-bold">
          T
        </div>
        <div>
          <p className="font-display text-sm font-bold">Trihutbaba</p>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map(({ href, label, Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href.replace(`/${locale}`, "")}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent/30 hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent/30 hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}
