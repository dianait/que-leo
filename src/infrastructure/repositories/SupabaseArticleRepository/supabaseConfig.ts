import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export const createSupabaseClient = (
  supabaseUrl?: string,
  supabaseKey?: string
): SupabaseClient => {
  // If an instance already exists, return it
  if (supabaseClient) {
    return supabaseClient;
  }

  const url = supabaseUrl ?? import.meta.env.VITE_SUPABASE_URL;
  const key = supabaseKey ?? import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    throw new Error(
      "Las variables de entorno de Supabase no están configuradas. Asegúrate de tener VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu archivo .env"
    );
  }

  supabaseClient = createClient(url, key);
  return supabaseClient;
};

// Function to reset the client (useful for tests)
export const resetSupabaseClient = () => {
  supabaseClient = null;
};
