# Google Search Console & Google Business Profile

## Sitemap to submit in Google Search Console

Submit this **single sitemap URL** (use your live domain):

```text
https://store.kordobafarms.com/sitemap.xml
```

If you use a different domain (e.g. Vercel preview), use that domain instead. The sitemap is generated dynamically and includes:

- All indexable locale pages: home, about, faq, order, corporate, live-farm
- All available animal detail pages per locale
- Locale alternates (hreflang) for each URL

**Steps in Search Console:**

1. Go to [Google Search Console](https://search.google.com/search-console).
2. Select your property (e.g. `https://store.kordobafarms.com`).
3. In the left menu: **Sitemaps**.
4. Under “Add a new sitemap”, enter: **`sitemap.xml`** (no leading slash).
5. Click **Submit**.

Google will then crawl `https://your-domain.com/sitemap.xml`. You only need to submit this one URL; the sitemap itself lists every page.

---

## How to get your Google Business Profile (GBP) link

You already have a profile for **Kordoba Farms**. To get the public link:

### Option 1 – From Google Maps (easiest)

1. Open [Google Maps](https://www.google.com/maps).
2. Search for **Kordoba Farms** (or your business name).
3. Click your business in the results.
4. In the right panel, click **Share**.
5. Copy the link. It usually looks like:
   - `https://maps.app.goo.gl/xxxxx` or  
   - `https://goo.gl/maps/xxxxx` or  
   - `https://www.google.com/maps/place/...`

That URL is your **GBP link**. Use it for `NEXT_PUBLIC_GBP_URL` so the site can add it to Organization/Store schema (`sameAs`).

### Option 2 – From Google Business Profile (business.google.com)

1. Go to [business.google.com](https://business.google.com) and sign in.
2. Select **Kordoba Farms**.
3. Click **Home** (or **Info**).
4. Find **“Add your business link”** or **“Profile link”** / **“Get your short link”**.
5. Copy the **public profile link** (e.g. `https://g.page/kordoba-farms` or a `goo.gl`/`maps.app.goo.gl` link).

Use that as `NEXT_PUBLIC_GBP_URL` in your `.env`.

### Set it in the project

In your `.env` (or Vercel/hosting env vars):

```env
NEXT_PUBLIC_GBP_URL="https://g.page/your-page-name"
```

Replace with the actual link you copied. After redeploy, the site will add it to structured data so Google can connect your website and your Business Profile.

---

## WhatsApp link (optional)

Your WhatsApp link: **https://wa.me/601137600068**

To use it in schema (Organization `contactPoint`) and on the site:

- In **Admin → Settings**, set the WhatsApp link there, **or**
- In `.env`:  
  `NEXT_PUBLIC_WHATSAPP_LINK="https://wa.me/601137600068"`

The code reads from env first; Admin Settings can override for the cart/float. Schema uses `NEXT_PUBLIC_WHATSAPP_LINK` when set.
