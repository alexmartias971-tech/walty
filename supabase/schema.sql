-- ═══════════════════════════════════════════════════════════════
--  WALTI — base de données (Supabase)
--  À coller dans Supabase > SQL Editor > New query > Run.
--  Crée la table des contacts (prospects + clients), les règles de
--  sécurité (RLS) et la liste des administrateurs autorisés.
-- ═══════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- 1. Administrateurs autorisés à voir les données
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;
-- (aucune policy : la table n'est lisible que via la fonction ci-dessous)

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where email = lower(auth.jwt() ->> 'email'));
$$;

-- 2. Contacts : prospects et clients
create table if not exists public.accounts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  stage text not null default 'nouveau'
    check (stage in ('nouveau','contacte','demo','proposition','client','perdu')),
  source text not null default 'site' check (source in ('site','terrain')),
  business text not null check (char_length(business) between 1 and 120),
  contact_name text check (char_length(contact_name) <= 120),
  sector text check (char_length(sector) <= 80),
  city text check (char_length(city) <= 80),
  phone text check (char_length(phone) <= 30),
  email text check (char_length(email) <= 160),
  preferred_channel text check (char_length(preferred_channel) <= 20),
  message text check (char_length(message) <= 2100),
  plan text check (plan in ('essentiel','premium','enseigne')),
  billing text check (billing in ('mensuel','annuel')),
  mrr numeric(10,2) not null default 0,
  client_since date,
  client_status text check (client_status in ('actif','pause','resilie')),
  founder boolean not null default false,
  next_action text check (char_length(next_action) <= 200),
  next_action_date date,
  notes jsonb not null default '[]'::jsonb,
  consent_at timestamptz
);

create index if not exists accounts_stage_idx on public.accounts (stage);
create index if not exists accounts_next_action_idx on public.accounts (next_action_date);

alter table public.accounts enable row level security;

-- Droits d'accès de base (la RLS ci-dessous filtre ensuite ligne par ligne)
grant insert on public.accounts to anon;
grant select, insert, update, delete on public.accounts to authenticated;

-- Les visiteurs du site peuvent UNIQUEMENT déposer une demande (jamais lire)
drop policy if exists "formulaire du site" on public.accounts;
create policy "formulaire du site" on public.accounts
  for insert to anon
  with check (
    stage = 'nouveau' and source = 'site' and plan is null and mrr = 0
    and client_status is null and founder = false and notes = '[]'::jsonb
    and consent_at is not null
  );

-- Les administrateurs peuvent tout faire
drop policy if exists "admin lecture" on public.accounts;
create policy "admin lecture" on public.accounts for select to authenticated using (public.is_admin());
drop policy if exists "admin ajout" on public.accounts;
create policy "admin ajout" on public.accounts for insert to authenticated with check (public.is_admin());
drop policy if exists "admin modification" on public.accounts;
create policy "admin modification" on public.accounts for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admin suppression" on public.accounts;
create policy "admin suppression" on public.accounts for delete to authenticated using (public.is_admin());

-- 3. Mise à jour automatique de updated_at
create or replace function public.touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;
drop trigger if exists accounts_touch on public.accounts;
create trigger accounts_touch before update on public.accounts for each row execute function public.touch_updated_at();

-- 4. VOTRE COMPTE ADMIN : remplacez l'adresse puis exécutez cette ligne.
--    Créez aussi l'utilisateur dans Authentication > Users > Add user (avec mot de passe).
-- insert into public.admins (email) values ('votre-email@exemple.fr');
