<script lang="ts">
	import { enhance } from '$app/forms';
	import Seal from '#lib/components/Seal.svelte';
	import SeatMeter from '#lib/components/SeatMeter.svelte';
	import { formatEventDateLong, formatMoney } from '#lib/format.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const event = $derived(data.event);
	const soldOut = $derived(event.remaining <= 0);

	let party = $state(2);
	let submitting = $state(false);
	let showPaymentNote = $state(false);

	// Nunca ofrecer más lugares de los que quedan.
	const maxParty = $derived(Math.max(1, event.remaining));
	$effect(() => {
		if (party > maxParty) party = maxParty;
	});

	const total = $derived(party * event.cover_cents);

	// Los errores, con la voz de BUNKER.
	const errorText = $derived.by(() => {
		if (!form || !('error' in form) || !form.error) return null;
		switch (form.error) {
			case 'missing_name':
				return '¿A nombre de quién apartamos?';
			case 'invalid_instagram':
				return 'Ese Instagram no nos cuadra. Ponlo como @tu_usuario.';
			case 'invalid_phone':
				return 'Ese WhatsApp no nos cuadra. Ponlo a 10 dígitos, como 55 1234 5678.';
			case 'invalid_party_size':
				return 'Dinos cuántos vienen: mínimo 1.';
			case 'no_capacity': {
				const left = 'remaining' in form ? Number(form.remaining) : 0;
				return left > 0
					? `Ya no caben ${form.party_size}. Quedan ${left}: ¿le bajamos?`
					: 'Se nos llenó justo ahora. Ya no quedan lugares.';
			}
			case 'event_not_found':
			case 'event_past':
				return 'Este evento ya no está disponible.';
			default:
				return 'Algo se trabó de nuestro lado. Intenta otra vez en un momento.';
		}
	});

	const success = $derived(form && 'success' in form && form.success ? form : null);
</script>

<svelte:head>
	<title>{event.title} · BUNKER</title>
</svelte:head>

<article class="page">
	<a class="back" href="/">← Todos los eventos</a>

	<header class="event-head">
		<p class="when">{formatEventDateLong(event.starts_at)}</p>
		<h1>{event.title}</h1>
		{#if event.description}<p class="desc">{event.description}</p>{/if}
		<p class="cover">Cover <strong>{formatMoney(event.cover_cents)}</strong> por persona</p>
		<SeatMeter capacity={event.capacity} remaining={event.remaining} />
	</header>

	{#if success}
		<section class="ticket confirmed" aria-live="polite" aria-labelledby="listo">
			<div class="seal">
				<Seal center="OK" caption="apartado" label="Bunker · reserva apartada · nos vemos ·" size="7rem" />
			</div>
			<h2 id="listo" tabindex="-1">Listo, {success.name}.</h2>
			<p>
				Te apartamos <strong>{success.partySize} {success.partySize === 1 ? 'lugar' : 'lugares'}</strong> para
				{event.title}.
			</p>
			<dl class="summary">
				<div>
					<dt>Cover total</dt>
					<dd>{formatMoney(success.reservation.total_cents)}</dd>
				</div>
				<div>
					<dt>Estado</dt>
					<dd>Pendiente de pago</dd>
				</div>
			</dl>
			<button class="button" type="button" onclick={() => (showPaymentNote = true)}>
				Pagar {formatMoney(success.reservation.total_cents)} de cover
			</button>
			{#if showPaymentNote}
				<p class="demo-note" role="status">
					Esto es un ejemplo: en la versión real aquí se abre el link de pago de la fintech de BUNKER, y el equipo ve
					tu pago en su panel.
				</p>
			{/if}
			<a class="button button--quiet" href="/">Ver otros eventos</a>
		</section>
	{:else if soldOut}
		<section class="ticket">
			<div class="seal">
				<Seal
					tone="red"
					center="LLENO"
					caption="sin lugares"
					label="Bunker · sin lugares · hasta la próxima ·"
					size="7rem"
					animate={false}
				/>
			</div>
			<h2>Este ya se llenó.</h2>
			<p>Échale ojo al siguiente evento; luego luego se aparta.</p>
			<a class="button" href="/">Ver otros eventos</a>
		</section>
	{:else}
		<form
			class="ticket"
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					await update({ reset: false });
					submitting = false;
				};
			}}
		>
			<h2>Aparta tu lugar</h2>

			<div class="field">
				<label for="name">¿A nombre de quién?</label>
				<input id="name" name="name" autocomplete="name" required maxlength="120" value={form?.name ?? ''} />
			</div>

			<div class="field">
				<label for="instagram">Tu Instagram</label>
				<div class="prefixed">
					<span aria-hidden="true">@</span>
					<input
						id="instagram"
						name="instagram"
						autocomplete="username"
						autocapitalize="none"
						spellcheck="false"
						required
						maxlength="60"
						placeholder="tu_usuario"
						aria-describedby="instagram-help"
						value={form?.instagram ?? ''}
					/>
				</div>
				<p id="instagram-help" class="help">Tu usuario, con o sin @.</p>
			</div>

			<div class="field">
				<label for="phone">Tu WhatsApp</label>
				<input
					id="phone"
					name="phone"
					type="tel"
					inputmode="tel"
					autocomplete="tel"
					required
					placeholder="55 1234 5678"
					aria-describedby="phone-help"
					value={form?.phone ?? ''}
				/>
				<p id="phone-help" class="help">A 10 dígitos.</p>
			</div>

			<fieldset class="field party">
				<legend>¿Cuántos van?</legend>
				<div class="stepper">
					<button
						type="button"
						class="step"
						onclick={() => (party = Math.max(1, party - 1))}
						disabled={party <= 1}
						aria-label="Uno menos">−</button
					>
					<input
						name="party_size"
						type="number"
						inputmode="numeric"
						min="1"
						max={maxParty}
						bind:value={party}
						aria-label="Personas"
					/>
					<button
						type="button"
						class="step"
						onclick={() => (party = Math.min(maxParty, party + 1))}
						disabled={party >= maxParty}
						aria-label="Uno más">+</button
					>
				</div>
				<p class="total" aria-live="polite">
					{party} × {formatMoney(event.cover_cents)} = <strong>{formatMoney(total)}</strong> de cover
				</p>
			</fieldset>

			{#if errorText}
				<p class="error" role="alert">{errorText}</p>
			{/if}

			<button class="button submit" disabled={submitting}>
				{submitting ? 'Apartando…' : `Apartar ${party} ${party === 1 ? 'lugar' : 'lugares'}`}
			</button>
			<p class="fine">El cover se paga después de apartar. Tus datos solo se usan para tu reserva.</p>
		</form>
	{/if}
</article>

<style>
	.page {
		display: grid;
		gap: var(--space-l);
		max-width: 40rem;
		padding: var(--space-l) clamp(1rem, 4vw, 3rem) var(--space-xl);
	}

	.back {
		font-weight: 700;
		text-underline-offset: 3px;
		min-height: 2.75rem;
		display: inline-flex;
		align-items: center;
		justify-self: start;
	}

	.event-head {
		display: grid;
		gap: var(--space-s);
	}

	.when {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--step-1);
		text-transform: uppercase;
		color: var(--stamp);
	}

	h1 {
		font-size: var(--step-4);
	}

	.desc {
		color: var(--muted);
	}

	.cover strong {
		font-family: var(--font-display);
		font-size: var(--step-1);
	}

	.ticket {
		position: relative;
		display: grid;
		gap: var(--space-m);
		padding: var(--space-l) var(--space-m);
		background: var(--ticket);
		border: 2px solid var(--ink);
		border-radius: var(--radius);
		box-shadow: 4px 4px 0 var(--ink);
	}

	.ticket h2 {
		font-size: var(--step-3);
	}

	/* Solo cuando hay sello: deja espacio para que no tape el título. */
	.ticket:has(.seal) h2 {
		padding-right: 5.5rem;
	}

	.seal {
		position: absolute;
		top: calc(var(--space-m) * -1.5);
		right: calc(var(--space-s) * -0.5);
	}

	.field {
		display: grid;
		gap: var(--space-2xs);
		margin: 0;
		padding: 0;
		border: 0;
	}

	label,
	legend {
		font-weight: 700;
		padding: 0;
	}

	input {
		font: inherit;
		color: var(--ink);
		background: oklch(1 0 0);
		border: 2px solid var(--ink);
		border-radius: var(--radius);
		padding: 0.65rem 0.8rem;
		min-height: 3rem;
		width: 100%;
	}

	input::placeholder {
		color: var(--muted);
	}

	/* Campo de Instagram con la @ fija a la izquierda. */
	.prefixed {
		position: relative;
	}

	.prefixed span {
		position: absolute;
		left: 0.85rem;
		top: 50%;
		translate: 0 -50%;
		font-weight: 700;
		color: var(--muted);
		pointer-events: none;
	}

	.prefixed input {
		padding-left: 2rem;
	}

	.help,
	.fine {
		font-size: var(--step--1);
		color: var(--muted);
	}

	.stepper {
		display: grid;
		grid-template-columns: 3rem 5rem 3rem;
		gap: var(--space-xs);
		align-items: center;
	}

	.stepper input {
		text-align: center;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--step-2);
		padding: 0.3rem;
		-moz-appearance: textfield;
		appearance: textfield;
	}

	.stepper input::-webkit-outer-spin-button,
	.stepper input::-webkit-inner-spin-button {
		-webkit-appearance: none;
		margin: 0;
	}

	.step {
		width: 3rem;
		height: 3rem;
		border: 2px solid var(--ink);
		border-radius: 50%;
		background: var(--kraft);
		color: var(--ink);
		font-size: var(--step-2);
		line-height: 1;
		cursor: pointer;
	}

	.step:disabled {
		opacity: 0.35;
		cursor: not-allowed;
	}

	.total {
		margin-top: var(--space-xs);
	}

	.total strong {
		font-family: var(--font-display);
		font-size: var(--step-1);
	}

	.error {
		padding: var(--space-s) var(--space-m);
		border: 2px solid var(--stamp-red);
		border-radius: var(--radius);
		background: var(--stamp-red);
		color: oklch(1 0 0);
		font-weight: 700;
	}

	.submit {
		width: 100%;
	}

	.confirmed h2:focus {
		outline: none;
	}

	.summary {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
		gap: var(--space-s);
		margin: 0;
		padding: var(--space-s) 0;
		border-top: 2px dashed var(--ink);
		border-bottom: 2px dashed var(--ink);
	}

	.summary dt {
		font-size: var(--step--1);
		color: var(--muted);
	}

	.summary dd {
		margin: 0;
		font-family: var(--font-display);
		font-weight: 800;
		font-size: var(--step-2);
	}

	.demo-note {
		padding: var(--space-s) var(--space-m);
		border: 2px dashed var(--stamp);
		border-radius: var(--radius);
	}
</style>
