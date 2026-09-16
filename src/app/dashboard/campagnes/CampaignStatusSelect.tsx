"use client";

import { useTransition } from "react";
import { setCampaignStatus } from "./actions";
import type { CampaignStatusType } from "@/types/database";

const STATUS_LABELS: Record<CampaignStatusType, string> = {
  planifiee: "Planifiée",
  ouverte: "Ouverte",
  cloturee: "Clôturée",
  prolongee: "Prolongée",
};

const STATUS_COLORS: Record<CampaignStatusType, string> = {
  planifiee: "bg-foreground/5 text-foreground/50",
  ouverte: "bg-brand-accent/10 text-brand-accent",
  cloturee: "bg-foreground/10 text-foreground/60",
  prolongee: "bg-brand-warning/10 text-brand-warning",
};

export function CampaignStatusSelect({
  campaignId,
  status,
}: {
  campaignId: string;
  status: CampaignStatusType;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(() =>
          setCampaignStatus(campaignId, e.target.value as CampaignStatusType)
        )
      }
      className={`rounded-full px-2.5 py-1 text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${STATUS_COLORS[status]}`}
    >
      {(Object.keys(STATUS_LABELS) as CampaignStatusType[]).map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
