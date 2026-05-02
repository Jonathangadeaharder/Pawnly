<script lang="ts">
import { Brand } from '$lib/brand';

let { size = 20, color = Brand.colors.ink }: { size?: number; color?: string } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24">
	<path
		d="M12 3 L13 10 L20 12 L13 14 L12 21 L11 14 L4 12 L11 10 Z"
		fill={color}
	/>
</svg>
