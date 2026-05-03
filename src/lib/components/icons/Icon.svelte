<script lang="ts">
import { Brand } from '$lib/brand';
import type { Snippet } from 'svelte';

let {
	size = 20,
	color = Brand.colors.ink,
	children,
}: { size?: number; color?: string; children: Snippet } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24">
	{@render children()}
</svg>
