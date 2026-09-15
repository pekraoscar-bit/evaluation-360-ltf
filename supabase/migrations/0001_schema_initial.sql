-- ============================================================================
-- ÉVALUATION 360° — LA TULIPE FOOD
-- Migration 0001 : schéma initial (référentiel + campagnes + évaluations) + RLS
--
-- À exécuter dans Supabase > SQL Editor > New query, en une seule fois.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. TYPES ÉNUMÉRÉS
-- ----------------------------------------------------------------------------
create type public.user_role as enum (
  'drh',
  'n1',
  'collaborateur',
  'evaluateur_pair',
  'evaluateur_collaborateur'
);

create type public.evaluation_source as enum (
  'auto',
  'collaborateurs',
  'pairs',
  'n_plus_1'
);

create type public.campaign_period as enum ('avril', 'juillet', 'octobre', 'janvier');

create type public.campaign_status as enum ('planifiee', 'ouverte', 'cloturee', 'prolongee');

create type public.evaluation_status as enum (
  'non_commencee',
  'en_cours',
  'soumise',
  'validee'
);

create type public.action_status as enum (
  'a_faire',
  'en_cours',
  'realise',
  'reporte',
  'abandonne'
);

-- ----------------------------------------------------------------------------
-- 2. RÉFÉRENTIEL : sites, postes, critères
-- ----------------------------------------------------------------------------
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table public.positions (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  active boolean not null default true,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

create table public.position_criteria (
  id uuid primary key default gen_random_uuid(),
  position_id uuid not null references public.positions (id) on delete cascade,
  name text not null,
  description text,
  category text,
  display_order int not null default 0,
  weight numeric not null default 1,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 3. COLLABORATEURS ET COMPTES
-- ----------------------------------------------------------------------------
create table public.employees (
  id uuid primary key default gen_random_uuid(),
  matricule text not null unique,
  full_name text not null,
  position_id uuid references public.positions (id),
  site_id uuid references public.sites (id),
  manager_employee_id uuid references public.employees (id),
  user_id uuid unique references auth.users (id) on delete set null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Profil applicatif lié à un compte Supabase Auth (créé à l'étape Authentification)
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  employee_id uuid references public.employees (id),
  role public.user_role not null default 'collaborateur',
  full_name text,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. PARAMÈTRES DRH (pondérations, échelle, seuils — singleton)
-- ----------------------------------------------------------------------------
create table public.app_settings (
  id int primary key default 1,
  weight_collaborateurs numeric not null default 0.40,
  weight_n1 numeric not null default 0.30,
  weight_pairs numeric not null default 0.15,
  weight_auto numeric not null default 0.15,
  rating_min int not null default 1,
  rating_max int not null default 5,
  threshold_insuffisant_max numeric not null default 1.99,
  threshold_ameliorer_max numeric not null default 2.99,
  threshold_satisfaisant_max numeric not null default 3.49,
  threshold_bien_max numeric not null default 4.49,
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);

insert into public.app_settings (id) values (1);

-- ----------------------------------------------------------------------------
-- 5. CAMPAGNES, ATTRIBUTIONS, ÉVALUATIONS
-- ----------------------------------------------------------------------------
create table public.evaluation_campaigns (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year int not null,
  period public.campaign_period not null,
  start_date date,
  end_date date,
  status public.campaign_status not null default 'planifiee',
  created_at timestamptz not null default now(),
  unique (year, period)
);

create table public.evaluation_assignments (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.evaluation_campaigns (id) on delete cascade,
  evaluatee_id uuid not null references public.employees (id) on delete cascade,
  evaluator_id uuid not null references public.employees (id) on delete cascade,
  source public.evaluation_source not null,
  created_at timestamptz not null default now(),
  unique (campaign_id, evaluatee_id, evaluator_id, source)
);

create table public.evaluations (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null unique references public.evaluation_assignments (id) on delete cascade,
  status public.evaluation_status not null default 'non_commencee',
  submitted_at timestamptz,
  validated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.evaluation_answers (
  id uuid primary key default gen_random_uuid(),
  evaluation_id uuid not null references public.evaluations (id) on delete cascade,
  criterion_id uuid not null references public.position_criteria (id),
  rating int check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (evaluation_id, criterion_id)
);

-- Plans d'action, entretiens, notifications et audit : structure posée dès
-- maintenant (référencée par le cahier des charges), le remplissage viendra
-- aux étapes correspondantes du plan de développement.
create table public.action_plans (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  campaign_id uuid references public.evaluation_campaigns (id),
  created_at timestamptz not null default now()
);

create table public.action_items (
  id uuid primary key default gen_random_uuid(),
  action_plan_id uuid not null references public.action_plans (id) on delete cascade,
  axe text not null,
  objectif text,
  action text,
  responsable_employee_id uuid references public.employees (id),
  date_debut date,
  date_cible date,
  priorite text,
  status public.action_status not null default 'a_faire',
  comment text,
  created_at timestamptz not null default now()
);

create table public.evaluation_interviews (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  campaign_id uuid not null references public.evaluation_campaigns (id) on delete cascade,
  interview_date date,
  points_forts text,
  difficultes text,
  axes_amelioration text,
  objectifs text,
  actions_decidees text,
  commentaire_n1 text,
  commentaire_collaborateur text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees (id) on delete cascade,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references auth.users (id),
  action text not null,
  details jsonb,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. FONCTIONS UTILITAIRES POUR LES POLICIES RLS
-- ----------------------------------------------------------------------------
create or replace function public.current_employee_id()
returns uuid
language sql
stable
as $$
  select employee_id from public.profiles where id = auth.uid();
$$;

create or replace function public.current_role()
returns public.user_role
language sql
stable
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_drh()
returns boolean
language sql
stable
as $$
  select public.current_role() = 'drh';
$$;

-- ----------------------------------------------------------------------------
-- 7. ACTIVATION RLS + POLICIES
-- ----------------------------------------------------------------------------
alter table public.sites enable row level security;
alter table public.positions enable row level security;
alter table public.position_criteria enable row level security;
alter table public.employees enable row level security;
alter table public.profiles enable row level security;
alter table public.app_settings enable row level security;
alter table public.evaluation_campaigns enable row level security;
alter table public.evaluation_assignments enable row level security;
alter table public.evaluations enable row level security;
alter table public.evaluation_answers enable row level security;
alter table public.action_plans enable row level security;
alter table public.action_items enable row level security;
alter table public.evaluation_interviews enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

-- Référentiel : lecture pour tout utilisateur connecté, écriture réservée DRH
create policy "referentiel_lecture_sites" on public.sites for select using (auth.uid() is not null);
create policy "referentiel_ecriture_sites" on public.sites for all using (public.is_drh()) with check (public.is_drh());

create policy "referentiel_lecture_positions" on public.positions for select using (auth.uid() is not null);
create policy "referentiel_ecriture_positions" on public.positions for all using (public.is_drh()) with check (public.is_drh());

create policy "referentiel_lecture_criteres" on public.position_criteria for select using (auth.uid() is not null);
create policy "referentiel_ecriture_criteres" on public.position_criteria for all using (public.is_drh()) with check (public.is_drh());

-- Profils : chacun voit son propre profil, la DRH voit tout
create policy "profils_soi_meme" on public.profiles for select using (id = auth.uid());
create policy "profils_drh_tout" on public.profiles for all using (public.is_drh()) with check (public.is_drh());

-- Collaborateurs : soi-même, son équipe (N+1), ou tout (DRH)
create policy "employes_soi_meme" on public.employees for select
  using (id = public.current_employee_id());
create policy "employes_son_equipe" on public.employees for select
  using (manager_employee_id = public.current_employee_id());
create policy "employes_drh_tout" on public.employees for all
  using (public.is_drh()) with check (public.is_drh());

-- Paramètres : lecture pour tous les connectés, écriture DRH uniquement
create policy "settings_lecture" on public.app_settings for select using (auth.uid() is not null);
create policy "settings_ecriture" on public.app_settings for all using (public.is_drh()) with check (public.is_drh());

-- Campagnes : lecture pour tous les connectés, gestion par la DRH
create policy "campagnes_lecture" on public.evaluation_campaigns for select using (auth.uid() is not null);
create policy "campagnes_ecriture" on public.evaluation_campaigns for all using (public.is_drh()) with check (public.is_drh());

-- Attributions : un évaluateur voit ses propres attributions ; DRH voit tout
create policy "attributions_evaluateur" on public.evaluation_assignments for select
  using (evaluator_id = public.current_employee_id());
create policy "attributions_drh" on public.evaluation_assignments for all
  using (public.is_drh()) with check (public.is_drh());

-- Évaluations et réponses : réservées à l'évaluateur concerné (lecture/écriture
-- de SA copie) et à la DRH. Volontairement PAS d'accès direct pour l'évalué :
-- la confidentialité/anonymisation impose de ne restituer que des résultats
-- agrégés, via une fonction/vue dédiée construite à l'étape "Calcul des scores".
create policy "evaluations_evaluateur" on public.evaluations for select
  using (
    assignment_id in (
      select id from public.evaluation_assignments
      where evaluator_id = public.current_employee_id()
    )
  );
create policy "evaluations_evaluateur_ecriture" on public.evaluations for insert
  with check (
    assignment_id in (
      select id from public.evaluation_assignments
      where evaluator_id = public.current_employee_id()
    )
  );
create policy "evaluations_evaluateur_maj" on public.evaluations for update
  using (
    assignment_id in (
      select id from public.evaluation_assignments
      where evaluator_id = public.current_employee_id()
    )
  );
create policy "evaluations_drh" on public.evaluations for all
  using (public.is_drh()) with check (public.is_drh());

create policy "reponses_evaluateur" on public.evaluation_answers for select
  using (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.evaluation_assignments a on a.id = e.assignment_id
      where a.evaluator_id = public.current_employee_id()
    )
  );
create policy "reponses_evaluateur_ecriture" on public.evaluation_answers for insert
  with check (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.evaluation_assignments a on a.id = e.assignment_id
      where a.evaluator_id = public.current_employee_id()
    )
  );
create policy "reponses_evaluateur_maj" on public.evaluation_answers for update
  using (
    evaluation_id in (
      select e.id from public.evaluations e
      join public.evaluation_assignments a on a.id = e.assignment_id
      where a.evaluator_id = public.current_employee_id()
    )
  );
create policy "reponses_drh" on public.evaluation_answers for all
  using (public.is_drh()) with check (public.is_drh());

-- Plans d'action, entretiens, notifications : l'employé concerné + son N+1 + la DRH
create policy "plans_action_soi_meme" on public.action_plans for select
  using (employee_id = public.current_employee_id());
create policy "plans_action_n1" on public.action_plans for select
  using (
    employee_id in (
      select id from public.employees where manager_employee_id = public.current_employee_id()
    )
  );
create policy "plans_action_drh" on public.action_plans for all
  using (public.is_drh()) with check (public.is_drh());

create policy "actions_via_plan" on public.action_items for select
  using (
    action_plan_id in (
      select id from public.action_plans
      where employee_id = public.current_employee_id()
         or employee_id in (
              select id from public.employees where manager_employee_id = public.current_employee_id()
            )
    )
  );
create policy "actions_drh" on public.action_items for all
  using (public.is_drh()) with check (public.is_drh());

create policy "entretiens_soi_meme" on public.evaluation_interviews for select
  using (employee_id = public.current_employee_id());
create policy "entretiens_n1" on public.evaluation_interviews for select
  using (
    employee_id in (
      select id from public.employees where manager_employee_id = public.current_employee_id()
    )
  );
create policy "entretiens_drh" on public.evaluation_interviews for all
  using (public.is_drh()) with check (public.is_drh());

create policy "notifications_soi_meme" on public.notifications for select
  using (employee_id = public.current_employee_id());
create policy "notifications_drh" on public.notifications for all
  using (public.is_drh()) with check (public.is_drh());

-- Audit log : lecture réservée à la DRH, écriture par le backend uniquement
create policy "audit_drh" on public.audit_logs for select using (public.is_drh());
