"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import type { CampaignPeriod, CampaignStatusType } from "@/types/database";

const PATH = "/dashboard/campagnes";

const PERIOD_TO_MONTH: Record<CampaignPeriod, string> = {
  avril: "04",
  juillet: "07",
  octobre: "10",
  janvier: "01",
};

export type CreateCampaignResult = { ok: true } | { ok: false; error: string };

export async function createCampaign(formData: FormData): Promise<CreateCampaignResult> {
  const { supabase } = await requireRole(["drh"]);

  const year = Number(formData.get("year"));
  const period = String(formData.get("period") ?? "") as CampaignPeriod;
  const startDate = String(formData.get("start_date") ?? "") || null;
  const endDate = String(formData.get("end_date") ?? "") || null;

  if (!year || !PERIOD_TO_MONTH[period]) {
    return { ok: false, error: "Année ou période invalide." };
  }

  const name = `Évaluation ${period.charAt(0).toUpperCase() + period.slice(1)} ${year}`;

  const { error } = await supabase.from("evaluation_campaigns").insert({
    name,
    year,
    period,
    start_date: startDate,
    end_date: endDate,
    status: "planifiee",
  });

  if (error) {
    return {
      ok: false,
      error: error.code === "23505" ? "Cette campagne existe déjà pour cette période." : error.message,
    };
  }

  revalidatePath(PATH);
  return { ok: true };
}

export async function setCampaignStatus(campaignId: string, status: CampaignStatusType) {
  const { supabase } = await requireRole(["drh"]);
  await supabase.from("evaluation_campaigns").update({ status }).eq("id", campaignId);
  revalidatePath(PATH);
}
