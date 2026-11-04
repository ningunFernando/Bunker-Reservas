import { error, fail } from '@sveltejs/kit';
import { supabase } from '#lib/supabase.js';
import { getEvent } from '#lib/events.js';
import { normalizePhoneMx } from '#lib/phone.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const event = await getEvent(params.id);
	if (!event) error(404, 'Ese evento no existe o ya pasó.');
	return { event };
};

export const actions: Actions = {
	// Reserva N lugares. El cupo lo garantiza reserve_spots() en la BD, no este código.
	default: async ({ params, request }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const phoneInput = String(form.get('phone') ?? '');
		const partySize = Number(form.get('party_size'));
		const values = { name, phone: phoneInput, party_size: String(form.get('party_size') ?? '') };

		if (!name) return fail(400, { ...values, error: 'missing_name' as const });
		const phone = normalizePhoneMx(phoneInput);
		if (!phone) return fail(400, { ...values, error: 'invalid_phone' as const });
		if (!Number.isInteger(partySize) || partySize < 1) {
			return fail(400, { ...values, error: 'invalid_party_size' as const });
		}

		const { data, error: rpcError } = await supabase.rpc('reserve_spots', {
			p_event_id: params.id,
			p_name: name,
			p_phone: phone,
			p_party_size: partySize
		});

		if (rpcError) {
			switch (rpcError.message) {
				case 'no_capacity':
					return fail(409, {
						...values,
						error: 'no_capacity' as const,
						remaining: Number(rpcError.details)
					});
				case 'event_not_found':
				case 'event_past':
					return fail(404, { ...values, error: rpcError.message });
				case 'invalid_party_size':
					return fail(400, { ...values, error: 'invalid_party_size' as const });
				default:
					console.error('reserve_spots falló', rpcError);
					return fail(500, { ...values, error: 'unexpected' as const });
			}
		}

		const [reservation] = data as { reservation_id: string; remaining: number; total_cents: number }[];
		return { success: true as const, reservation, partySize };
	}
};
