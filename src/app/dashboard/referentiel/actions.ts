"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";

const PATH = "/dashboard/referentiel";

export async function createSite(formData: FormData) {
  const { supabase } = await requireRole(["drh"]);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("sites").insert({ name });
  revalidatePath(PATH);
}

export async function createPosition(formData: FormData) {
  const { supabase } = await requireRole(["drh"]);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;
  await supabase.from("positions").insert({ name, active: true });
  revalidatePath(PATH);
}

export async function setPositionActive(positionId: string, active: boolean) {
  const { supabase } = await requireRole(["drh"]);
  await supabase.from("positions").update({ active }).eq("id", positionId);
  revalidatePath(PATH);
}

export async function createCriterion(formData: FormData) {
  const { supabase } = await requireRole(["drh"]);
  const positionId = String(formData.get("position_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!positionId || !name) return;

  const { count } = await supabase
    .from("position_criteria")
    .select("id", { count: "exact", head: true })
    .eq("position_id", positionId);

  await supabase.from("position_criteria").insert({
    position_id: positionId,
    name,
    display_order: (count ?? 0) + 1,
  });
  revalidatePath(PATH);
}

export async function setCriterionActive(criterionId: string, active: boolean) {
  const { supabase } = await requireRole(["drh"]);
  await supabase.from("position_criteria").update({ active }).eq("id", criterionId);
  revalidatePath(PATH);
}
