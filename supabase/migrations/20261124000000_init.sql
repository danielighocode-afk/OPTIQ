-- OPTIQ: initial database setup.
-- Run once in the Supabase dashboard: SQL Editor > New query > paste > Run.
-- Safe to read through first. It only creates OPTIQ's own tables, rules and photo storage.

-- 1. One profile row per student (linked to their sign-in account).
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text not null default '',
  phone       text,
  avatar_url  text,
  level       integer check (level between 100 and 600),
  opt_set     integer,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- 2. One row per student and quiz.
create table if not exists public.results (
  user_id     uuid not null references auth.users (id) on delete cascade,
  quiz_id     text not null,
  best        integer not null check (best >= 0),
  last        integer not null check (last >= 0),
  total       integer not null check (total > 0),
  attempts    integer not null default 1 check (attempts >= 1),
  updated_at  timestamptz not null default now(),
  primary key (user_id, quiz_id)
);

-- 3. Keep updated_at fresh.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists results_set_updated_at on public.results;
create trigger results_set_updated_at
  before update on public.results
  for each row execute function public.set_updated_at();

-- 4. Create the profile automatically when someone signs up (email or Google).
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, phone, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Security: every student can only see and change their own rows.
alter table public.profiles enable row level security;
alter table public.results  enable row level security;

drop policy if exists "profiles: read own"   on public.profiles;
drop policy if exists "profiles: insert own" on public.profiles;
drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: read own"   on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "profiles: insert own" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles: update own" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "results: read own"   on public.results;
drop policy if exists "results: insert own" on public.results;
drop policy if exists "results: update own" on public.results;
create policy "results: read own"   on public.results for select to authenticated using ((select auth.uid()) = user_id);
create policy "results: insert own" on public.results for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "results: update own" on public.results for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- 6. Profile photos: a public bucket (photos can be shown by link), but each student
--    can only upload, replace or delete files inside their own folder.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 1048576, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

drop policy if exists "avatars: read own folder"   on storage.objects;
drop policy if exists "avatars: upload own folder" on storage.objects;
drop policy if exists "avatars: update own folder" on storage.objects;
drop policy if exists "avatars: delete own folder" on storage.objects;
create policy "avatars: read own folder" on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: upload own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: update own folder" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars: delete own folder" on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
