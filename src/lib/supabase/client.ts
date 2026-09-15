import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client Supabase à utiliser dans les Client Components ("use client").
 * S'appuie sur les variables NEXT_PUBLIC_* (sûres à exposer au navigateur) :
 * les autorisations réelles sont appliquées côté base de données via RLS,
 * jamais dans ce client.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
