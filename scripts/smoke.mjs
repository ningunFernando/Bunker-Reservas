// Smoke del cupo (Fase 1). Uso:
//   npm run smoke                              → prueba la BD con la llave publicable
//   npm run smoke -- --app http://localhost:5173 → además prueba la form action de la app
//
// Lee el .env. Necesita SUPABASE_SECRET_KEY solo para crear y borrar su propio evento SMOKE;
// las reservas se hacen con la llave publicable, igual que el público.
// Todo lo que crea lleva el prefijo SMOKE y se borra al final (AGENTS.md § 7.3).
import { createClient } from '@supabase/supabase-js';

process.loadEnvFile('.env');
const url = process.env.PUBLIC_SUPABASE_URL;
const publishable = process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !publishable || !secret) {
	console.error('Falta PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY o SUPABASE_SECRET_KEY en .env');
	process.exit(1);
}
const appIndex = process.argv.indexOf('--app');
const appUrl = appIndex > -1 ? process.argv[appIndex + 1] : null;

const opts = { auth: { persistSession: false } };
const admin = createClient(url, secret, opts);
const anon = createClient(url, publishable, opts);

const CAPACITY = 11;
const COVER = 10000;
const phone = (n) => `+525500000${String(n).padStart(3, '0')}`;
const reserve = (eventId, n, party) =>
	anon.rpc('reserve_spots', {
		p_event_id: eventId,
		p_name: `SMOKE ${n}`,
		p_phone: phone(n),
		p_instagram: `smoke_${n}`,
		p_party_size: party
	});

let passed = 0;
let failed = 0;
function check(name, ok, info = '') {
	if (ok) passed++;
	else failed++;
	console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? `  (${info})` : ''}`);
}
async function remainingOf(eventId) {
	const { data, error } = await anon.rpc('events_with_availability');
	if (error) throw error;
	return data.find((e) => e.id === eventId)?.remaining;
}

let eventId;
try {
	const { data: ev, error: evError } = await admin
		.from('events')
		.insert({
			title: 'SMOKE evento',
			starts_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
			cover_cents: COVER,
			capacity: CAPACITY
		})
		.select('id')
		.single();
	if (evError) throw evError;
	eventId = ev.id;

	check('el evento aparece con todos sus lugares', (await remainingOf(eventId)) === CAPACITY);

	const r1 = await reserve(eventId, 1, 3);
	const row1 = r1.data?.[0];
	check(
		'reservar 3 aparta los lugares y calcula el total',
		!r1.error && row1?.remaining === CAPACITY - 3 && row1?.total_cents === 3 * COVER,
		r1.error?.message ?? `quedan ${row1?.remaining}, total ${row1?.total_cents}`
	);
	check('los lugares que quedan bajan', (await remainingOf(eventId)) === CAPACITY - 3);

	const r2 = await reserve(eventId, 2, CAPACITY - 3 + 1);
	check(
		'pasarse del cupo se rechaza con los lugares que quedan',
		r2.error?.message === 'no_capacity' && r2.error?.details === String(CAPACITY - 3),
		`${r2.error?.message} / ${r2.error?.details}`
	);

	const r3 = await reserve(eventId, 3, 0);
	check('0 personas se rechaza', r3.error?.message === 'invalid_party_size', r3.error?.message);

	const r4 = await anon.rpc('reserve_spots', {
		p_event_id: eventId,
		p_name: 'SMOKE 4',
		p_phone: '55 abc',
		p_instagram: 'smoke_4',
		p_party_size: 1
	});
	check('un teléfono que no es E.164 se rechaza', !!r4.error, r4.error?.code);

	const r5 = await anon.rpc('reserve_spots', {
		p_event_id: eventId,
		p_name: 'SMOKE 5',
		p_phone: phone(5),
		p_instagram: 'No Vale!',
		p_party_size: 1
	});
	check('un Instagram inválido se rechaza en la BD', !!r5.error, r5.error?.code);

	const readRes = await anon.from('reservations').select('id');
	const readCus = await anon.from('customers').select('id');
	check(
		'el público no puede leer reservas ni clientes',
		(readRes.data?.length ?? 0) === 0 && (readCus.data?.length ?? 0) === 0,
		`reservas ${readRes.data?.length ?? readRes.error?.code}, clientes ${readCus.data?.length ?? readCus.error?.code}`
	);

	const ins = await anon
		.from('reservations')
		.insert({ event_id: eventId, customer_id: '00000000-0000-0000-0000-000000000000', party_size: 1 });
	check('el público no puede insertar reservas sin reserve_spots()', !!ins.error, ins.error?.code);

	const again = await reserve(eventId, 1, 1);
	const { data: same } = await admin.from('customers').select('instagram').eq('phone', phone(1));
	check(
		'el mismo WhatsApp reutiliza al cliente y guarda su Instagram',
		!again.error && same?.length === 1 && same[0].instagram === 'smoke_1',
		again.error?.message ?? `clientes con ese teléfono: ${same?.length}, instagram ${same?.[0]?.instagram}`
	);

	// 10 reservas de 2 al mismo tiempo con 7 lugares libres: solo caben 3 y queda 1 para la app.
	const parallel = await Promise.all(Array.from({ length: 10 }, (_, i) => reserve(eventId, 10 + i, 2)));
	const ok = parallel.filter((r) => !r.error).length;
	const rejected = parallel.filter((r) => r.error?.message === 'no_capacity').length;
	const left = await remainingOf(eventId);
	check('10 reservas al mismo tiempo no pasan del cupo', ok === 3 && rejected === 7 && left === 1, `${ok} entraron, ${rejected} rechazadas, quedan ${left}`);

	if (appUrl) {
		const body = new FormData();
		body.set('name', 'SMOKE app');
		body.set('phone', '55 0000 0099');
		body.set('instagram', '@SMOKE_App');
		body.set('party_size', '5');
		const res = await fetch(`${appUrl}/eventos/${eventId}`, {
			method: 'POST',
			body,
			headers: { origin: appUrl, accept: 'application/json', 'x-sveltekit-action': 'true' }
		});
		const json = await res.json();
		check('la form action rechaza pasarse del cupo', json.type === 'failure' && json.status === 409, `${json.type} ${json.status}`);

		body.set('party_size', '1');
		const res2 = await fetch(`${appUrl}/eventos/${eventId}`, {
			method: 'POST',
			body,
			headers: { origin: appUrl, accept: 'application/json', 'x-sveltekit-action': 'true' }
		});
		const json2 = await res2.json();
		const { data: appCustomer } = await admin.from('customers').select('phone, instagram').eq('name', 'SMOKE app').single();
		check(
			'la form action reserva y normaliza teléfono e Instagram',
			json2.type === 'success' && appCustomer?.phone === '+525500000099' && appCustomer?.instagram === 'smoke_app',
			`${json2.type} ${json2.status} · ${appCustomer?.phone} · ${appCustomer?.instagram}`
		);
		check('después de la app ya no quedan lugares', (await remainingOf(eventId)) === 0);
	}
} catch (err) {
	failed++;
	console.error('FAIL  error inesperado:', err.message ?? err);
} finally {
	// Limpieza: el evento SMOKE (sus reservas se borran en cascada) y los clientes SMOKE.
	if (eventId) await admin.from('events').delete().eq('id', eventId);
	await admin.from('customers').delete().like('name', 'SMOKE%');
	const { count: evLeft } = await admin.from('events').select('id', { count: 'exact', head: true }).like('title', 'SMOKE%');
	const { count: cuLeft } = await admin.from('customers').select('id', { count: 'exact', head: true }).like('name', 'SMOKE%');
	check('la limpieza no deja datos SMOKE', evLeft === 0 && cuLeft === 0, `eventos ${evLeft}, clientes ${cuLeft}`);
}

console.log(`\n${passed}/${passed + failed} PASS`);
process.exit(failed ? 1 : 0);
