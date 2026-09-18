"use client";

import { useTransition } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { markInterviewDone } from "./actions";

export function DoneToggle({
  interviewId,
  done,
  employeeId,
  campaignId,
}: {
  interviewId: string;
  done: boolean;
  employeeId: string;
  campaignId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant={done ? "primary" : "secondary"}
      disabled={pending}
      onClick={() => startTransition(() => markInterviewDone(interviewId, !done, employeeId, campaignId))}
    >
      {pending ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
      {done ? "Entretien réalisé" : "Marquer comme réalisé"}
    </Button>
  );
}
