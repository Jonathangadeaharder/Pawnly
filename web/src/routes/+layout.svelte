<script lang="ts">
import '../app.css';
import { goto } from '$app/navigation';
import { page } from '$app/stores';
import { Brand } from '$lib/brand';
import Overlay from '$lib/components/Overlay.svelte';
import GameScreen from '$lib/components/screens/GameScreen.svelte';
import ScanScreen from '$lib/components/screens/ScanScreen.svelte';
import TabBar from '$lib/components/TabBar.svelte';
import { auth } from '$lib/stores/auth.svelte';
import { overlay } from '$lib/stores/overlay.svelte';

let { children } = $props();

const isAuthPage = $derived($page.url.pathname === '/auth');

const isAuthenticated = $derived(!auth.loading && auth.user !== null);

$effect(() => {
	if (!auth.loading && !isAuthenticated && !isAuthPage) {
		goto('/auth');
	}
});

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

{#if auth.loading && !isAuthPage}
	<div class="loading-screen" style:background-color={Brand.colors.cream}>
		<div class="loading-spinner"></div>
	</div>
{:else}
	<div class="app-shell">
		{@render children()}
		{#if !isAuthPage}
			<TabBar active={activeTab} onChange={handleTabChange} />
		{/if}
		{#if overlay.current === 'game'}
			<GameScreen onExit={() => overlay.close()} />
		{:else if overlay.current === 'scan'}
			<ScanScreen onClose={() => overlay.close()} level={overlay.scanLevel} />
		{:else if overlay.current !== null}
			<Overlay visible={true} onClose={() => overlay.close()}>
				<div class="flex h-full items-center justify-center">
					<p class="font-body text-lg text-white">
						{overlay.current ?? ''} overlay
					</p>
				</div>
			</Overlay>
		{/if}
	</div>
{/if}

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

	.loading-screen {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid rgba(31, 36, 23, 0.15);
		border-top-color: #3F6B43;
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}
</style>
