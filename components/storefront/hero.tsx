"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowRight, Leaf } from "lucide-react";
import { Link } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";

export function Hero() {
  const t = useTranslations("home.hero");

  return (
    <section className="relative overflow-hidden gradient-hero">
      <div className="container-x relative grid items-center gap-10 py-16 md:grid-cols-2 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative z-10"
        >
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <Leaf className="h-3.5 w-3.5" /> {t("eyebrow")}
          </span>
          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
            {t("title")}
          </h1>
          <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("subtitle")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/products">
                {t("cta_shop")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/categories">{t("cta_categories")}</Link>
            </Button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
          className="relative aspect-square w-full max-w-md justify-self-center md:justify-self-end"
        >
          <div className="absolute inset-0 rounded-3xl bg-primary/10 blur-3xl" />
          <div className="relative grid h-full grid-cols-2 grid-rows-2 gap-3 p-3">
            {[
              { emoji: "🌾", label: "Seeds & Grains", color: "bg-harvest/20" },
              { emoji: "🚜", label: "Tractors", color: "bg-primary/15" },
              { emoji: "🪓", label: "Hand Tools", color: "bg-soil-100" },
              { emoji: "🌱", label: "Fertilizer", color: "bg-emerald-100" },
            ].map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.07 }}
                className={`flex flex-col items-center justify-center rounded-2xl ${c.color} p-6 shadow-sm`}
              >
                <span className="text-5xl">{c.emoji}</span>
                <span className="mt-2 text-xs font-medium text-foreground/80">
                  {c.label}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
