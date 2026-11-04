import { defineEnvVars } from '@sveltejs/kit/env';

// SvelteKit 3: las variables de entorno se declaran aquí y se importan de
// `$app/env/public` (llegan al navegador) o `$app/env/private` (solo servidor).
export const variables = defineEnvVars({
	PUBLIC_SUPABASE_URL: {
		public: true,
		description: 'URL del proyecto de Supabase (Settings → API).'
	},
	PUBLIC_SUPABASE_PUBLISHABLE_KEY: {
		public: true,
		description: 'Llave publicable de Supabase. Es pública: la seguridad la dan las políticas de RLS.'
	}
});
