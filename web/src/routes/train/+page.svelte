<script lang="ts">
import { Brand } from '$lib/brand';
import PaperBg from '$lib/components/PaperBg.svelte';
</script>

<svelte:head>
	<title>{Brand.name} — Train</title>
</svelte:head>

<PaperBg>
	<div class="p-8 pb-28">
		<div class="mx-auto max-w-lg">
			<h1 class="font-display text-3xl font-semibold italic tracking-tight text-ink">
				Train
			</h1>
			<p class="mt-2 font-body text-lg text-ink-muted">
				Practice puzzles and tactics
			</p>
		</div>
	</div>
</PaperBg>
