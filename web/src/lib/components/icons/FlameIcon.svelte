<script lang="ts">
import { Brand } from '$lib/brand';

let { size = 20, color = Brand.colors.ink }: { size?: number; color?: string } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24">
	<path
		d="M12 3 Q14 8 17 10 Q19 13 19 16 Q19 21 12 21 Q5 21 5 16 Q5 13 8 11 Q7 7 12 3 Z"
		fill={color}
	/>
</svg>
