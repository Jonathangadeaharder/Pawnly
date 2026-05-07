<script lang="ts">
import type { Snippet } from 'svelte';
import { Brand } from '$lib/brand';

let {
	kind = 'primary',
	icon,
	children,
	full = false,
	onclick,
	...rest
}: {
	kind?: 'primary' | 'moss' | 'sunny' | 'ghost' | 'cream';
	icon?: Snippet;
	children: Snippet;
	full?: boolean;
	onclick?: (e: MouseEvent) => void;
	[key: string]: unknown;
} = $props();

const styles = {
	primary: {
		bg: Brand.colors.ink,
		fg: Brand.colors.cream,
		shadow: '0 4px 0 #0d100a, 0 8px 24px rgba(31,36,23,0.18)',
	},
	moss: {
		bg: Brand.colors.moss,
		fg: Brand.colors.cream,
		shadow: '0 4px 0 #2c4d30, 0 8px 24px rgba(63,107,67,0.25)',
	},
	sunny: {
		bg: Brand.colors.sunny,
		fg: Brand.colors.ink,
		shadow: '0 4px 0 #c8932c, 0 8px 24px rgba(232,181,71,0.35)',
	},
	ghost: {
		bg: 'transparent',
		fg: Brand.colors.ink,
		shadow: 'inset 0 0 0 1.5px rgba(31,36,23,0.18)',
	},
	cream: {
		bg: Brand.colors.creamSoft,
		fg: Brand.colors.ink,
		shadow: '0 3px 0 rgba(31,36,23,0.10)',
	},
} as const;

let transform = $state('translateY(0)');

function onmousedown(_e: MouseEvent) {
	transform = 'translateY(2px)';
}

function onmouseup(_e: MouseEvent) {
	transform = 'translateY(0)';
}

function onmouseleave(_e: MouseEvent) {
	transform = 'translateY(0)';
}
</script>

<button
	{onclick}
	{onmousedown}
	{onmouseup}
	{onmouseleave}
	style:background-color={styles[kind].bg}
	style:color={styles[kind].fg}
	style:box-shadow={styles[kind].shadow}
	style:font-family={Brand.fonts.body}
	style:width={full ? '100%' : 'auto'}
	style:border-radius="14px"
	style:transform={transform}
	class="btn"
	{...rest}
>
	{#if icon}{@render icon()}{/if}
	{@render children()}
</button>

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		padding: 14px 20px;
		border-radius: 14px;
		border: none;
		cursor: pointer;
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.01em;
		transition: transform 0.06s ease;
	}
</style>
