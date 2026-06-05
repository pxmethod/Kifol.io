# Kifolio Orgs — Data contract

## Auth
- Single Supabase Auth instance shared by apps/web (parent app) and apps/orgs.
- `org_members.user_id` = `auth.users.id`. A user can be a Kifolio parent AND an org admin/instructor on the same auth account.
- apps/orgs reads org context from `org_members` on login. apps/web reads child portfolio context as before.
- Dual sessions: a user can be logged into apps/web and apps/orgs simultaneously in different tabs with no conflict.

## Child portfolio → org connection
- `portfolio_org_connections` joins `portfolios.id` (apps/web) to `organizations.id`.
- Connection is created server-side when a parent accepts an invite (Phase 3).
- Existing Kifolio parents log in on the invite link and accept; no second account required.
- New parents complete standard onboarding; org connection attaches after signup via invite token.
- A child can be connected to multiple orgs.
- Status: `connected` | `disconnected`. Soft delete only — preserve history.

## Achievement request states
- `pending` → parent has not acted. Shown in parent app as "awaiting your approval".
- `approved` → parent approved; org achievement renders on child timeline with org seal.
- `declined` → parent declined; org notified, not shown on timeline.
- `expired` → 30 days elapsed with no action; treated as declined.

## Seat counting
- `seat_count` = count of `org_members` where `org_id = X` and `status = 'active'`.
- Admin always counts as a seat.
- Solo plan: `seat_limit = 1`. Admin is the only member; `role = admin`.
- Team plan: `seat_limit` up to 10 (admin + up to 9 others).
- Enforce at service layer before insert into `org_members`.

## Billing
- New org signups receive a **14-day free trial** (no payment required).
  - `subscription_status = trialing`
  - `trial_ends_at = now() + 14 days` (override length with `ORG_TRIAL_DAYS` env on server)
  - No Stripe customer/subscription is created until the admin chooses a plan.
- After trial expires without a paid subscription, the org sees billing prompts (`trial_expired`).
- Plans: `solo` | `team` (`organizations.plan_tier`).
- Solo: $9.99/mo or $105/yr — 1 seat.
- Team: $19.99/mo or $220/yr — up to 10 seats (admin included).
- Stripe webhooks update `plan_tier`, `seat_limit`, `subscription_status`, and `stripe_*` fields when a plan is purchased.

## Permissions matrix

| Action | Admin | Instructor |
|--------|-------|------------|
| Manage billing | ✅ | ❌ |
| Edit org profile & seal | ✅ | ❌ |
| Invite / remove instructors | ✅ | ❌ |
| Manage seats | ✅ | ❌ |
| Invite parents | ✅ | ❌ |
| Create achievement requests | ✅ | ✅ |
| View org dashboard | ✅ | ✅ |
