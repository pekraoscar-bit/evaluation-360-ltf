"use client";

import { useRef, useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createCampaign } from "./actions";
import type { CampaignPeriod } from "@/types/database";

const PERIODS: { value: CampaignPeriod; label: string }[] = [
  { value: "avril", label: "Avril" },
  { value: "juillet", label: "Juillet" },
  { value: "octobre", label: "Octobre" },
  { value: "janvier", label: "Janvier (bilan annuel)" },
];

export function CampaignForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await createCampaign(formData);
      if (res.ok) {
        formRef.current?.reset();
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <form ref={formRef} action={submit} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/60">Année</label>
        <Input name="year" type="number" defaultValue={new Date().getFullYear()} required className="w-24" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/60">Période</label>
        <select
          name="period"
          required
          className="rounded-lg border border-brand-border bg-brand-surface px-3 py-2.5 text-sm"
        >
          {PERIODS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/60">Date de début</label>
        <Input name="start_date" type="date" />
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/60">Date de fin</label>
        <Input name="end_date" type="date" />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
        Créer la campagne
      </Button>
      {error && <p className="text-sm text-brand-danger w-full">{error}</p>}
    </form>
  );
}
