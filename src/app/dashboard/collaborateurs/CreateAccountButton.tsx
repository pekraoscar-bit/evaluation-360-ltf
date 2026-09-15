"use client";

import { useState, useTransition } from "react";
import { KeyRound, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { createEmployeeAccount } from "./actions";
import type { UserRole } from "@/types/database";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "collaborateur", label: "Collaborateur" },
  { value: "n1", label: "N+1 / Responsable hiérarchique" },
  { value: "drh", label: "Admin / DRH" },
];

export function CreateAccountButton({
  employeeId,
  suggestedEmail,
}: {
  employeeId: string;
  suggestedEmail: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState(suggestedEmail);
  const [role, setRole] = useState<UserRole>("collaborateur");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ email: string; password: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  function submit() {
    setError(null);
    startTransition(async () => {
      const res = await createEmployeeAccount(employeeId, email, role);
      if (res.ok) {
        setResult({ email: res.email, password: res.temporaryPassword });
      } else {
        setError(res.error);
      }
    });
  }

  if (result) {
    return (
      <div className="text-xs bg-brand-accent/10 border border-brand-accent/30 rounded-lg p-3 space-y-1.5 max-w-xs">
        <p className="font-medium text-foreground">Compte créé — à transmettre une seule fois :</p>
        <p>
          E-mail : <span className="font-mono">{result.email}</span>
        </p>
        <div className="flex items-center gap-1.5">
          <span>
            Mot de passe temporaire : <span className="font-mono">{result.password}</span>
          </span>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(result.password);
              setCopied(true);
            }}
            className="text-foreground/50 hover:text-foreground"
            title="Copier"
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
          </button>
        </div>
        <p className="text-foreground/50">
          Ce mot de passe ne sera plus jamais affiché — transmettez-le au collaborateur maintenant.
        </p>
      </div>
    );
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)} className="text-xs px-2.5 py-1.5">
        <KeyRound size={13} />
        Créer un compte
      </Button>
    );
  }

  return (
    <div className="space-y-2 max-w-xs">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="e-mail du collaborateur"
        className="text-xs py-1.5"
      />
      <select
        value={role}
        onChange={(e) => setRole(e.target.value as UserRole)}
        className="w-full rounded-lg border border-brand-border bg-brand-surface px-2.5 py-1.5 text-xs"
      >
        {ROLE_OPTIONS.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-brand-danger">{error}</p>}
      <div className="flex gap-1.5">
        <Button onClick={submit} disabled={pending} className="text-xs px-2.5 py-1.5">
          {pending && <Loader2 size={13} className="animate-spin" />}
          Confirmer
        </Button>
        <Button
          variant="ghost"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="text-xs px-2.5 py-1.5"
        >
          Annuler
        </Button>
      </div>
    </div>
  );
}
