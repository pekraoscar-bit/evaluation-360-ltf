"use client";

import { useRef, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { addPairAssignment } from "./actions";

export function AddPairForm({
  campaignId,
  employees,
}: {
  campaignId: string;
  employees: { id: string; full_name: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      await addPairAssignment(formData);
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={submit} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="campaign_id" value={campaignId} />
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/60">Évalué</label>
        <select
          name="evaluatee_id"
          required
          className="rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm min-w-48"
        >
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.full_name}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <label className="text-xs font-medium text-foreground/60">Évaluateur (pair)</label>
        <select
          name="evaluator_id"
          required
          className="rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm min-w-48"
        >
          {employees.map((e) => (
            <option key={e.id} value={e.id}>
              {e.full_name}
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
        Ajouter
      </Button>
    </form>
  );
}
