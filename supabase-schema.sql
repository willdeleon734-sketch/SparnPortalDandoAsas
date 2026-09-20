create table if not exists public.profiles(id uuid primary key references auth.users(id) on delete cascade,full_name text,plan_name text default 'Acesso Beta',subscription_status text default 'inactive',subscription_expires_at timestamptz,mercado_pago_customer_id text,updated_at timestamptz default now());
alter table public.profiles enable row level security;
create policy "user reads own profile" on public.profiles for select using(auth.uid()=id);
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$ begin insert into public.profiles(id,full_name) values(new.id,new.raw_user_meta_data->>'full_name') on conflict do nothing;return new;end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();