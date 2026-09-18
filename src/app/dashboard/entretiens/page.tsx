import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { saveInterview, saveOwnComment } from "./actions";
import { DoneToggle } from "./DoneToggle";

export default async function EntretiensPage({
  searchParams,
}: {
  searchParams: Promise<{ employe?: string; campagne?: string }>;
}) {
  const { supabase, profile } = await requireAuth();
  const { employe, campagne } = await searchParams;
  const targetEmployeeId = employe ?? profile?.employee_id;

  const { data: campaigns } = await supabase
    .from("evaluation_campaigns")
    .select("id, name")
    .order("year", { ascending: false })
    .order("period");

  const campaignId = campagne ?? campaigns?.[0]?.id;

  if (!targetEmployeeId || !campaignId) {
    return (
      <div className="min-h-full flex flex-col">
        <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-semibold text-foreground">Entretiens</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="p-5 text-sm text-foreground/60">
            {!targetEmployeeId
              ? "Votre compte n'est pas encore associé à une fiche collaborateur."
              : "Aucune campagne n'existe encore."}
          </Card>
        </main>
      </div>
    );
  }

  const [{ data: employee }, { data: interview }] = await Promise.all([
    supabase.from("employees").select("full_name").eq("id", targetEmployeeId).maybeSingle(),
    supabase
      .from("evaluation_interviews")
      .select("*")
      .eq("employee_id", targetEmployeeId)
      .eq("campaign_id", campaignId)
      .maybeSingle(),
  ]);

  const isOwn = targetEmployeeId === profile?.employee_id;
  const canEditN1Fields = profile?.role === "drh" || profile?.role === "n1";

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-semibold text-foreground text-sm">
          {isOwn ? "Mon entretien" : `Entretien — ${employee?.full_name ?? "—"}`}
        </h1>
      </header>

      <main className="flex-1 p-6 max-w-2xl mx-auto w-full space-y-6">
        <Card className="p-5 flex items-center justify-between gap-3 flex-wrap">
          <select
            defaultValue={campaignId}
            className="rounded-lg border border-brand-border bg-brand-surface px-3 py-2 text-sm"
            disabled
          >
            {(campaigns ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {interview && canEditN1Fields && (
            <DoneToggle
              interviewId={interview.id}
              done={interview.done}
              employeeId={targetEmployeeId}
              campaignId={campaignId}
            />
          )}
        </Card>

        {canEditN1Fields ? (
          <Card className="p-5">
            <form action={saveInterview} className="space-y-3">
              <input type="hidden" name="employee_id" value={targetEmployeeId} />
              <input type="hidden" name="campaign_id" value={campaignId} />
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground/60">Date de l&apos;entretien</label>
                <Input name="interview_date" type="date" defaultValue={interview?.interview_date ?? ""} />
              </div>
              <Field name="points_forts" label="Points forts" defaultValue={interview?.points_forts} />
              <Field name="difficultes" label="Difficultés" defaultValue={interview?.difficultes} />
              <Field
                name="axes_amelioration"
                label="Axes d'amélioration"
                defaultValue={interview?.axes_amelioration}
              />
              <Field name="objectifs" label="Objectifs" defaultValue={interview?.objectifs} />
              <Field
                name="actions_decidees"
                label="Actions décidées"
                defaultValue={interview?.actions_decidees}
              />
              <Field
                name="commentaire_n1"
                label="Commentaires du N+1"
                defaultValue={interview?.commentaire_n1}
              />
              <Button type="submit">Enregistrer</Button>
            </form>
          </Card>
        ) : (
          <Card className="p-5 space-y-3 text-sm">
            <ReadRow label="Date" value={interview?.interview_date} />
            <ReadRow label="Points forts" value={interview?.points_forts} />
            <ReadRow label="Difficultés" value={interview?.difficultes} />
            <ReadRow label="Axes d'amélioration" value={interview?.axes_amelioration} />
            <ReadRow label="Objectifs" value={interview?.objectifs} />
            <ReadRow label="Actions décidées" value={interview?.actions_decidees} />
            <ReadRow label="Commentaires du N+1" value={interview?.commentaire_n1} />
          </Card>
        )}

        {isOwn && (
          <Card className="p-5">
            <form action={saveOwnComment} className="space-y-3">
              <input type="hidden" name="employee_id" value={targetEmployeeId} />
              <input type="hidden" name="campaign_id" value={campaignId} />
              <Field
                name="commentaire_collaborateur"
                label="Mon commentaire"
                defaultValue={interview?.commentaire_collaborateur}
              />
              <Button type="submit" variant="secondary">
                Enregistrer mon commentaire
              </Button>
            </form>
          </Card>
        )}
      </main>
    </div>
  );
}

function Field({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-foreground/60">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={2}
        className="w-full text-sm rounded-lg border border-brand-border bg-brand-surface px-3 py-2"
      />
    </div>
  );
}

function ReadRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium text-foreground/50">{label}</p>
      <p className="text-foreground/80">{value || "—"}</p>
    </div>
  );
}
