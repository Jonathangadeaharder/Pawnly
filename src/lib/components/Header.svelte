<script lang="ts">
import type { Snippet } from 'svelte';
import { Brand } from '$lib/brand';

let {
	title,
	sub,
	right,
	onBack,
	accent = false,
}: {
	title: string;
	sub?: string;
	right?: Snippet;
	onBack?: () => void;
	accent?: boolean;
} = $props();
</script>

<div class="flex items-start justify-between gap-3" style:padding="16px 20px 12px">
	<div class="min-w-0 flex-1">
		{#if onBack}
			<button
				onclick={onBack}
				class="cursor-pointer border-none bg-transparent"
				style:padding="4px 0"
				style:margin-bottom="4px"
				style:color={Brand.colors.inkMuted}
				style:font-family={Brand.fonts.body}
				style:font-size="13px"
				style:font-weight="500"
			>
				← Back
			</button>
		{/if}
		<div
			style:font-family={Brand.fonts.display}
			style:font-size="28px"
			style:font-weight="600"
			style:color={Brand.colors.ink}
			style:letter-spacing="-0.025em"
			style:line-height="1.05"
			style:font-style={accent ? 'italic' : 'normal'}
		>
			{title}
		</div>
		{#if sub}
			<div
				style:font-family={Brand.fonts.body}
				style:font-size="14px"
				style:color={Brand.colors.inkMuted}
				style:margin-top="4px"
				style:line-height="1.4"
			>
				{sub}
			</div>
		{/if}
	</div>
	{#if right}
		{@render right()}
	{/if}
</div>
