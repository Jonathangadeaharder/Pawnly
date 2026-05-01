<script lang="ts">
import { Brand } from '$lib/brand';
import YouScreen from '$lib/components/screens/YouScreen.svelte';

function onSettings() {
	console.log('navigate to settings');
}
</script>

<svelte:head>
	<title>{Brand.name} — You</title>
</svelte:head>

<YouScreen {onSettings} />
