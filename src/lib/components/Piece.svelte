<script lang="ts">
import { Brand } from '$lib/brand';

let {
	type,
	color = 'white',
	size = 40,
	ink,
}: {
	type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
	color?: 'white' | 'black';
	size?: number;
	ink?: string;
} = $props();

const stroke = $derived(ink ?? (color === 'white' ? Brand.colors.ink : Brand.colors.cream));
const fill = $derived(color === 'white' ? Brand.colors.cream : Brand.colors.ink);
const sw = 2.2;

const paths: Record<string, string> = {
	p: 'M50 22 a8 8 0 1 1 0.01 0 z M40 38 q10 -4 20 0 l-2 8 h-16 z M36 48 h28 v6 h-28 z M32 60 q18 -6 36 0 l-3 14 h-30 z',
	n: 'M30 78 h40 v-6 h-3 q0 -28 -16 -38 q-4 -3 -4 -8 l-3 2 q-3 6 -8 8 q-6 3 -6 10 q0 4 4 4 q3 0 4 -3 q1 -2 4 -2 q3 0 3 4 q-1 5 -8 8 q-9 4 -7 21 z',
	b: 'M30 78 h40 v-6 h-4 l-3 -6 q4 -2 4 -6 q0 -10 -10 -22 q3 -2 3 -5 q0 -4 -10 -4 q-10 0 -10 4 q0 3 3 5 q-10 12 -10 22 q0 4 4 6 l-3 6 h-4 z M50 26 v6 M47 29 h6',
	r: 'M28 78 h44 v-6 l-4 -4 v-22 l-4 -4 v-6 h-6 v4 h-6 v-4 h-8 v4 h-6 v-4 h-6 v6 l-4 4 v22 l-4 4 z',
	q: 'M26 78 h48 v-6 l-3 -6 q5 -2 5 -8 l-3 -22 l-8 8 l-5 -10 l-5 12 l-5 -14 l-5 14 l-5 -12 l-5 10 l-8 -8 l-3 22 q0 6 5 8 l-3 6 z M28 24 a3 3 0 1 1 0.01 0 z M44 18 a3 3 0 1 1 0.01 0 z M50 14 a3 3 0 1 1 0.01 0 z M56 18 a3 3 0 1 1 0.01 0 z M72 24 a3 3 0 1 1 0.01 0 z',
	k: 'M26 78 h48 v-6 l-3 -6 q5 -2 5 -8 q0 -10 -12 -10 q-6 0 -10 4 q-4 -4 -10 -4 q-12 0 -12 10 q0 6 5 8 l-3 6 z M50 22 v18 M42 30 h16',
};
</script>

<svg width={size} height={size} viewBox="0 0 100 100" style="display:block">
	<path d={paths[type]} {fill} {stroke} stroke-width={sw} stroke-linejoin="round" />
</svg>
