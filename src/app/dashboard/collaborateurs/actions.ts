"use server";

import { randomBytes } from "crypto";
import { requireRole } from "@/lib/auth/require-role";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/types/database";

export type CreateAccountResult =
  | { ok: true; email: string; temporaryPassword: string }
  | { ok: false; error: string };

function generateTemporaryPassword(): string {
  // 12 caractères lisibles (évite les caractères ambigus 0/O, 1/l/I)
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(12);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export async function createEmployeeAccount(
  employeeId: string,
  email: string,
  role: UserRole
): Promise<CreateAccountResult> {
  // Seule la DRH peut créer des comptes.
  await requireRole(["drh"]);

  if (!email || !email.includes("@")) {
    return { ok: false, error: "Adresse e-mail invalide." };
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erreur de configuration." };
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
