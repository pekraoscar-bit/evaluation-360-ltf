"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-role";

/**
 * Récupère (en la créant si besoin) la ligne `evaluations` correspondant à
 * cette attribution. La RLS garantit que seul l'évaluateur concerné (ou la
 * DRH) peut le faire.
 */
async function ensureEvaluation(assignmentId: string) {
  const { supabase } = await requireAuth();

  const { data: existing } = await supabase
    .from("evaluations")
    .select("id, status")
    .eq("assignment_id", assignmentId)
    .maybeSingle();

  if (existing) return existing;

  const { data: created, error } = await supabase
    .from("evaluations")
    .insert({ assignment_id: assignmentId, status: "en_cours" })
    .select("id, status")
    .single();

  if (error || !created) return null;
  return created;
}

export async function saveAnswer(
  assignmentId: string,
  criterionId: string,
  rating: number | null,
  comment: string
) {
  const { supabase } = await requireAuth();
  const evaluation = await ensureEvaluation(assignmentId);
  if (!evaluation) return { ok: false as const };

  if (evaluation.status === "non_commencee") {
    await supabase.from("evaluations").update({ status: "en_cours" }).eq("id", evaluation.id);
  }

  await supabase.from("evaluation_answers").upsert(
    {
      evaluation_id: evaluation.id,
      criterion_id: criterionId,
      rating,
      comment: comment || null,
    },
    { onConflict: "evaluation_id,criterion_id" }
  );

  return { ok: true as const };
}

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitEvaluation(
  assignmentId: string,
  requiredCriterionIds: string[]
): Promise<SubmitResult> {
  const { supabase } = await requireAuth();
  const evaluation = await ensureEvaluation(assignmentId);
  if (!evaluation) return { ok: false, error: "Évaluation introuvable." };

  const { data: answers } = await supabase
    .from("evaluation_answers")
    .select("criterion_id, rating")
    .eq("evaluation_id", evaluation.id);

  const ratedIds = new Set((answers ?? []).filter((a) => a.rating != null).map((a) => a.criterion_id));
  const missing = requiredCriterionIds.filter((id) => !ratedIds.has(id));

  if (missing.length > 0) {
    return { ok: false, error: `${missing.length} critère(s) non noté(s).` };
  }

  await supabase
    .from("evaluations")
    .update({ status: "soumise", submitted_at: new Date().toISOString() })
    .eq("id", evaluation.id);

  revalidatePath(`/dashboard/mes-evaluations/${assignmentId}`);
  revalidatePath("/dashboard/mes-evaluations");
  return { ok: true };
}
