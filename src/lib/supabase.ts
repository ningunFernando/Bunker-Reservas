import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } from '$app/env/public';

// Cliente con la llave publicable. Todo lo que puede leer o escribir lo deciden las
// políticas de RLS de la base de datos (AGENTS.md § 7.4).
export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
	auth: { persistSession: false }
});
