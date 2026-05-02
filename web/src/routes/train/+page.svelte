<script lang="ts">
import { Brand } from '$lib/brand';
import TrainScreen from '$lib/components/screens/TrainScreen.svelte';
import { overlay } from '$lib/stores/overlay.svelte';

function onOpenPuzzle(puzzleId: string) {
	console.log('open puzzle', puzzleId);
}

function onOpenScan() {
	overlay.openScan();
}
</script>

<svelte:head>
	<title>{Brand.name} — Train</title>
</svelte:head>

<TrainScreen {onOpenPuzzle} {onOpenScan} />
