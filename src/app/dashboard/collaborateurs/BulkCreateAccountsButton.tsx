"use client";

import { useState, useTransition } from "react";
import { Loader2, Users2, Download, Check, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { createAllMissingAccounts, type BulkCreateResultRow } from "./actions";

export function BulkCreateAccountsButton() {
  const [results, setResults] = useState<BulkCreateResultRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setError(null);
    startTransition(async () => {
      try {
        const res = await createAllMissingAccounts();
        setResults(res);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Erreur inattendue.");
      }
    });
  }

  function downloadCsv() {
    if (!results) return;
    const ok = results.filter((r): r is Extract<BulkCreateResultRow, { ok: true }> => r.ok);
    const header = "matricule;nom;email;mot_de_passe_temporaire\n";
    const body = ok
      .map((r) => `${r.matricule};${r.fullName};${r.email};${r.temporaryPassword}`)
      .join("\n");
    const blob = new Blob([header + body], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "identifiants-collaborateurs.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (results) {
    const okCount = results.filter((r) => r.ok).length;
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm text-foreground/70">
            {okCount} compte(s) créé(s) sur {results.length}.
          </p>
          <Button variant="secondary" onClick={downloadCsv} className="text-xs px-2.5 py-1.5">
            <Download size={13} />
            Télécharger la liste (CSV)
          </Button>
        </div>
        <div className="max-h-64 overflow-y-auto border border-brand-border rounded-lg divide-y divide-brand-border">
          {results.map((r) => (
            <div key={r.employeeId} className="px-3 py-2 text-xs flex items-center gap-2">
              {r.ok ? (
                <Check size={13} className="text-brand-accent shrink-0" />
              ) : (
                <X size={13} className="text-brand-danger shrink-0" />
              )}
              <span className="font-medium">{r.fullName}</span>
              {r.ok ? (
                <span className="font-mono text-foreground/60">
                  {r.email} · {r.temporaryPassword}
                </span>
              ) : (
                <span className="text-brand-danger">{r.error}</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-foreground/50">
          Ces mots de passe ne seront plus jamais affichés — téléchargez la
          liste maintenant pour les transmettre à chacun.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button variant="secondary" onClick={run} disabled={pending}>
        {pending ? <Loader2 size={16} className="animate-spin" /> : <Users2 size={16} />}
        Créer tous les comptes manquants
      </Button>
      <p className="text-xs text-foreground/50">
        Génère un compte pour chaque collaborateur actif qui n&apos;en a pas
        encore (e-mail basé sur le matricule, rôle N+1/collaborateur déduit
        automatiquement de l&apos;organigramme — modifiable ensuite au cas par cas).
      </p>
      {error && <p className="text-xs text-brand-danger">{error}</p>}
    </div>
  );
}
