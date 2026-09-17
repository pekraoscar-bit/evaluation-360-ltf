import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { requireAuth } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";

export default async function MesResultatsPage() {
  const { supabase, profile } = await requireAuth();

  if (!profile?.employee_id) {
    return (
      <div className="min-h-full flex flex-col">
        <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
          <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
            <ArrowLeft size={18} />
          </Link>
          <h1 className="font-semibold text-foreground">Mes résultats</h1>
        </header>
        <main className="flex-1 p-6">
          <Card className="p-5 text-sm text-foreground/60">
            Votre compte n&apos;est pas encore associé à une fiche collaborateur.
          </Card>
        </main>
      </div>
    );
  }

  const { data: campaigns } = await supabase
    .from("evaluation_campaigns")
    .select("id, name, year, period")
    .order("year", { ascending: false })
    .order("period");

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-semibold text-foreground">Mes résultats</h1>
      </header>

      <main className="flex-1 p-6">
        <Card className="divide-y divide-brand-border">
          {(campaigns ?? []).map((c) => (
            <Link
              key={c.id}
              href={`/dashboard/mes-resultats/${c.id}`}
              className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-foreground/5"
            >
              <span className="text-sm font-medium text-foreground">{c.name}</span>
              <ChevronRight size={16} className="text-foreground/30" />
            </Link>
          ))}
          {(campaigns ?? []).length === 0 && (
            <p className="px-5 py-6 text-center text-sm text-foreground/40">
              Aucune campagne pour l&apos;instant.
            </p>
          )}
        </Card>
      </main>
    </div>
  );
}
