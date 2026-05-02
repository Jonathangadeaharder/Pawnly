<script lang="ts">
import Mascot from './Mascot.svelte';
import Wordmark from './Wordmark.svelte';

let {
	size = 32,
	color,
}: {
	size?: number;
	color?: string;
} = $props();
</script>

<span style:display="inline-flex" style:align-items="center" style:gap="{size * 0.25}px">
	<Mascot size={size * 1.1} mood="happy" {color} />
	<Wordmark {size} {color} />
</span>
