<script lang="ts">
	import '@fontsource-variable/fraunces/full.css';
	import '@fontsource-variable/fraunces/full-italic.css';
	import '@fontsource-variable/inter';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(*, *::before, *::after) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		-webkit-font-smoothing: antialiased;
	}

	:global(img) {
		display: block;
		max-width: 100%;
	}

	@media print {
		@page {
			margin: 1.5cm;
		}
	}
</style>
