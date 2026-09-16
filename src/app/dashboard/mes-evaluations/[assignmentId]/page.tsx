import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { EvaluationForm } from "./EvaluationForm";

export default async function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ assignmentId: string }>;
}) {
  const { assignmentId } = await params;
  const { supabase, profile } = await requireAuth();

  // La RLS limite déjà l'accès à l'évaluateur concerné (ou la DRH) ; on
  // vérifie ici explicitement pour afficher un message clair sinon un 404.
  const { data: assignment } = await supabase
    .from("evaluation_assignments")
    .select("id, evaluatee_id, evaluator_id, source, campaign_id")
    .eq("id", assignmentId)
    .maybeSingle();

  if (!assignment) notFound();

  const isOwnEvaluation =
    assignment.evaluator_id === profile?.employee_id || profile?.role === "drh";
  if (!isOwnEvaluation) notFound();

  const [{ data: evaluatee }, { data: campaign }] = await Promise.all([
    supabase.from("employees").select("full_name, position_id").eq("id", assignment.evaluatee_id).maybeSingle(),
    supabase.from("evaluation_campaigns").select("name").eq("id", assignment.campaign_id).maybeSingle(),
  ]);

  const { data: criteria } = evaluatee?.position_id
    ? await supabase
        .from("position_criteria")
        .select("id, name, description")
        .eq("position_id", evaluatee.position_id)
        .eq("active", true)
        .order("display_order")
    : { data: [] };

  const { data: evaluation } = await supabase
    .from("evaluations")
    .select("id, status")
    .eq("assignment_id", assignmentId)
    .maybeSingle();

  const { data: answers } = evaluation
    ? await supabase
        .from("evaluation_answers")
        .select("criterion_id, rating, comment")
        .eq("evaluation_id", evaluation.id)
    : { data: [] };

  const readOnly = evaluation?.status === "soumise" || evaluation?.status === "validee";

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard/mes-evaluations" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="font-semibold text-foreground text-sm">
            {assignment.evaluatee_id === profile?.employee_id
              ? "Mon auto-évaluation"
              : `Évaluation de ${evaluatee?.full_name ?? "—"}`}
          </h1>
          <p className="text-xs text-foreground/50">{campaign?.name}</p>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full">
        <Card className="p-6">
          {(criteria ?? []).length === 0 ? (
            <p className="text-sm text-foreground/50">
              Aucun critère actif n&apos;est défini pour le poste concerné.
              Contactez la DRH.
            </p>
          ) : (
            <EvaluationForm
              assignmentId={assignmentId}
              criteria={criteria ?? []}
              initialAnswers={answers ?? []}
              readOnly={readOnly}
            />
          )}
        </Card>
      </main>
    </div>
  );
}
