<script lang="ts">
import { Brand } from '$lib/brand';
import PaperBg from '$lib/components/PaperBg.svelte';
import { achievements, getUnlockedAchievements } from '$lib/data/achievements';

const stats = { games: 0, puzzles: 0, lessons: 0, rating: 0, streak: 0 };
const unlocked = getUnlockedAchievements(stats);
</script>

<svelte:head>
	<title>{Brand.name} — You</title>
</svelte:head>

<PaperBg>
	<div class="p-8 pb-28">
		<div class="mx-auto max-w-lg">
			<h1 class="font-display text-3xl font-semibold italic tracking-tight text-ink">
				You
			</h1>
			<p class="mt-2 font-body text-lg text-ink-muted">
				Your profile and stats
			</p>
			<section class="mt-8">
				<h2 class="font-display text-xl font-semibold text-ink">Achievements</h2>
				<ul class="mt-4 space-y-3">
					{#each achievements as achievement}
						<li class="flex items-center gap-3 rounded-lg bg-white/50 p-3">
							<span class="text-2xl">{achievement.emoji}</span>
							<div>
								<p class="font-body font-medium text-ink">
									{achievement.label}
									{#if unlocked.some((u) => u.id === achievement.id)}
										<span class="ml-2 text-xs text-green-600">Unlocked</span>
									{/if}
								</p>
								<p class="font-body text-sm text-ink-muted">{achievement.description}</p>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		</div>
	</div>
</PaperBg>
