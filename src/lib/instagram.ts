// Normaliza un usuario de Instagram: sin @, sin la URL del perfil y en minúsculas.
// Instagram acepta letras, números, punto y guion bajo, hasta 30 caracteres. Regresa null si no es válido.
export function normalizeInstagram(input: string): string | null {
	const handle = input
		.trim()
		.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
		.replace(/^@/, '')
		.replace(/\/.*$/, '')
		.toLowerCase();

	return /^[a-z0-9._]{1,30}$/.test(handle) ? handle : null;
}
