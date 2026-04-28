import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Mukta } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const mukta = Mukta({
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-nepali",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a1410" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_BASE_URL ?? "https://trihutbaba.kesug.com"
  ),
  title: {
    default: "Trihutbaba Store & Machinery — Agriculture Tools Nepal",
    template: "%s | Trihutbaba",
  },
  description:
    "Buy genuine farm tools, seeds, fertilizers, pesticides and agriculture machinery online in Nepal. Fast delivery, secure eSewa & Khalti payments.",
  applicationName: "Trihutbaba",
  authors: [{ name: "Trihutbaba" }],
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  formatDetection: { telephone: true, email: true, address: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${inter.variable} ${manrope.variable} ${mukta.variable}`}
    >
      <body className="min-h-screen bg-background font-sans">{children}</body>
    </html>
  );
}
