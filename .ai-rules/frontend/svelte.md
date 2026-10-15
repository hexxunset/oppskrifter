---
paths:
  - '**/*.svelte'
  - '**/*.ts'
  - '**/*.js'
  - '**/svelte.config.js'
---

# Svelte & SvelteKit Conventions

## Stack

- SvelteKit (latest), TypeScript (strict mode)
- pnpm (enforced via preinstall script)
- Vitest for unit testing
- Playwright for E2E testing
- ESLint + Prettier
- Svelte stores for state management
- CSS/SCSS for styling (scoped by default in Svelte)

## Core Principles

- **Simplicity**: Svelte is designed to be minimal. Don't over-engineer.
- **Reactivity**: Use Svelte's built-in reactivity (`$:`) instead of complex state management
- **Component composition**: Build small, reusable components
- **Progressive enhancement**: SvelteKit apps should work without JavaScript when possible

## Component Standards

- Component files: PascalCase (e.g., `UserProfile.svelte`)
- Components are in `src/lib/components/` for reusable components
- Page components go in `src/routes/` (SvelteKit file-based routing)
- Keep components small and focused
- Prefer composition over inheritance

## Component Structure

A well-organized Svelte component follows this order:

```svelte
<script lang="ts">
	// 1. Imports
	import { onMount } from 'svelte';
	import type { ComponentType } from './types';

	// 2. Props (with TypeScript types)
	export let title: string;
	export let items: ComponentType[] = [];

	// 3. Local state
	let count = 0;

	// 4. Reactive declarations
	$: doubled = count * 2;
	$: if (count > 10) {
		console.log('Count is high!');
	}

	// 5. Functions
	function handleClick() {
		count += 1;
	}

	// 6. Lifecycle
	onMount(() => {
		console.log('Component mounted');
	});
</script>

<!-- 7. Template -->
<div class="container">
	<h1>{title}</h1>
	<button on:click={handleClick}>
		Clicked {count}
		{count === 1 ? 'time' : 'times'}
	</button>
	<p>Doubled: {doubled}</p>
</div>

<!-- 8. Styles (scoped by default) -->
<style lang="scss">
	.container {
		padding: 1rem;
	}
</style>
```

## State Management

### Local Component State

```svelte
<script lang="ts">
	let count = 0; // Simple reactive variable

	$: doubled = count * 2; // Reactive declaration
</script>
```

### Svelte Stores (for shared state)

**Writable Store** (most common):

```typescript
// src/lib/stores/user.ts
import { writable } from 'svelte/store';

export const user = writable<User | null>(null);
```

**Usage in components**:

```svelte
<script lang="ts">
	import { user } from '$lib/stores/user';

	// Auto-subscribe with $ prefix
	$: console.log('Current user:', $user);
</script>

<p>Hello, {$user?.name ?? 'Guest'}</p>
```

**Readable Store** (for derived/computed values):

```typescript
import { readable, derived } from 'svelte/store';

export const isLoggedIn = derived(user, ($user) => $user !== null);
```

**Custom Store** (with methods):

```typescript
function createCounter() {
	const { subscribe, set, update } = writable(0);

	return {
		subscribe,
		increment: () => update((n) => n + 1),
		decrement: () => update((n) => n - 1),
		reset: () => set(0)
	};
}

export const counter = createCounter();
```

## Reactivity

Svelte's reactivity is **statement-based**. Assignments trigger updates.

✅ **Good**:

```svelte
<script lang="ts">
	let count = 0;

	function increment() {
		count += 1; // This triggers reactivity
	}
</script>
```

❌ **Bad** (doesn't trigger reactivity):

```svelte
<script lang="ts">
	let obj = { count: 0 };

	function increment() {
		obj.count += 1; // Won't trigger update
	}
</script>
```

✅ **Fix** (reassign to trigger reactivity):

```svelte
<script lang="ts">
	let obj = { count: 0 };

	function increment() {
		obj = { ...obj, count: obj.count + 1 }; // Reassignment triggers update
	}
</script>
```

## SvelteKit Routing

SvelteKit uses **file-based routing**:

```
src/routes/
├── +page.svelte              # / (home page)
├── +layout.svelte            # Layout for all pages
├── about/
│   └── +page.svelte          # /about
├── blog/
│   ├── +page.svelte          # /blog
│   ├── +page.ts              # Load data for /blog
│   └── [slug]/
│       ├── +page.svelte      # /blog/[slug]
│       └── +page.ts          # Load data for /blog/[slug]
└── api/
    └── items/
        └── +server.ts        # API endpoint /api/items
```

### Load Functions

Use `+page.ts` for client-side data loading:

```typescript
// src/routes/blog/[slug]/+page.ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params, fetch }) => {
	const response = await fetch(`/api/posts/${params.slug}`);
	const post = await response.json();

	return { post };
};
```

Use `+page.server.ts` for server-side only data loading:

```typescript
// src/routes/admin/+page.server.ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	// This runs on the server only
	// Good for database queries, secrets, etc.
	return {
		user: locals.user
	};
};
```

## API Routes

Create API endpoints with `+server.ts`:

```typescript
// src/routes/api/items/+server.ts
import type { RequestHandler } from './$types';
import { json } from '@sveltejs/kit';

export const GET: RequestHandler = async ({ url }) => {
	const items = await fetchItems();
	return json(items);
};

export const POST: RequestHandler = async ({ request }) => {
	const data = await request.json();
	const item = await createItem(data);
	return json(item, { status: 201 });
};
```

## TypeScript Standards

- Strict mode (`"strict": true`)
- No `any` typing (use `unknown` if needed)
- Explicit return types for public functions
- Use `type` for object shapes, `interface` for contracts
- Always use curly braces for if/for/while statements
- Small, single-responsibility functions
- Prefer immutability
- Named exports only — no default exports

## Props and Events

### Props (parent → child):

```svelte
<script lang="ts">
	export let title: string;
	export let count: number = 0; // Optional with default
	export let items: string[] | undefined = undefined; // Explicitly optional
</script>
```

### Events (child → parent):

```svelte
<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher<{
		save: { id: string };
		cancel: never;
	}>();

	function handleSave() {
		dispatch('save', { id: '123' });
	}
</script>

<button on:click={handleSave}>Save</button>
```

**Parent**:

```svelte
<MyComponent
	on:save={(e) => console.log('Saved:', e.detail.id)}
	on:cancel={() => console.log('Cancelled')}
/>
```

## Testing

### Unit Tests (Vitest)

```typescript
// src/lib/components/Counter.test.ts
import { render, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import Counter from './Counter.svelte';

describe('Counter', () => {
	it('increments count on button click', async () => {
		const { getByText } = render(Counter);
		const button = getByText(/clicked 0 times/i);

		await fireEvent.click(button);

		expect(button).toHaveTextContent('Clicked 1 time');
	});
});
```

### E2E Tests (Playwright)

```typescript
// tests/homepage.spec.ts
import { test, expect } from '@playwright/test';

test('homepage has title', async ({ page }) => {
	await page.goto('/');
	await expect(page).toHaveTitle(/My App/);
});
```

## Styling

### Component-Scoped Styles (default)

```svelte
<style>
	/* Automatically scoped to this component */
	.button {
		background: blue;
	}
</style>
```

### Global Styles

```svelte
<style>
	:global(.app-container) {
		max-width: 1200px;
	}
</style>
```

### CSS Variables for Theming

```svelte
<script lang="ts">
	export let primaryColor = '#3498db';
</script>

<div style="--primary: {primaryColor}">
	<button>Click me</button>
</div>

<style>
	button {
		background: var(--primary);
	}
</style>
```

## Performance

- Svelte compiles to vanilla JS — no virtual DOM overhead
- Components are reactive by default
- Use `{#key}` to force re-render when needed
- Lazy load routes with dynamic imports: `const Comp = () => import('./Heavy.svelte')`
- Use `beforeUpdate` and `afterUpdate` sparingly (they run on every change)
- Profile with browser DevTools, not assumptions

## Common Pitfalls

### 1. Reactivity on arrays/objects

```svelte
<!-- ❌ Won't trigger reactivity -->
<script>
  let items = [1, 2, 3];
  items.push(4); // No update
</script>

<!-- ✅ Reassign to trigger -->
<script>
  let items = [1, 2, 3];
  items = [...items, 4]; // Updates!
</script>
```

### 2. Event modifiers

```svelte
<!-- Prevent default and stop propagation -->
<form on:submit|preventDefault={handleSubmit}>
	<button on:click|once={notify}>Click once</button>
</form>
```

### 3. Two-way binding

```svelte
<script>
	let name = '';
</script>

<!-- Two-way binding with bind: -->
<input bind:value={name} />
<p>Hello, {name}!</p>
```

## API Integration

When the frontend talks to a separate backend API (rather than SvelteKit
endpoints), keep integration centralized and type-safe.

**Guidelines**:

- Centralize the base URL and fetch logic in a single API client module
- Keep frontend TypeScript types in sync with backend DTOs
- Read the API base URL from an environment variable, with a sensible dev default
- Always handle failed API calls gracefully

### Centralized API Client

```typescript
// src/lib/api/client.ts
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export async function apiGet<T>(endpoint: string): Promise<T> {
	const response = await fetch(`${API_BASE}${endpoint}`, {
		credentials: 'include' // For cookies/sessions
	});
	if (!response.ok) throw new Error(`API error: ${response.status}`);
	return response.json();
}

export async function apiPost<T>(endpoint: string, data: unknown): Promise<T> {
	const response = await fetch(`${API_BASE}${endpoint}`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(data)
	});
	if (!response.ok) throw new Error(`API error: ${response.status}`);
	return response.json();
}
```

### Usage in Load Functions

```typescript
// src/routes/items/+page.ts
import type { PageLoad } from './$types';
import { apiGet } from '$lib/api/client';

export const load: PageLoad = async () => {
	const items = await apiGet<Item[]>('/api/items');
	return { items };
};
```

### Common API Pitfalls

- Enum values: Always verify backend enum names match frontend
- Nullable fields: Check backend mapper to see when fields can be null
- Error handling: Always handle failed API calls gracefully

## References

- Svelte Tutorial: https://learn.svelte.dev/
- SvelteKit Docs: https://kit.svelte.dev/docs
- Svelte Best Practices: https://svelte.dev/docs/svelte/overview

## Additional AI Instructions

- Keep it simple — Svelte's strength is minimal boilerplate
- Use built-in reactivity before reaching for stores
- Prefer SvelteKit's built-in features (routing, forms, endpoints) over external libraries
- Do not invent APIs or libraries — check docs first
- Write components that are easy to test and reason about
- If multiple approaches are possible, choose the one that:
  1. Uses Svelte's built-in features
  2. Has less boilerplate
  3. Is easier to understand
