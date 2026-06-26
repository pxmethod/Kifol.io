-- Phase 3: parent invite fields, connection tracking, parent-facing RLS

alter table public.org_parent_invites
  add column if not exists student_first_name text,
  add column if not exists student_last_name  text,
  add column if not exists personal_note      text,
  add column if not exists opened_at          timestamptz,
  add column if not exists accepted_at        timestamptz;

alter table public.portfolio_org_connections
  add column if not exists invited_via    uuid references public.org_parent_invites(id),
  add column if not exists disconnected_at timestamptz;

create index if not exists portfolio_org_connections_portfolio_id_idx
  on public.portfolio_org_connections (portfolio_id);

-- Parents can read connections for portfolios they own
create policy "parent can read their portfolio connections"
  on public.portfolio_org_connections for select
  using (
    exists (
      select 1 from public.portfolios
      where portfolios.id = portfolio_org_connections.portfolio_id
        and portfolios.user_id = auth.uid()
    )
  );

-- Parents can read basic org info for orgs their child is connected to
create policy "parent can read connected org details"
  on public.organizations for select
  using (
    exists (
      select 1
      from public.portfolio_org_connections poc
      join public.portfolios p on p.id = poc.portfolio_id
      where poc.org_id = organizations.id
        and poc.status = 'connected'
        and p.user_id = auth.uid()
    )
  );
