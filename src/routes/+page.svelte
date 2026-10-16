<script lang="ts">
	import { tick } from 'svelte';
	import RecipeCard from '#lib/components/RecipeCard/RecipeCard.svelte';
	import { recipes } from '#lib/recipes.ts';

	let printing = $state<string | null>(null);
	let active = $state<string | null>(null);

	let observer: IntersectionObserver | undefined;

	function trackVisible(node: HTMLElement): () => void {
		observer ??= new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) active = entry.target.id;
				}
			},
			{ rootMargin: '-50% 0px -50% 0px' }
		);
		observer.observe(node);
		return () => observer?.unobserve(node);
	}

	async function printRecipe(slug: string): Promise<void> {
		printing = slug;
		await tick();
		window.print();
	}
</script>

<svelte:head>
	<title>Mammas oppskrifter</title>
</svelte:head>

<svelte:window onafterprint={() => (printing = null)} />

<div class="site">
	<nav class="contents" aria-label="Innhold">
		<p class="contents-label">Innhold</p>
		<ol>
			{#each recipes as recipe, index (recipe.slug)}
				<li>
					<a
						href="#{recipe.slug}"
						class:active={active === recipe.slug}
						aria-current={active === recipe.slug ? 'location' : undefined}
					>
						<span class="contents-number">{index + 1}</span>
						{recipe.title}
					</a>
				</li>
			{/each}
		</ol>
	</nav>

	<main>
		<header id="start" class="page masthead" {@attach trackVisible}>
			<p class="eyebrow">Til den beste mammaen:</p>
			<h1>Mammas <em>oppskrifter</em></h1>
		</header>

		{#each recipes as recipe, index (recipe.slug)}
			<section
				id={recipe.slug}
				class="page"
				class:hidden-in-print={printing !== null && printing !== recipe.slug}
				{@attach trackVisible}
			>
				<RecipeCard
					{recipe}
					number={index + 1}
					flipped={index % 2 === 1}
					onprint={() => printRecipe(recipe.slug)}
				/>
			</section>
		{/each}
	</main>
</div>

<style>
	@media (prefers-reduced-motion: no-preference) {
		:global(html) {
			scroll-behavior: smooth;
		}
	}

	@media (min-width: 56rem) {
		:global(html) {
			scroll-snap-type: y mandatory;
		}
	}

	@media (max-width: 55.99rem) {
		:global(html) {
			scroll-padding-top: 3.5rem;
		}
	}

	.site {
		--bg: #f6f1ea;
		--ink: #2a2420;
		--muted: #7a6e64;
		--accent: #a2452e;
		--rule: #dcd2c5;
		--display: 'Fraunces Variable', Georgia, serif;
		--body: 'Inter Variable', system-ui, sans-serif;

		background: var(--bg);
		color: var(--ink);
		font-family: var(--body);
		line-height: 1.6;
	}

	.page {
		display: grid;
		place-items: center;
		min-height: 100svh;
		padding: clamp(2.5rem, 6vw, 4rem) clamp(1.25rem, 5vw, 4rem);
		scroll-snap-align: start;
	}

	.page + .page {
		border-top: 1px solid var(--rule);
	}

	.masthead {
		align-content: center;
		text-align: center;
	}

	.eyebrow {
		margin: 0 0 1rem;
		color: var(--accent);
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.22em;
		text-transform: uppercase;
	}

	h1 {
		margin: 0;
		font-family: var(--display);
		font-size: clamp(3.25rem, 10vw, 7rem);
		font-weight: 300;
		font-variation-settings: 'opsz' 144;
		letter-spacing: -0.03em;
		line-height: 0.95;
	}

	h1 em {
		color: var(--accent);
		font-variation-settings:
			'opsz' 144,
			'SOFT' 100,
			'WONK' 1;
	}

	.contents {
		position: sticky;
		top: 0;
		z-index: 1;
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 0.5rem clamp(1.25rem, 5vw, 4rem);
		border-bottom: 1px solid var(--rule);
		background: var(--bg);
	}

	.contents-label {
		margin: 0;
		color: var(--muted);
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.contents ol {
		display: flex;
		gap: 0.25rem;
		margin: 0;
		padding: 0;
		list-style: none;
		overflow-x: auto;
	}

	.contents a {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		padding: 0.4rem 0.75rem;
		border-radius: 0.25rem;
		color: var(--muted);
		font-family: var(--display);
		font-size: 1.05rem;
		white-space: nowrap;
		text-decoration: none;
		transition:
			color 0.2s,
			background-color 0.2s;
	}

	.contents a:hover,
	.contents a:focus-visible {
		color: var(--ink);
	}

	.contents a.active {
		background: rgb(162 69 46 / 0.08);
		color: var(--accent);
	}

	.contents-number {
		font-size: 0.85rem;
		font-style: italic;
	}

	@media (min-width: 56rem) {
		.site {
			display: grid;
			grid-template-columns: 15rem 1fr;
		}

		.contents {
			flex-direction: column;
			align-items: stretch;
			gap: 1rem;
			height: 100svh;
			padding: 3rem 1.25rem;
			border-right: 1px solid var(--rule);
			border-bottom: none;
		}

		.contents-label {
			padding-left: 0.75rem;
		}

		.contents ol {
			flex-direction: column;
		}

		.contents a {
			white-space: normal;
		}
	}

	@media print {
		:global(html) {
			scroll-snap-type: none;
		}

		.site {
			display: block;
			background: white;
		}

		.page {
			display: block;
			min-height: 0;
			padding: 1.5cm;
			border: none;
		}

		.contents,
		.masthead,
		.page.hidden-in-print {
			display: none;
		}
	}
</style>
