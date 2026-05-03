<script lang="ts">
import Icon from './Icon.svelte';

let { size = 20, color }: { size?: number; color?: string } = $props();
</script>

<Icon {size} {color}>
	<path
		d="M7 5 L19 12 L7 19 Z"
		stroke={color}
		stroke-width="2"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
