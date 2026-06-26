-- Member-volume pricing: replace seat-based solo/team with starter/growth/studio

-- Rename seat_limit → member_limit
alter table public.organizations rename column seat_limit to member_limit;

-- Expand plan tiers
alter table public.organizations drop constraint if exists organizations_plan_tier_check;
alter table public.organizations
  alter column plan_tier set default 'starter';

update public.organizations
set
  plan_tier = case plan_tier
    when 'solo' then 'starter'
    when 'team' then 'growth'
    else plan_tier
  end,
  member_limit = case plan_tier
    when 'solo' then 30
    when 'team' then 75
    else member_limit
  end;

alter table public.organizations
  add constraint organizations_plan_tier_check
  check (plan_tier in ('starter', 'growth', 'studio'));

alter table public.organizations
  alter column member_limit set default 30;

-- Track when an org first exceeded its member cap (7-day grace period)
alter table public.organizations
  add column if not exists member_limit_exceeded_at timestamptz;
