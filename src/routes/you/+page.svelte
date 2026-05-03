<script lang="ts">
import { Brand } from '$lib/brand';
import YouScreen from '$lib/components/screens/YouScreen.svelte';
import { achievements, getUnlockedAchievements } from '$lib/data/achievements';
import { createUserRepository } from '$lib/repositories/user.svelte';
import { auth } from '$lib/stores/auth.svelte';

const repo = createUserRepository();

let name = $state('Player');
let rating = $state(0);
let gamesPlayed = $state(0);
let puzzlesSolved = $state(0);

const stats = { games: 0, puzzles: 0, lessons: 0, rating: 0, streak: 0 };
const unlocked = getUnlockedAchievements(stats);

async function loadProfile() {
	await repo.loadProfile();
	if (repo.profile) {
		name = repo.profile.display_name || 'Player';
		rating = repo.profile.rating ?? 0;
		gamesPlayed = repo.profile.games_played ?? 0;
		puzzlesSolved = repo.profile.puzzles_solved ?? 0;
	}
}

if (auth.user) {
	loadProfile();
}

function onSettings() {
	console.log('navigate to settings');
}
</script>

<svelte:head>
	<title>{Brand.name} — You</title>
</svelte:head>

<YouScreen {name} {rating} {gamesPlayed} {puzzlesSolved} {onSettings} />
