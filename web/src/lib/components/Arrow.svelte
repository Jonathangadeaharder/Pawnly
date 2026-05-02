<script lang="ts">
import { Brand } from '$lib/brand';

let {
	x1,
	y1,
	x2,
	y2,
	sq,
	color = Brand.colors.moss,
	opacity = 0.85,
}: {
	x1: number;
	y1: number;
	x2: number;
	y2: number;
	sq: number;
	color?: string;
	opacity?: number;
} = $props();

const dx = $derived(x2 - x1);
const dy = $derived(y2 - y1);
const len = $derived(Math.sqrt(dx * dx + dy * dy));
const nx = $derived(dx / len);
const ny = $derived(dy / len);
const ex = $derived(x2 - nx * sq * 0.3);
const ey = $derived(y2 - ny * sq * 0.3);
const ah = $derived(sq * 0.25);
</script>

<g {opacity}>
	<line
		{x1}
		{y1}
		x2={ex}
		y2={ey}
		stroke={color}
		stroke-width={sq * 0.14}
		stroke-linecap="round"
	/>
	<polygon
		points="{x2},{y2} {ex - ny * ah / 1.6},{ey + nx * ah / 1.6} {ex + ny * ah / 1.6},{ey - nx * ah / 1.6}"
		fill={color}
	/>
</g>
