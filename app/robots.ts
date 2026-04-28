import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ?? "https://trihutbaba.kesug.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/api/",
          "/account/",
          "/checkout",
          "/payment/",
          "/*?token=*",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
