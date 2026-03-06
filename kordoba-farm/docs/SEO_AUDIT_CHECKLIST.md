# SEO audit checklist

Last verified: after sitemap/robots/middleware fixes.

## Sitemap (`/sitemap.xml`)

| Item | Status |
|------|--------|
| Only indexable pages included | Yes – home, about, faq, order, corporate, live-farm (× ar, en, ms, zh) |
| No animal/product detail URLs | Yes – removed by design |
| No cart, checkout, dashboard, shop, choose-product, order-details | Yes – not in sitemap |
| URLs use `SEO_BASE_URL` (store.kordobafarms.com) | Yes |
| `lastmod`, `changefreq`, `priority` set | Yes |
| Locale alternates (`x-default`, ar, en, ms, zh) per URL | Yes |
| Dynamic, no DB for sitemap (no Prisma) | Yes – static paths only |

## robots.txt

| Item | Status |
|------|--------|
| `allow: /` | Yes |
| `disallow`: /admin, /api | Yes |
| `disallow`: /ar/animal, /en/animal, /ms/animal, /zh/animal | Yes |
| `disallow`: shop, choose-product, cart, checkout, checkout/success, dashboard | Yes |
| `disallow`: order-details | Yes |
| `sitemap` and `host` use `SEO_BASE_URL` | Yes |

## Metadata (canonical, hreflang, noindex)

| Page | Canonical / alternates | noindex |
|------|------------------------|--------|
| Home, about, faq, order, corporate, live-farm | Yes via `buildPageMetadata` | No (indexed) |
| Cart, checkout, checkout/success | Yes | Yes |
| Shop, choose-product | Yes | Yes |
| Animal /[tag] | Yes | Yes |
| Dashboard, order-details | N/A (redirect) | Disallow in robots |

## Root layout & schema

| Item | Status |
|------|--------|
| `metadataBase`: `SEO_BASE_URL` | Yes |
| Default title/description/keywords | Yes |
| Organization + WebSite + Store JSON-LD | Yes |
| `areaServed` / `serviceArea` (7 areas + KL, Malaysia) | Yes |
| `sameAs` when `NEXT_PUBLIC_GBP_URL` set | Yes |
| `contactPoint` (WhatsApp) when `NEXT_PUBLIC_WHATSAPP_LINK` set | Yes |
| `<html lang dir>` from request (middleware sets `x-locale`, `x-dir`) | Yes – fixed so request headers are passed to RSC |

## Middleware

| Item | Status |
|------|--------|
| Sets `x-locale` and `x-dir` on **request** (so root layout sees them) | Yes – uses `NextResponse.next({ request: { headers } })` |
| Redirects from next-intl preserved | Yes – 3xx returned as-is; for 2xx we copy response headers to `next` |
| Matcher excludes api, _next, admin, static files | Yes |

## Locale & SEO

| Item | Status |
|------|--------|
| `getAlternates(pathname)` – canonical = English URL, `x-default` = English | Yes |
| All public indexable pages have locale-specific title/description/keywords (ar, ms, zh, en) | Yes |
| OG/Twitter locale set per page | Yes |

## Fixes applied in this audit

1. **Middleware → root layout locale**  
   Middleware was setting **response** headers; root layout reads **request** headers. Updated middleware to pass `x-locale` and `x-dir` via **request** headers (`NextResponse.next({ request: { headers } })`) and copy next-intl response headers onto that response so `<html lang dir>` is correct in SSR.

2. **order-details in robots**  
   Added `disallow` for `/ar/order-details`, `/en/order-details`, `/ms/order-details`, `/zh/order-details` (redirect-only routes; no need to crawl).

## Env for full SEO

- `NEXT_PUBLIC_APP_URL` = `https://store.kordobafarms.com` (or leave unset; default is this).
- `NEXT_PUBLIC_GBP_URL` = your Google Business Profile URL (e.g. `https://g.page/Kordoba+Farms`).
- `NEXT_PUBLIC_WHATSAPP_LINK` = optional; used in schema `contactPoint` and site UI.

## Google Search Console

- Property: **https://store.kordobafarms.com**
- Sitemap: **https://store.kordobafarms.com/sitemap.xml** (submit as `sitemap.xml` in GSC).
