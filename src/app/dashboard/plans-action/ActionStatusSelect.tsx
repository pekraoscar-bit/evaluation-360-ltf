"use client";

import { useTransition } from "react";
import { setActionItemStatus } from "./actions";
import type { ActionStatusType } from "@/types/database";

const LABELS: Record<ActionStatusType, string> = {
  a_faire: "À faire",
  en_cours: "En cours",
  realise: "Réalisé",
  reporte: "Reporté",
  abandonne: "Abandonné",
};

const COLORS: Record<ActionStatusType, string> = {
  a_faire: "bg-foreground/5 text-foreground/50",
  en_cours: "bg-brand-warning/10 text-brand-warning",
  realise: "bg-brand-accent/10 text-brand-accent",
  reporte: "bg-foreground/10 text-foreground/60",
  abandonne: "bg-brand-danger/10 text-brand-danger",
};

export function ActionStatusSelect({
  itemId,
  status,
  employeeId,
}: {
  itemId: string;
  status: ActionStatusType;
  employeeId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) =>
        startTransition(() =>
          setActionItemStatus(itemId, e.target.value as ActionStatusType, employeeId)
        )
      }
      className={`rounded-full px-2.5 py-1 text-xs font-medium border-0 cursor-pointer disabled:opacity-50 ${COLORS[status]}`}
    >
      {(Object.keys(LABELS) as ActionStatusType[]).map((s) => (
        <option key={s} value={s}>
          {LABELS[s]}
        </option>
      ))}
    </select>
  );
}
