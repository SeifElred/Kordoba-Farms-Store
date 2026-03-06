# Kordoba Farms – Project & SEO Ratings

Quick reference: **1 = poor, 5 = okay, 10 = excellent.**

---

## Overall project — **8/10**

| Aspect | Score | Notes |
|--------|--------|--------|
| **Architecture** | 8 | Clear App Router structure, locale-based routing, separate admin. Prisma + Stripe + Redis is a solid stack. |
| **Code quality** | 8 | TypeScript throughout, Zod for API validation, shared `buildPageMetadata` and SEO helpers. Some repetition in locale branches (ar/ms/zh/en). |
| **Maintainability** | 8 | Centralised SEO in `src/lib/seo.ts`, content/translations in messages, admin behind auth. |
| **Dependencies** | 8 | Next 14, React 18, Prisma, Stripe, next-intl, Radix UI, Tailwind. Up to date and standard choices. |

**Minus:** No automated tests; admin session uses single env password (no multi-user/roles).

---

## UX / Frontend — **7.5/10**

| Aspect | Score | Notes |
|--------|--------|--------|
| **Structure** | 8 | Header, footer, breadcrumbs, cart, order wizard, shop filters. Logical flow: choose product → order → checkout. |
| **Responsive** | 8 | Mobile-first layout, safe-area insets, drawer menu. Max-width and padding tuned for small screens. |
| **Theming** | 8 | CSS variables, admin themes, Ramadan decorations. RTL via `dir` and locale script. |
| **Feedback** | 7 | Sonner toasts, loading states on order page. Could add more inline validation messages and empty states. |

**Minus:** No visible skip link; some forms could show errors more clearly.

---

## Performance — **7.5/10**

| Aspect | Score | Notes |
|--------|--------|--------|
| **Build** | 8 | SSG for most locale pages; dynamic for sitemap/animal; middleware is lean. |
| **Runtime** | 7 | Prisma + optional Redis. No obvious N+1 in checked routes. Animal images from external URLs (consider Next Image + domain config). |
| **Bundle** | 7 | First load ~87–156 kB per route. Order page is heaviest; could benefit from more code-splitting if needed. |

**Minus:** No evidence of image optimisation config for external Unsplash/URLs; no service worker/PWA.

---

## Security — **7/10**

| Aspect | Score | Notes |
|--------|--------|--------|
| **API** | 8 | Checkout validated with Zod; animal availability and user upsert handled safely. Stripe webhook likely verified (not re-checked here). |
| **Admin** | 7 | Session cookie with HMAC, timing-safe compare. Single shared password; no rate limiting or CSRF token visible. |
| **Sensitive data** | 8 | No secrets in client; env for Stripe, DB, admin. |

**Minus:** Admin auth is single-password; cart/checkout not in robots but still crawlable if linked (noindex is set in metadata).

---

## Accessibility — **7/10**

| Aspect | Score | Notes |
|--------|--------|--------|
| **Semantics** | 7 | Header, main, footer, `role="contentinfo"`, `aria-label` on cart and menu. Section headings and lists used. |
| **Focus** | 7 | Visible focus rings (`focus-visible:ring-2`) on links/buttons. |
| **Language** | 8 | `lang` and `dir` set per locale (client script); next-intl for translated content. |
| **Images / motion** | 6 | Some `aria-hidden` and labels; OG image has alt. No skip link; motion not reduced for prefers-reduced-motion. |

**Minus:** Skip to main content missing; no explicit handling for reduced motion.

---

## i18n / Localization — **8.5/10**

| Aspect | Score | Notes |
|--------|--------|--------|
| **Coverage** | 9 | ar, en, ms, zh with next-intl; nav, FAQ, checkout, order, footer, etc. |
| **SEO per locale** | 9 | Canonical, hreflang, OG locale, and locale-specific titles/descriptions on all main pages. |
| **RTL** | 8 | Arabic `dir=rtl` and layout considerations (e.g. paddingInline). |
| **Consistency** | 8 | Shared message keys; some copy still inline in components (e.g. area sentences in `seo.ts`). |

**Minus:** Root `<html lang="en">` is overridden by client script only; SSR lang could be set from locale for consistency.

---

## SEO — **8.5/10**

### Technical SEO — **9/10**

| Item | Status |
|------|--------|
| **robots.txt** | ✅ Allow /, disallow /admin, /api, cart, checkout, success, dashboard; sitemap + host. |
| **Sitemap** | ✅ Dynamic sitemap with home, about, faq, order, corporate, live-farm + animal URLs; locale alternates; priorities and changeFreq. |
| **Canonical** | ✅ Every public page uses `buildPageMetadata` with pathname → correct canonical. |
| **Hreflang** | ✅ alternates.languages with ar/en/ms/zh + x-default on all relevant pages. |
| **Noindex** | ✅ Cart, checkout, checkout/success use `robots: { index: false, follow: false }`. |
| **Metadata base** | ✅ `metadataBase` set from `SEO_BASE_URL`. |
| **Structured data** | ✅ Organization, WebSite, Store (with areaServed/serviceArea); FAQPage on /faq. |

**Minus:** BreadcrumbList schema not added; root `lang` is set client-side only.

---

### On-page & content SEO — **8.5/10**

| Item | Status |
|------|--------|
| **Default title/description** | ✅ Strong: “Aqiqah & Qurban Malaysia \| Goat & Sheep”, areas and intents in description. |
| **Per-page titles** | ✅ Intent-led (e.g. “Tempah Aqiqah & Korban Malaysia”, “Aqiqah & Qurban FAQ – Book goat & sheep Malaysia”). |
| **Meta keywords** | ✅ Used on key pages via `getCoreSeoKeywords(locale)`. |
| **Keyword coverage** | ✅ Many high-intent phrases: aqiqah/qurban/korban + Malaysia, KL, and 7 areas; goat, sheep, lamb, personal meat; tempah/book/order in 4 languages. |
| **Area-specific content** | ✅ Home and about list all 7 areas with unique sentences (getAreaKeywordSentences) for long-tail “aqiqah Cheras”, “qurban Ampang”, etc. |
| **H1 / headings** | ✅ Pages have clear H1; delivery/area sections have H2. |
| **OG / Twitter** | ✅ title, description, url, siteName, locale; Twitter card. |
| **OG image** | ✅ Dynamic route; could include locale or tagline for more variation. |

**Minus:** No dedicated “Service areas” page (only sections on home/about); Product/Offer schema on animal pages would help for rich results.

---

### Local SEO — **8/10**

| Item | Status |
|------|--------|
| **Service areas** | ✅ Cheras, Ampang, Taman Melawati, Serdang, Sri Kembangan, Cyberjaya, Putrajaya in schema, keywords, and copy. |
| **Schema** | ✅ Organization + Store with areaServed and serviceArea; descriptions mention areas and intents. |
| **Copy** | ✅ getLocalizedAreaSentence and getAreaKeywordSentences used on home, about, FAQ, corporate, live-farm, order. |

**Minus:** No physical address or opening hours in schema (placeholders only); no Google Business Profile URL; ranking will also depend on off-site (reviews, links, GBP).

---

### SEO summary score — **8.5/10**

- **Strengths:** Strong technical base (sitemap, robots, canonical, hreflang, noindex where needed). Rich keyword set and area-by-area content. Good structured data. Multilingual metadata aligned with search intents.
- **To reach 9–10:** Add BreadcrumbList; set SSR `lang` from locale; add Product/Offer on animal pages; consider a dedicated “Areas we serve” page; add address/hours/GBP when available; optional OG image variants per locale.

---

## One-line summary

| Category    | Rating | One line |
|------------|--------|----------|
| **Project** | 8/10  | Solid Next.js + Prisma + Stripe app with clear structure and maintainable SEO layer. |
| **UX**      | 7.5/10| Clear flows and responsive layout; minor gaps in feedback and a11y. |
| **Performance** | 7.5/10 | Good build and SSG; image and bundle tuning could improve further. |
| **Security**   | 7/10  | API and env usage are sound; admin is single-password. |
| **Accessibility** | 7/10 | Decent semantics and focus; skip link and reduced motion missing. |
| **i18n**    | 8.5/10| Strong 4-locale support and locale-aware SEO. |
| **SEO**     | **8.5/10** | Strong technical SEO and local/keyword targeting; a few schema and content tweaks would push it to 9+. |

---

*Generated as a snapshot for the Kordoba Farms codebase. Adjust after adding tests, GBP, or more content.*
