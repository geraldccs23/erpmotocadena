import { createClient } from '@supabase/supabase-js';

// Valores proporcionados por el usuario
// Nota: Se usa la Service Key para garantizar acceso total según requerimiento
const SUPABASE_URL = 'https://supabase.motocadena.com';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogInNlcnZpY2Vfcm9sZSIsCiAgImlzcyI6ICJzdXBhYmFzZSIsCiAgImlhdCI6IDE3MTUwNTA4MDAsCiAgImV4cCI6IDE4NzI4MTcyMDAKfQ.qsWIBzlqP7AT6w39r4QMlPstb6Vj8hWLssCoqbfybMk';

export const isSupabaseConfigured = true;

// Inicialización con SERVICE_ROLE para bypass de RLS y máxima compatibilidad
export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});