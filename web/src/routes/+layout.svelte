<script lang="ts">
import '../app.css';
import { page } from '$app/stores';
import TabBar from '$lib/components/TabBar.svelte';
import Overlay from '$lib/components/Overlay.svelte';
import { overlay } from '$lib/stores/overlay.svelte';
import { goto } from '$app/navigation';

let { children } = $props();

const activeTab = $derived.by(() => {
	const path = $page.url.pathname;
	if (path === '/') return 'home';
	if (path.startsWith('/play')) return 'play';
	if (path.startsWith('/learn')) return 'learn';
	if (path.startsWith('/train')) return 'train';
	if (path.startsWith('/you')) return 'you';
	return 'home';
});

function handleTabChange(id: string) {
	const routes: Record<string, string> = {
		home: '/',
		play: '/play',
		learn: '/learn',
		train: '/train',
		you: '/you',
	};
	goto(routes[id] || '/');
}
</script>

<div class="app-shell">
	{@render children()}
	<TabBar active={activeTab} onChange={handleTabChange} />
	<Overlay visible={overlay.current !== null} onClose={() => overlay.close()}>
		<div class="flex h-full items-center justify-center">
			<p class="font-body text-lg text-white">
				{overlay.current ?? ''} overlay
			</p>
		</div>
	</Overlay>
</div>

<style>
	.app-shell {
		height: 100%;
		width: 100%;
		position: relative;
		min-height: 100vh;
		background: var(--color-cream);
		background-image:
			radial-gradient(circle at 20% 10%, rgba(232, 181, 71, 0.06) 0px, transparent 40%),
			radial-gradient(circle at 80% 90%, rgba(63, 107, 67, 0.05) 0px, transparent 50%);
	}
</style>
