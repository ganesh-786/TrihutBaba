"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { Link } from "@/lib/i18n/routing";
import { formatNpr } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { ProductWithImages } from "@/lib/db/queries/products";
import type { Locale } from "@/lib/i18n/config";

export function ProductCard({ product }: { product: ProductWithImages }) {
  const t = useTranslations("product");
  const locale = useLocale() as Locale;
  const name = locale === "ne" ? product.nameNe : product.nameEn;
  const image = product.images?.[0]?.url ?? "/placeholder-product.svg";
  const price = Number(product.priceNpr);
  const compare = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const hasDiscount = compare && compare > price;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group h-full"
    >
      <Link
        href={`/products/${product.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
      >
        <div className="relative aspect-square overflow-hidden bg-secondary/40">
          <Image
            src={image}
            alt={product.images?.[0]?.altEn ?? name}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {hasDiscount && (
            <Badge variant="destructive" className="absolute left-3 top-3">
              -{Math.round(((compare! - price) / compare!) * 100)}%
            </Badge>
          )}
          {product.stockQty === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/70">
              <Badge variant="outline">{t("out_of_stock")}</Badge>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-1 p-4">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">{name}</h3>
          {product.brand && (
            <p className="text-xs text-muted-foreground">{product.brand}</p>
          )}
          <div className="mt-auto flex items-baseline gap-2 pt-2">
            <span className="text-lg font-bold text-primary">
              {formatNpr(price, locale)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-muted-foreground line-through">
                {formatNpr(compare!, locale)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
