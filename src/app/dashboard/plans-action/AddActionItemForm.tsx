"use client";

import { useRef, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { addActionItem } from "./actions";

export function AddActionItemForm({ employeeId }: { employeeId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      await addActionItem(formData);
      formRef.current?.reset();
    });
  }

  return (
    <form ref={formRef} action={submit} className="space-y-3">
      <input type="hidden" name="employee_id" value={employeeId} />
      <div className="grid sm:grid-cols-2 gap-3">
        <Input name="axe" placeholder="Axe d'amélioration" required />
        <Input name="objectif" placeholder="Objectif" />
      </div>
      <Input name="action" placeholder="Action à mener" />
      <div className="grid sm:grid-cols-3 gap-3">
        <Input name="date_debut" type="date" />
        <Input name="date_cible" type="date" />
        <select
          name="priorite"
          className="rounded-lg border border-brand-border bg-brand-surface px-3 py-2.5 text-sm"
          defaultValue=""
        >
          <option value="">Priorité</option>
          <option value="basse">Basse</option>
          <option value="moyenne">Moyenne</option>
          <option value="haute">Haute</option>
        </select>
      </div>
      <Button type="submit" variant="secondary" disabled={pending}>
        {pending ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
        Ajouter au plan d&apos;action
      </Button>
    </form>
  );
}
