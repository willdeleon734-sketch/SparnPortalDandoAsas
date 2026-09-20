-- INSTITUTO TECA — CMS de textos do index
-- Execute este arquivo UMA VEZ no SQL Editor do Supabase.
-- Depois veja "Authentication > Users", copie o UUID da SUA conta administradora
-- e execute a última instrução INSERT substituindo COLE_SEU_UUID_AQUI.

create table if not exists public.site_content (
  content_key text primary key,
  content_value text not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

create table if not exists public.site_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.site_admins enable row level security;

drop policy if exists "site_content leitura publica" on public.site_content;
create policy "site_content leitura publica"
on public.site_content for select
to anon, authenticated
using (true);

drop policy if exists "site_content admin insert" on public.site_content;
create policy "site_content admin insert"
on public.site_content for insert
to authenticated
with check (
  auth.uid() = updated_by
  and exists (select 1 from public.site_admins a where a.user_id = auth.uid())
);

drop policy if exists "site_content admin update" on public.site_content;
create policy "site_content admin update"
on public.site_content for update
to authenticated
using (exists (select 1 from public.site_admins a where a.user_id = auth.uid()))
with check (
  auth.uid() = updated_by
  and exists (select 1 from public.site_admins a where a.user_id = auth.uid())
);

-- Ninguém edita a lista de admins pelo site.
-- O cadastro de administradores é feito pelo SQL Editor / dashboard.
revoke insert, update, delete on public.site_admins from anon, authenticated;
grant select on public.site_admins to authenticated;

-- IMPORTANTE:
-- Substitua pelo UUID da sua conta em Authentication > Users e rode esta linha separadamente:
-- insert into public.site_admins(user_id) values ('COLE_SEU_UUID_AQUI') on conflict do nothing;
