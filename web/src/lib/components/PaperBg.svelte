<script lang="ts">
import type { Snippet } from 'svelte';
import { Brand } from '$lib/brand';

let { children, style }: { children: Snippet; style?: string } = $props();
</script>

<div
	class="relative min-h-full"
	style:background={Brand.colors.cream}
	style={style}
>
	{@render children()}
</div>
