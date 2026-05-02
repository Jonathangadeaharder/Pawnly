<script lang="ts">
import { Brand } from '$lib/brand';

let { size = 20, color = Brand.colors.ink }: { size?: number; color?: string } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24">
	<path
		d="M4 11 L12 4 L20 11 V20 H4 Z M9 20 V14 H15 V20"
		stroke={color}
		stroke-width="2"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</svg>
