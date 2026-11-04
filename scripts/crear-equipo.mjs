// Crea (o actualiza) una cuenta del equipo de BUNKER y la da de alta en la tabla staff.
// Uso:
//   npm run equipo:crear                  → la cuenta de prueba de STAFF_TEST_EMAIL / STAFF_TEST_PASSWORD (.env);
//                                           si no existen, las genera y las agrega al .env
//   npm run equipo:crear -- correo@real   → da de alta una cuenta real; la contraseña se genera y se imprime una vez
// Necesita SUPABASE_SECRET_KEY en el .env. Es idempotente: correrlo dos veces no duplica nada.
import { appendFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

process.loadEnvFile('.env');
const url = process.env.PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) {
	console.error('Falta PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY en .env');
	process.exit(1);
}
const admin = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });

const argEmail = process.argv[2];
let email = argEmail ?? process.env.STAFF_TEST_EMAIL;
let password = argEmail ? undefined : process.env.STAFF_TEST_PASSWORD;
const newPassword = () => randomBytes(15).toString('base64url');

if (!email) {
	email = 'equipo@bunker.test';
	password = newPassword();
	appendFileSync(
		'.env',
		`\n# Cuenta de prueba del panel (la creó scripts/crear-equipo.mjs)\nSTAFF_TEST_EMAIL=${email}\nSTAFF_TEST_PASSWORD=${password}\n`
	);
	console.log('Se agregaron STAFF_TEST_EMAIL y STAFF_TEST_PASSWORD al .env');
}
const printPassword = !password;
password ??= newPassword();

// ¿Ya existe? (listUsers pagina de 50; para el PoC basta con buscar en las primeras páginas)
let user = null;
for (let page = 1; page <= 10 && !user; page++) {
	const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 50 });
	if (error) throw error;
	user = data.users.find((u) => u.email === email.toLowerCase()) ?? null;
	if (data.users.length < 50) break;
}

if (user) {
	const { error } = await admin.auth.admin.updateUserById(user.id, { password, email_confirm: true });
	if (error) throw error;
	console.log(`Cuenta existente actualizada: ${email}`);
} else {
	const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
	if (error) throw error;
	user = data.user;
	console.log(`Cuenta creada: ${email}`);
}

const { error: staffError } = await admin.from('staff').upsert({ user_id: user.id });
if (staffError) throw staffError;
console.log('Alta en staff: ok');
if (printPassword) console.log(`Contraseña (guárdala, no se vuelve a mostrar): ${password}`);
