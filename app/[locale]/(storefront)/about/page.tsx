import { setRequestLocale } from "next-intl/server";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="container-x py-12">
      <h1 className="font-display text-3xl font-bold sm:text-4xl">
        {locale === "ne" ? "हाम्रो बारेमा" : "About Trihutbaba"}
      </h1>
      <div className="prose prose-sm mt-6 max-w-2xl text-muted-foreground">
        <p>
          {locale === "ne"
            ? "त्रिहुतबाबा स्टोर एण्ड मेसिनरी नेपालका किसानहरूका लागि गुणस्तरीय कृषि औजार, बीउ, मल र मेसिनरी प्रदान गर्छ। हामी प्रत्येक किसानको खेतीलाई सजिलो, उत्पादनशील र दिगो बनाउने प्रतिबद्धता राख्छौं।"
            : "Trihutbaba Store & Machinery is committed to bringing quality agriculture tools, seeds, fertilizers, and machinery to every farmer in Nepal. We aim to make farming easier, more productive, and sustainable — one tool at a time."}
        </p>
        <p>
          {locale === "ne"
            ? "हामी eSewa, Khalti र क्यास अन डेलिभरी मार्फत भुक्तानी स्वीकार गर्छौं र देशभर ढुवानी पुर्‍याउँछौं।"
            : "We accept eSewa, Khalti, and Cash on Delivery, and ship to every district in Nepal."}
        </p>
      </div>
    </div>
  );
}
