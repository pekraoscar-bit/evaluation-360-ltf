import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { GenerateAssignmentsButton } from "./GenerateAssignmentsButton";
import { AddPairForm } from "./AddPairForm";
import { RemoveAssignmentButton } from "./RemoveAssignmentButton";

const SOURCE_LABELS: Record<string, string> = {
  auto: "Auto-évaluation",
  collaborateurs: "Collaborateur",
  pairs: "Pair",
  n_plus_1: "N+1",
};

export default async function AttributionsPage({
  searchParams,
}: {
  searchParams: Promise<{ campagne?: string }>;
}) {
  const { supabase } = await requireRole(["drh"]);
  const { campagne: campaignId } = await searchParams;

  const { data: campaigns } = await supabase
    .from("evaluation_campaigns")
    .select("id, name")
    .order("year", { ascending: false })
    .order("period");

  if (!campaignId) {
    return (
      <div className="min-h-full flex flex-col">
        <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-semibold text-foreground">Attributions</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="p-5 space-y-3">
            <p className="text-sm text-foreground/60">Choisissez une campagne :</p>
            {(campaigns ?? []).length === 0 && (
              <p className="text-sm text-foreground/40">
                Aucune campagne n&apos;existe encore —{" "}
                <Link href="/dashboard/campagnes" className="text-brand-primary underline">
                  créez-en une d&apos;abord
                </Link>
                .
              </p>
            )}
            <ul className="space-y-1.5">
              {(campaigns ?? []).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/attributions?campagne=${c.id}`}
                    className="block px-3 py-2 rounded-lg bg-foreground/5 text-sm text-foreground/80 hover:bg-foreground/10"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </Card>
        </main>
      </div>
    );
  }

  const [{ data: campaign }, { data: employees }, { data: assignments }] = await Promise.all([
    supabase.from("evaluation_campaigns").select("id, name").eq("id", campaignId).maybeSingle(),
    supabase.from("employees").select("id, full_name").eq("active", true).order("full_name"),
    supabase
      .from("evaluation_assignments")
      .select("id, evaluatee_id, evaluator_id, source")
      .eq("campaign_id", campaignId),
  ]);

  const nameById = new Map((employees ?? []).map((e) => [e.id, e.full_name]));

  const sorted = [...(assignments ?? [])].sort((a, b) => {
    const an = nameById.get(a.evaluatee_id) ?? "";
    const bn = nameById.get(b.evaluatee_id) ?? "";
    return an.localeCompare(bn) || a.source.localeCompare(b.source);
  });

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard/attributions" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-semibold text-foreground">
          Attributions — <span className="text-foreground/60">{campaign?.name}</span>
        </h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <Card className="p-5 space-y-4">
          <GenerateAssignmentsButton campaignId={campaignId} />
          <p className="text-xs text-foreground/50">
            Génère automatiquement, pour chaque collaborateur actif : son
            auto-évaluation, l&apos;évaluation par son N+1 (si renseigné), et
            l&apos;évaluation par ses subordonnés directs. Les évaluations entre
            pairs restent à ajouter manuellement ci-dessous.
          </p>
          <div className="border-t border-brand-border pt-4">
            <AddPairForm campaignId={campaignId} employees={employees ?? []} />
          </div>
        </Card>

        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-foreground/50">
                <th className="px-4 py-3 font-medium">Évalué</th>
                <th className="px-4 py-3 font-medium">Évaluateur</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium w-10" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((a) => (
                <tr key={a.id} className="border-b border-brand-border last:border-0">
                  <td className="px-4 py-3 text-foreground">{nameById.get(a.evaluatee_id) ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground/70">{nameById.get(a.evaluator_id) ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground/70">{SOURCE_LABELS[a.source]}</td>
                  <td className="px-4 py-3">
                    <RemoveAssignmentButton assignmentId={a.id} campaignId={campaignId} />
                  </td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-foreground/40">
                    Aucune attribution pour l&apos;instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}
