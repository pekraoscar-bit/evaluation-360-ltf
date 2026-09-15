import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@/types/database";

/**
 * Client Supabase à utiliser dans les Server Components, Server Actions et
 * Route Handlers. Lit/écrit les cookies de session pour que l'utilisateur
 * reste authentifié entre les requêtes.
 *
 * La sécurité réelle des données (qui peut lire/écrire quoi) est portée par
 * les policies RLS en base — ce client ne fait que porter l'identité de
 * l'utilisateur connecté, il n'accorde aucun droit par lui-même.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Appelé depuis un Server Component : ignoré si le middleware
            // gère déjà le rafraîchissement de session.
          }
        },
      },
    }
  );
}
