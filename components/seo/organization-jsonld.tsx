import type { Locale } from "@/lib/i18n/config";

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://trihutbaba.kesug.com";

export function OrganizationJsonLd({ locale }: { locale: Locale }) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Organization", "Store"],
        "@id": `${SITE_URL}#organization`,
        name: "Trihutbaba Store & Machinery",
        alternateName: "त्रिहुतबाबा स्टोर एण्ड मेसिनरी",
        url: SITE_URL,
        logo: `${SITE_URL}/logo.png`,
        sameAs: [],
        address: {
          "@type": "PostalAddress",
          addressCountry: "NP",
          addressRegion: "Nepal",
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer support",
          areaServed: "NP",
          availableLanguage: ["en", "ne"],
        },
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        url: SITE_URL,
        name: "Trihutbaba Store & Machinery",
        inLanguage: locale === "ne" ? "ne-NP" : "en-US",
        publisher: { "@id": `${SITE_URL}#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${SITE_URL}/${locale}/products?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "LocalBusiness",
        "@id": `${SITE_URL}#localbusiness`,
        name: "Trihutbaba Store & Machinery",
        image: `${SITE_URL}/og.png`,
        priceRange: "NPR",
        address: {
          "@type": "PostalAddress",
          addressCountry: "NP",
        },
        telephone: "",
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
