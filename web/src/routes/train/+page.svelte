<script lang="ts">
import { Brand } from '$lib/brand';
import TrainScreen from '$lib/components/screens/TrainScreen.svelte';

function onOpenPuzzle(puzzleId: string) {
	console.log('open puzzle', puzzleId);
}
</script>

<svelte:head>
	<title>{Brand.name} — Train</title>
</svelte:head>

<TrainScreen {onOpenPuzzle} />
