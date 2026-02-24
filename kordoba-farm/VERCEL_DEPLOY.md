# Deploying Kordoba Farm on Vercel

## 1. Prerequisites

- **Git**: Push your project to GitHub, GitLab, or Bitbucket.
- **Vercel account**: [vercel.com](https://vercel.com) (sign up with Git).

## 2. Database (PostgreSQL / Supabase)

Vercel does not host databases. The recommended setup for this project is **PostgreSQL on Supabase**:

- Create a project on [Supabase](https://supabase.com) (it provisions a Postgres database for you).
- In Supabase → **Project Settings → Database**, copy the **connection string** for `psql` or `Prisma`.

Example connection string:

```txt
postgresql://USER:PASSWORD@db.xxxxx.supabase.co:5432/postgres?sslmode=require
```

Use this as `DATABASE_URL` in Vercel (see step 5) and in your local `.env`.

After first deploy (or before), run Prisma migrations/DDL from your machine with the same `DATABASE_URL`:

```bash
DATABASE_URL="postgresql://..." npx prisma db push
npx prisma db seed   # if you use seed
```

## 3. Redis (optional)

The app uses Redis (e.g. `src/lib/redis.ts`). On Vercel there is no local Redis, so either:

- **Use [Upstash Redis](https://upstash.com)** (serverless Redis), create a database, and set `REDIS_URL` in Vercel to the Upstash URL (often `rediss://...`), or  
- **Leave `REDIS_URL` unset** only if the app does not call Redis anywhere. If the app connects at import time, an unset value may fall back to `redis://localhost:6379` and fail on Vercel. In that case you must set a valid `REDIS_URL` or make Redis optional in code.

## 4. Import project on Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import your Git repository (e.g. the one containing `kordoba-farm`).
3. Set **Root Directory** to the folder that contains `package.json` and `next.config.mjs` (e.g. `kordoba-farm` if the repo root is the monorepo root).
4. **Build Command**: `npm run build` (default).  
   **Output Directory**: leave default (Next.js is auto-detected).  
   **Install Command**: `npm install` (default).

## 5. Environment variables

In the Vercel project: **Settings → Environment Variables**. Add:

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | PostgreSQL/Supabase connection string (see step 2). |
| `ADMIN_PASSWORD` | Yes | Admin login password. |
| `ADMIN_SESSION_SECRET` | Yes | Long random string (e.g. 32+ chars) for session signing. |
| `NEXT_PUBLIC_APP_URL` | Yes | Full app URL, e.g. `https://your-app.vercel.app` (no trailing slash). |
| `STRIPE_SECRET_KEY` | If using checkout | Stripe secret key. |
| `STRIPE_WEBHOOK_SECRET` | If using checkout | Stripe webhook signing secret for your Vercel URL. |
| `NEXT_PUBLIC_WHATSAPP_LINK` | No | Can also be set in Admin → Settings. |
| `REDIS_URL` | If app uses Redis | e.g. Upstash `rediss://...` URL. |

Use **Production**, and optionally **Preview**, as needed. Redeploy after changing env vars.

## 6. Stripe webhook (if you use Stripe)

1. In Stripe Dashboard → Developers → Webhooks, add an endpoint:  
   `https://YOUR_VERCEL_DOMAIN/api/webhooks/stripe`
2. Select the events your app needs (e.g. `checkout.session.completed`).
3. Copy the **Signing secret** and set it as `STRIPE_WEBHOOK_SECRET` in Vercel.

## 7. Deploy

- Push to the connected branch (e.g. `main`); Vercel will build and deploy.
- Or trigger a deploy from the Vercel dashboard.

## 8. Post-deploy

- Run `prisma db push` (and `prisma db seed` if used) against your production `DATABASE_URL` if you haven’t already.
- In Admin → Settings, set WhatsApp link and any other site settings.
- Confirm checkout and webhooks using the live Stripe keys and `NEXT_PUBLIC_APP_URL`.

---

**Summary checklist**

- [ ] Repo pushed to GitHub/GitLab/Bitbucket  
- [ ] PostgreSQL (Supabase) database created and `DATABASE_URL` set on Vercel  
- [ ] `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` set  
- [ ] `NEXT_PUBLIC_APP_URL` set to your Vercel (or custom) URL  
- [ ] Stripe keys and `STRIPE_WEBHOOK_SECRET` set if using checkout  
- [ ] `REDIS_URL` set if the app uses Redis, or code updated so Redis is optional  
- [ ] Root directory on Vercel points to the app folder (`kordoba-farm` if applicable)  
- [ ] Database migrated and seeded after first deploy  
