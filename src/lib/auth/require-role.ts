import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@/types/database";

/**
 * À appeler en tête d'une page serveur protégée. Redirige vers /login si non
 * connecté, ou vers /dashboard si connecté mais sans l'un des rôles requis.
 * Retourne l'utilisateur et son profil pour usage dans la page.
 */
export async function requireRole(allowed: UserRole[]) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, employee_id, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile || !allowed.includes(profile.role)) {
    redirect("/dashboard");
  }

  return { user, profile, supabase };
}
