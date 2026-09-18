"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-role";

function path(employeeId: string, campaignId: string) {
  return `/dashboard/entretiens?employe=${employeeId}&campagne=${campaignId}`;
}

async function ensureInterview(employeeId: string, campaignId: string) {
  const { supabase } = await requireAuth();

  const { data: existing } = await supabase
    .from("evaluation_interviews")
    .select("id")
    .eq("employee_id", employeeId)
    .eq("campaign_id", campaignId)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("evaluation_interviews")
    .insert({ employee_id: employeeId, campaign_id: campaignId })
    .select("id")
    .single();

  if (error || !created) return null;
  return created.id;
}

export async function saveInterview(formData: FormData) {
  const { supabase } = await requireAuth();

  const employeeId = String(formData.get("employee_id") ?? "");
  const campaignId = String(formData.get("campaign_id") ?? "");
  if (!employeeId || !campaignId) return;

  const id = await ensureInterview(employeeId, campaignId);
  if (!id) return;

  await supabase
    .from("evaluation_interviews")
    .update({
      interview_date: String(formData.get("interview_date") ?? "") || null,
      points_forts: String(formData.get("points_forts") ?? "").trim() || null,
      difficultes: String(formData.get("difficultes") ?? "").trim() || null,
      axes_amelioration: String(formData.get("axes_amelioration") ?? "").trim() || null,
      objectifs: String(formData.get("objectifs") ?? "").trim() || null,
      actions_decidees: String(formData.get("actions_decidees") ?? "").trim() || null,
      commentaire_n1: String(formData.get("commentaire_n1") ?? "").trim() || null,
    })
    .eq("id", id);

  revalidatePath(path(employeeId, campaignId));
}

export async function saveOwnComment(formData: FormData) {
  const { supabase } = await requireAuth();

  const employeeId = String(formData.get("employee_id") ?? "");
  const campaignId = String(formData.get("campaign_id") ?? "");
  if (!employeeId || !campaignId) return;

  const id = await ensureInterview(employeeId, campaignId);
  if (!id) return;

  await supabase
    .from("evaluation_interviews")
    .update({
      commentaire_collaborateur: String(formData.get("commentaire_collaborateur") ?? "").trim() || null,
    })
    .eq("id", id);

  revalidatePath(path(employeeId, campaignId));
}

export async function markInterviewDone(
  interviewId: string,
  done: boolean,
  employeeId: string,
  campaignId: string
) {
  const { supabase } = await requireAuth();
  await supabase.from("evaluation_interviews").update({ done }).eq("id", interviewId);
  revalidatePath(path(employeeId, campaignId));
}
