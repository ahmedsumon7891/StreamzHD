# StreamZ HD

Production-ready IPTV streaming web application.

## Stack
- Next.js 15 (App Router) + React 19
- Supabase (Postgres + Auth + Storage), `@supabase/ssr`
- Tailwind CSS, Framer Motion, Zustand
- Video.js + `@videojs/http-streaming` (HLS)
- Deploy: Vercel

## Setup

1. `cp .env.example .env.local` and fill in values:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose)
   - `NEXT_PUBLIC_APP_URL` (final public URL)

2. Create a Supabase project. **Edit `supabase/migrations/007_admin_auth.sql`**
   and set your real `admin_email` and `admin_password` before running.
   Then run the SQL files in `supabase/migrations/` **in order** (001 → 007)
   in the Supabase SQL editor.

3. In Supabase Storage, create public buckets: `logos`, `sliders`,
   `categories`, `countries`, `media` (migration 006 also handles this).

4. `npm install && npm run dev`

5. Visit `/admin/login` and sign in with the seeded admin email/password.
   **Change the password immediately** from the Supabase dashboard
   (Authentication → Users) or after first login.

## Deploy to Vercel

1. Push to GitHub.
2. Import to Vercel.
3. Paste env vars from `.env.example`.
4. Deploy.

## Production Notes

- **Auth**: Supabase Auth + `user_roles` table; admin role checked via
  `has_role()` security-definer RPC. No custom JWT.
- **RLS**: Enabled on all user-data tables; public reads go through the
  service-role client with explicit column/where filters.
- **Rate limiting**: In-memory per-instance limiter on `/api/channels/view`
  (30/min/IP). For multi-region enforcement, plug in Upstash Redis.
- **Security headers**: HSTS, X-Frame-Options, X-Content-Type-Options,
  Permissions-Policy, Referrer-Policy — set in `next.config.ts`.
- **Images**: `next/image` with AVIF/WebP; remote patterns allow Supabase
  storage + any HTTPS host (tighten for stricter CSP).
- **Edge runtime**: All API routes use Node runtime (`runtime = "nodejs"`)
  because they use the service-role Supabase client.
- **Vercel function limits**: `/api/channels/import` is configured for
  60s (`maxDuration: 60`). Requires Vercel **Pro** plan; Hobby tops out at 10s.

## Optional hardening
- Add Sentry (`@sentry/nextjs`) for error monitoring.
- Add Upstash Redis for distributed rate limiting + caching.
- Configure Supabase Storage CORS to your final domain only.
- Replace the placeholder `public/og.png` with a branded 1200×630 image.
