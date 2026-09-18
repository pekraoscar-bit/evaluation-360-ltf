"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import { emailFromMatricule } from "./utils";
import type { UserRole } from "@/types/database";

const PATH = "/dashboard/collaborateurs";

export type CreateAccountResult =
  | { ok: true; email: string; temporaryPassword: string }
  | { ok: false; error: string };

export type BulkCreateResultRow = {
  employeeId: string;
  fullName: string;
  matricule: string;
} & (
  | { ok: true; email: string; temporaryPassword: string }
  | { ok: false; error: string }
);

function generateTemporaryPassword(): string {
  // 12 caractères lisibles (évite les caractères ambigus 0/O, 1/l/I)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(12);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

async function createAccountForEmployee(
  admin: ReturnType<typeof createAdminClient>,
  employeeId: string,
  email: string,
  role: UserRole
): Promise<CreateAccountResult> {
  if (!email || !email.includes("@")) {
    return { ok: false, error: "Adresse e-mail invalide." };
  }

  const temporaryPassword = generateTemporaryPassword();

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password: temporaryPassword,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return {
      ok: false,
      error: createError?.message ?? "Impossible de créer le compte (e-mail déjà utilisé ?).",
    };
  }

  const { error: profileError } = await admin.from("profiles").insert({
    id: created.user.id,
    employee_id: employeeId,
    role,
  });

  if (profileError) {
    // On annule la création du compte auth pour ne pas laisser un compte orphelin.
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: "Erreur lors de la liaison du profil : " + profileError.message };
  }

  const { error: linkError } = await admin
    .from("employees")
    .update({ user_id: created.user.id })
    .eq("id", employeeId);

  if (linkError) {
    return { ok: false, error: "Compte créé mais non lié à l'employé : " + linkError.message };
  }

  return { ok: true, email, temporaryPassword };
}

export async function createEmployeeAccount(
  employeeId: string,
  email: string,
  role: UserRole
): Promise<CreateAccountResult> {
  // Seule la DRH peut créer des comptes.
  await requireRole(["drh"]);

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur de configuration." };
  }

  const result = await createAccountForEmployee(admin, employeeId, email, role);
  revalidatePath(PATH);
  return result;
}

/**
 * Crée en une fois un compte pour tous les collaborateurs actifs qui n'en
 * ont pas encore, avec un e-mail dérivé du matricule (unique et fiable).
 * Le rôle est déduit automatiquement : "n1" si l'employé encadre au moins
 * un subordonné, "collaborateur" sinon. Modifiable ensuite au cas par cas.
 */
export async function createAllMissingAccounts(): Promise<BulkCreateResultRow[]> {
  await requireRole(["drh"]);

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    throw new Error(e instanceof Error ? e.message : "Erreur de configuration.");
  }

  const { data: employees } = await admin
    .from("employees")
    .select("id, matricule, full_name, manager_employee_id, user_id, active")
    .eq("active", true)
    .is("user_id", null);

  if (!employees || employees.length === 0) return [];

  const managerIds = new Set(
    (
      await admin.from("employees").select("manager_employee_id").not("manager_employee_id", "is", null)
    ).data?.map((r) => r.manager_employee_id) ?? []
  );

  const results: BulkCreateResultRow[] = [];

  for (const emp of employees) {
    const role: UserRole = managerIds.has(emp.id) ? "n1" : "collaborateur";
    const email = emailFromMatricule(emp.matricule);
    const res = await createAccountForEmployee(admin, emp.id, email, role);
    results.push({ employeeId: emp.id, fullName: emp.full_name, matricule: emp.matricule, ...res });
  }

  revalidatePath(PATH);
  return results;
}
