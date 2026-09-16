"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";

function path(campaignId: string) {
  return `/dashboard/attributions?campagne=${campaignId}`;
}

/**
 * Génère automatiquement les attributions déterministes d'une campagne :
 * - auto : chaque employé actif s'auto-évalue
 * - n_plus_1 : le manager direct évalue son subordonné (si renseigné)
 * - collaborateurs : chaque subordonné direct évalue son manager
 *
 * Les évaluations "pairs" restent manuelles (aucune règle fiable pour les
 * déterminer automatiquement à partir des données disponibles).
 * Les doublons (déjà attribués) sont silencieusement ignorés grâce à la
 * contrainte unique en base.
 */
export async function generateAutomaticAssignments(campaignId: string) {
  const { supabase } = await requireRole(["drh"]);

  const { data: employees } = await supabase
    .from("employees")
    .select("id, manager_employee_id, active")
    .eq("active", true);

  if (!employees) return;

  const rows: {
    campaign_id: string;
    evaluatee_id: string;
    evaluator_id: string;
    source: "auto" | "n_plus_1" | "collaborateurs";
  }[] = [];

  for (const emp of employees) {
    // Auto-évaluation
    rows.push({
      campaign_id: campaignId,
      evaluatee_id: emp.id,
      evaluator_id: emp.id,
      source: "auto",
    });

    // N+1 évalue son subordonné
    if (emp.manager_employee_id) {
      rows.push({
        campaign_id: campaignId,
        evaluatee_id: emp.id,
        evaluator_id: emp.manager_employee_id,
        source: "n_plus_1",
      });

      // Ce même employé, en tant que subordonné, évalue son manager
      rows.push({
        campaign_id: campaignId,
        evaluatee_id: emp.manager_employee_id,
        evaluator_id: emp.id,
        source: "collaborateurs",
      });
    }
  }

  // Insertion tolérante aux doublons : on ignore les conflits un par un
  // (upsert avec onConflict sur la contrainte unique existante).
  await supabase
    .from("evaluation_assignments")
    .upsert(rows, {
      onConflict: "campaign_id,evaluatee_id,evaluator_id,source",
      ignoreDuplicates: true,
    });

  revalidatePath(path(campaignId));
}

export async function addPairAssignment(formData: FormData) {
  const { supabase } = await requireRole(["drh"]);

  const campaignId = String(formData.get("campaign_id") ?? "");
  const evaluateeId = String(formData.get("evaluatee_id") ?? "");
  const evaluatorId = String(formData.get("evaluator_id") ?? "");

  if (!campaignId || !evaluateeId || !evaluatorId || evaluateeId === evaluatorId) return;

  await supabase.from("evaluation_assignments").insert({
    campaign_id: campaignId,
    evaluatee_id: evaluateeId,
    evaluator_id: evaluatorId,
    source: "pairs",
  });

  revalidatePath(path(campaignId));
}

export async function removeAssignment(assignmentId: string, campaignId: string) {
  const { supabase } = await requireRole(["drh"]);
  await supabase.from("evaluation_assignments").delete().eq("id", assignmentId);
  revalidatePath(path(campaignId));
}
