"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShoppingBag, Check, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart/store";
import { useRouter } from "@/lib/i18n/routing";
import { showToast } from "@/components/ui/toaster";
import type { ProductWithImages } from "@/lib/db/queries/products";

export function AddToCartButton({
  product,
  showQty = true,
}: {
  product: ProductWithImages;
  showQty?: boolean;
}) {
  const t = useTranslations("product");
  const router = useRouter();
  const add = useCart((s) => s.add);
  const [qty, setQty] = React.useState(1);
  const [added, setAdded] = React.useState(false);

  const stock = product.stockQty;
  const disabled = stock <= 0;

  const onAdd = () => {
    if (disabled) return;
    add(
      {
        productId: product.id,
        slug: product.slug,
        nameEn: product.nameEn,
        nameNe: product.nameNe,
        price: Number(product.priceNpr),
        image: product.images?.[0]?.url ?? "/placeholder-product.svg",
        stockQty: stock,
      },
      qty
    );
    setAdded(true);
    showToast({
      title: t("add_to_cart"),
      description: product.nameEn,
      variant: "success",
    });
    setTimeout(() => setAdded(false), 1500);
  };

  const onBuyNow = () => {
    onAdd();
    router.push("/checkout");
  };

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      {showQty && !disabled && (
        <div className="flex h-12 items-center rounded-md border">
          <button
            type="button"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            className="flex h-full w-12 items-center justify-center hover:bg-accent/30"
            aria-label="decrease"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-semibold">{qty}</span>
          <button
            type="button"
            onClick={() => setQty((q) => Math.min(stock, q + 1))}
            className="flex h-full w-12 items-center justify-center hover:bg-accent/30"
            aria-label="increase"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      )}
      <Button size="lg" onClick={onAdd} disabled={disabled} className="flex-1">
        {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
        {disabled ? t("out_of_stock") : t("add_to_cart")}
      </Button>
      <Button
        size="lg"
        variant="accent"
        onClick={onBuyNow}
        disabled={disabled}
        className="flex-1"
      >
        {t("buy_now")}
      </Button>
    </div>
  );
}
