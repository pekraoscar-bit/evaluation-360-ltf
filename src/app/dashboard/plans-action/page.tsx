import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { AddActionItemForm } from "./AddActionItemForm";
import { ActionStatusSelect } from "./ActionStatusSelect";

export default async function PlansActionPage({
  searchParams,
}: {
  searchParams: Promise<{ employe?: string }>;
}) {
  const { supabase, profile } = await requireAuth();
  const { employe } = await searchParams;
  const targetEmployeeId = employe ?? profile?.employee_id;

  if (!targetEmployeeId) {
    return (
      <div className="min-h-full flex flex-col">
        <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-semibold text-foreground">Plan d&apos;action</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="p-5 text-sm text-foreground/60">
            Votre compte n&apos;est pas encore associé à une fiche collaborateur.
          </Card>
        </main>
      </div>
    );
  }

  const [{ data: employee }, { data: plans }] = await Promise.all([
    supabase.from("employees").select("full_name").eq("id", targetEmployeeId).maybeSingle(),
    supabase.from("action_plans").select("id").eq("employee_id", targetEmployeeId),
  ]);

  const planIds = (plans ?? []).map((p) => p.id);
  const { data: items } = planIds.length
    ? await supabase
        .from("action_items")
        .select("id, axe, objectif, action, date_debut, date_cible, priorite, status")
        .in("action_plan_id", planIds)
        .order("created_at")
    : { data: [] };

  const isOwnPlan = targetEmployeeId === profile?.employee_id;

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-semibold text-foreground text-sm">
          {isOwnPlan ? "Mon plan d'action" : `Plan d'action — ${employee?.full_name ?? "—"}`}
        </h1>
      </header>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
        <Card className="p-5">
          <AddActionItemForm employeeId={targetEmployeeId} />
        </Card>

        <Card className="divide-y divide-brand-border">
          {(items ?? []).map((item) => (
            <div key={item.id} className="p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-foreground">{item.axe}</p>
                  {item.objectif && <p className="text-xs text-foreground/50">{item.objectif}</p>}
                </div>
                <ActionStatusSelect itemId={item.id} status={item.status} employeeId={targetEmployeeId} />
              </div>
              {item.action && <p className="text-sm text-foreground/70">{item.action}</p>}
              <div className="flex gap-3 text-xs text-foreground/40">
                {item.date_debut && <span>Début : {item.date_debut}</span>}
                {item.date_cible && <span>Cible : {item.date_cible}</span>}
                {item.priorite && <span className="capitalize">Priorité : {item.priorite}</span>}
              </div>
            </div>
          ))}
          {(items ?? []).length === 0 && (
            <p className="p-6 text-center text-sm text-foreground/40">
              Aucune action pour l&apos;instant.
            </p>
          )}
        </Card>
      </main>
    </div>
  );
}
