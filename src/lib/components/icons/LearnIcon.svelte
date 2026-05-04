<script lang="ts">
import Icon from './Icon.svelte';

let { size = 20, color }: { size?: number; color?: string } = $props();
</script>

<Icon {size} {color}>
	<path
		d="M3 7 L12 4 L21 7 L12 10 Z M7 9 V14 Q12 17 17 14 V9"
		stroke={color}
		stroke-width="2"
		fill="none"
		stroke-linecap="round"
		stroke-linejoin="round"
	/>
</Icon>
