"use client";

import { useTransition } from "react";
import { Loader2, X } from "lucide-react";
import { removeAssignment } from "./actions";

export function RemoveAssignmentButton({
  assignmentId,
  campaignId,
}: {
  assignmentId: string;
  campaignId: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => removeAssignment(assignmentId, campaignId))}
      className="text-foreground/30 hover:text-brand-danger disabled:opacity-50"
      title="Retirer cette attribution"
    >
      {pending ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />}
    </button>
  );
}
