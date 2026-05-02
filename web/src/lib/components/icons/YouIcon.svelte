<script lang="ts">
import { Brand } from '$lib/brand';

let { size = 20, color = Brand.colors.ink }: { size?: number; color?: string } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24">
	<circle
		cx="12"
		cy="9"
		r="4"
		stroke={color}
		stroke-width="2"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M4 20 Q12 14 20 20"
		stroke={color}
		stroke-width="2"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
