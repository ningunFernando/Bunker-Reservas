<script lang="ts">
	import { enhance } from '$app/forms';
	import { eventDateParts, formatEventDateLong, formatMoney } from '#lib/format.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let pendingId = $state<string | null>(null);

	const statusLabel = { pendiente_pago: 'Pendiente', pagada: 'Pagada', cancelada: 'Cancelada' } as const;

	// "+525512345678" → "55 1234 5678" para leerlo de un vistazo.
	function prettyPhone(phone: string) {
		const local = phone.startsWith('+52') ? phone.slice(3) : phone.replace(/^\+/, '');
		return local.length === 10 ? `${local.slice(0, 2)} ${local.slice(2, 6)} ${local.slice(6)}` : phone;
	}
</script>

<svelte:head>
	<title>Panel del equipo · BUNKER</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="panel">
	<header class="bar">
		<div>
			<h1>Reservas</h1>
			<p class="who">{data.email}</p>
		</div>
		<form method="POST" action="?/logout" use:enhance>
			<button class="btn btn--ghost">Salir</button>
		</form>
	</header>

	{#if form && 'error' in form && form.error === 'not_pending'}
		<p class="notice" role="status">Esa reserva ya no estaba pendiente; recargamos la lista.</p>
	{/if}

	{#if data.events.length === 0}
		<p class="empty">
			No hay eventos próximos. Los eventos se crean por ahora en la base de datos (la migración trae uno de ejemplo).
		</p>
	{/if}

	{#each data.events as event (event.id)}
		{@const when = eventDateParts(event.starts_at)}
		<section class="event" aria-labelledby="ev-{event.id}">
			<div class="event-head">
				<div>
					<h2 id="ev-{event.id}">{event.title}</h2>
					<p class="meta">
						<time datetime={event.starts_at} title={formatEventDateLong(event.starts_at)}
							>{when.weekday} {when.dayMonth} · {when.time}</time
						>
						· Cover {formatMoney(event.cover_cents)}
					</p>
				</div>
				<dl class="stats">
					<div>
						<dt>Ocupados</dt>
						<dd>{event.occupied} <span>de {event.capacity}</span></dd>
					</div>
					<div>
						<dt>Quedan</dt>
						<dd class:zero={event.remaining <= 0}>{event.remaining}</dd>
					</div>
					<div>
						<dt>Pagadas</dt>
						<dd>{event.paid} <span>de {event.active}</span></dd>
					</div>
				</dl>
			</div>

			{#if event.reservations.length === 0}
				<p class="empty">Todavía nadie aparta para este evento. Cuando alguien reserve, aparece aquí con su contacto.</p>
			{:else}
				<table>
					<thead>
						<tr>
							<th scope="col">Nombre</th>
							<th scope="col">Instagram</th>
							<th scope="col">WhatsApp</th>
							<th scope="col" class="num">Personas</th>
							<th scope="col" class="num">Cover</th>
							<th scope="col">Estado</th>
							<th scope="col"><span class="visually-hidden">Acción</span></th>
						</tr>
					</thead>
					<tbody>
						{#each event.reservations as r (r.id)}
							<tr class:cancelled={r.status === 'cancelada'}>
								<td data-label="Nombre" class="name">{r.customers?.name ?? '—'}</td>
								<td data-label="Instagram">
									{#if r.customers?.instagram}
										<a href="https://instagram.com/{r.customers.instagram}" target="_blank" rel="noopener noreferrer"
											>@{r.customers.instagram}</a
										>
									{:else}—{/if}
								</td>
								<td data-label="WhatsApp">
									{#if r.customers?.phone}
										<a href="https://wa.me/{r.customers.phone.replace('+', '')}" target="_blank" rel="noopener noreferrer"
											>{prettyPhone(r.customers.phone)}</a
										>
									{/if}
								</td>
								<td data-label="Personas" class="num">{r.party_size}</td>
								<td data-label="Cover" class="num">{formatMoney(r.party_size * event.cover_cents)}</td>
								<td data-label="Estado">
									<span class="status {r.status}">{statusLabel[r.status]}</span>
								</td>
								<td class="action">
									{#if r.status === 'pendiente_pago'}
										<form
											method="POST"
											action="?/markPaid"
											use:enhance={() => {
												pendingId = r.id;
												return async ({ update }) => {
													await update();
													pendingId = null;
												};
											}}
										>
											<input type="hidden" name="reservation_id" value={r.id} />
											<button class="btn" disabled={pendingId === r.id}>
												{pendingId === r.id ? 'Guardando…' : 'Marcar pagada'}
												<span class="visually-hidden">: {r.customers?.name}</span>
											</button>
										</form>
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			{/if}
		</section>
	{/each}
</div>

<style>
	/* Panel (register product): una sola familia, escala fija, densidad y colores contenidos. */
	.panel {
		display: grid;
		gap: 1.5rem;
		max-width: 72rem;
		padding: 1.5rem clamp(1rem, 3vw, 2rem) 3rem;
		font-size: 1rem;
	}

	.bar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
	}

	h1,
	h2 {
		font-family: var(--font-body);
		font-weight: 700;
		line-height: 1.2;
	}

	h1 {
		font-size: 1.75rem;
	}

	h2 {
		font-size: 1.25rem;
	}

	.who,
	.meta {
		color: var(--muted);
		font-size: 0.9rem;
	}

	.event {
		display: grid;
		gap: 1rem;
		padding: 1.25rem;
		background: var(--ticket);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
	}

	.event-head {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 1rem;
	}

	.stats {
		display: flex;
		gap: 1.5rem;
		margin: 0;
	}

	.stats dt {
		font-size: 0.8rem;
		color: var(--muted);
	}

	.stats dd {
		margin: 0;
		font-size: 1.375rem;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}

	.stats dd span {
		font-size: 0.9rem;
		font-weight: 400;
		color: var(--muted);
	}

	.stats dd.zero {
		color: oklch(0.42 0.14 32);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: 0.95rem;
	}

	th {
		text-align: left;
		font-size: 0.8rem;
		font-weight: 700;
		color: var(--muted);
		padding: 0.5rem;
		border-bottom: 1px solid var(--rule);
	}

	td {
		padding: 0.6rem 0.5rem;
		border-bottom: 1px solid var(--rule);
		vertical-align: middle;
	}

	.num {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.name {
		font-weight: 700;
	}

	td a {
		color: var(--stamp);
		text-underline-offset: 3px;
	}

	tr.cancelled td {
		color: var(--muted);
		text-decoration: line-through;
	}

	.status {
		display: inline-block;
		padding: 0.15rem 0.55rem;
		border-radius: 999px;
		font-size: 0.85rem;
		font-weight: 700;
		border: 1px solid currentColor;
	}

	.status.pendiente_pago {
		color: oklch(0.42 0.11 60);
	}

	.status.pagada {
		background: var(--stamp);
		border-color: var(--stamp);
		color: oklch(1 0 0);
	}

	.status.cancelada {
		color: var(--muted);
	}

	.action {
		text-align: right;
	}

	.btn {
		min-height: 2.5rem;
		padding: 0.4rem 0.9rem;
		border: 1px solid var(--stamp);
		border-radius: var(--radius);
		background: var(--stamp);
		color: oklch(1 0 0);
		font: inherit;
		font-size: 0.9rem;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
		transition: background-color 150ms var(--ease-out);
	}

	.btn:hover {
		background: var(--stamp-deep);
	}

	.btn:disabled {
		opacity: 0.7;
		cursor: progress;
	}

	.btn--ghost {
		background: transparent;
		color: var(--ink);
		border-color: var(--muted);
	}

	.btn--ghost:hover {
		background: oklch(0.21 0.025 55 / 0.06);
	}

	.empty,
	.notice {
		color: var(--muted);
		max-width: 65ch;
	}

	/* En el celular, cada reserva es un bloque con sus etiquetas. */
	@media (max-width: 44rem) {
		thead {
			position: absolute;
			width: 1px;
			height: 1px;
			overflow: hidden;
			clip: rect(0 0 0 0);
		}

		table,
		tbody,
		tr,
		td {
			display: block;
		}

		tr {
			padding: 0.75rem 0;
			border-bottom: 1px solid var(--rule);
		}

		td {
			display: flex;
			justify-content: space-between;
			gap: 1rem;
			padding: 0.2rem 0;
			border: 0;
		}

		td[data-label]::before {
			content: attr(data-label);
			color: var(--muted);
			font-size: 0.85rem;
		}

		.num,
		.action {
			text-align: left;
		}

		.action {
			padding-top: 0.5rem;
		}

		.action form,
		.action .btn {
			width: 100%;
		}
	}
</style>
