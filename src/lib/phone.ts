// Normaliza un teléfono mexicano a E.164 (+52 y 10 dígitos) para que el mismo
// cliente no se duplique en la base (AGENTS.md § 7.4). Regresa null si no es válido.
export function normalizePhoneMx(input: string): string | null {
	const raw = input.trim();
	const digits = raw.replace(/\D/g, '');

	// Número con lada internacional explícita que no es de México: se respeta tal cual.
	if (raw.startsWith('+') && !digits.startsWith('52')) {
		return digits.length >= 8 && digits.length <= 15 ? `+${digits}` : null;
	}

	if (digits.length === 10) return `+52${digits}`;
	// 52 + 10 dígitos, o el formato viejo de celular 521 + 10 dígitos.
	if (digits.length === 12 && digits.startsWith('52')) return `+${digits}`;
	if (digits.length === 13 && digits.startsWith('521')) return `+52${digits.slice(3)}`;

	return null;
}
