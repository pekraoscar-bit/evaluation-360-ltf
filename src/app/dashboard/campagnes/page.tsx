import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { CampaignForm } from "./CampaignForm";
import { CampaignStatusSelect } from "./CampaignStatusSelect";

export default async function CampagnesPage() {
  const { supabase } = await requireRole(["drh"]);

  const { data: campaigns } = await supabase
    .from("evaluation_campaigns")
    .select("id, name, year, period, start_date, end_date, status")
    .order("year", { ascending: false })
    .order("period");

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-semibold text-foreground">Campagnes d&apos;évaluation</h1>
      </header>

      <main className="flex-1 p-6 space-y-6">
        <Card className="p-5">
          <CampaignForm />
        </Card>

        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-foreground/50">
                <th className="px-4 py-3 font-medium">Campagne</th>
                <th className="px-4 py-3 font-medium">Période</th>
                <th className="px-4 py-3 font-medium">Début</th>
                <th className="px-4 py-3 font-medium">Fin</th>
                <th className="px-4 py-3 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody>
              {(campaigns ?? []).map((c) => (
                <tr key={c.id} className="border-b border-brand-border last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-foreground/70 capitalize">
                    {c.period} {c.year}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">{c.start_date ?? "—"}</td>
                  <td className="px-4 py-3 text-foreground/70">{c.end_date ?? "—"}</td>
                  <td className="px-4 py-3">
                    <CampaignStatusSelect campaignId={c.id} status={c.status} />
                  </td>
                </tr>
              ))}
              {(campaigns ?? []).length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-foreground/40">
                    Aucune campagne pour l&apos;instant.
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
