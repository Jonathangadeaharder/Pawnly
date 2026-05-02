<script lang="ts">
import type { Snippet } from 'svelte';
import { Brand } from '$lib/brand';

let {
	children,
	style,
	raised = false,
}: {
	children: Snippet;
	style?: Record<string, string>;
	raised?: boolean;
} = $props();

const mergedStyle = $derived(
	[
		`background:${Brand.colors.cream}`,
		`border:1.5px solid ${Brand.colors.creamDeep}`,
		'border-radius:18px',
		'padding:16px',
		`box-shadow:${raised ? '0 12px 32px rgba(31,36,23,0.10), 0 1px 0 rgba(255,255,255,0.5) inset' : '0 1px 0 rgba(255,255,255,0.5) inset'}`,
		...(style ? Object.entries(style).map(([k, v]) => `${k}:${v}`) : []),
	].join(';'),
);
</script>

<div style={mergedStyle}>
	{@render children()}
</div>
