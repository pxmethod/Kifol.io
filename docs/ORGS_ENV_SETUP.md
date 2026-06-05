# Kifolio Orgs — Environment variables

Copy Supabase vars from `apps/web/.env.local` into `apps/orgs/.env.local` (same project).

## Required

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional: free trial length in days for new orgs (default 14)
ORG_TRIAL_DAYS=14

# Branded email verification (same as parent app)
EMAIL_VERIFICATION_SECRET=
MAILERSEND_API_KEY=
MAILERSEND_TEMPLATE_WELCOME=
SUPPORT_EMAIL=support@kifol.io

# Stripe (server)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_SOLO_MONTHLY=
STRIPE_PRICE_SOLO_ANNUAL=
STRIPE_PRICE_TEAM_MONTHLY=
STRIPE_PRICE_TEAM_ANNUAL=

# Stripe (client — billing page buttons)
NEXT_PUBLIC_STRIPE_PRICE_SOLO_MONTHLY=
NEXT_PUBLIC_STRIPE_PRICE_SOLO_ANNUAL=
NEXT_PUBLIC_STRIPE_PRICE_TEAM_MONTHLY=
NEXT_PUBLIC_STRIPE_PRICE_TEAM_ANNUAL=
```

## URLs

```bash
# Local orgs app (port 3001, basePath /orgs)
NEXT_PUBLIC_ORGS_APP_URL=http://localhost:3001

# Used in Stripe redirect URLs (production: https://kifol.io)
NEXT_PUBLIC_ORGS_URL=https://kifol.io
```

## Marketing site (`apps/web`)

```bash
# Points CTAs on /orgs to the orgs app in local dev
NEXT_PUBLIC_ORGS_APP_URL=http://localhost:3001
```

## Database

Run `supabase/migrations/20260527120000_orgs_foundation.sql` in the Supabase SQL editor (dashboard).

## Stripe webhook

Point Stripe to: `https://<your-orgs-host>/orgs/api/webhooks/stripe`

Local: `stripe listen --forward-to localhost:3001/orgs/api/webhooks/stripe`

## Free trial

- Every new org signup gets `subscription_status=trialing` and `trial_ends_at` set automatically.
- No Stripe setup required until the admin subscribes from **Billing**.
- Existing orgs created before this change: run in Supabase SQL editor if you want to grant a trial:

```sql
update public.organizations
set
  subscription_status = 'trialing',
  trial_ends_at = now() + interval '14 days'
where stripe_subscription_id is null
  and subscription_status = 'incomplete';
```

## Verification flow

- Org signup sends a branded verification email through MailerSend using the same template path as the parent app.
- Verify endpoint: `/orgs/verify?token=...`
- API confirm endpoint: `/orgs/api/auth/confirm-email`
- In Supabase Auth settings, disable default confirmation email template if you only want branded verification emails.
