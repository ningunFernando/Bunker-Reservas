<script lang="ts">
	import Seal from '#lib/components/Seal.svelte';
	import SeatMeter from '#lib/components/SeatMeter.svelte';
	import { eventDateParts, formatMoney } from '#lib/format.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const photo = 'https://images.unsplash.com/photo-1687771454203-97d0b08bbeb2?auto=format&fit=crop&q=70';
</script>

<svelte:head>
	<title>BUNKER · Aparta tu lugar</title>
	<meta name="description" content="Eventos de BUNKER, cerveza artesanal. Aparta tu lugar desde el celular." />
</svelte:head>

<section class="hero">
	<div class="label">
		<h1>No se ve desde la calle. <span>Se aparta desde aquí.</span></h1>
		<p class="lede">
			Cerveza artesanal, noches con plan y lugar para 35. Elige el evento, dinos cuántos van y listo.
		</p>
	</div>
	<figure class="photo">
		<div class="seal-wrap">
			<Seal size="clamp(6.5rem, 5rem + 6vw, 9rem)" />
		</div>
		<img
			src="{photo}&w=1200"
			srcset="{photo}&w=640 640w, {photo}&w=1000 1000w, {photo}&w=1600 1600w"
			sizes="(min-width: 56rem) 55vw, 100vw"
			width="1600"
			height="1067"
			alt="Tablero de cata con cinco cervezas, de la más clara a la más oscura, sobre la barra."
			fetchpriority="high"
		/>
	</figure>
</section>

<section class="events" aria-labelledby="eventos-titulo">
	<h2 id="eventos-titulo">Lo que viene</h2>

	{#if data.events.length === 0}
		<p class="empty">No hay eventos en puerta. Date una vuelta pronto: aquí avisamos.</p>
	{:else}
		<ol class="tickets">
			{#each data.events as event (event.id)}
				{@const when = eventDateParts(event.starts_at)}
				{@const soldOut = event.remaining <= 0}
				<li class="ticket" class:sold-out={soldOut}>
					<div class="stub">
						<span class="weekday">{when.weekday}</span>
						<span class="day">{when.dayMonth}</span>
						<span class="time">{when.time}</span>
					</div>
					<div class="body">
						<h3>{event.title}</h3>
						{#if event.description}<p class="desc">{event.description}</p>{/if}
						<p class="cover">
							Cover <strong>{formatMoney(event.cover_cents)}</strong> por persona
						</p>
						<SeatMeter capacity={event.capacity} remaining={event.remaining} />
						{#if soldOut}
							<p class="full-note">Este ya se llenó. Échale ojo al siguiente.</p>
						{:else}
							<a class="button" href="/eventos/{event.id}">
								Apartar lugares <span class="visually-hidden">para {event.title}</span>
							</a>
						{/if}
					</div>
					{#if soldOut}
						<div class="full-seal">
							<Seal
								tone="red"
								center="LLENO"
								caption="sin lugares"
								label="Bunker · sin lugares · hasta la próxima ·"
								size="6.5rem"
								animate={false}
							/>
						</div>
					{/if}
				</li>
			{/each}
		</ol>
	{/if}
</section>

<style>
	.hero {
		display: grid;
		border-bottom: 2px solid var(--ink);
	}

	.label {
		position: relative;
		display: grid;
		gap: var(--space-m);
		align-content: center;
		padding: var(--space-l) clamp(1rem, 4vw, 3rem) var(--space-xl);
	}

	h1 {
		font-size: var(--step-4);
		max-width: 11ch;
	}

	h1 span {
		display: block;
		color: var(--stamp);
	}

	.lede {
		max-width: 38ch;
		font-size: var(--step-1);
		line-height: 1.45;
	}

	/* El sello queda estampado sobre la orilla de la foto, sin tapar el texto. */
	.seal-wrap {
		position: absolute;
		right: clamp(0.5rem, 3vw, 2rem);
		top: calc(var(--space-xl) * -0.9);
		z-index: 1;
	}

	.photo {
		position: relative;
		margin: 0;
		border-top: 2px solid var(--ink);
		aspect-ratio: 4 / 3;
		background: var(--kraft-deep);
	}

	.photo img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	@media (min-width: 56rem) {
		.hero {
			grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
			min-height: min(82vh, 46rem);
		}

		.photo {
			border-top: 0;
			border-left: 2px solid var(--ink);
			aspect-ratio: auto;
		}

		/* En escritorio el sello queda dentro de la foto, en la esquina de abajo. */
		.seal-wrap {
			top: auto;
			right: auto;
			left: var(--space-l);
			bottom: var(--space-l);
		}
	}

	.events {
		display: grid;
		gap: var(--space-l);
		padding: var(--space-xl) clamp(1rem, 4vw, 3rem);
		max-width: 64rem;
	}

	.events h2 {
		font-size: var(--step-3);
	}

	.empty {
		font-size: var(--step-1);
		max-width: 40ch;
	}

	.tickets {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		gap: var(--space-l);
	}

	/* El boleto: talón con la fecha, línea perforada y el cuerpo. */
	.ticket {
		position: relative;
		display: grid;
		grid-template-columns: 1fr;
		background: var(--ticket);
		border: 2px solid var(--ink);
		border-radius: var(--radius);
		box-shadow: 4px 4px 0 var(--ink);
	}

	.stub {
		display: flex;
		align-items: baseline;
		gap: var(--space-s);
		padding: var(--space-s) var(--space-m);
		border-bottom: 2px dashed var(--ink);
		font-family: var(--font-display);
		font-weight: 800;
		text-transform: uppercase;
		line-height: 1;
	}

	.weekday,
	.time {
		font-size: var(--step-1);
	}

	.day {
		font-size: var(--step-2);
	}

	.body {
		display: grid;
		gap: var(--space-s);
		justify-items: start;
		padding: var(--space-m);
	}

	.body h3 {
		font-size: var(--step-3);
	}

	.desc {
		color: var(--muted);
		max-width: 52ch;
	}

	.cover strong {
		font-family: var(--font-display);
		font-size: var(--step-1);
	}

	.body :global(.meter) {
		width: 100%;
	}

	.body .button {
		margin-top: var(--space-xs);
	}

	.full-note {
		font-weight: 700;
	}

	.full-seal {
		position: absolute;
		top: var(--space-xs);
		right: var(--space-xs);
	}

	@media (min-width: 40rem) {
		.ticket {
			grid-template-columns: 9rem 1fr;
		}

		.stub {
			flex-direction: column;
			align-items: flex-start;
			gap: var(--space-xs);
			padding: var(--space-m);
			border-bottom: 0;
			border-right: 2px dashed var(--ink);
		}

		.day {
			font-size: var(--step-3);
		}
	}
</style>
