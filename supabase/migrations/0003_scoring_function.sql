-- ============================================================================
-- ÉVALUATION 360° — LA TULIPE FOOD
-- Migration 0003 : calcul des scores (fonction serveur sécurisée)
--
-- Pourquoi une fonction plutôt qu'une vue simple : le calcul du score doit
-- impérativement se faire côté serveur (jamais faire confiance à un score
-- envoyé par le navigateur), ET respecter l'anonymisation (l'évalué et son
-- N+1 ne doivent jamais voir l'identité des évaluateurs individuels,
-- seulement des moyennes). Une fonction SECURITY DEFINER permet de lire les
-- réponses individuelles (normalement bloquées par la RLS pour l'évalué)
-- tout en ne renvoyant QUE des agrégats, après avoir vérifié elle-même les
-- droits d'accès (DRH, l'employé lui-même, ou son N+1 direct).
-- ============================================================================

create or replace function public.get_employee_criterion_scores(
  p_campaign_id uuid,
  p_employee_id uuid
)
returns table (
  criterion_id uuid,
  criterion_name text,
  avg_auto numeric,
  avg_collaborateurs numeric,
  avg_pairs numeric,
  avg_n_plus_1 numeric,
  weighted_score numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_caller_employee_id uuid;
  v_caller_role public.user_role;
  v_manager_id uuid;
  v_weight_auto numeric;
  v_weight_collaborateurs numeric;
  v_weight_pairs numeric;
  v_weight_n1 numeric;
begin
  select employee_id, role into v_caller_employee_id, v_caller_role
  from public.profiles where id = auth.uid();

  if v_caller_role is null then
    raise exception 'Accès refusé : profil introuvable';
  end if;

  if v_caller_role != 'drh' then
    if v_caller_employee_id is null or v_caller_employee_id != p_employee_id then
      select manager_employee_id into v_manager_id
      from public.employees where id = p_employee_id;

      if v_caller_employee_id is null or v_manager_id is distinct from v_caller_employee_id then
        raise exception 'Accès refusé : vous ne pouvez pas consulter ces résultats';
      end if;
    end if;
  end if;

  select weight_auto, weight_collaborateurs, weight_pairs, weight_n1
  into v_weight_auto, v_weight_collaborateurs, v_weight_pairs, v_weight_n1
  from public.app_settings where id = 1;

  return query
  with answers as (
    select
      pc.id as crit_id,
      pc.name as crit_name,
      pc.display_order as crit_order,
      a.source,
      ea.rating
    from public.evaluation_assignments a
    join public.evaluations e on e.assignment_id = a.id and e.status in ('soumise', 'validee')
    join public.evaluation_answers ea on ea.evaluation_id = e.id and ea.rating is not null
    join public.position_criteria pc on pc.id = ea.criterion_id
    where a.campaign_id = p_campaign_id and a.evaluatee_id = p_employee_id
  ),
  agg as (
    select
      crit_id,
      crit_name,
      crit_order,
      avg(rating) filter (where source = 'auto') as agg_avg_auto,
      avg(rating) filter (where source = 'collaborateurs') as agg_avg_collaborateurs,
      avg(rating) filter (where source = 'pairs') as agg_avg_pairs,
      avg(rating) filter (where source = 'n_plus_1') as agg_avg_n_plus_1
    from answers
    group by crit_id, crit_name, crit_order
  )
  select
    agg.crit_id,
    agg.crit_name,
    round(agg.agg_avg_auto, 2),
    round(agg.agg_avg_collaborateurs, 2),
    round(agg.agg_avg_pairs, 2),
    round(agg.agg_avg_n_plus_1, 2),
    round(
      (
        coalesce(agg.agg_avg_auto, 0) * v_weight_auto
        + coalesce(agg.agg_avg_collaborateurs, 0) * v_weight_collaborateurs
        + coalesce(agg.agg_avg_pairs, 0) * v_weight_pairs
        + coalesce(agg.agg_avg_n_plus_1, 0) * v_weight_n1
      )
      / nullif(
        (case when agg.agg_avg_auto is not null then v_weight_auto else 0 end)
        + (case when agg.agg_avg_collaborateurs is not null then v_weight_collaborateurs else 0 end)
        + (case when agg.agg_avg_pairs is not null then v_weight_pairs else 0 end)
        + (case when agg.agg_avg_n_plus_1 is not null then v_weight_n1 else 0 end),
        0
      ),
      2
    ) as weighted_score
  from agg
  order by agg.crit_order;
end;
$$;

-- Autoriser tout utilisateur authentifié à appeler la fonction : le contrôle
-- d'accès réel est fait à l'intérieur (RAISE EXCEPTION si non autorisé).
grant execute on function public.get_employee_criterion_scores(uuid, uuid) to authenticated;
