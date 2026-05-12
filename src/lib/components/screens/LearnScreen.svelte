<script lang="ts">
import { Brand } from '$lib/brand';
import Card from '$lib/components/Card.svelte';
import Header from '$lib/components/Header.svelte';
import Mascot from '$lib/components/Mascot.svelte';
import PaperBg from '$lib/components/PaperBg.svelte';

let {
	onOpenLesson,
}: {
	onOpenLesson: (lessonId: string) => void;
} = $props();

const lessons = [
	{ id: 'l1', title: 'How pieces move', status: 'done', emoji: '♟', duration: '3 min' },
	{ id: 'l2', title: 'Capture & check', status: 'done', emoji: '⚔️', duration: '4 min' },
	{ id: 'l3', title: 'Special moves', status: 'current', emoji: '✨', duration: '5 min' },
	{ id: 'l4', title: 'Checkmate patterns', status: 'locked', emoji: '👑', duration: '6 min' },
	{ id: 'l5', title: 'Opening principles', status: 'locked', emoji: '📖', duration: '5 min' },
];

const completedCount = $derived(lessons.filter((l) => l.status === 'done').length);
const progressPercent = $derived((completedCount / lessons.length) * 100);
</script>

<div class="h-full overflow-y-auto" style:padding-bottom="120px">
	<PaperBg style="min-height:100%">
		<Header title="Learn" sub="Your Pawnly journey" />

		<!-- Progress overview -->
		<div style:padding="0 16px 16px">
			<Card style={{ padding: '16px' }}>
				<div class="flex items-center gap-3.5">
					<Mascot size={48} mood="teaching" />
					<div class="flex-1">
						<div
							class="text-[13px] font-medium text-ink-muted"
							style:font-family={Brand.fonts.body}
						>
							Course progress
						</div>
						<div
							class="text-[22px] font-semibold text-ink"
							style:font-family={Brand.fonts.display}
						>
							{completedCount} of {lessons.length} lessons
						</div>
						<div
							class="mt-2 h-[5px] overflow-hidden rounded-[3px]"
							style:background={Brand.colors.creamDeep}
						>
							<div
								class="h-full"
								style:width="{progressPercent}%"
								style:background={Brand.colors.moss}
							></div>
						</div>
					</div>
				</div>
			</Card>
		</div>

		<!-- Lesson timeline -->
		<div style:padding="0 16px">
			<div
				class="mb-3 text-lg font-semibold italic text-ink"
				style:font-family={Brand.fonts.display}
			>
				Lessons
			</div>
			<div class="flex flex-col">
				{#each lessons as lesson, i (lesson.id)}
					<div class="flex">
						<!-- Timeline line -->
						<div class="flex w-10 flex-col items-center">
							<div
								class="h-4 w-4 rounded-full"
								style:background={lesson.status === 'done'
									? Brand.colors.moss
									: lesson.status === 'current'
										? Brand.colors.sunny
										: Brand.colors.creamDeep}
								style:border={lesson.status === 'locked'
									? `2px solid ${Brand.colors.creamDeep}`
									: 'none'}
							></div>
							{#if i < lessons.length - 1}
								<div
									class="w-0.5 flex-1"
									style:background={lesson.status === 'done'
										? Brand.colors.moss
										: Brand.colors.creamDeep}
								></div>
							{/if}
						</div>
						<!-- Lesson card -->
						<button
							class="mb-2 ml-2 flex flex-1 items-center gap-2.5 rounded-[14px] border-none text-left"
							style:padding="12px 14px"
							style:background={lesson.status === 'locked'
								? 'transparent'
								: Brand.colors.cream}
							style:border={lesson.status === 'locked'
								? `1.5px solid ${Brand.colors.creamDeep}`
								: 'none'}
							style:cursor={lesson.status === 'locked' ? 'default' : 'pointer'}
							style:opacity={lesson.status === 'locked' ? '0.5' : '1'}
							onclick={() => {
								if (lesson.status !== 'locked') onOpenLesson(lesson.id);
							}}
						>
							<span class="text-[22px]">{lesson.emoji}</span>
							<div class="flex-1">
								<div
									class="text-sm font-semibold text-ink"
									style:font-family={Brand.fonts.body}
								>
									{lesson.title}
								</div>
								<div
									class="mt-0.5 text-[11px] text-ink-muted"
									style:font-family={Brand.fonts.body}
								>
									{lesson.duration}
								</div>
							</div>
							{#if lesson.status === 'done'}
								<span class="text-base" style:color={Brand.colors.moss}>✓</span>
							{/if}
							{#if lesson.status === 'locked'}
								<span class="text-sm">🔒</span>
							{/if}
						</button>
					</div>
				{/each}
			</div>
		</div>
	</PaperBg>
</div>
