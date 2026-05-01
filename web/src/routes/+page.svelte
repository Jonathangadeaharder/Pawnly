<script lang="ts">
	import { Brand } from '$lib/brand';
</script>

<svelte:head>
	<title>{Brand.name} — {Brand.tagline}</title>
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
	<h1 class="font-display text-5xl font-semibold italic tracking-tight text-ink">
		{Brand.name}
	</h1>
	<p class="font-body text-lg text-ink-muted">
		{Brand.tagline}
	</p>
</main>
