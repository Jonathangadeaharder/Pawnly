<script lang="ts">
import { Brand } from '$lib/brand';
import YouScreen from '$lib/components/screens/YouScreen.svelte';
import { achievements, getUnlockedAchievements } from '$lib/data/achievements';

const stats = { games: 0, puzzles: 0, lessons: 0, rating: 0, streak: 0 };
const unlocked = getUnlockedAchievements(stats);

function onSettings() {
	console.log('navigate to settings');
}
</script>

<svelte:head>
	<title>{Brand.name} — You</title>
</svelte:head>

<YouScreen {onSettings} {achievements} {unlocked} />
