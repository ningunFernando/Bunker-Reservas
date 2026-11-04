import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

type Row = {
	id: string;
	title: string;
	starts_at: string;
	cover_cents: number;
	capacity: number;
	reservations: {
		id: string;
		party_size: number;
		status: 'pendiente_pago' | 'pagada' | 'cancelada';
		created_at: string;
		customers: { name: string; phone: string; instagram: string | null } | null;
	}[];
};

// Solo entra una cuenta que esté en la tabla staff (RLS de la BD, AGENTS.md § 7.4).
async function requireStaff(locals: App.Locals) {
	const user = await locals.getUser();
	if (!user) redirect(303, '/panel/entrar');
	const { data: isStaff } = await locals.supabase.rpc('is_staff');
	if (!isStaff) error(403, 'Tu cuenta no es del equipo de BUNKER.');
	return user;
}

export const load: PageServerLoad = async ({ locals }) => {
	const user = await requireStaff(locals);

	const { data, error: dbError } = await locals.supabase
		.from('events')
		.select(
			'id, title, starts_at, cover_cents, capacity, reservations(id, party_size, status, created_at, customers(name, phone, instagram))'
		)
		.gte('starts_at', new Date(Date.now() - 12 * 3600 * 1000).toISOString())
		.order('starts_at');
	if (dbError) error(500, `No se pudieron leer las reservas: ${dbError.message}`);

	const events = (data as unknown as Row[]).map((event) => {
		const active = event.reservations.filter((r) => r.status !== 'cancelada');
		const occupied = active.reduce((sum, r) => sum + r.party_size, 0);
		return {
			...event,
			reservations: [...event.reservations].sort((a, b) => a.created_at.localeCompare(b.created_at)),
			occupied,
			remaining: event.capacity - occupied,
			paid: active.filter((r) => r.status === 'pagada').length,
			active: active.length
		};
	});

	return { email: user.email ?? '', events };
};

export const actions: Actions = {
	markPaid: async ({ request, locals }) => {
		await requireStaff(locals);
		const id = String((await request.formData()).get('reservation_id') ?? '');
		if (!id) return fail(400, { error: 'missing_id' as const });

		// RLS: solo el equipo puede actualizar reservas. Pedimos la fila de vuelta para confirmar que cambió.
		const { data, error: dbError } = await locals.supabase
			.from('reservations')
			.update({ status: 'pagada' })
			.eq('id', id)
			.eq('status', 'pendiente_pago')
			.select('id');
		if (dbError) return fail(500, { error: 'unexpected' as const });
		if (!data?.length) return fail(409, { error: 'not_pending' as const, id });
		return { paidId: id };
	},

	logout: async ({ locals }) => {
		await locals.supabase.auth.signOut();
		redirect(303, '/panel/entrar');
	}
};
