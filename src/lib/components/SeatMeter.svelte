<script lang="ts">
	// Los lugares como perforaciones de un boleto: llenas = apartadas, huecas = libres.
	// Para lectores de pantalla solo cuenta el texto; las marcas son decoración.
	let { capacity, remaining }: { capacity: number; remaining: number } = $props();

	const taken = $derived(Math.max(0, capacity - remaining));
	const seats = $derived(Array.from({ length: capacity }, (_, i) => i < taken));
	const low = $derived(remaining > 0 && remaining <= Math.max(3, Math.round(capacity * 0.15)));
</script>

<div class="meter">
	<div class="holes" aria-hidden="true" style:--count={capacity}>
		{#each seats as isTaken, i (i)}
			<span class="hole" class:taken={isTaken}></span>
		{/each}
	</div>
	<p class="count" class:low>
		{#if remaining === 0}
			Ya no quedan lugares
		{:else}
			<strong>Quedan {remaining}</strong> de {capacity} lugares
		{/if}
	</p>
</div>

<style>
	.meter {
		display: grid;
		gap: var(--space-xs);
	}

	.holes {
		display: grid;
		grid-template-columns: repeat(var(--count), minmax(0, 1fr));
		gap: clamp(2px, 0.6vw, 4px);
		/* Cada perforación mide a lo mucho ~1rem: con cupos chicos no se vuelven círculos gigantes. */
		max-width: min(32rem, calc(var(--count) * 1rem));
	}

	.hole {
		aspect-ratio: 1;
		border-radius: 50%;
		border: 1.5px solid var(--ink);
	}

	.hole.taken {
		background: var(--ink);
	}

	.count {
		font-size: var(--step--1);
		color: var(--muted);
	}

	.count strong {
		color: var(--ink);
	}

	/* Pocos lugares: el rojo va como subrayado, nunca como texto (2.7:1 sobre kraft). */
	.count.low strong {
		font-family: var(--font-display);
		font-size: var(--step-1);
		text-decoration: underline 3px var(--stamp-red);
		text-underline-offset: 4px;
	}
</style>
