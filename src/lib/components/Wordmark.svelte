<script lang="ts">
import { Brand } from '$lib/brand';

let {
	size = 32,
	color,
}: {
	size?: number;
	color?: string;
} = $props();

const c = $derived(color ?? Brand.colors.ink);
</script>

<span
	style:font-family={Brand.fonts.display}
	style:font-size="{size}px"
	style:font-weight="600"
	style:font-style="italic"
	style:letter-spacing="-0.02em"
	style:color={c}
	style:line-height="1"
>Pawnly</span>
