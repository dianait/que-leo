import { createClient } from '@supabase/supabase-js';

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
