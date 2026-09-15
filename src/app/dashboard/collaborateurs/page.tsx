import Link from "next/link";
import { ArrowLeft, UserCheck } from "lucide-react";
import { requireRole } from "@/lib/auth/require-role";
import { Card } from "@/components/ui/Card";
import { CreateAccountButton } from "./CreateAccountButton";

export default async function CollaborateursPage() {
  const { supabase } = await requireRole(["drh"]);

  const [{ data: employees }, { data: positions }, { data: sites }] = await Promise.all([
    supabase
      .from("employees")
      .select("id, matricule, full_name, position_id, site_id, manager_employee_id, user_id, active")
      .order("full_name"),
    supabase.from("positions").select("id, name"),
    supabase.from("sites").select("id, name"),
  ]);

  const positionById = new Map((positions ?? []).map((p) => [p.id, p.name]));
  const siteById = new Map((sites ?? []).map((s) => [s.id, s.name]));
  const employeeById = new Map((employees ?? []).map((e) => [e.id, e.full_name]));

  function suggestedEmail(fullName: string) {
    const slug = fullName
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z\s]/g, "")
      .trim()
      .split(/\s+/)
      .join(".");
    return `${slug}@latulipefood.ci`;
  }

  return (
    <div className="min-h-full flex flex-col">
      <header className="border-b border-brand-border bg-brand-surface px-6 py-4 flex items-center gap-3">
        <Link href="/dashboard" className="text-foreground/50 hover:text-foreground">
          <ArrowLeft size={18} />
        </Link>
        <h1 className="font-semibold text-foreground">Collaborateurs</h1>
        <span className="text-sm text-foreground/40">({employees?.length ?? 0})</span>
      </header>

      <main className="flex-1 p-6">
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-foreground/50">
                <th className="px-4 py-3 font-medium">Nom</th>
                <th className="px-4 py-3 font-medium">Matricule</th>
                <th className="px-4 py-3 font-medium">Poste</th>
                <th className="px-4 py-3 font-medium">Site</th>
                <th className="px-4 py-3 font-medium">N+1</th>
                <th className="px-4 py-3 font-medium">Compte</th>
              </tr>
            </thead>
            <tbody>
              {(employees ?? []).map((emp) => (
                <tr key={emp.id} className="border-b border-brand-border last:border-0 align-top">
                  <td className="px-4 py-3 font-medium text-foreground">{emp.full_name}</td>
                  <td className="px-4 py-3 text-foreground/60 font-mono text-xs">{emp.matricule}</td>
                  <td className="px-4 py-3 text-foreground/70">
                    {emp.position_id ? positionById.get(emp.position_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {emp.site_id ? siteById.get(emp.site_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3 text-foreground/70">
                    {emp.manager_employee_id ? employeeById.get(emp.manager_employee_id) ?? "—" : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {emp.user_id ? (
                      <span className="inline-flex items-center gap-1.5 text-brand-accent text-xs font-medium">
                        <UserCheck size={14} />
                        Compte actif
                      </span>
                    ) : (
                      <CreateAccountButton
                        employeeId={emp.id}
                        suggestedEmail={suggestedEmail(emp.full_name)}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </main>
    </div>
  );
}
