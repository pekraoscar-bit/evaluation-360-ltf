-- ============================================================================
-- Migration 0004 : vue d'ensemble DRH d'une campagne (scores agrégés de tous
-- les évalués, jamais l'identité des évaluateurs individuels).
-- ============================================================================

create or replace function public.get_campaign_scores(p_campaign_id uuid)
returns table (
  evaluatee_id uuid,
  overall_score numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_drh() then
    raise exception 'Accès non autorisé à ces résultats';
  end if;

  return query
  with answered as (
    select
      a.evaluatee_id as ev_id,
      aa.criterion_id as crit_id,
      a.source,
      aa.rating
    from public.evaluation_answers aa
    join public.evaluations e on e.id = aa.evaluation_id
    join public.evaluation_assignments a on a.id = e.assignment_id
    where a.campaign_id = p_campaign_id
      and e.status in ('soumise', 'validee')
      and aa.rating is not null
  ),
  agg as (
    select
      ev_id,
      crit_id,
      avg(rating) filter (where source = 'auto') as score_auto,
      avg(rating) filter (where source = 'n_plus_1') as score_n1,
      avg(rating) filter (where source = 'collaborateurs') as score_collaborateurs,
      avg(rating) filter (where source = 'pairs') as score_pairs
    from answered
    group by ev_id, crit_id
  ),
  s as (select * from public.app_settings where id = 1),
  weighted as (
    select
      agg.ev_id,
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
    from agg
    cross join s
  )
  select ev_id as evaluatee_id, avg(weighted_score) as overall_score
  from weighted
  where weighted_score is not null
  group by ev_id;
end;
$$;

grant execute on function public.get_campaign_scores(uuid) to authenticated;
