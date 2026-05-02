<script lang="ts">
import { Brand } from '$lib/brand';
import Header from '$lib/components/Header.svelte';
import PaperBg from '$lib/components/PaperBg.svelte';
import Pill from '$lib/components/Pill.svelte';

let {
	onOpenPuzzle,
}: {
	onOpenPuzzle: (puzzleId: string) => void;
} = $props();

const puzzles = [
	{ id: 'p1', title: 'Fork!', emoji: '🍴', difficulty: 1, solved: true },
	{ id: 'p2', title: 'Pin & win', emoji: '📌', difficulty: 2, solved: true },
	{ id: 'p3', title: 'Back rank mate', emoji: '🏰', difficulty: 2, solved: false },
	{ id: 'p4', title: 'Discovered attack', emoji: '💥', difficulty: 3, solved: false },
	{ id: 'p5', title: 'Queen sacrifice', emoji: '👑', difficulty: 4, solved: false },
	{ id: 'p6', title: 'Knight fork', emoji: '♞', difficulty: 2, solved: false },
];
</script>

<div class="h-full overflow-y-auto pb-28">
	<PaperBg style="min-height:100%">
		<Header title="Train" sub="Sharpen your tactics" />

		<!-- Daily puzzle hero -->
		<div style:padding="0 16px 16px">
			<button
				class="w-full cursor-pointer border-none text-left"
				style:background={Brand.colors.sunset}
				style:border-radius="22px"
				style:padding="20px"
				style:box-shadow="0 12px 28px rgba(232,122,65,0.25)"
				onclick={() => onOpenPuzzle('daily')}
			>
				<Pill bg="rgba(255,255,255,0.2)" color={Brand.colors.cream}>
					Daily challenge
				</Pill>
				<div
					style:font-family={Brand.fonts.display}
					style:font-style="italic"
					style:font-size="22px"
					style:font-weight="600"
					style:color={Brand.colors.cream}
					style:margin-top="8px"
				>
					Mate in 2
				</div>
				<div
					style:font-family={Brand.fonts.body}
					style:font-size="13px"
					style:color={Brand.colors.cream}
					style:opacity="0.8"
					style:margin-top="4px"
				>
					Can you find the winning move?
				</div>
			</button>
		</div>

		<!-- Puzzle grid -->
		<div style:padding="0 16px">
			<div
				class="mb-3 text-lg font-semibold italic text-ink"
				style:font-family={Brand.fonts.display}
			>
				Puzzles
			</div>
			<div class="grid grid-cols-2 gap-2.5">
				{#each puzzles as puzzle (puzzle.id)}
					<button
						class="cursor-pointer border-none text-left"
						style:background={puzzle.solved ? Brand.colors.cream : Brand.colors.creamDeep}
						style:border={puzzle.solved ? `1.5px solid ${Brand.colors.moss}` : 'none'}
						style:border-radius="18px"
						style:padding="16px 14px"
						onclick={() => onOpenPuzzle(puzzle.id)}
					>
						<span class="text-[28px]">{puzzle.emoji}</span>
						<div
							class="mt-2 text-sm font-semibold text-ink"
							style:font-family={Brand.fonts.body}
						>
							{puzzle.title}
						</div>
						<div class="mt-1.5 flex gap-0.5">
							{#each [1, 2, 3, 4] as d (d)}
								<div
									class="h-2 w-2 rounded-full"
									style:background={d <= puzzle.difficulty ? Brand.colors.sunny : Brand.colors.creamDeep}
								></div>
							{/each}
						</div>
						{#if puzzle.solved}
							<div
								class="mt-1.5 text-[11px] font-semibold text-moss"
								style:font-family={Brand.fonts.body}
							>
								✓ Solved
							</div>
						{/if}
					</button>
				{/each}
			</div>
		</div>
	</PaperBg>
</div>
