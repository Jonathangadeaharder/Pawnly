<script lang="ts">
import { Brand } from '$lib/brand';

let { size = 20, color = Brand.colors.ink }: { size?: number; color?: string } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 24 24">
	<path
		d="M12 21 Q3 15 3 9 Q3 5 7 5 Q10 5 12 8 Q14 5 17 5 Q21 5 21 9 Q21 15 12 21 Z"
		fill={color}
	/>
</svg>
