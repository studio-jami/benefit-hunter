create table if not exists public.hunter_user_state (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  profile_doc jsonb not null default '{}'::jsonb,
  statuses jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.hunter_user_state enable row level security;

create or replace function public.set_hunter_user_state_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_hunter_user_state_updated_at on public.hunter_user_state;
create trigger set_hunter_user_state_updated_at
before update on public.hunter_user_state
for each row
execute function public.set_hunter_user_state_updated_at();

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.hunter_user_state to authenticated;

drop policy if exists "Users can read own hunter state" on public.hunter_user_state;
create policy "Users can read own hunter state"
  on public.hunter_user_state
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert own hunter state" on public.hunter_user_state;
create policy "Users can insert own hunter state"
  on public.hunter_user_state
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update own hunter state" on public.hunter_user_state;
create policy "Users can update own hunter state"
  on public.hunter_user_state
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete own hunter state" on public.hunter_user_state;
create policy "Users can delete own hunter state"
  on public.hunter_user_state
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

do $$
begin
  if exists (
    select 1
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.proname = 'rls_auto_enable'
      and pg_get_function_identity_arguments(p.oid) = ''
  ) then
    revoke execute on function public.rls_auto_enable() from public;
  end if;
end;
$$;
