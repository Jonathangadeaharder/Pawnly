<script lang="ts">
import { Brand } from '$lib/brand';
import HomeScreen from '$lib/components/screens/HomeScreen.svelte';

function onNavigate(screen: string) {
	console.log('navigate to', screen);
}
</script>

<svelte:head>
	<title>{Brand.name} — {Brand.tagline}</title>
</svelte:head>

<HomeScreen {onNavigate} />
