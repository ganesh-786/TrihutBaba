"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/lib/i18n/routing";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";
import { locales, localeNames, type Locale } from "@/lib/i18n/config";
import { useState } from "react";

export function LocaleSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Language"
        onClick={() => setOpen((v) => !v)}
      >
        <Globe className="h-5 w-5" />
      </Button>
      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
            aria-hidden
          />
          <div className="absolute right-0 z-20 mt-2 w-40 rounded-md border bg-card p-1 shadow-lg">
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => {
                  router.replace(pathname, { locale: l });
                  setOpen(false);
                }}
                className={`block w-full rounded px-3 py-2 text-left text-sm hover:bg-accent/30 ${
                  l === locale ? "font-semibold text-primary" : ""
                }`}
              >
                {localeNames[l]}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
