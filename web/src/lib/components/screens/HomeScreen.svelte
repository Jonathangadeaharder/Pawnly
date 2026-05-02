<script lang="ts">
import { Brand } from '$lib/brand';
import { italian } from '$lib/positions';
import Card from '$lib/components/Card.svelte';
import Pill from '$lib/components/Pill.svelte';
import PaperBg from '$lib/components/PaperBg.svelte';
import MiniBoard from '$lib/components/MiniBoard.svelte';
import Mascot from '$lib/components/Mascot.svelte';
import FlameIcon from '$lib/components/icons/FlameIcon.svelte';
import StarIcon from '$lib/components/icons/StarIcon.svelte';

let {
	onNavigate,
	name = 'Maya',
}: {
	onNavigate: (screen: string) => void;
	name?: string;
} = $props();

const streak = 7;
const todayMins = 3;
const goalMins = 5;
const xp = 1240;
const rating = 1140;

const timeOfDay = $derived.by(() => {
	const h = new Date().getHours();
	if (h < 12) return 'morning';
	if (h < 17) return 'afternoon';
	return 'evening';
});

const dayName = $derived(
	new Date().toLocaleDateString('en-US', { weekday: 'long' }),
);

const quickActions = [
	{ id: 'play', title: 'Play a game', sub: 'Vs. coach · 10 min', emoji: '♟', bg: Brand.colors.moss, fg: Brand.colors.cream, border: false },
	{ id: 'train', title: 'Daily puzzle', sub: 'Solve in under 60s', emoji: '🎯', bg: Brand.colors.sunny, fg: Brand.colors.ink, border: false },
	{ id: 'learn', title: 'Continue lesson', sub: 'Knight forks · 3/5', emoji: '📖', bg: Brand.colors.cream, fg: Brand.colors.ink, border: true },
	{ id: 'train', title: "Bishop's Prison", sub: 'Mini-game · ★★★☆☆', emoji: '🎪', bg: Brand.colors.cream, fg: Brand.colors.ink, border: true },
];

const streakDays = Array.from({ length: 7 }, () => 1);
</script>

<div class="h-full overflow-y-auto" style:padding-bottom="120px">
	<PaperBg style="min-height:100%">
		<!-- Greeting -->
		<div class="flex items-start justify-between" style:padding="60px 20px 16px">
			<div>
				<div
					class="text-[13px] font-medium text-ink-muted"
					style:font-family={Brand.fonts.body}
				>
					{dayName} {timeOfDay}
				</div>
				<div
					class="mt-0.5 text-[30px] font-semibold italic leading-[1.05] tracking-[-0.02em] text-ink"
					style:font-family={Brand.fonts.display}
				>
					Welcome back,<br />{name}.
				</div>
			</div>
			<div
				class="flex items-center gap-1.5 rounded-[14px] px-3 py-2 text-cream"
				style:background={Brand.colors.ink}
				style:box-shadow="0 6px 16px rgba(31,36,23,0.2)"
			>
				<FlameIcon size={16} color={Brand.colors.sunny} />
				<span
					class="text-sm font-bold"
					style:font-family={Brand.fonts.mono}
				>{streak}</span>
			</div>
		</div>

		<!-- Daily ritual hero -->
		<div class="px-4">
			<button
				class="w-full cursor-pointer overflow-hidden rounded-[24px] border-none p-5 text-left"
				style:background={Brand.colors.ink}
				style:box-shadow="0 18px 40px rgba(31,36,23,0.22)"
				onclick={() => onNavigate('play')}
			>
				<div class="relative">
					<div class="absolute -right-8 -bottom-8 opacity-95" style:transform="rotate(-8deg)">
						<MiniBoard size={170} pieces={italian} theme="warm" lastMove={{ from: 'f1', to: 'c4' }} />
					</div>
					<Pill bg="rgba(232,181,71,0.22)" color={Brand.colors.sunny}>
						Today's ritual
					</Pill>
					<div
						class="mt-2.5 max-w-[200px] text-[26px] font-semibold italic leading-[1.1] tracking-[-0.02em] text-cream"
						style:font-family={Brand.fonts.display}
					>
						The Italian opening — let's try it.
					</div>
					<div
						class="mt-2 max-w-[180px] text-[13px] leading-[1.4] text-cream opacity-70"
						style:font-family={Brand.fonts.body}
					>
						4 mins · A bishop, a knight, and you. Easy.
					</div>
					<div
						class="mt-3.5 flex items-center gap-1.5 text-[13px] font-semibold"
						style:color={Brand.colors.sunny}
						style:font-family={Brand.fonts.body}
					>
						Start ritual <span class="text-base">→</span>
					</div>
				</div>
			</button>
		</div>

		<!-- Progress strip -->
		<div class="flex gap-2.5" style:padding="16px 16px 6px">
			<Card style={{ flex: '1', padding: '14px' }}>
				<div class="flex items-center gap-1.5">
					<FlameIcon size={14} color={Brand.colors.sunny} />
					<span
						class="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-muted"
						style:font-family={Brand.fonts.body}
					>Streak</span>
				</div>
				<div
					class="mt-1 text-[28px] font-semibold tracking-[-0.02em] text-ink"
					style:font-family={Brand.fonts.display}
				>
					{streak} <span class="text-[13px] font-medium text-ink-muted" style:font-family={Brand.fonts.body}>days</span>
				</div>
				<div class="mt-1.5 flex gap-[3px]">
					{#each streakDays as _day, i (i)}
						<div
							class="h-[5px] flex-1 rounded-[3px]"
							style:background={Brand.colors.moss}
						></div>
					{/each}
				</div>
			</Card>
			<Card style={{ flex: '1', padding: '14px' }}>
				<div class="flex items-center gap-1.5">
					<StarIcon size={14} color={Brand.colors.sunny} />
					<span
						class="text-[11px] font-semibold uppercase tracking-[0.04em] text-ink-muted"
						style:font-family={Brand.fonts.body}
					>Today</span>
				</div>
				<div
					class="mt-1 text-[28px] font-semibold tracking-[-0.02em] text-ink"
					style:font-family={Brand.fonts.display}
				>
					{todayMins}<span class="text-[13px] font-medium text-ink-muted" style:font-family={Brand.fonts.body}>/{goalMins}m</span>
				</div>
				<div
					class="mt-1.5 h-[5px] overflow-hidden rounded-[3px]"
					style:background={Brand.colors.creamDeep}
				>
					<div
						class="h-full"
						style:width="{(todayMins / goalMins) * 100}%"
						style:background={Brand.colors.sunny}
					></div>
				</div>
			</Card>
		</div>

		<!-- Quick actions heading -->
		<div
			class="text-lg font-semibold italic tracking-[-0.01em] text-ink"
			style:padding="16px 20px 8px"
			style:font-family={Brand.fonts.display}
		>
			Pick something
		</div>

		<!-- Quick action buttons -->
		<div class="flex flex-col gap-2.5" style:padding="0 16px">
			{#each quickActions as r, i (i)}
				<button
					class="flex cursor-pointer items-center gap-3.5 rounded-[18px] border-none p-3.5 px-4 text-left"
					style:background={r.bg}
					style:color={r.fg}
					style:border={r.border ? `1.5px solid ${Brand.colors.creamDeep}` : 'none'}
					style:box-shadow={r.border ? 'none' : '0 6px 14px rgba(31,36,23,0.10)'}
					onclick={() => onNavigate(r.id)}
				>
					<div class="flex h-9 w-9 items-center justify-center text-[26px]">{r.emoji}</div>
					<div class="flex-1">
						<div
							class="text-[15px] font-semibold leading-[1.2]"
							style:font-family={Brand.fonts.body}
						>{r.title}</div>
						<div
							class="mt-0.5 text-[12px] opacity-70"
							style:font-family={Brand.fonts.body}
						>{r.sub}</div>
					</div>
					<div class="text-lg opacity-60">→</div>
				</button>
			{/each}
		</div>

		<!-- Rating peek -->
		<div style:padding="20px 16px 0">
			<Card style={{ padding: '14px' }}>
				<div class="flex items-center gap-3.5">
					<Mascot size={44} mood="happy" />
					<div class="flex-1">
						<div
							class="text-[13px] font-medium text-ink-muted"
							style:font-family={Brand.fonts.body}
						>Your rating</div>
						<div
							class="text-[22px] font-bold text-ink"
							style:font-family={Brand.fonts.mono}
						>
							{rating} <span class="text-[12px] font-semibold" style:color={Brand.colors.moss}>+18 this week</span>
						</div>
					</div>
					<button
						class="cursor-pointer border-none bg-transparent text-[13px] font-semibold text-ink-muted"
						style:font-family={Brand.fonts.body}
						onclick={() => onNavigate('you')}
					>Details →</button>
				</div>
			</Card>
		</div>
	</PaperBg>
</div>
