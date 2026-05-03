<script lang="ts">
import Icon from './Icon.svelte';

let { size = 20, color }: { size?: number; color?: string } = $props();
</script>

<Icon {size} {color}>
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
</Icon>
