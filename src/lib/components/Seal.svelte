<script lang="ts">
	// El sello de goma de BUNKER: texto en círculo y el cupo al centro.
	let {
		label = 'Bunker · cerveza artesanal · se aparta aquí ·',
		center = '35',
		caption = 'lugares',
		tone = 'stamp',
		size = '8.5rem',
		animate = true
	}: {
		label?: string;
		center?: string;
		caption?: string;
		tone?: 'stamp' | 'red';
		size?: string;
		animate?: boolean;
	} = $props();

	const id = $props.id();
</script>

<svg
	class="seal {tone}"
	class:animate
	viewBox="0 0 200 200"
	style:--size={size}
	aria-hidden="true"
	focusable="false"
>
	<defs>
		<path id="ring-{id}" d="M100,100 m-72,0 a72,72 0 1,1 144,0 a72,72 0 1,1 -144,0" />
	</defs>
	<circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" stroke-width="5" />
	<circle cx="100" cy="100" r="54" fill="none" stroke="currentColor" stroke-width="3" />
	<!-- textLength reparte el texto exacto en la circunferencia (2π·72 ≈ 452), sin encimarse. -->
	<text class="ring">
		<textPath href="#ring-{id}" startOffset="0" textLength="446" lengthAdjust="spacing"
			>{label.toUpperCase()}</textPath
		>
	</text>
	<text class="center" class:long={center.length > 3} x="100" y="108" text-anchor="middle">{center}</text>
	<text class="caption" x="100" y="132" text-anchor="middle">{caption.toUpperCase()}</text>
</svg>

<style>
	.seal {
		width: var(--size);
		height: var(--size);
		color: var(--stamp);
		rotate: -8deg;
		/* Tinta de sello: un poco translúcida, como sobre papel. */
		opacity: 0.92;
		mix-blend-mode: multiply;
	}

	.seal.red {
		color: var(--stamp-red);
		rotate: 7deg;
	}

	.ring {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 16px;
		fill: currentColor;
	}

	.center {
		font-family: var(--font-stencil);
		font-weight: 800;
		font-size: 46px;
		fill: currentColor;
	}

	/* Palabras como "LLENO" no caben a 46px dentro del círculo interior (radio 54). */
	.center.long {
		font-size: 28px;
		translate: 0 -4px;
	}

	.caption {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 14px;
		letter-spacing: 0.14em;
		fill: currentColor;
	}

	/* Se "estampa" una vez al cargar. */
	.animate {
		animation: stamp 520ms var(--ease-out) 200ms both;
	}

	@keyframes stamp {
		from {
			opacity: 0;
			scale: 1.35;
			filter: blur(3px);
		}
		60% {
			opacity: 0.92;
			scale: 0.97;
			filter: blur(0);
		}
		to {
			opacity: 0.92;
			scale: 1;
		}
	}
</style>
