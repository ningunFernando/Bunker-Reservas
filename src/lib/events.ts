import { supabase } from '#lib/supabase.js';

export type EventWithAvailability = {
	id: string;
	title: string;
	description: string | null;
	starts_at: string;
	cover_cents: number;
	capacity: number;
	remaining: number;
};

// Eventos próximos con los lugares que quedan (función events_with_availability de la BD).
export async function listEvents(): Promise<EventWithAvailability[]> {
	const { data, error } = await supabase.rpc('events_with_availability');
	if (error) throw new Error(`No se pudieron leer los eventos: ${error.message}`);
	return (data ?? []) as EventWithAvailability[];
}

export async function getEvent(id: string): Promise<EventWithAvailability | null> {
	const events = await listEvents();
	return events.find((event) => event.id === id) ?? null;
}
