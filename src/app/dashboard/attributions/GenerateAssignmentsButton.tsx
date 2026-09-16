"use client";

import { useTransition } from "react";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { generateAutomaticAssignments } from "./actions";

export function GenerateAssignmentsButton({ campaignId }: { campaignId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="secondary"
      disabled={pending}
      onClick={() => startTransition(() => generateAutomaticAssignments(campaignId))}
    >
      {pending ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
      Générer auto-évaluations + N+1 + collaborateurs
    </Button>
  );
}
