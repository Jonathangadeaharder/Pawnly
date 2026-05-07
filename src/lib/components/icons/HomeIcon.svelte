<script lang="ts">
import Icon from './Icon.svelte';

let { size = 20, color }: { size?: number; color?: string } = $props();
</script>

<Icon {size} {color}>
	<path
		d="M4 11 L12 4 L20 11 V20 H4 Z M9 20 V14 H15 V20"
		stroke={color}
		stroke-width="2"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
