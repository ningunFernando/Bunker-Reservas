// Smoke del panel del equipo (Fase 2), por HTTP contra la app corriendo:
//   npm run smoke:panel -- --app http://localhost:5173
// Usa la cuenta de prueba (STAFF_TEST_EMAIL / STAFF_TEST_PASSWORD, ver `npm run equipo:crear`) y SUPABASE_SECRET_KEY
// para preparar y borrar sus datos. Todo lo que crea lleva SMOKE y se borra al final, incluida la cuenta que no es
// del equipo.
import { randomBytes } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

process.loadEnvFile('.env');
const { PUBLIC_SUPABASE_URL: url, PUBLIC_SUPABASE_PUBLISHABLE_KEY: publishable, SUPABASE_SECRET_KEY: secret } =
	process.env;
const staffEmail = process.env.STAFF_TEST_EMAIL;
const staffPassword = process.env.STAFF_TEST_PASSWORD;
const appIndex = process.argv.indexOf('--app');
const app = appIndex > -1 ? process.argv[appIndex + 1] : null;
if (!url || !publishable || !secret || !staffEmail || !staffPassword || !app) {
	console.error('Faltan variables en .env (corre `npm run equipo:crear`) o el --app <url>.');
	process.exit(1);
}

const opts = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(url, secret, opts);
const anon = createClient(url, publishable, opts);

let passed = 0;
let failed = 0;
function check(name, ok, info = '') {
	if (ok) passed++;
	else failed++;
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? `  (${info})` : ''}`);
}

// Un "navegador" mínimo: guarda las cookies que pone el servidor y las manda de vuelta.
function browser() {
	const jar = new Map();
	const absorb = (res) => {
		for (const raw of res.headers.getSetCookie()) {
			const [pair, ...attrs] = raw.split(';');
			const name = pair.slice(0, pair.indexOf('='));
			const value = pair.slice(pair.indexOf('=') + 1);
			const expired = attrs.some((a) => /max-age=0/i.test(a.trim())) || value === '';
			if (expired) jar.delete(name);
			else jar.set(name, value);
		}
	};
	const cookie = () => [...jar].map(([k, v]) => `${k}=${v}`).join('; ');
	return {
		jar,
		async get(path) {
			const res = await fetch(app + path, { redirect: 'manual', headers: { cookie: cookie() } });
			absorb(res);
			return res;
		},
		async action(path, fields) {
			const body = new FormData();
			for (const [k, v] of Object.entries(fields)) body.set(k, v);
			const res = await fetch(app + path, {
				method: 'POST',
				body,
				headers: { cookie: cookie(), origin: app, accept: 'application/json', 'x-sveltekit-action': 'true' }
			});
			absorb(res);
			return res.json();
		}
	};
}

let eventId;
let outsiderId;
try {
	const staff = browser();

	const r0 = await staff.get('/panel');
	check(
		'sin sesión, /panel manda a entrar',
		r0.status === 303 && r0.headers.get('location') === '/panel/entrar',
		`${r0.status} → ${r0.headers.get('location')}`
	);

	const bad = await staff.action('/panel/entrar', { email: staffEmail, password: 'no-es-la-contraseña' });
	check('una contraseña equivocada no entra', bad.type === 'failure' && bad.status === 400, `${bad.type} ${bad.status}`);

	const ok = await staff.action('/panel/entrar', { email: staffEmail, password: staffPassword });
	check(
		'el equipo entra y recibe su sesión',
		ok.type === 'redirect' && ok.location === '/panel' && [...staff.jar.keys()].some((k) => k.includes('auth-token')),
		`${ok.type} ${ok.location ?? ''} · cookies: ${staff.jar.size}`
	);

	// Datos: un evento SMOKE con una reserva hecha por el público.
	const { data: ev, error: evError } = await admin
		.from('events')
		.insert({ title: 'SMOKE panel', starts_at: new Date(Date.now() + 864e5).toISOString(), cover_cents: 12000, capacity: 10 })
		.select('id')
		.single();
	if (evError) throw evError;
	eventId = ev.id;
	const res = await anon.rpc('reserve_spots', {
		p_event_id: eventId,
		p_name: 'SMOKE panel',
		p_phone: '+525500000888',
		p_instagram: 'smoke_panel',
		p_party_size: 2
	});
	if (res.error) throw res.error;
	const reservationId = res.data[0].reservation_id;

	const page = await staff.get('/panel');
	const html = await page.text();
	check(
		'el panel muestra la reserva con su contacto',
		page.status === 200 && html.includes('SMOKE panel') && html.includes('@smoke_panel') && html.includes('55 0000 0888'),
		`${page.status}`
	);
	// Dentro de la sección del evento SMOKE: "Ocupados</dt> <dd class=…>2 <span…>de 10" y "Quedan … 8".
	const section = html.slice(html.indexOf('SMOKE panel')).replace(/<!--.*?-->/g, '');
	const occupied = section.match(/Ocupados<\/dt>\s*<dd[^>]*>(\d+)/)?.[1];
	const left = section.match(/Quedan<\/dt>\s*<dd[^>]*>(\d+)/)?.[1];
	check('el panel cuenta los lugares ocupados y los que quedan', occupied === '2' && left === '8', `ocupados ${occupied}, quedan ${left}`);

	const paid = await staff.action('/panel?/markPaid', { reservation_id: reservationId });
	const { data: row } = await admin.from('reservations').select('status').eq('id', reservationId).single();
	check('marcar pagada cambia el estado en la BD', paid.type === 'success' && row?.status === 'pagada', `${paid.type} · ${row?.status}`);

	const again = await staff.action('/panel?/markPaid', { reservation_id: reservationId });
	check('marcar pagada dos veces no hace nada', again.type === 'failure' && again.status === 409, `${again.type} ${again.status}`);

	// Una cuenta que no es del equipo: entra a Supabase, pero no ve ni cambia nada.
	const outsiderEmail = `smoke-${randomBytes(4).toString('hex')}@bunker.test`;
	const outsiderPassword = randomBytes(15).toString('base64url');
	const { data: created, error: createError } = await admin.auth.admin.createUser({
		email: outsiderEmail,
		password: outsiderPassword,
		email_confirm: true
	});
	if (createError) throw createError;
	outsiderId = created.user.id;

	const outsider = browser();
	await outsider.action('/panel/entrar', { email: outsiderEmail, password: outsiderPassword });
	const denied = await outsider.get('/panel');
	check('una cuenta que no es del equipo no ve el panel', denied.status === 403, `${denied.status}`);

	const direct = createClient(url, publishable, opts);
	await direct.auth.signInWithPassword({ email: outsiderEmail, password: outsiderPassword });
	const { data: peek } = await direct.from('customers').select('id');
	const { data: touched } = await direct.from('reservations').update({ status: 'cancelada' }).eq('id', reservationId).select('id');
	check(
		'ni por la API lee clientes ni cambia reservas',
		(peek?.length ?? 0) === 0 && (touched?.length ?? 0) === 0,
		`clientes ${peek?.length ?? 0}, cambiadas ${touched?.length ?? 0}`
	);

	const out = await staff.action('/panel?/logout', {});
	const after = await staff.get('/panel');
	check('salir cierra la sesión', out.type === 'redirect' && after.status === 303, `${out.type} · después ${after.status}`);
} catch (err) {
	failed++;
	console.error('FAIL  error inesperado:', err.message ?? err);
} finally {
	if (eventId) await admin.from('events').delete().eq('id', eventId);
	await admin.from('customers').delete().like('name', 'SMOKE%');
	if (outsiderId) await admin.auth.admin.deleteUser(outsiderId);
	const { count: ev } = await admin.from('events').select('id', { count: 'exact', head: true }).like('title', 'SMOKE%');
	const { count: cu } = await admin.from('customers').select('id', { count: 'exact', head: true }).like('name', 'SMOKE%');
	const { data: users } = await admin.auth.admin.listUsers({ perPage: 200 });
	const leftover = users?.users.filter((u) => u.email?.startsWith('smoke-')).length ?? -1;
	check('la limpieza no deja datos ni cuentas SMOKE', ev === 0 && cu === 0 && leftover === 0, `eventos ${ev}, clientes ${cu}, cuentas ${leftover}`);
}

console.log(`\n${passed}/${passed + failed} PASS`);
process.exit(failed ? 1 : 0);
