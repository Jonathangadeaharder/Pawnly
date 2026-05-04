<script lang="ts">
import Icon from './Icon.svelte';

let { size = 20, color }: { size?: number; color?: string } = $props();
</script>

<Icon {size} {color}>
	<circle
		cx="12"
		cy="12"
		r="8"
		stroke={color}
		stroke-width="2"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
	<path
		d="M12 8 V12 L15 14"
		stroke={color}
		stroke-width="2"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
