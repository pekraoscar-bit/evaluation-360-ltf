import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Client Supabase "admin", utilisant la clé secrète (service_role).
 *
 * NE JAMAIS importer ce fichier depuis un Client Component ni l'exposer au
 * navigateur : il contourne totalement la RLS. Réservé aux Server Actions
 * qui doivent effectuer des opérations d'administration (ex. création de
 * comptes de connexion par la DRH).
 *
 * Nécessite la variable d'environnement SUPABASE_SERVICE_ROLE_KEY (jamais
 * préfixée NEXT_PUBLIC_, donc jamais envoyée au navigateur par Next.js).
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY manquante : ajoutez-la dans les variables " +
        "d'environnement (Vercel > Settings > Environment Variables) pour " +
        "activer la création de comptes."
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
