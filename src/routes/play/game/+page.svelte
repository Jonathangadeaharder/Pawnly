<script lang="ts">
import { goto } from '$app/navigation';
import GameScreen from '$lib/components/screens/GameScreen.svelte';

function handleExit() {
	goto('/play');
}
</script>

<svelte:head>
	<title>Game — Chess</title>
</svelte:head>

<GameScreen onExit={handleExit} />
