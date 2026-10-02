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
  plan text check (plan in ('essentiel','premium','pro')),
  billing text check (billing in ('mensuel','annuel')),
  mrr numeric(10,2) not null default 0,
  client_since date,
  client_status text check (client_status in ('actif','pause','resilie')),
  founder boolean not null default false,
  next_action text check (char_length(next_action) <= 200),
  next_action_date date,
  notes jsonb not null default '[]'::jsonb,
  requested_plan text check (requested_plan in ('essentiel','premium','pro')),
  card_config jsonb,
  billing_info jsonb,
  consent_at timestamptz
);

-- (si la table existait déjà avant la v3)
alter table public.accounts add column if not exists requested_plan text;
alter table public.accounts add column if not exists card_config jsonb;
alter table public.accounts add column if not exists billing_info jsonb;
update public.accounts set plan = 'pro' where plan = 'enseigne';
alter table public.accounts drop constraint if exists accounts_plan_check;
alter table public.accounts add constraint accounts_plan_check check (plan in ('essentiel','premium','pro'));

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
    and (card_config is null or pg_column_size(card_config) < 600000)
    and (billing_info is null or pg_column_size(billing_info) < 4000)
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

-- 4. ESPACE COMMERÇANT
-- Le commerçant se connecte avec l'e-mail de sa fiche client (créez son accès dans
-- Supabase → Authentication → Users → Add user, avec le même e-mail).
-- Cette fonction ne renvoie QUE sa carte : jamais les notes internes ni les autres clients.
create or replace function public.my_account()
returns table (business text, contact_name text, plan text, requested_plan text, card_config jsonb, client_since date)
language sql
security definer
set search_path = public
stable
as $$
  select a.business, a.contact_name, a.plan, a.requested_plan, a.card_config, a.client_since
  from public.accounts a
  where a.stage = 'client'
    and a.email is not null
    and lower(a.email) = lower(auth.jwt() ->> 'email')
  order by a.client_since desc nulls last
  limit 1;
$$;
revoke all on function public.my_account() from public, anon;
grant execute on function public.my_account() to authenticated;

-- 5. NOTIFICATIONS DES COMMERÇANTS
-- Le commerçant écrit sa notification dans son espace ; vous la voyez dans l'admin
-- (onglet « Notifications »), vous l'envoyez depuis l'application de cartes, puis vous la marquez envoyée.
create table if not exists public.push_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  account_email text not null check (char_length(account_email) <= 160),
  business text check (char_length(business) <= 120),
  message text not null check (char_length(message) between 1 and 160),
  send_at timestamptz,
  status text not null default 'a_envoyer' check (status in ('a_envoyer','envoye','annule')),
  sent_at timestamptz
);
create index if not exists push_requests_email_idx on public.push_requests (account_email, created_at desc);
alter table public.push_requests enable row level security;
grant select, insert, update, delete on public.push_requests to authenticated;

-- Le commerçant connecté est-il un client actif ? (lit la table accounts sans l'exposer)
create or replace function public.is_active_client()
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.accounts a
    where a.stage = 'client' and a.email is not null and lower(a.email) = lower(auth.jwt() ->> 'email')
  );
$$;
revoke all on function public.is_active_client() from public, anon;
grant execute on function public.is_active_client() to authenticated;

drop policy if exists "commerçant lit ses notifications" on public.push_requests;
create policy "commerçant lit ses notifications" on public.push_requests
  for select to authenticated using (account_email = lower(auth.jwt() ->> 'email'));
drop policy if exists "commerçant écrit une notification" on public.push_requests;
create policy "commerçant écrit une notification" on public.push_requests
  for insert to authenticated with check (
    account_email = lower(auth.jwt() ->> 'email') and status = 'a_envoyer' and sent_at is null and public.is_active_client()
  );
drop policy if exists "commerçant annule une notification" on public.push_requests;
create policy "commerçant annule une notification" on public.push_requests
  for delete to authenticated using (account_email = lower(auth.jwt() ->> 'email') and status = 'a_envoyer');
drop policy if exists "admin notifications" on public.push_requests;
create policy "admin notifications" on public.push_requests
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- Limites par formule : Essentiel = pas de notification, Premium = 2 par semaine sans programmation, Pro = illimité.
create or replace function public.check_push_limit()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  p text;
  n int;
begin
  if public.is_admin() then return new; end if;
  select coalesce(a.plan, a.requested_plan) into p
    from public.accounts a
   where a.stage = 'client' and lower(a.email) = new.account_email
   order by a.client_since desc nulls last
   limit 1;
  if p is null or p = 'essentiel' then
    raise exception 'Les notifications sont incluses à partir de la formule Premium.';
  end if;
  if p = 'premium' then
    if new.send_at is not null then
      raise exception 'La programmation des notifications est incluse avec la formule Pro.';
    end if;
    select count(*) into n from public.push_requests
     where account_email = new.account_email and status <> 'annule' and created_at >= date_trunc('week', now());
    if n >= 2 then
      raise exception 'Vous avez déjà envoyé vos 2 notifications de la semaine.';
    end if;
  end if;
  return new;
end $$;
drop trigger if exists push_limit on public.push_requests;
create trigger push_limit before insert on public.push_requests for each row execute function public.check_push_limit();

-- 6. VOTRE COMPTE ADMIN : remplacez l'adresse puis exécutez cette ligne.
--    Créez aussi l'utilisateur dans Authentication > Users > Add user (avec mot de passe).
-- insert into public.admins (email) values ('votre-email@exemple.fr');
