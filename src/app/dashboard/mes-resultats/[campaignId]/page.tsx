import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { getAppreciation } from "@/lib/scores/appreciation";

export default async function ResultatsDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>;
}) {
  const { campaignId } = await params;
  const { supabase, profile } = await requireAuth();

  if (!profile?.employee_id) {
    return <p className="p-6 text-sm text-foreground/60">Aucune fiche collaborateur associée.</p>;
  }

  const [{ data: campaign }, { data: rows, error }, { data: settings }] = await Promise.all([
    supabase.from("evaluation_campaigns").select("name").eq("id", campaignId).maybeSingle(),
    supabase.rpc("get_evaluatee_scores", {
      p_campaign_id: campaignId,
      p_evaluatee_id: profile.employee_id,
    }),
    supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
  ]);

  const criteria = rows ?? [];
  const validScores = criteria.map((r) => r.weighted_score).filter((s): s is number => s != null);
  const overall = validScores.length
    ? validScores.reduce((sum, s) => sum + s, 0) / validScores.length
    : null;

  const appreciation = overall != null && settings ? getAppreciation(overall, settings) : null;

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard/mes-resultats" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-semibold text-foreground text-sm">{campaign?.name}</h1>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">
        {error && (
          <Card className="p-5 text-sm text-brand-danger">
            Impossible de récupérer vos résultats pour l&apos;instant.
          </Card>
        )}

        {!error && overall == null && (
          <Card className="p-5 text-sm text-foreground/50">
            Aucun résultat validé pour cette campagne pour l&apos;instant — les
            évaluations doivent être soumises par les évaluateurs concernés.
          </Card>
        )}

        {overall != null && (
          <Card className="p-6 text-center space-y-2">
            <p className="text-xs text-foreground/50 uppercase tracking-wide">Score global</p>
            <p className="text-4xl font-semibold text-foreground">{overall.toFixed(2)} / 5</p>
            {appreciation && (
              <span
                className={`inline-block text-sm font-medium px-3 py-1 rounded-full ${appreciation.color}`}
              >
                {appreciation.label}
              </span>
            )}
          </Card>
        )}

        {criteria.length > 0 && (
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-foreground/50">
                  <th className="px-4 py-3 font-medium">Critère</th>
                  <th className="px-4 py-3 font-medium text-center">Collaborateurs</th>
                  <th className="px-4 py-3 font-medium text-center">Pairs</th>
                  <th className="px-4 py-3 font-medium text-center">N+1</th>
                  <th className="px-4 py-3 font-medium text-center">Auto</th>
                  <th className="px-4 py-3 font-medium text-center">Pondéré</th>
                </tr>
              </thead>
              <tbody>
                {criteria.map((c) => (
                  <tr key={c.criterion_id} className="border-b border-brand-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{c.criterion_name}</td>
                    <td className="px-4 py-3 text-center text-foreground/60">
                      {c.score_collaborateurs?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground/60">
                      {c.score_pairs?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground/60">
                      {c.score_n1?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center text-foreground/60">
                      {c.score_auto?.toFixed(1) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-foreground">
                      {c.weighted_score?.toFixed(2) ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </main>
    </div>
  );
}
