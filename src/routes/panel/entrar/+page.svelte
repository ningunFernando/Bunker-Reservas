<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let submitting = $state(false);

	const errorText = $derived(
		form?.error === 'invalid_credentials'
			? 'El correo o la contraseña no coinciden.'
			: form?.error === 'missing'
				? 'Escribe tu correo y tu contraseña.'
				: null
	);
</script>

<svelte:head>
	<title>Entrar al panel · BUNKER</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="wrap">
	<form
		class="card"
		method="POST"
		use:enhance={() => {
			submitting = true;
			return async ({ update }) => {
				await update({ reset: false });
				submitting = false;
			};
		}}
	>
		<h1>Panel del equipo</h1>
		<p class="lead">Solo para el equipo de BUNKER.</p>

		<label for="email">Correo</label>
		<input id="email" name="email" type="email" autocomplete="username" required value={form?.email ?? ''} />

		<label for="password">Contraseña</label>
		<input id="password" name="password" type="password" autocomplete="current-password" required />

		{#if errorText}
			<p class="error" role="alert">{errorText}</p>
		{/if}

		<button class="submit" disabled={submitting}>{submitting ? 'Entrando…' : 'Entrar'}</button>
	</form>
</div>

<style>
	.wrap {
		display: grid;
		place-items: start center;
		padding: 3rem 1rem;
	}

	.card {
		display: grid;
		gap: 0.5rem;
		width: min(100%, 24rem);
		padding: 1.5rem;
		background: var(--ticket);
		border: 1px solid var(--rule);
		border-radius: var(--radius);
	}

	h1 {
		font-family: var(--font-body);
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.2;
	}

	.lead {
		color: var(--muted);
		margin-bottom: 0.5rem;
	}

	label {
		font-weight: 700;
		font-size: 0.95rem;
		margin-top: 0.25rem;
	}

	input {
		font: inherit;
		color: var(--ink);
		background: oklch(1 0 0);
		border: 1px solid var(--muted);
		border-radius: var(--radius);
		padding: 0.6rem 0.75rem;
		min-height: 2.75rem;
	}

	.error {
		color: oklch(0.42 0.14 32);
		font-weight: 700;
	}

	.submit {
		margin-top: 0.75rem;
		min-height: 2.75rem;
		border: 0;
		border-radius: var(--radius);
		background: var(--stamp);
		color: oklch(1 0 0);
		font: inherit;
		font-weight: 700;
		cursor: pointer;
		transition: background-color 150ms var(--ease-out);
	}

	.submit:hover {
		background: var(--stamp-deep);
	}

	.submit:disabled {
		opacity: 0.7;
		cursor: progress;
	}
</style>
