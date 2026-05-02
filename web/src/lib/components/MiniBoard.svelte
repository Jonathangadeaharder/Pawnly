<script lang="ts">
import { Brand } from '$lib/brand';
import Arrow from '$lib/components/Arrow.svelte';
import Piece from '$lib/components/Piece.svelte';

let {
	size = 240,
	pieces = {},
	highlights = [],
	lastMove = null,
	flip = false,
	theme = 'default',
	showCoords = false,
	arrows = [],
}: {
	size?: number;
	pieces?: Record<string, string>;
	highlights?: { square: string; color?: string; opacity?: number }[];
	lastMove?: { from: string; to: string } | null;
	flip?: boolean;
	theme?: 'default' | 'warm';
	showCoords?: boolean;
	arrows?: { from: string; to: string; color?: string; opacity?: number }[];
} = $props();

const sq = $derived(size / 8);
const files = $derived(flip ? ['h','g','f','e','d','c','b','a'] : ['a','b','c','d','e','f','g','h']);
const ranks = $derived(flip ? [1,2,3,4,5,6,7,8] : [8,7,6,5,4,3,2,1]);
const lightC = $derived(theme === 'warm' ? Brand.colors.boardLightAlt : Brand.colors.boardLight);
const darkC = $derived(theme === 'warm' ? Brand.colors.boardDarkAlt : Brand.colors.boardDark);

const boardSquares = $derived(
	ranks.flatMap((r, ri) =>
		files.map((f, fi) => ({
			name: `${f}${r}`,
			fi,
			ri,
			isLight: (ri + fi) % 2 === 0,
		}))
	)
);

const highlightMap = $derived(new Map(highlights.map((h) => [h.square, h])));

const pieceEntries = $derived(
	boardSquares
		.filter((sq) => pieces[sq.name])
		.map((sq) => {
			const p = pieces[sq.name];
			return {
				...sq,
				color: p === p.toUpperCase() ? 'white' as const : 'black' as const,
				type: p.toLowerCase() as 'p' | 'n' | 'b' | 'r' | 'q' | 'k',
			};
		})
);
</script>

<div
	style:width="{size}px"
	style:height="{size}px"
	style:position="relative"
	style:border-radius="12px"
	style:overflow="hidden"
	style:box-shadow="0 8px 24px rgba(31,36,23,0.18), 0 1px 0 rgba(255,255,255,0.4) inset"
>
	<svg width={size} height={size} style="position:absolute;inset:0">
		{#each boardSquares as s (s.name)}
			{@const hl = highlightMap.get(s.name)}
			{@const isLast = lastMove && (lastMove.from === s.name || lastMove.to === s.name)}
			<rect
				x={s.fi * sq}
				y={s.ri * sq}
				width={sq}
				height={sq}
				fill={s.isLight ? lightC : darkC}
			/>
			{#if isLast}
				<rect
					x={s.fi * sq}
					y={s.ri * sq}
					width={sq}
					height={sq}
					fill={Brand.colors.sunny}
					opacity="0.42"
				/>
			{/if}
			{#if hl}
				<rect
					x={s.fi * sq}
					y={s.ri * sq}
					width={sq}
					height={sq}
					fill={hl.color || Brand.colors.moss}
					opacity={hl.opacity ?? 0.4}
				/>
			{/if}
			{#if showCoords && s.fi === 0}
				<text
					x={s.fi * sq + 3}
					y={s.ri * sq + 11}
					font-size={sq * 0.18}
					fill={s.isLight ? darkC : lightC}
					font-family={Brand.fonts.mono}
					font-weight="600"
				>{s.name[1]}</text>
			{/if}
			{#if showCoords && s.ri === 7}
				<text
					x={s.fi * sq + sq - 9}
					y={s.ri * sq + sq - 4}
					font-size={sq * 0.18}
					fill={s.isLight ? darkC : lightC}
					font-family={Brand.fonts.mono}
					font-weight="600"
				>{s.name[0]}</text>
			{/if}
		{/each}
		{#each arrows as a, i (i)}
			{@const fromFi = files.indexOf(a.from[0])}
			{@const fromRi = ranks.indexOf(parseInt(a.from[1]))}
			{@const toFi = files.indexOf(a.to[0])}
			{@const toRi = ranks.indexOf(parseInt(a.to[1]))}
			<Arrow
				x1={fromFi * sq + sq / 2}
				y1={fromRi * sq + sq / 2}
				x2={toFi * sq + sq / 2}
				y2={toRi * sq + sq / 2}
				{sq}
				color={a.color}
				opacity={a.opacity}
			/>
		{/each}
	</svg>
	{#each pieceEntries as p (p.name)}
		<div
			style:position="absolute"
			style:left="{p.fi * sq}px"
			style:top="{p.ri * sq}px"
			style:width="{sq}px"
			style:height="{sq}px"
			style:display="flex"
			style:align-items="center"
			style:justify-content="center"
			style:pointer-events="none"
		>
			<Piece type={p.type} color={p.color} size={sq * 0.86} />
		</div>
	{/each}
</div>
