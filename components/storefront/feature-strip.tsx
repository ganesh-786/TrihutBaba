"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Truck, ShieldCheck, Sprout, Headphones } from "lucide-react";

export function FeatureStrip() {
  const t = useTranslations("home.features");
  const items = [
    { Icon: Truck, key: "delivery" },
    { Icon: ShieldCheck, key: "payments" },
    { Icon: Sprout, key: "genuine" },
    { Icon: Headphones, key: "support" },
  ] as const;

  return (
    <section className="container-x py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ Icon, key }, i) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-start gap-3 rounded-xl border bg-card p-5"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">{t(`${key}.title`)}</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {t(`${key}.desc`)}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
