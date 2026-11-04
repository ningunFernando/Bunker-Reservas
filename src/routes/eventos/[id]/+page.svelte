<script lang="ts">
	// Página provisional de la Fase 1, parte 1: solo sirve para probar la form action.
	// La interfaz real se construye en la parte 2 con /impeccable craft (AGENTS.md § 7.2).
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<h1>{data.event.title}</h1>
<p>Quedan {data.event.remaining} de {data.event.capacity} lugares.</p>

<form method="POST">
	<label>Nombre <input name="name" required /></label>
	<label>WhatsApp <input name="phone" type="tel" required /></label>
	<label>Personas <input name="party_size" type="number" min="1" required /></label>
	<button>Reservar</button>
</form>

{#if form?.success}
	<p>Reserva lista. Quedan {form.reservation.remaining} lugares.</p>
{:else if form?.error}
	<p>Error: {form.error}</p>
{/if}
