-- IndexPusher initial schema

-- Sites table: one row per verified Search Console property
create table if not exists public.sites (
  id                      uuid primary key default gen_random_uuid(),
  user_id                 uuid not null references auth.users(id) on delete cascade,
  domain                  text not null,
  service_account_email   text not null,
  -- WARNING: store encrypted via Supabase Vault in production
  service_account_key_json text not null,
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);

create index on public.sites(user_id);

-- RLS: users can only see/edit their own sites
alter table public.sites enable row level security;

create policy "users manage own sites"
  on public.sites
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- URL submissions table
create table if not exists public.url_submissions (
  id              uuid primary key default gen_random_uuid(),
  site_id         uuid not null references public.sites(id) on delete cascade,
  url             text not null,
  type            text not null check (type in ('URL_UPDATED', 'URL_DELETED')),
  status          text not null check (status in ('pending', 'submitted', 'error', 'rate_limited'))
                  default 'pending',
  google_response jsonb,
  error_message   text,
  submitted_at    timestamptz,
  created_at      timestamptz not null default now()
);

create index on public.url_submissions(site_id, created_at desc);
create index on public.url_submissions(status);

-- RLS: join through sites to enforce user ownership
alter table public.url_submissions enable row level security;

create policy "users manage own submissions"
  on public.url_submissions
  for all
  using (
    exists (
      select 1 from public.sites
      where sites.id = url_submissions.site_id
        and sites.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.sites
      where sites.id = url_submissions.site_id
        and sites.user_id = auth.uid()
    )
  );

-- Service role bypass for queue worker
create policy "service role bypass sites"
  on public.sites for all
  to service_role using (true) with check (true);

create policy "service role bypass submissions"
  on public.url_submissions for all
  to service_role using (true) with check (true);

-- updated_at trigger for sites
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger sites_updated_at
  before update on public.sites
  for each row execute function public.set_updated_at();
