# Trihutbaba Store & Machinery

A production-grade, bilingual (English / Nepali) e-commerce platform for an agriculture supply store in Nepal.

> Live target: `https://trihutbaba.kesug.com`

## Highlights

- **Next.js 15 (App Router)** with React Server Components, Server Actions, Turbopack
- **Bilingual** (`/en`, `/ne`) with `next-intl` and `hreflang` for SEO
- **Drizzle ORM + Supabase Postgres**, Row-Level-Security ready
- **Supabase Auth + Storage** (admin login, product image uploads)
- **eSewa ePay v2** & **Khalti KPG-2** payments — server-signed and server-verified (status / lookup) with double-spend, amount-tampering, and idempotency guards. Cash-on-Delivery also supported.
- **Order state machine**: `pending → paid → processing → shipped → delivered`, with email (Resend) + SMS (Sparrow) notifications. Signed-link tracking for guest customers.
- **SEO-first**: server-rendered metadata, OG image generator, JSON-LD (Organization, LocalBusiness, WebSite, Product, BreadcrumbList), dynamic `sitemap.xml`, `robots.txt`, Google Merchant Center feed at `/feed/google.xml`.
- **Smooth motion** with `motion` (Framer Motion v11), GPU-only transforms, respects `prefers-reduced-motion`.
- **Mobile-first responsive** UI, agrarian palette, accessibility-conscious.

## Quick start (local dev)

```bash
# 1. Install dependencies
npm install

# 2. Copy environment template and fill in values
cp .env.example .env.local

# 3. (Optional, only needed once) push the schema to your Supabase Postgres
npm run db:push

# 4. Seed sample categories + products so the storefront has content
npm run db:seed

# 5. Run the dev server
npm run dev
```

Open <http://localhost:3000> — it will auto-redirect to `/en`.

## Environment variables

See [.env.example](.env.example). Required for production:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | Public site URL, e.g. `https://trihutbaba.kesug.com` |
| `DATABASE_URL` | Postgres connection string (Supabase: pooled session URL) |
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase project keys |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, used for image uploads & admin scripts |
| `ESEWA_MERCHANT_CODE`, `ESEWA_SECRET_KEY` | Production eSewa credentials |
| `ESEWA_PAYMENT_URL` | `https://epay.esewa.com.np/api/epay/main/v2/form` (prod) |
| `ESEWA_STATUS_URL` | `https://epay.esewa.com.np/api/epay/transaction/status/` (prod) |
| `KHALTI_SECRET_KEY` | Khalti merchant live secret |
| `KHALTI_BASE_URL` | `https://khalti.com` (prod) or `https://dev.khalti.com` (test) |
| `RESEND_API_KEY`, `EMAIL_FROM`, `OWNER_EMAIL` | Transactional email (Resend) |
| `SPARROW_SMS_TOKEN`, `SPARROW_SMS_FROM`, `OWNER_PHONE` | Owner SMS alerts |
| `ORDER_TRACKING_SECRET` | Long random string used to sign guest tracking links |

## Deploying to Vercel and pointing `trihutbaba.kesug.com`

1. **Push to GitHub.** Initialize the repo and push:
   ```bash
   git init && git add . && git commit -m "Initial Trihutbaba ecommerce"
   gh repo create trihutbaba --public --source . --push
   ```
2. **Create the Vercel project.**
   - Go to <https://vercel.com/new> and import the GitHub repo.
   - Framework preset: Next.js (auto-detected). Build command: `next build`.
3. **Set environment variables** in Vercel → Settings → Environment Variables. Copy from your `.env.local` (use the **production** payment URLs and live secrets).
4. **Set up Supabase**:
   - Create a free Supabase project at <https://supabase.com>.
   - In SQL editor, run `drizzle/0000_init.sql` (or simply run `npm run db:push` locally with `DATABASE_URL` pointing at Supabase).
   - In **Authentication → Providers**, enable Email/Password.
   - In **Storage**, create a public bucket named `products`.
   - Copy `URL`, `anon`, and `service_role` keys into Vercel env vars.
5. **Sign up the owner account** (one-time):
   - Visit `https://YOUR-VERCEL-URL/en/admin/login` and click "Sign up" (or create the user from the Supabase Auth dashboard).
   - Promote them to admin from your terminal:
     ```bash
     DATABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... \
       npm run promote:admin -- owner@trihutbaba.com
     ```
6. **Connect the custom domain** `trihutbaba.kesug.com`:
   - In Vercel → Settings → Domains, add `trihutbaba.kesug.com`.
   - Vercel will show you a DNS record to set. Log in to your **InfinityFree / Kesug control panel** → DNS, and add the record exactly as shown:
     - Most likely a `CNAME` with name `trihutbaba` pointing to `cname.vercel-dns.com`.
   - Wait for propagation (usually 1–10 minutes), then click "Refresh" in Vercel.
7. **Switch payment gateways to production**:
   - eSewa: change `ESEWA_PAYMENT_URL` to `https://epay.esewa.com.np/api/epay/main/v2/form` and `ESEWA_STATUS_URL` to `https://epay.esewa.com.np/api/epay/transaction/status/`. Replace the `EPAYTEST` merchant code and test secret with the live values issued by eSewa.
   - Khalti: change `KHALTI_BASE_URL` to `https://khalti.com` and use your live secret.
8. **Submit to search engines**:
   - Add the property to <https://search.google.com/search-console> (use the Vercel-generated `/en` URL or the custom domain once live).
   - Submit `https://trihutbaba.kesug.com/sitemap.xml`.
   - In Google Merchant Center, register `https://trihutbaba.kesug.com/feed/google.xml`.

## Project layout

```
app/
├── [locale]/
│   ├── (storefront)/      Public storefront (home, products, cart, checkout, account)
│   ├── (admin)/admin/     Admin (dashboard, products, categories, orders, settings)
│   └── (admin-auth)/      Admin login (no sidebar)
├── api/payments/          eSewa & Khalti server routes
├── feed/google.xml/       Google Merchant feed
├── opengraph-image.tsx    OG share image
├── sitemap.ts             Dynamic sitemap
└── robots.ts              robots.txt

components/
├── ui/                    shadcn-style primitives
├── storefront/            Storefront components
├── admin/                 Admin components
└── seo/                   JSON-LD components

lib/
├── db/                    Drizzle schema + queries
├── supabase/              Supabase clients (server, browser, admin)
├── i18n/                  next-intl config + messages
├── payments/              eSewa + Khalti integration helpers
├── notifications/         Email (Resend) + SMS (Sparrow)
├── actions/               Server Actions (products, categories, checkout, orders, uploads)
├── auth.ts                Auth + role guards
├── cart/store.ts          Zustand cart (persisted)
├── nepal-locations.ts     Nepal provinces & districts
├── order-tracking.ts      Signed guest tracking tokens
└── utils.ts               Helpers (formatNpr, generateOrderNo, slugify, ...)

scripts/
├── seed.ts                Sample categories + products
└── promote-admin.ts       Promote a Supabase user to admin
```

## Order lifecycle

```
pending  →  paid  →  processing  →  shipped  →  delivered
   ↘                ↘            ↘
     cancelled       cancelled    cancelled / refunded
```

- `pending → paid` is set automatically by the eSewa/Khalti verify endpoints (or immediately for COD).
- Stock is decremented exactly once at the `paid` transition (inside a DB transaction).
- All other transitions happen in **Admin → Orders → [order]** via the action buttons.
- Customer email + signed tracking link are sent on each non-internal status change.

## Payments — security guards

Both gateways:
- Server creates the order first (status `pending`); never trusts client-side prices.
- Reject if order is already `paid` (no double-spend).
- Verify amount matches stored order total within 1 paisa.
- Verify gateway-side using the official status endpoint (eSewa) / lookup endpoint (Khalti).
- Idempotent by `transaction_uuid` (eSewa) / `pidx` (Khalti).

## SEO checklist

- ✅ Per-locale `<title>` / `<meta description>` / `canonical`
- ✅ `hreflang` alternates for `en`, `ne`, `x-default`
- ✅ Organization + LocalBusiness + WebSite JSON-LD on every page
- ✅ Product + BreadcrumbList JSON-LD on product pages
- ✅ Dynamic `sitemap.xml` covering both locales for every product/category
- ✅ Google Merchant feed at `/feed/google.xml`
- ✅ OG image at `/opengraph-image`
- ✅ Static-where-possible (ISR `revalidate: 120s` on product/category pages)
- ✅ `next/image` AVIF/WebP, lazy below the fold
- ✅ `next/font` with self-hosted Inter, Manrope, Mukta (Devanagari)
- ✅ Server-rendered everything that matters — bots see real HTML

### Target keywords

EN: agriculture machinery Nepal · farm tools Nepal online · tractor parts Nepal · buy seeds Nepal · fertilizer online Nepal · pesticides Nepal price · agriculture store Nepal

NE: कृषि औजार नेपाल · ट्र्याक्टर पार्ट्स · बीउ बिजन अनलाइन · मल किन्ने · कृषि सामग्री · कृषि मेसिनरी

## Known design decisions

- **Hosting on Vercel, not InfinityFree (`*.kesug.com` / `*.wuaze.com`)**. InfinityFree only supports PHP/MySQL — Node.js is not available there. The kesug subdomain is mapped to Vercel via DNS so the URL the user types is unchanged.
- **Tailwind v3** (not v4) for shadcn/ui ecosystem stability.
- **DB client is lazy-loaded** through a Proxy so `next build` doesn't require `DATABASE_URL` at module-load time.
- **Cart is client-only** (`zustand` + `localStorage`); orders are persisted server-side only at checkout.

## License

Proprietary — Trihutbaba Store & Machinery, Nepal.
