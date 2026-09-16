import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { ToggleActive } from "./ToggleActive";
import { createSite, createPosition, createCriterion } from "./actions";

export default async function ReferentielPage({
  searchParams,
}: {
  searchParams: Promise<{ poste?: string }>;
}) {
  const { supabase } = await requireRole(["drh"]);
  const { poste: selectedPositionId } = await searchParams;

  const [{ data: sites }, { data: positions }] = await Promise.all([
    supabase.from("sites").select("id, name").order("name"),
    supabase.from("positions").select("id, name, active").order("display_order"),
  ]);

  const currentPositionId = selectedPositionId ?? positions?.[0]?.id;

  const { data: criteria } = currentPositionId
    ? await supabase
        .from("position_criteria")
        .select("id, name, active, display_order")
        .eq("position_id", currentPositionId)
        .order("display_order")
    : { data: [] };

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-semibold text-foreground">Référentiel</h1>
      </header>

      <main className="flex-1 p-6 grid gap-6 lg:grid-cols-2">
        {/* Sites */}
        <Card className="p-5 space-y-4 h-fit">
          <h2 className="font-medium text-foreground">Sites</h2>
          <ul className="space-y-1.5">
            {(sites ?? []).map((s) => (
              <li key={s.id} className="text-sm text-foreground/80 px-3 py-1.5 rounded-lg bg-foreground/5">
                {s.name}
              </li>
            ))}
          </ul>
          <form action={createSite} className="flex gap-2">
            <Input name="name" placeholder="Nouveau site" required className="text-sm py-1.5" />
            <Button type="submit" variant="secondary" className="px-2.5 py-1.5">
              <Plus size={14} />
            </Button>
          </form>
        </Card>

        {/* Postes */}
        <Card className="p-5 space-y-4 h-fit">
          <h2 className="font-medium text-foreground">Postes</h2>
          <ul className="space-y-1.5">
            {(positions ?? []).map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between gap-2 text-sm px-3 py-1.5 rounded-lg bg-foreground/5"
              >
                <Link
                  href={`/dashboard/referentiel?poste=${p.id}`}
                  className={
                    p.id === currentPositionId
                      ? "font-medium text-brand-primary"
                      : "text-foreground/80 hover:text-foreground"
                  }
                >
                  {p.name}
                </Link>
                <ToggleActive id={p.id} active={p.active} kind="position" />
              </li>
            ))}
          </ul>
          <form action={createPosition} className="flex gap-2">
            <Input name="name" placeholder="Nouveau poste" required className="text-sm py-1.5" />
            <Button type="submit" variant="secondary" className="px-2.5 py-1.5">
              <Plus size={14} />
            </Button>
          </form>
        </Card>

        {/* Critères du poste sélectionné */}
        <Card className="p-5 space-y-4 lg:col-span-2">
          <h2 className="font-medium text-foreground">
            Critères —{" "}
            <span className="text-foreground/50">
              {positions?.find((p) => p.id === currentPositionId)?.name ?? "sélectionnez un poste"}
            </span>
          </h2>
          <ul className="space-y-1.5">
            {(criteria ?? []).map((c) => (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 text-sm px-3 py-1.5 rounded-lg bg-foreground/5"
              >
                <span className="text-foreground/80">{c.name}</span>
                <ToggleActive id={c.id} active={c.active} kind="criterion" />
              </li>
            ))}
            {(criteria ?? []).length === 0 && (
              <p className="text-sm text-foreground/40">Aucun critère pour ce poste.</p>
            )}
          </ul>
          {currentPositionId && (
            <form action={createCriterion} className="flex gap-2">
              <input type="hidden" name="position_id" value={currentPositionId} />
              <Input name="name" placeholder="Nouveau critère" required className="text-sm py-1.5 flex-1" />
              <Button type="submit" variant="secondary" className="px-2.5 py-1.5">
                <Plus size={14} />
              </Button>
            </form>
          )}
        </Card>
      </main>
    </div>
  );
}
