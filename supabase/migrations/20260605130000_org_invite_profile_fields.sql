-- Optional display name and job title on instructor invites (applied on accept)

alter table public.org_invites
  add column if not exists display_name text,
  add column if not exists job_title text;
