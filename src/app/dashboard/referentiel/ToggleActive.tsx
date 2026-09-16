"use client";

import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { setPositionActive, setCriterionActive } from "./actions";

export function ToggleActive({
  id,
  active,
  kind,
}: {
  id: string;
  active: boolean;
  kind: "position" | "criterion";
}) {
  const [pending, startTransition] = useTransition();
  const action = kind === "position" ? setPositionActive : setCriterionActive;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => action(id, !active))}
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50 ${
        active
          ? "bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20"
          : "bg-foreground/5 text-foreground/40 hover:bg-foreground/10"
      }`}
    >
      {pending && <Loader2 size={11} className="animate-spin" />}
      {active ? "Actif" : "Inactif"}
    </button>
  );
}
