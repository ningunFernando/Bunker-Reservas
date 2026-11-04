import { createServerClient } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$app/env/public';
import type { Handle } from '@sveltejs/kit/hooks'; // SvelteKit 3: los tipos de hooks salieron de '@sveltejs/kit'

// Cada petición trae su propio cliente de Supabase con la sesión guardada en cookies (Fase 2, panel).
// El público no inicia sesión: para él este cliente es igual al anónimo de #lib/supabase.
export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
		cookies: {
			getAll: () => event.cookies.getAll(),
			setAll: (cookies) => {
				for (const { name, value, options } of cookies) {
					event.cookies.set(name, value, { ...options, path: '/' });
				}
			}
		}
	});

	// getUser valida el token con Supabase Auth; getSession solo leería la cookie sin verificarla.
	event.locals.getUser = async () => {
		const {
			data: { user }
		} = await event.locals.supabase.auth.getUser();
		return user;
	};

	return resolve(event, {
		filterSerializedResponseHeaders: (name) => name === 'content-range' || name === 'x-supabase-api-version'
	});
};
