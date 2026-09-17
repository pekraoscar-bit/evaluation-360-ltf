-- ============================================================================
-- Migration 0003 : calcul des scores (agrégés, jamais l'identité des
-- évaluateurs individuels), pondération et seuils lus depuis app_settings.
--
-- Fonction SECURITY DEFINER : nécessaire pour lire evaluation_answers au-delà
-- des policies RLS habituelles (réservées à l'évaluateur + la DRH), tout en
-- ne renvoyant QUE des moyennes agrégées — jamais une ligne individuelle.
-- L'autorisation est vérifiée explicitement à l'intérieur de la fonction.
-- ============================================================================

create or replace function public.get_evaluatee_scores(
  p_campaign_id uuid,
  p_evaluatee_id uuid
)
returns table (
  criterion_id uuid,
  criterion_name text,
  display_order int,
  score_auto numeric,
  score_n1 numeric,
  score_collaborateurs numeric,
  score_pairs numeric,
  weighted_score numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (
    public.current_employee_id() = p_evaluatee_id
    or public.is_drh()
  ) then
    raise exception 'Accès non autorisé à ces résultats';
  end if;

  return query
  with answered as (
    select
      aa.criterion_id,
      a.source,
      aa.rating
    from public.evaluation_answers aa
    join public.evaluations e on e.id = aa.evaluation_id
    join public.evaluation_assignments a on a.id = e.assignment_id
    where a.campaign_id = p_campaign_id
      and a.evaluatee_id = p_evaluatee_id
      and e.status in ('soumise', 'validee')
      and aa.rating is not null
  ),
  agg as (
    select
      answered.criterion_id as crit_id,
      avg(rating) filter (where source = 'auto') as score_auto,
      avg(rating) filter (where source = 'n_plus_1') as score_n1,
      avg(rating) filter (where source = 'collaborateurs') as score_collaborateurs,
      avg(rating) filter (where source = 'pairs') as score_pairs
    from answered
    group by answered.criterion_id
  ),
  s as (select * from public.app_settings where id = 1)
  select
    pc.id as criterion_id,
    pc.name as criterion_name,
    pc.display_order,
    agg.score_auto,
    agg.score_n1,
    agg.score_collaborateurs,
    agg.score_pairs,
    (
      coalesce(agg.score_collaborateurs * s.weight_collaborateurs, 0)
      + coalesce(agg.score_n1 * s.weight_n1, 0)
      + coalesce(agg.score_pairs * s.weight_pairs, 0)
      + coalesce(agg.score_auto * s.weight_auto, 0)
    ) / nullif(
        (case when agg.score_collaborateurs is not null then s.weight_collaborateurs else 0 end)
      + (case when agg.score_n1 is not null then s.weight_n1 else 0 end)
      + (case when agg.score_pairs is not null then s.weight_pairs else 0 end)
      + (case when agg.score_auto is not null then s.weight_auto else 0 end)
    , 0) as weighted_score
  from public.position_criteria pc
  join agg on agg.crit_id = pc.id
  cross join s
  order by pc.display_order;
end;
$$;

grant execute on function public.get_evaluatee_scores(uuid, uuid) to authenticated;
