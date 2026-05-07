<script lang="ts">
import { Brand } from '$lib/brand';

let { size = 20, color = Brand.colors.ink }: { size?: number; color?: string } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24">
	<path
		d="M12 3 L14.5 9 L21 9.5 L16 13.5 L18 20 L12 16.5 L6 20 L8 13.5 L3 9.5 L9.5 9 Z"
		fill={color}
	/>
</svg>
