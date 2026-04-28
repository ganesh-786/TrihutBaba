"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { Link, usePathname } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart, cartSelectors } from "@/lib/cart/store";
import { LocaleSwitcher } from "./locale-switcher";
import { cn } from "@/lib/utils";

export function Header() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const cartCount = useCart(cartSelectors.count);
  const hydrated = useCart((s) => s.hydrated);

  const links = [
    { href: "/", label: t("home") },
    { href: "/products", label: t("products") },
    { href: "/categories", label: t("categories") },
    { href: "/about", label: t("about") },
    { href: "/contact", label: t("contact") },
  ];

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      window.location.href = `/products?q=${encodeURIComponent(query.trim())}`;
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-display font-bold">
              T
            </div>
            <span className="hidden font-display text-lg font-bold tracking-tight sm:inline">
              Trihutbaba
            </span>
          </Link>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent/30",
                pathname === l.href && "text-primary"
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={t("search")}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <LocaleSwitcher />
          <Button asChild variant="ghost" size="icon" aria-label={t("account")}>
            <Link href="/account">
              <User className="h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label={t("cart")}
            className="relative"
          >
            <Link href="/cart">
              <ShoppingBag className="h-5 w-5" />
              {hydrated && cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
                  {cartCount}
                </span>
              )}
            </Link>
          </Button>
        </div>
      </div>

      {searchOpen && (
        <div className="border-t bg-background">
          <div className="container-x py-3">
            <form onSubmit={onSearchSubmit} className="flex gap-2">
              <Input
                autoFocus
                placeholder={t("search")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button type="submit">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      )}

      {mobileOpen && (
        <div className="border-t bg-background md:hidden">
          <nav className="container-x flex flex-col py-2">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-md px-3 py-3 text-sm font-medium hover:bg-accent/30"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
