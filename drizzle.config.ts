import { defineConfig } from 'drizzle-kit';

// Drizzle solo corre las migraciones SQL de supabase/migrations/ (npm run db:migrate).
// La app sigue hablando con Supabase por supabase-js; no hay esquema de Drizzle en TypeScript.
try {
	process.loadEnvFile('.env');
} catch {
	// Sin .env: DATABASE_URL tiene que venir del entorno.
}

// DIRECT_URL es el nombre que usa el equipo (estilo Prisma); DATABASE_URL también sirve.
const url = process.env.DATABASE_URL ?? process.env.DIRECT_URL;
if (!url) {
	throw new Error('Falta DATABASE_URL o DIRECT_URL en .env (Supabase → Connect → Session pooler).');
}

export default defineConfig({
	dialect: 'postgresql',
	out: './supabase/migrations',
	dbCredentials: { url },
	migrations: { table: '__drizzle_migrations', schema: 'drizzle' }
});
