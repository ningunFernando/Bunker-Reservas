<script lang="ts">
	import '../app.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<a class="skip" href="#contenido">Saltar al contenido</a>

<header class="top">
	<a class="wordmark" href="/" aria-label="BUNKER, inicio">BUNKER</a>
</header>

<main id="contenido">
	{@render children()}
</main>

<footer class="foot">
	<details>
		<summary>Aviso de privacidad <span>(texto de ejemplo)</span></summary>
		<p>
			Con tu nombre, tu Instagram y tu WhatsApp apartamos tu lugar y te avisamos de tu reserva. No los usamos para
			otra cosa ni los compartimos. Este texto es un ejemplo para la demo; el aviso real lo define BUNKER.
		</p>
	</details>
	<p class="credit">Foto de portada: Unsplash (ilustrativa, no es BUNKER).</p>
</footer>

<style>
	.skip {
		position: absolute;
		left: var(--space-s);
		top: -4rem;
		padding: var(--space-xs) var(--space-s);
		background: var(--ink);
		color: var(--kraft);
		border-radius: var(--radius);
		z-index: var(--z-sticky);
	}

	.skip:focus {
		top: var(--space-s);
	}

	.top {
		padding: var(--space-s) clamp(1rem, 4vw, 3rem);
		border-bottom: 2px solid var(--ink);
	}

	.wordmark {
		font-family: var(--font-stencil);
		font-weight: 800;
		font-size: var(--step-2);
		letter-spacing: 0.06em;
		text-decoration: none;
		line-height: 1;
	}

	main {
		min-height: 70vh;
	}

	.foot {
		display: grid;
		gap: var(--space-s);
		padding: var(--space-l) clamp(1rem, 4vw, 3rem);
		border-top: 2px solid var(--ink);
		background: var(--kraft-deep);
		font-size: var(--step--1);
	}

	details {
		max-width: 60ch;
	}

	summary {
		cursor: pointer;
		font-weight: 700;
		min-height: 2.75rem;
		display: flex;
		align-items: center;
		gap: 0.35em;
	}

	summary span {
		font-weight: 400;
	}

	.credit {
		color: var(--ink);
	}
</style>
