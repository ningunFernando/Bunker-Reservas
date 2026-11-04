import { listEvents } from '#lib/events.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { events: await listEvents() };
};
