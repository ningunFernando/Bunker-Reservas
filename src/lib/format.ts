// Formatos en es-MX y en la hora de la Ciudad de México (AGENTS.md § 6).
const TIME_ZONE = 'America/Mexico_City';

const money = new Intl.NumberFormat('es-MX', {
	style: 'currency',
	currency: 'MXN',
	minimumFractionDigits: 0,
	maximumFractionDigits: 2
});

export function formatMoney(cents: number): string {
	return money.format(cents / 100);
}

const weekday = new Intl.DateTimeFormat('es-MX', { weekday: 'short', timeZone: TIME_ZONE });
const dayMonth = new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', timeZone: TIME_ZONE });
const time = new Intl.DateTimeFormat('es-MX', {
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
	timeZone: TIME_ZONE
});
const full = new Intl.DateTimeFormat('es-MX', {
	weekday: 'long',
	day: 'numeric',
	month: 'long',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false,
	timeZone: TIME_ZONE
});

const clean = (s: string) => s.replace('.', '');

// "sáb", "7 nov", "20:00"
export function eventDateParts(iso: string) {
	const date = new Date(iso);
	return {
		weekday: clean(weekday.format(date)),
		dayMonth: clean(dayMonth.format(date)),
		time: time.format(date)
	};
}

// "sábado, 7 de noviembre, 20:00"
export function formatEventDateLong(iso: string): string {
	return full.format(new Date(iso));
}
