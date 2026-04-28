"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Trash2, Minus, Plus, ShoppingBag } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { useCart, cartSelectors } from "@/lib/cart/store";
import { formatNpr } from "@/lib/utils";
import type { Locale } from "@/lib/i18n/config";

export function CartPageClient() {
  const t = useTranslations("cart");
  const locale = useLocale() as Locale;
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const remove = useCart((s) => s.remove);
  const subtotal = useCart(cartSelectors.subtotal);
  const hydrated = useCart((s) => s.hydrated);

  if (!hydrated) {
    return (
      <div className="container-x py-16">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-16">
        <div className="mx-auto flex max-w-md flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
            <ShoppingBag className="h-10 w-10 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-bold">{t("empty")}</h1>
          <p className="mt-2 text-muted-foreground">{t("empty_desc")}</p>
          <Button asChild className="mt-6" size="lg">
            <Link href="/products">{t("continue_shopping")}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x py-10">
      <h1 className="font-display mb-6 text-3xl font-bold sm:text-4xl">{t("title")}</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-3">
          {items.map((item) => {
            const name = locale === "ne" ? item.nameNe : item.nameEn;
            return (
              <div
                key={item.productId}
                className="flex gap-4 rounded-xl border bg-card p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <Image
                    src={item.image}
                    alt={name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div className="flex flex-1 flex-col justify-between">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      href={`/products/${item.slug}`}
                      className="font-medium leading-snug hover:text-primary"
                    >
                      {name}
                    </Link>
                    <button
                      onClick={() => remove(item.productId)}
                      className="text-muted-foreground hover:text-destructive"
                      aria-label={t("remove")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex h-9 items-center rounded-md border">
                      <button
                        onClick={() => setQty(item.productId, item.qty - 1)}
                        className="flex h-full w-9 items-center justify-center hover:bg-accent/30"
                        aria-label="-"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => setQty(item.productId, item.qty + 1)}
                        className="flex h-full w-9 items-center justify-center hover:bg-accent/30"
                        aria-label="+"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatNpr(item.price * item.qty, locale)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatNpr(item.price, locale)} × {item.qty}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <aside className="h-fit rounded-xl border bg-card p-6 lg:sticky lg:top-20">
          <h2 className="text-lg font-semibold">{locale === "ne" ? "सारांश" : "Summary"}</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("subtotal")}</span>
              <span className="font-medium">{formatNpr(subtotal, locale)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t("shipping")}</span>
              <span className="text-xs text-muted-foreground">{t("shipping_calc")}</span>
            </div>
            <div className="mt-3 flex justify-between border-t pt-3 text-base">
              <span className="font-semibold">{t("total")}</span>
              <span className="font-bold text-primary">{formatNpr(subtotal, locale)}</span>
            </div>
          </div>
          <Button asChild size="lg" className="mt-6 w-full">
            <Link href="/checkout">{t("checkout")}</Link>
          </Button>
          <Button asChild variant="ghost" className="mt-2 w-full" size="sm">
            <Link href="/products">{t("continue_shopping")}</Link>
          </Button>
        </aside>
      </div>
    </div>
  );
}
