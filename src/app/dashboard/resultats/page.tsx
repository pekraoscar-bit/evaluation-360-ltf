import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { getAppreciation } from "@/lib/scores/appreciation";

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4">
      <p className="text-xs text-foreground/50">{label}</p>
      <p className="text-2xl font-semibold text-foreground mt-1">{value}</p>
    </Card>
  );
}

export default async function ResultatsGlobauxPage({
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
          <h1 className="font-semibold text-foreground">Résultats globaux</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="p-5 space-y-3">
            <p className="text-sm text-foreground/60">Choisissez une campagne :</p>
            <ul className="space-y-1.5">
              {(campaigns ?? []).map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/dashboard/resultats?campagne=${c.id}`}
                    className="block px-3 py-2 rounded-lg bg-foreground/5 text-sm text-foreground/80 hover:bg-foreground/10"
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
              {(campaigns ?? []).length === 0 && (
                <p className="text-sm text-foreground/40">Aucune campagne pour l&apos;instant.</p>
              )}
            </ul>
          </Card>
        </main>
      </div>
    );
  }

  const [
    { data: campaign },
    { data: assignments },
    { data: employees },
    { data: positions },
    { data: settings },
    { data: scores },
  ] = await Promise.all([
    supabase.from("evaluation_campaigns").select("name").eq("id", campaignId).maybeSingle(),
    supabase.from("evaluation_assignments").select("id, evaluatee_id").eq("campaign_id", campaignId),
    supabase.from("employees").select("id, full_name, position_id, active").eq("active", true),
    supabase.from("positions").select("id, name"),
    supabase.from("app_settings").select("*").eq("id", 1).maybeSingle(),
    supabase.rpc("get_campaign_scores", { p_campaign_id: campaignId }),
  ]);

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  const { data: evaluations } = assignmentIds.length
    ? await supabase.from("evaluations").select("assignment_id, status").in("assignment_id", assignmentIds)
    : { data: [] };

  const totalAssignments = assignments?.length ?? 0;
  const personnesConcernees = new Set((assignments ?? []).map((a) => a.evaluatee_id)).size;
  const soumises = (evaluations ?? []).filter((e) => e.status === "soumise" || e.status === "validee").length;
  const enCours = (evaluations ?? []).filter((e) => e.status === "en_cours").length;
  const commencees = (evaluations ?? []).length;
  const nonCommencees = totalAssignments - commencees;
  const tauxParticipation = totalAssignments ? Math.round((soumises / totalAssignments) * 100) : 0;

  const scoreValues = (scores ?? []).map((s) => s.overall_score).filter((s): s is number => s != null);
  const scoreMoyenGlobal = scoreValues.length
    ? scoreValues.reduce((sum, s) => sum + s, 0) / scoreValues.length
    : null;

  const positionById = new Map((positions ?? []).map((p) => [p.id, p.name]));
  const employeeById = new Map((employees ?? []).map((e) => [e.id, e]));
  const scoreByEvaluatee = new Map((scores ?? []).map((s) => [s.evaluatee_id, s.overall_score]));

  const rows = [...employeeById.values()]
    .map((e) => ({
      id: e.id,
      name: e.full_name,
      position: e.position_id ? positionById.get(e.position_id) ?? "—" : "—",
      score: scoreByEvaluatee.get(e.id) ?? null,
    }))
    .sort((a, b) => (b.score ?? -1) - (a.score ?? -1));

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard/resultats" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-semibold text-foreground text-sm">
          Résultats globaux — <span className="text-foreground/60">{campaign?.name}</span>
        </h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Kpi label="Collaborateurs actifs" value={String(employees?.length ?? 0)} />
          <Kpi label="Personnes concernées" value={String(personnesConcernees)} />
          <Kpi label="Évaluations soumises" value={`${soumises} / ${totalAssignments}`} />
          <Kpi label="En cours" value={String(enCours)} />
          <Kpi label="Non commencées" value={String(nonCommencees)} />
          <Kpi label="Taux de participation" value={`${tauxParticipation}%`} />
          <Kpi
            label="Score moyen global"
            value={scoreMoyenGlobal != null ? `${scoreMoyenGlobal.toFixed(2)} / 5` : "—"}
          />
        </div>

        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-foreground/50">
                <th className="px-4 py-3 font-medium">Collaborateur</th>
                <th className="px-4 py-3 font-medium">Poste</th>
                <th className="px-4 py-3 font-medium text-center">Score</th>
                <th className="px-4 py-3 font-medium">Appréciation</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const appreciation = r.score != null && settings ? getAppreciation(r.score, settings) : null;
                return (
                  <tr key={r.id} className="border-b border-brand-border last:border-0">
                    <td className="px-4 py-3 text-foreground">{r.name}</td>
                    <td className="px-4 py-3 text-foreground/60">{r.position}</td>
                    <td className="px-4 py-3 text-center font-medium text-foreground">
                      {r.score != null ? r.score.toFixed(2) : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {appreciation ? (
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${appreciation.color}`}>
                          {appreciation.label}
                        </span>
                      ) : (
                        <span className="text-xs text-foreground/30">En attente</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}
