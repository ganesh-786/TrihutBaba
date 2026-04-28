import { useTranslations } from "next-intl";
import { Link } from "@/lib/i18n/routing";
import { Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  const t = useTranslations();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 border-t bg-secondary/40">
      <div className="container-x py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground font-display font-bold">
                T
              </div>
              <span className="font-display text-lg font-bold">Trihutbaba</span>
            </div>
            <p className="text-sm text-muted-foreground">{t("site.tagline")}</p>
            <p className="text-xs text-muted-foreground">
              {t("footer.made_with")}
            </p>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("footer.company")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-primary">
                  {t("nav.about")}
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-primary">
                  {t("nav.categories")}
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary">
                  {t("nav.products")}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("footer.support")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4" /> +977-9800000000
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> hello@trihutbaba.com
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Nepal
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold">{t("footer.legal")}</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/privacy" className="hover:text-primary">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-primary">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="hover:text-primary">
                  Refund Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Trihutbaba Store & Machinery. {t("footer.rights")}
          </p>
          <div className="flex items-center gap-3">
            <span>Payments accepted:</span>
            <span className="rounded bg-card px-2 py-1 font-semibold">eSewa</span>
            <span className="rounded bg-card px-2 py-1 font-semibold">Khalti</span>
            <span className="rounded bg-card px-2 py-1 font-semibold">COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
