<script lang="ts">
import { Brand } from '$lib/brand';
import Card from '$lib/components/Card.svelte';
import Mascot from '$lib/components/Mascot.svelte';
import PaperBg from '$lib/components/PaperBg.svelte';

let {
	name = 'Maya',
	rating = 0,
	gamesPlayed = 0,
	puzzlesSolved = 0,
	onSettings,
}: {
	name?: string;
	rating?: number;
	gamesPlayed?: number;
	puzzlesSolved?: number;
	onSettings?: () => void;
} = $props();

const stats = [
	{ value: String(rating || '—'), label: 'Rating' },
	{ value: String(gamesPlayed), label: 'Games' },
	{ value: String(puzzlesSolved), label: 'Puzzles' },
];

const achievements = [
	{ emoji: '🔥', label: '7-day streak', unlocked: true },
	{ emoji: '♟', label: 'First game', unlocked: true },
	{ emoji: '🎯', label: 'Puzzle master', unlocked: false },
	{ emoji: '📖', label: 'Student', unlocked: true },
	{ emoji: '👑', label: 'Checkmate!', unlocked: false },
	{ emoji: '⭐', label: 'Rising star', unlocked: false },
];
</script>

<div class="h-full overflow-y-auto" style:padding-bottom="120px">
	<PaperBg style="min-height:100%">
		<!-- Profile header -->
		<div class="text-center" style:padding="60px 20px 16px">
			<div class="flex justify-center">
				<Mascot size={80} mood="happy" />
			</div>
			<div
				class="mt-2 text-[28px] font-semibold italic text-ink"
				style:font-family={Brand.fonts.display}
			>
				{name}
			</div>
			<div
				class="mt-1 text-[13px] text-ink-muted"
				style:font-family={Brand.fonts.body}
			>
				Joined 3 weeks ago
			</div>
		</div>

		<!-- Stats strip -->
		<div class="flex gap-2.5 px-4 mb-4">
			{#each stats as stat, i (i)}
				<Card style={{ flex: '1', padding: '14px', 'text-align': 'center' }}>
					<div
						class="text-[22px] font-bold text-ink"
						style:font-family={Brand.fonts.mono}
					>
						{stat.value}
					</div>
					<div
						class="mt-0.5 text-[11px] text-ink-muted"
						style:font-family={Brand.fonts.body}
					>
						{stat.label}
					</div>
				</Card>
			{/each}
		</div>

		<!-- Achievements -->
		<div class="px-4">
			<div
				class="text-lg font-semibold italic text-ink mb-3"
				style:font-family={Brand.fonts.display}
			>
				Achievements
			</div>
			<div class="grid grid-cols-3 gap-2.5">
				{#each achievements as a, i (i)}
					<div
						class="rounded-[16px] px-2 py-3.5 text-center"
						style:background={a.unlocked ? Brand.colors.cream : Brand.colors.creamDeep}
						style:opacity={a.unlocked ? '1' : '0.4'}
					>
						<span class="text-[28px]">{a.emoji}</span>
						<div
							class="mt-1.5 text-[11px] font-semibold text-ink"
							style:font-family={Brand.fonts.body}
						>
							{a.label}
						</div>
					</div>
				{/each}
			</div>
		</div>

		<!-- Settings button -->
		<div class="px-4 pt-5">
			<button
				class="w-full cursor-pointer rounded-[16px] border-none px-4 py-3.5 text-center text-[14px] font-semibold text-ink-muted"
				style:background="transparent"
				style:border={`1.5px solid ${Brand.colors.creamDeep}`}
				style:font-family={Brand.fonts.body}
				onclick={() => onSettings?.()}
			>
				Settings
			</button>
		</div>
	</PaperBg>
</div>
