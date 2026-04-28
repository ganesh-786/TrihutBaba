import { setRequestLocale } from "next-intl/server";
import { Mail, Phone, MapPin } from "lucide-react";

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-x py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        {locale === "ne" ? "सम्पर्क" : "Contact us"}
      </h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        {locale === "ne"
          ? "उत्पादनबारे प्रश्न छ? अर्डर लगाउन चाहनुहुन्छ? हामीलाई सम्पर्क गर्नुहोस्।"
          : "Have a question about a product? Want to place an order? Reach out to us."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-card p-5">
          <Phone className="mb-2 h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">{locale === "ne" ? "फोन" : "Phone"}</h3>
          <p className="mt-1 text-sm text-muted-foreground">+977-9800000000</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <Mail className="mb-2 h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">Email</h3>
          <p className="mt-1 text-sm text-muted-foreground">hello@trihutbaba.com</p>
        </div>
        <div className="rounded-xl border bg-card p-5">
          <MapPin className="mb-2 h-5 w-5 text-primary" />
          <h3 className="text-sm font-semibold">
            {locale === "ne" ? "ठेगाना" : "Address"}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">Nepal</p>
        </div>
      </div>
    </div>
  );
}
