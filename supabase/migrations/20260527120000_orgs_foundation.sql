-- Kifolio for Orgs — Phase 1 foundation

-- organizations
create table public.organizations (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  slug             text not null unique,
  logo_url         text,
  seal_template_id text,
  about            text,
  location         text,
  plan_tier        text not null default 'solo'
                   check (plan_tier in ('solo', 'team')),
  seat_limit       int not null default 1,
  stripe_customer_id      text unique,
  stripe_subscription_id  text unique,
  stripe_price_id         text,
  subscription_status     text default 'incomplete'
                          check (subscription_status in (
                            'incomplete', 'trialing', 'active',
                            'past_due', 'canceled', 'unpaid'
                          )),
  trial_ends_at    timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- org_members
create table public.org_members (
  id           uuid primary key default gen_random_uuid(),
  org_id       uuid not null references public.organizations(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null check (role in ('admin', 'instructor')),
  status       text not null default 'active'
               check (status in ('active', 'suspended', 'removed')),
  photo_url    text,
  display_name text,
  job_title    text,
  invited_at   timestamptz,
  joined_at    timestamptz not null default now(),
  created_at   timestamptz not null default now(),
  unique (org_id, user_id)
);

-- org_invites (instructor invites — UI Phase 2+)
create table public.org_invites (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references public.organizations(id) on delete cascade,
  email      text not null,
  role       text not null default 'instructor' check (role in ('instructor')),
  token      text not null unique default encode(gen_random_bytes(32), 'hex'),
  status     text not null default 'pending'
             check (status in ('pending', 'accepted', 'expired', 'revoked')),
  expires_at timestamptz not null default (now() + interval '7 days'),
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);

-- org_parent_invites (Phase 3)
create table public.org_parent_invites (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  email           text not null,
  token           text not null unique default encode(gen_random_bytes(32), 'hex'),
  status          text not null default 'pending'
                  check (status in ('pending', 'accepted', 'expired', 'revoked')),
  org_name_snapshot  text,
  org_logo_snapshot  text,
  expires_at      timestamptz not null default (now() + interval '30 days'),
  invited_by      uuid references auth.users(id),
  created_at      timestamptz not null default now()
);

-- portfolio_org_connections (Phase 3)
create table public.portfolio_org_connections (
  id           uuid primary key default gen_random_uuid(),
  portfolio_id uuid not null,
  org_id       uuid not null references public.organizations(id) on delete cascade,
  status       text not null default 'connected'
               check (status in ('connected', 'disconnected')),
  connected_at timestamptz not null default now(),
  unique (portfolio_id, org_id)
);

-- org_achievement_requests (Phase 4)
create table public.org_achievement_requests (
  id              uuid primary key default gen_random_uuid(),
  org_id          uuid not null references public.organizations(id) on delete cascade,
  portfolio_id    uuid not null,
  created_by      uuid not null references auth.users(id),
  type            text not null check (type in ('endorsement', 'shoutout', 'promotion')),
  title           text not null,
  body            text,
  media_url       text,
  status          text not null default 'pending'
                  check (status in ('pending', 'approved', 'declined', 'expired')),
  expires_at      timestamptz not null default (now() + interval '30 days'),
  approved_at     timestamptz,
  declined_at     timestamptz,
  parent_note     text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- indexes
create index org_members_org_id_idx on public.org_members (org_id);
create index org_members_user_id_idx on public.org_members (user_id);
create index org_invites_org_id_idx on public.org_invites (org_id);
create index org_invites_token_idx on public.org_invites (token);
create index org_parent_invites_org_id_idx on public.org_parent_invites (org_id);
create index org_parent_invites_token_idx on public.org_parent_invites (token);
create index portfolio_org_connections_portfolio_id_idx on public.portfolio_org_connections (portfolio_id);
create index portfolio_org_connections_org_id_idx on public.portfolio_org_connections (org_id);
create index org_achievement_requests_org_id_idx on public.org_achievement_requests (org_id);
create index org_achievement_requests_portfolio_id_idx on public.org_achievement_requests (portfolio_id);

-- updated_at triggers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger organizations_updated_at
  before update on public.organizations
  for each row execute function public.set_updated_at();

create trigger org_achievement_requests_updated_at
  before update on public.org_achievement_requests
  for each row execute function public.set_updated_at();

-- RLS
alter table public.organizations              enable row level security;
alter table public.org_members                enable row level security;
alter table public.org_invites                enable row level security;
alter table public.org_parent_invites         enable row level security;
alter table public.portfolio_org_connections  enable row level security;
alter table public.org_achievement_requests   enable row level security;

create or replace function public.is_org_admin(org uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.org_members
    where org_id = org
      and user_id = auth.uid()
      and role = 'admin'
      and status = 'active'
  );
$$;

create or replace function public.is_org_member(org uuid)
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.org_members
    where org_id = org
      and user_id = auth.uid()
      and status = 'active'
  );
$$;

create policy "org members can read their org"
  on public.organizations for select
  using (public.is_org_member(id));

create policy "org admin can update"
  on public.organizations for update
  using (public.is_org_admin(id));

create policy "members can see their own org members"
  on public.org_members for select
  using (public.is_org_member(org_id));

create policy "admin can insert members"
  on public.org_members for insert
  with check (public.is_org_admin(org_id));

create policy "admin can update members"
  on public.org_members for update
  using (public.is_org_admin(org_id));

create policy "admin can remove members"
  on public.org_members for delete
  using (public.is_org_admin(org_id));

create policy "admin can manage invites"
  on public.org_invites for all
  using (public.is_org_admin(org_id));

create policy "anyone can look up invite by token"
  on public.org_invites for select
  using (true);

create policy "admin can manage parent invites"
  on public.org_parent_invites for all
  using (public.is_org_admin(org_id));

create policy "anyone can look up parent invite by token"
  on public.org_parent_invites for select
  using (true);

create policy "org members can see connections"
  on public.portfolio_org_connections for select
  using (public.is_org_member(org_id));

create policy "org members can view requests"
  on public.org_achievement_requests for select
  using (public.is_org_member(org_id));

create policy "org members can create requests"
  on public.org_achievement_requests for insert
  with check (public.is_org_member(org_id));

create policy "admin can update any request"
  on public.org_achievement_requests for update
  using (public.is_org_admin(org_id));

-- Service role bypasses RLS for signup provisioning (server-side only)
