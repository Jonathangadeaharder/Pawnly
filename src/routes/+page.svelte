<script lang="ts">
import { goto } from '$app/navigation';
import { Brand } from '$lib/brand';
import HomeScreen from '$lib/components/screens/HomeScreen.svelte';
import { createUserRepository } from '$lib/repositories/user.svelte';
import { auth } from '$lib/stores/auth.svelte';

const repo = createUserRepository();

let name = $state('Player');
let rating = $state(0);
let streak = $state(0);
let xp = $state(0);

const routeMap: Record<string, string> = {
	play: '/play',
	train: '/train',
	learn: '/learn',
	you: '/you',
};

async function loadProfile() {
	await repo.loadProfile();
	if (repo.profile) {
		name = repo.profile.display_name || 'Player';
		rating = repo.profile.rating ?? 0;
		streak = repo.profile.streak ?? 0;
	}
}

if (auth.user) {
	loadProfile();
}

function onNavigate(screen: string) {
	const route = routeMap[screen] ?? `/${screen}`;
	goto(route);
}
</script>

<svelte:head>
	<title>{Brand.name} — {Brand.tagline}</title>
</svelte:head>

<HomeScreen {onNavigate} {name} {rating} {streak} {xp} />
