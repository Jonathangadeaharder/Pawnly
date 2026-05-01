<script lang="ts">
import { goto } from '$app/navigation';
import { Brand } from '$lib/brand';
import OnboardingScreen from '$lib/components/screens/OnboardingScreen.svelte';

function onComplete() {
	goto('/');
}
</script>

<svelte:head>
	<title>{Brand.name} — Onboarding</title>
</svelte:head>

<OnboardingScreen {onComplete} />
