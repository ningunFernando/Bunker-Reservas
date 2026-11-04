// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SupabaseClient, User } from '@supabase/supabase-js';

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			// Cliente de Supabase con la sesión de quien hace la petición (cookies). Lo crea hooks.server.ts.
			supabase: SupabaseClient;
			// Usuario validado contra Supabase Auth (getUser, no solo la cookie), o null.
			getUser: () => Promise<User | null>;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
