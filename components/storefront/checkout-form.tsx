"use client";

import * as React from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { motion } from "motion/react";
import { Truck, CreditCard, Wallet } from "lucide-react";
import { useCart, cartSelectors } from "@/lib/cart/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { showToast } from "@/components/ui/toaster";
import { formatNpr, cn } from "@/lib/utils";
import { nepalProvinces, provinceDistricts } from "@/lib/nepal-locations";
import { createOrder } from "@/lib/actions/checkout";
import type { Locale } from "@/lib/i18n/config";

type PaymentMethod = "esewa" | "khalti" | "cod";

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const tCommon = useTranslations("common");
  const locale = useLocale() as Locale;
  const items = useCart((s) => s.items);
  const subtotal = useCart(cartSelectors.subtotal);
  const clearCart = useCart((s) => s.clear);
  const hydrated = useCart((s) => s.hydrated);
  const [province, setProvince] = React.useState<string>(nepalProvinces[2]);
  const [method, setMethod] = React.useState<PaymentMethod>("esewa");
  const [submitting, setSubmitting] = React.useState(false);

  const shipping = subtotal >= 5000 ? 0 : 150;
  const total = subtotal + shipping;

  if (!hydrated) {
    return (
      <div className="container-x py-16">
        <div className="h-6 w-40 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container-x py-16 text-center">
        <h1 className="font-display text-2xl font-bold">
          {locale === "ne" ? "तपाईंको कार्ट खाली छ" : "Your cart is empty"}
        </h1>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    const fd = new FormData(e.currentTarget);
    try {
      const result = await createOrder({
        customerName: fd.get("customerName") as string,
        customerEmail: (fd.get("customerEmail") as string) || "",
        customerPhone: fd.get("customerPhone") as string,
        province,
        district: fd.get("district") as string,
        city: fd.get("city") as string,
        area: fd.get("area") as string,
        landmark: (fd.get("landmark") as string) || "",
        notes: (fd.get("notes") as string) || "",
        paymentMethod: method,
        locale,
        items: items.map((i) => ({ productId: i.productId, qty: i.qty })),
      });

      if (method === "cod") {
        clearCart();
        window.location.href = `/${locale}/payment/success?orderNo=${result.orderNo}&method=cod`;
        return;
      }

      const res = await fetch(`/api/payments/${method}/initiate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: result.orderId, locale }),
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error ?? "Could not initiate payment");

      clearCart();

      if (method === "esewa") {
        const form = document.createElement("form");
        form.method = "POST";
        form.action = payload.paymentUrl;
        for (const [key, value] of Object.entries(payload.fields as Record<string, string>)) {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        }
        document.body.appendChild(form);
        form.submit();
      } else if (method === "khalti") {
        window.location.href = payload.paymentUrl;
      }
    } catch (err) {
      showToast({
        title: tCommon("error"),
        description: err instanceof Error ? err.message : "",
        variant: "error",
      });
      setSubmitting(false);
    }
  };

  const districts = provinceDistricts[province] ?? [];

  return (
    <form
      onSubmit={onSubmit}
      className="container-x grid gap-8 py-10 lg:grid-cols-[1fr_400px]"
    >
      <div className="space-y-6">
        <h1 className="font-display text-3xl font-bold">{t("title")}</h1>

        <section className="space-y-4 rounded-xl border bg-card p-6">
          <h2 className="font-semibold">{t("shipping_address")}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">{t("form.full_name")} *</Label>
              <Input id="customerName" name="customerName" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerPhone">{t("form.phone")} *</Label>
              <Input id="customerPhone" name="customerPhone" inputMode="tel" required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="customerEmail">{t("form.email")}</Label>
              <Input id="customerEmail" name="customerEmail" type="email" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="province">{t("form.province")} *</Label>
              <select
                id="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {nepalProvinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="district">{t("form.district")} *</Label>
              <select
                id="district"
                name="district"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">{t("form.city")} *</Label>
              <Input id="city" name="city" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="area">{t("form.area")} *</Label>
              <Input id="area" name="area" required />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="landmark">{t("form.landmark")}</Label>
              <Input id="landmark" name="landmark" />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="notes">{t("form.notes")}</Label>
              <Textarea id="notes" name="notes" rows={3} />
            </div>
          </div>
        </section>

        <section className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 font-semibold">{t("payment_method")}</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {(
              [
                { id: "esewa", label: t("esewa"), Icon: Wallet, color: "bg-emerald-50 text-emerald-700" },
                { id: "khalti", label: t("khalti"), Icon: CreditCard, color: "bg-purple-50 text-purple-700" },
                { id: "cod", label: t("cod"), Icon: Truck, color: "bg-amber-50 text-amber-700" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setMethod(opt.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border-2 p-4 text-sm font-medium transition-all",
                  method === opt.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", opt.color)}>
                  <opt.Icon className="h-5 w-5" />
                </div>
                {opt.label}
              </button>
            ))}
          </div>
        </section>
      </div>

      <motion.aside
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-fit rounded-xl border bg-card p-6 lg:sticky lg:top-20"
      >
        <h2 className="mb-4 font-semibold">{t("order_summary")}</h2>
        <div className="space-y-3">
          {items.map((i) => {
            const name = locale === "ne" ? i.nameNe : i.nameEn;
            return (
              <div key={i.productId} className="flex gap-3 text-sm">
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary">
                  <Image src={i.image} alt={name} fill sizes="56px" className="object-cover" />
                </div>
                <div className="flex-1">
                  <p className="line-clamp-2 leading-snug">{name}</p>
                  <p className="text-xs text-muted-foreground">
                    {i.qty} × {formatNpr(i.price, locale)}
                  </p>
                </div>
                <span className="font-medium">{formatNpr(i.price * i.qty, locale)}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 space-y-2 border-t pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatNpr(subtotal, locale)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping === 0 ? "Free" : formatNpr(shipping, locale)}</span>
          </div>
          <div className="flex justify-between border-t pt-2 text-base">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-primary">{formatNpr(total, locale)}</span>
          </div>
        </div>
        <Button
          type="submit"
          size="lg"
          className="mt-6 w-full"
          disabled={submitting}
        >
          {submitting ? "..." : t("place_order")}
        </Button>
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {locale === "ne"
            ? "अर्डर गरेर तपाईं हाम्रो सर्तहरूमा सहमत हुनुहुन्छ।"
            : "By placing this order you agree to our terms."}
        </p>
      </motion.aside>
    </form>
  );
}
