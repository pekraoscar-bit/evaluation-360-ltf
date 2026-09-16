import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import type { EvaluationStatusType, EvaluationSourceType } from "@/types/database";

const STATUS_LABELS: Record<EvaluationStatusType, string> = {
  non_commencee: "Non commencée",
  en_cours: "En cours",
  soumise: "Soumise",
  validee: "Validée",
};

const STATUS_COLORS: Record<EvaluationStatusType, string> = {
  non_commencee: "bg-foreground/5 text-foreground/50",
  en_cours: "bg-brand-warning/10 text-brand-warning",
  soumise: "bg-brand-accent/10 text-brand-accent",
  validee: "bg-brand-primary/10 text-brand-primary",
};

const SOURCE_LABELS: Record<EvaluationSourceType, string> = {
  auto: "Auto-évaluation",
  collaborateurs: "Évaluation d'un collaborateur",
  pairs: "Évaluation d'un pair",
  n_plus_1: "Évaluation (en tant que N+1)",
};

export default async function MesEvaluationsPage() {
  const { supabase, profile } = await requireAuth();

  if (!profile?.employee_id) {
    return (
      <div className="min-h-full flex flex-col">
        <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-semibold text-foreground">Mes évaluations</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="p-5 text-sm text-foreground/60">
            Votre compte n&apos;est pas encore associé à une fiche collaborateur
            — contactez la DRH.
          </Card>
        </main>
      </div>
    );
  }

  const { data: assignments } = await supabase
    .from("evaluation_assignments")
    .select("id, evaluatee_id, source, campaign_id")
    .eq("evaluator_id", profile.employee_id);

  const campaignIds = [...new Set((assignments ?? []).map((a) => a.campaign_id))];
  const evaluateeIds = [...new Set((assignments ?? []).map((a) => a.evaluatee_id))];

  const [{ data: campaigns }, { data: evaluatees }, { data: evaluations }] = await Promise.all([
    campaignIds.length
      ? supabase.from("evaluation_campaigns").select("id, name").in("id", campaignIds)
      : Promise.resolve({ data: [] }),
    evaluateeIds.length
      ? supabase.from("employees").select("id, full_name").in("id", evaluateeIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from("evaluations")
      .select("assignment_id, status")
      .in("assignment_id", (assignments ?? []).map((a) => a.id).length ? (assignments ?? []).map((a) => a.id) : [""]),
  ]);

  const campaignById = new Map((campaigns ?? []).map((c) => [c.id, c.name]));
  const evaluateeById = new Map((evaluatees ?? []).map((e) => [e.id, e.full_name]));
  const statusByAssignment = new Map((evaluations ?? []).map((e) => [e.assignment_id, e.status]));

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-semibold text-foreground">Mes évaluations</h1>
      </header>

      <main className="flex-1 p-6">
        <Card className="divide-y divide-brand-border">
          {(assignments ?? []).map((a) => {
            const status = statusByAssignment.get(a.id) ?? "non_commencee";
            return (
              <Link
                key={a.id}
                href={`/dashboard/mes-evaluations/${a.id}`}
                className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-foreground/5"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {a.evaluatee_id === profile.employee_id
                      ? "Mon auto-évaluation"
                      : evaluateeById.get(a.evaluatee_id) ?? "—"}
                  </p>
                  <p className="text-xs text-foreground/50">
                    {campaignById.get(a.campaign_id) ?? "—"} · {SOURCE_LABELS[a.source]}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[status]}`}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                  <ChevronRight size={16} className="text-foreground/30" />
                </div>
              </Link>
            );
          })}
          {(assignments ?? []).length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-foreground/40">
              Aucune évaluation ne vous a été attribuée pour l&apos;instant.
            </p>
          )}
        </Card>
      </main>
    </div>
  );
}
