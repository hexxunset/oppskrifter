---
name: svelte-component-create
description: Generate a new Svelte component following modern SvelteKit conventions (TypeScript, reactive stores, Vitest tests)
---

# Svelte Component Generator

Use this skill to scaffold a new Svelte component following modern SvelteKit conventions.

## What This Skill Does

Generates a complete Svelte component with:

- **TypeScript support** with strict typing
- **Props with type safety**
- **Reactive declarations** (`$:`)
- **Event dispatching** pattern
- **Scoped styles** (SCSS ready)
- **Vitest test file** with component testing setup
- Proper component structure

## When to Use

- Creating a new feature component
- Adding a presentational (dumb) component
- Scaffolding a page component
- Any new Svelte component creation

## Usage

Provide:

1. **Component name** (e.g., "UserProfile" or "ProductCard")
2. **Component type** (optional): "page" (in routes/) or "component" (in lib/components/)
3. **Props needed** (optional): list of prop names and types

The skill will:

- Generate the component `.svelte` file
- Generate the Vitest test file
- Follow all naming conventions
- Set up proper TypeScript types

## Generated Structure

### For Library Components

```
src/lib/components/
└── UserProfile/
    ├── UserProfile.svelte       # Component
    └── UserProfile.test.ts      # Vitest tests
```

### For Page Components

```
src/routes/profile/
├── +page.svelte                 # Page component
├── +page.ts                     # Load function (optional)
└── +page.test.ts                # Tests
```

## Component Template (Presentational)

```svelte
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	// Props
	export let title: string;
	export let count: number = 0;

	// Local state
	let isExpanded = false;

	// Reactive declarations
	$: displayTitle = title.toUpperCase();

	// Events
	const dispatch = createEventDispatcher<{
		click: { count: number };
		close: never;
	}>();

	// Functions
	function handleClick() {
		count += 1;
		dispatch('click', { count });
	}

	function toggle() {
		isExpanded = !isExpanded;
	}
</script>

<div class="component-name">
	<h2>{displayTitle}</h2>
	<button on:click={handleClick}>
		Clicked {count}
		{count === 1 ? 'time' : 'times'}
	</button>

	{#if isExpanded}
		<div class="details">
			<slot />
		</div>
	{/if}
</div>

<style lang="scss">
	.component-name {
		padding: 1rem;
		border: 1px solid #ccc;
	}

	.details {
		margin-top: 1rem;
	}
</style>
```

## Page Template

```svelte
<!-- src/routes/profile/+page.svelte -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<svelte:head>
	<title>Profile</title>
</svelte:head>

<div class="page">
	<h1>Welcome, {data.user.name}</h1>
</div>

<style>
	.page {
		max-width: 1200px;
		margin: 0 auto;
		padding: 2rem;
	}
</style>
```

## Load Function Template

```typescript
// src/routes/profile/+page.ts
import type { PageLoad } from './$types';
import { apiGet } from '$lib/api/client';

export const load: PageLoad = async ({ params, fetch }) => {
	const user = await apiGet<User>(`/api/users/${params.id}`);

	return {
		user
	};
};
```

## Test Template

```typescript
// src/lib/components/UserProfile/UserProfile.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import UserProfile from './UserProfile.svelte';

describe('UserProfile', () => {
	it('renders with title prop', () => {
		const { getByText } = render(UserProfile, {
			props: { title: 'Test Title', count: 0 }
		});

		expect(getByText('TEST TITLE')).toBeInTheDocument();
	});

	it('increments count on button click', async () => {
		const { getByRole } = render(UserProfile, {
			props: { title: 'Test', count: 0 }
		});

		const button = getByRole('button');
		await fireEvent.click(button);

		expect(button).toHaveTextContent('Clicked 1 time');
	});

	it('dispatches click event with count', async () => {
		const { component, getByRole } = render(UserProfile, {
			props: { title: 'Test', count: 0 }
		});

		const clickEvents: any[] = [];
		component.$on('click', (e) => clickEvents.push(e.detail));

		const button = getByRole('button');
		await fireEvent.click(button);

		expect(clickEvents).toHaveLength(1);
		expect(clickEvents[0]).toEqual({ count: 1 });
	});
});
```

## Naming Conventions

- **File naming**: PascalCase for components (e.g., `UserProfile.svelte`)
- **Page files**: `+page.svelte` (SvelteKit convention)
- **Load files**: `+page.ts` or `+page.server.ts`
- **Test files**: `ComponentName.test.ts`
- **Folder**: PascalCase matching component name (for lib components)

## Component Types

### Presentational (Dumb) Components

- Accept data via props
- Emit events to parent
- No API calls or business logic
- Reusable across the app
- Location: `src/lib/components/`

### Page Components

- Located in `src/routes/`
- Can use load functions for data fetching
- May contain business logic
- Compose presentational components

### Layout Components

- `+layout.svelte` in `src/routes/`
- Wrap all child routes
- Good for navigation, footers, auth checks

## Next Steps After Generation

1. Add more props with proper TypeScript types
2. Add event dispatchers for user interactions
3. Import and use other components
4. Add reactive declarations (`$:`) for computed values
5. Write additional test cases for edge cases
6. Add Svelte animations/transitions if needed
7. Style with scoped CSS/SCSS

## Common Patterns

### Conditional Rendering

```svelte
{#if condition}
	<p>Shown when true</p>
{:else}
	<p>Shown when false</p>
{/if}
```

### Lists

```svelte
{#each items as item (item.id)}
	<div>{item.name}</div>
{/each}
```

### Await Promises

```svelte
{#await promise}
	<p>Loading...</p>
{:then value}
	<p>Result: {value}</p>
{:catch error}
	<p>Error: {error.message}</p>
{/await}
```

### Two-Way Binding

```svelte
<input bind:value={name} />
```

## Slots for Composition

```svelte
<!-- Parent -->
<Card>
	<h2>Custom content</h2>
	<p>Goes in the slot</p>
</Card>

<!-- Card.svelte -->
<div class="card">
	<slot />
</div>
```

Named slots:

```svelte
<!-- Parent -->
<Card>
	<h2 slot="header">Title</h2>
	<p>Body content</p>
</Card>

<!-- Card.svelte -->
<div class="card">
	<header>
		<slot name="header" />
	</header>
	<main>
		<slot />
	</main>
</div>
```
