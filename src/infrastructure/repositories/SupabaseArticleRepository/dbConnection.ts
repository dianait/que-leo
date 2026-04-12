import { createClient } from '@supabase/supabase-js';

// ⚠️ Nunca uses claves de servicio (service role) en el frontend.
// ⚠️ Asegúrate de tener Row Level Security (RLS) activado en todas las tablas de Supabase.
// Solo usa la anon key en el navegador.

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Create Supabase client
const supabase = createClient(
  supabaseUrl as string,
  supabaseKey as string
);

// Report connection status
if (!supabaseUrl || !supabaseKey) {
  console.warn('Faltan variables de entorno para Supabase.');
} else {
  console.log('Cliente de Supabase inicializado correctamente');
}

export default supabase;
