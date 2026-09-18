-- ============================================================================
-- Migration 0005 : le N+1 doit pouvoir créer/suivre les plans d'action et
-- entretiens de son équipe (pas seulement les consulter), et chacun doit
-- pouvoir créer son propre plan de développement. Jusqu'ici, seule la DRH
-- avait des droits d'écriture (policies "for all").
-- ============================================================================

-- Plans d'action : le N+1 et l'employé lui-même peuvent créer/modifier
create policy "plans_action_n1_ecriture" on public.action_plans for insert
  with check (
    employee_id in (
      select id from public.employees where manager_employee_id = public.current_employee_id()
    )
  );
create policy "plans_action_soi_meme_ecriture" on public.action_plans for insert
  with check (employee_id = public.current_employee_id());

-- Actions : idem, via le plan parent
create policy "actions_ecriture" on public.action_items for insert
  with check (
    action_plan_id in (
      select id from public.action_plans
      where employee_id = public.current_employee_id()
         or employee_id in (
              select id from public.employees where manager_employee_id = public.current_employee_id()
            )
    )
  );
create policy "actions_maj" on public.action_items for update
  using (
    action_plan_id in (
      select id from public.action_plans
      where employee_id = public.current_employee_id()
         or employee_id in (
              select id from public.employees where manager_employee_id = public.current_employee_id()
            )
    )
  );

-- Entretiens : le N+1 crée/modifie ceux de son équipe ; l'employé peut
-- compléter son propre commentaire sur son entretien.
create policy "entretiens_n1_ecriture" on public.evaluation_interviews for insert
  with check (
    employee_id in (
      select id from public.employees where manager_employee_id = public.current_employee_id()
    )
  );
create policy "entretiens_n1_maj" on public.evaluation_interviews for update
  using (
    employee_id in (
      select id from public.employees where manager_employee_id = public.current_employee_id()
    )
  );
create policy "entretiens_soi_meme_maj" on public.evaluation_interviews for update
  using (employee_id = public.current_employee_id());
