<script lang="ts">
import type { Snippet } from 'svelte';
import { Brand } from '$lib/brand';

let {
	color,
	bg,
	children,
	...rest
}: {
	color?: string;
	bg?: string;
	children: Snippet;
	[key: string]: unknown;
} = $props();
</script>

<span
	class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider"
	style:background={bg ?? 'rgba(31,36,23,0.06)'}
	style:color={color ?? Brand.colors.ink}
	style:font-family={Brand.fonts.body}
	{...rest}
>
	{@render children()}
</span>
