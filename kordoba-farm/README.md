# Kordoba Farm – Premium Qurban & Aqiqah Platform

Production-ready, multilingual e-commerce platform for livestock (Sheep & Goat) for **Qurban**, **Aqiqah**, **Personal Meat**, and **Gift**.  
Brand: **Kordoba Farm** · Parent: **Kordoba Agrotech Sdn. Bhd.**

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, TailwindCSS, Framer Motion, next-intl (i18n), React Hook Form, Zod
- **Backend:** Next.js API routes, Prisma ORM, MySQL, Redis, Stripe + FPX, Webhooks
- **Deploy:** Vercel (frontend), Railway/VPS (DB + Redis), Cloudinary (media)

## Getting Started

### 1. Install dependencies

```bash
cd kordoba-farm
npm install
```

### 2. Environment

Copy `.env.example` to `.env` and set:

- `DATABASE_URL` – MySQL connection string (e.g. `mysql://user:pass@localhost:3306/kordoba_farm`)
- `REDIS_URL` – optional, for cache (e.g. `redis://localhost:6379`)
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` – for payments
- `NEXT_PUBLIC_APP_URL` – site URL (e.g. `http://localhost:3000`)
- `NEXT_PUBLIC_WHATSAPP_LINK` – WhatsApp contact link

### 3. Database (MySQL)

The setup script uses **MySQL** (not MariaDB). It can install MySQL if missing, start it, and create the database:

```bash
# One-time setup (will ask for your sudo password)
chmod +x scripts/setup-db.sh
./scripts/setup-db.sh
```

The app database user `kordoba` has password **1234**. Your `.env` should have:

```
DATABASE_URL="mysql://kordoba:1234@localhost:3306/kordoba_farm"
```

Apply schema and seed the 4 products (12 variations):

```bash
npx prisma db push
npx tsx prisma/seed.ts
```

If you don’t have `tsx`: `npm i -D tsx` then run the seed again.

**Products in seed:** Half Goat, Half Sheep, Whole Goat, Whole Sheep — each with 3 variations (different breed/weight/price).

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000); the app redirects to `/en` (or locale from Accept-Language).

## Routes

| Path | Description |
|------|-------------|
| `/[locale]` | Purpose selection (Qurban / Aqiqah / Personal / Gift) |
| `/[locale]/shop` | Shop with filters, animal cards |
| `/[locale]/animal/[tag]` | Animal detail, slaughter date, checkout CTA |
| `/[locale]/checkout` | One-page checkout (guest), Stripe/FPX |
| `/[locale]/dashboard` | Redirects to shop (no customer accounts) |
| `/[locale]/live-farm` | Live farm / transparency page |
| `/[locale]/corporate` | Corporate / company page |
| `/admin` | **Admin panel** (password-protected): dashboard, animals CRUD, orders + status + certificate/video URLs |
| `/api/checkout` | Create order + Stripe Checkout Session |
| `/api/webhooks/stripe` | Stripe webhook (payment completed → update order + animal) |

Locales: `ar`, `en`, `ms`, `zh` (Arabic is RTL).

## Design

- **Primary:** `#0F3D2E` · **Accent:** `#C8A951` · White, charcoal
- Sticky header, floating WhatsApp, minimal forms, guest checkout

## SEO

- Sitemap: `/sitemap.xml`
- Schema.org Organization in root layout
- OpenGraph (locale-specific image under `[locale]`)

## Production

1. Set all env vars (DB, Redis, Stripe, Cloudinary, Resend, WhatsApp as needed).
2. Run migrations: `npx prisma migrate deploy` (after creating migrations).
3. Deploy frontend to Vercel; point Stripe webhook to `https://yourdomain.com/api/webhooks/stripe`.
4. Set `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` in production; the admin panel at `/admin` is protected by password (no customer accounts).

---

Built for the highest-converting livestock purchasing experience in Southeast Asia.
