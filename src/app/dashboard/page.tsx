import { redirect } from "next/navigation";
import Link from "next/link";
import { LogOut, ClipboardCheck, Users, ListChecks, CalendarRange, UserCog, FileCheck2, BarChart3, TrendingUp } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { logout } from "@/app/login/actions";

const ROLE_LABELS: Record<string, string> = {
  drh: "Admin / DRH",
  n1: "N+1 / Responsable hiérarchique",
  collaborateur: "Collaborateur",
  evaluateur_pair: "Évaluateur pair",
  evaluateur_collaborateur: "Évaluateur collaborateur",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-primary font-semibold">
          <ClipboardCheck size={20} />
          Évaluation 360° — LA TULIPE FOOD
        </div>
        <form action={logout}>
          <Button type="submit" variant="ghost">
            <LogOut size={16} />
            Se déconnecter
          </Button>
        </form>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="max-w-md w-full p-8 space-y-3 text-center">
          <h1 className="text-lg font-semibold text-foreground">
            Connexion réussie
          </h1>
          {profile ? (
            <div className="text-sm text-foreground/70 space-y-1">
              <p>
                Compte : <span className="font-medium">{user.email}</span>
              </p>
              <p>
                Rôle :{" "}
                <span className="font-medium">
                  {ROLE_LABELS[profile.role] ?? profile.role}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-sm text-brand-warning bg-brand-warning/10 rounded-lg px-3 py-2">
              Aucun profil applicatif n&apos;est encore associé à ce compte
              (rôle/employé). La DRH doit le lier depuis l&apos;administration.
            </p>
          )}
          <Link href="/dashboard/mes-evaluations">
            <Button variant="secondary" className="w-full">
              <FileCheck2 size={16} />
              Mes évaluations
            </Button>
          </Link>
          <Link href="/dashboard/mes-resultats">
            <Button variant="secondary" className="w-full">
              <BarChart3 size={16} />
              Mes résultats
            </Button>
          </Link>
          {profile?.role === "drh" && (
            <div className="space-y-2">
              <Link href="/dashboard/collaborateurs">
                <Button variant="secondary" className="w-full">
                  <Users size={16} />
                  Gérer les collaborateurs
                </Button>
              </Link>
              <Link href="/dashboard/referentiel">
                <Button variant="secondary" className="w-full">
                  <ListChecks size={16} />
                  Gérer le référentiel
                </Button>
              </Link>
              <Link href="/dashboard/campagnes">
                <Button variant="secondary" className="w-full">
                  <CalendarRange size={16} />
                  Gérer les campagnes
                </Button>
              </Link>
              <Link href="/dashboard/attributions">
                <Button variant="secondary" className="w-full">
                  <UserCog size={16} />
                  Attribuer les évaluateurs
                </Button>
              </Link>
              <Link href="/dashboard/resultats">
                <Button variant="secondary" className="w-full">
                  <TrendingUp size={16} />
                  Résultats globaux
                </Button>
              </Link>
            </div>
          )}
          <p className="text-xs text-foreground/40 pt-2">
            Le reste du tableau de bord (par rôle) sera construit aux étapes
            suivantes du plan de développement.
          </p>
        </Card>
      </main>
    </div>
  );
}
