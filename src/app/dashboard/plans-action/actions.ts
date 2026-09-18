"use server";

import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-role";
import type { ActionStatusType } from "@/types/database";

function path(employeeId: string) {
  return `/dashboard/plans-action?employe=${employeeId}`;
}

async function ensurePlan(employeeId: string) {
  const { supabase } = await requireAuth();

  const { data: existing } = await supabase
    .from("action_plans")
    .select("id")
    .eq("employee_id", employeeId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: created, error } = await supabase
    .from("action_plans")
    .insert({ employee_id: employeeId })
    .select("id")
    .single();

  if (error || !created) return null;
  return created.id;
}

export async function addActionItem(formData: FormData) {
  const { supabase } = await requireAuth();

  const employeeId = String(formData.get("employee_id") ?? "");
  const axe = String(formData.get("axe") ?? "").trim();
  const objectif = String(formData.get("objectif") ?? "").trim() || null;
  const action = String(formData.get("action") ?? "").trim() || null;
  const dateDebut = String(formData.get("date_debut") ?? "") || null;
  const dateCible = String(formData.get("date_cible") ?? "") || null;
  const priorite = String(formData.get("priorite") ?? "") || null;

  if (!employeeId || !axe) return;

  const planId = await ensurePlan(employeeId);
  if (!planId) return;

  await supabase.from("action_items").insert({
    action_plan_id: planId,
    axe,
    objectif,
    action,
    date_debut: dateDebut,
    date_cible: dateCible,
    priorite,
    status: "a_faire",
  });

  revalidatePath(path(employeeId));
}

export async function setActionItemStatus(
  itemId: string,
  status: ActionStatusType,
  employeeId: string
) {
  const { supabase } = await requireAuth();
  await supabase.from("action_items").update({ status }).eq("id", itemId);
  revalidatePath(path(employeeId));
}
