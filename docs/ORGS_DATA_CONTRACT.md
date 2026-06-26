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

## Member counting (billing)
- `member_count` = count of `org_parent_invites` where `org_id = X` and `status` in (`pending`, `accepted`).
- Archived, removed, expired, and revoked parent invites do **not** count toward the cap.
- Instructors are **unlimited** on all plans (`org_members` / `org_invites` are not capped).
- Plans set `organizations.member_limit` (30, 75, or 150 by tier).
- Orgs that exceed their tier are **prompted to upgrade, not hard-blocked**.
- A **7-day grace period** begins when `member_count > member_limit`; `member_limit_exceeded_at` tracks the start. After grace, upgrade prompts intensify but the org is never blocked.

## Billing
- New org signups receive a **14-day free trial** (no payment required).
  - `subscription_status = trialing`
  - `trial_ends_at = now() + 14 days` (override length with `ORG_TRIAL_DAYS` env on server)
  - Default plan: `starter` with `member_limit = 30`
  - No Stripe customer/subscription is created until the admin chooses a plan.
- After trial expires without a paid subscription, the org sees billing prompts (`trial_expired`).
- Plans: `starter` | `growth` | `studio` (`organizations.plan_tier`).

| Plan | Members | Monthly | Annual |
|------|---------|---------|--------|
| Starter | 30 | $14.99/mo | $159/yr ($13.25/mo) |
| Growth | 75 | $29.99/mo | $319/yr ($26.58/mo) |
| Studio | 150 | $49.99/mo | $531/yr ($44.25/mo) |

- Stripe webhooks update `plan_tier`, `member_limit`, `subscription_status`, and `stripe_*` fields when a plan is purchased.

## Permissions matrix

| Action | Admin | Instructor |
|--------|-------|------------|
| Manage billing | ✅ | ❌ |
| Edit org profile & seal | ✅ | ❌ |
| Invite / remove instructors | ✅ | ❌ |
| Invite parents | ✅ | ❌ |
| Create achievement requests | ✅ | ✅ |
| View org dashboard | ✅ | ✅ |
