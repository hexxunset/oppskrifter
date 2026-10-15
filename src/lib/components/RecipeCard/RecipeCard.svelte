<script lang="ts">
	import { asset } from '$app/paths';
	import type { Recipe } from '#lib/recipes.ts';

	type Props = {
		recipe: Recipe;
		number: number;
		flipped: boolean;
		onprint: () => void;
	};

	let { recipe, number, flipped, onprint }: Props = $props();
</script>

<article class="card" class:flipped>
	{#if recipe.image}
		<figure class="photo">
			<img src={asset(recipe.image)} alt={recipe.title} />
		</figure>
	{/if}

	<div class="body">
		<div class="meta">
			<p class="label number">Nr. {number}</p>
			<button type="button" class="label print" onclick={onprint}>Skriv ut</button>
		</div>
		<h2>{recipe.title}</h2>

		<section>
			<h3 class="label">Ingredienser</h3>
			<ul class="ingredients">
				{#each recipe.ingredients as ingredient (ingredient)}
					<li>{ingredient}</li>
				{/each}
			</ul>
		</section>

		<section>
			<h3 class="label">Slik gjør du</h3>
			<ol class="steps">
				{#each recipe.steps as step (step)}
					<li>{step}</li>
				{/each}
			</ol>
		</section>
	</div>
</article>

<style>
	.card {
		display: grid;
		gap: 1.75rem;
		width: 100%;
		max-width: 72rem;
		color: var(--ink);
		font-family: var(--body);
	}

	.photo {
		margin: 0;
	}

	.photo img {
		width: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}

	@media (min-width: 56rem) {
		.card {
			grid-template-columns: 1fr 1fr;
			gap: clamp(3rem, 6vw, 6rem);
			align-items: center;
		}

		.flipped .photo {
			order: 2;
		}

		.photo img {
			aspect-ratio: 4 / 5;
			max-height: 80svh;
		}
	}

	.label {
		font-size: 0.72rem;
		font-weight: 600;
		letter-spacing: 0.18em;
		text-transform: uppercase;
	}

	.meta {
		display: flex;
		justify-content: space-between;
		align-items: baseline;
	}

	.number {
		margin: 0;
		color: var(--accent);
	}

	.print {
		padding: 0 0 0.1rem;
		border: none;
		border-bottom: 1px solid currentColor;
		background: none;
		color: var(--muted);
		font-family: inherit;
		cursor: pointer;
	}

	.print:hover,
	.print:focus-visible {
		color: var(--accent);
	}

	h2 {
		margin: 0.25rem 0 1.5rem;
		font-family: var(--display);
		font-size: clamp(2.5rem, 5vw, 3.75rem);
		font-weight: 350;
		font-variation-settings: 'opsz' 144;
		letter-spacing: -0.02em;
		line-height: 1;
	}

	h3 {
		margin: 0 0 0.5rem;
		color: var(--accent);
	}

	section + section {
		margin-top: 2rem;
	}

	ul,
	ol {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.ingredients li {
		padding: 0.5rem 0;
		border-bottom: 1px solid var(--rule);
	}

	.ingredients li:first-child {
		border-top: 1px solid var(--rule);
	}

	.steps {
		counter-reset: step;
	}

	.steps li {
		display: grid;
		grid-template-columns: 2.25rem 1fr;
		padding: 0.35rem 0;
		counter-increment: step;
	}

	.steps li::before {
		content: counter(step);
		color: var(--accent);
		font-family: var(--display);
		font-size: 1.35rem;
		font-style: italic;
		line-height: 1.2;
	}

	@media print {
		.card {
			display: block;
			break-inside: avoid;
		}

		.print {
			display: none;
		}

		.photo img {
			aspect-ratio: 4 / 3;
			max-height: 9cm;
		}

		.body {
			padding-top: 1.5rem;
		}
	}
</style>
