<script lang="ts">
import { Brand } from '$lib/brand';

let {
	size = 64,
	mood = 'happy',
	color,
}: {
	size?: number;
	mood?: 'happy' | 'thinking' | 'celebrating' | 'sleepy' | 'surprised';
	color?: string;
} = $props();

const c = $derived(color ?? Brand.colors.ink);

const eyePaths = $derived.by(() => ({
	happy: `<circle cx="40" cy="48" r="2.6" fill="${c}"/><circle cx="56" cy="48" r="2.6" fill="${c}"/>`,
	thinking: `<circle cx="40" cy="48" r="2.6" fill="${c}"/><circle cx="56" cy="48" r="2.6" fill="${c}"/>`,
	celebrating: `<path d="M37 47 q3 -3 6 0" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M53 47 q3 -3 6 0" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
	sleepy: `<path d="M37 49 h6" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/><path d="M53 49 h6" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`,
	surprised: `<circle cx="40" cy="48" r="3.2" fill="${c}"/><circle cx="56" cy="48" r="3.2" fill="${c}"/>`,
}));

const mouthPaths = $derived.by(() => ({
	happy: `<path d="M42 56 q6 5 12 0" stroke="${c}" stroke-width="2.4" fill="none" stroke-linecap="round"/>`,
	thinking: `<path d="M44 57 h8" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`,
	celebrating: `<path d="M40 55 q8 9 16 0 q-8 4 -16 0 z" fill="${c}"/>`,
	sleepy: `<circle cx="48" cy="58" r="1.8" fill="${c}"/>`,
	surprised: `<ellipse cx="48" cy="58" rx="3" ry="4" fill="${c}"/>`,
}));
</script>

<svg width={size} height={size} viewBox="0 0 96 96" style="display:block">
	<ellipse cx="48" cy="86" rx="26" ry="4" fill={c} opacity="0.12" />
	<path d="M28 82 Q24 76 28 72 L68 72 Q72 76 68 82 Z" fill={c} />
	<path d="M34 70 Q34 66 38 66 L58 66 Q62 66 62 70 L62 72 L34 72 Z" fill={c} />
	<path d="M36 66 Q34 52 40 44 Q44 38 48 38 Q52 38 56 44 Q62 52 60 66 Z" fill={c} />
	<circle cx="48" cy="38" r="16" fill={c} />
	<circle cx="48" cy="50" r="13" fill={Brand.colors.cream} />
	{@html eyePaths[mood]}
	{@html mouthPaths[mood]}
	<circle cx="35" cy="54" r="2.5" fill={Brand.colors.coralSoft} opacity="0.6" />
	<circle cx="61" cy="54" r="2.5" fill={Brand.colors.coralSoft} opacity="0.6" />
</svg>
