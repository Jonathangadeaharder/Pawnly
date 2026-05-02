<script lang="ts">
import { goto } from '$app/navigation';
import PlayScreen from '$lib/components/screens/PlayScreen.svelte';

function handleStart() {
	goto('/play/game');
}
</script>

<PlayScreen onStart={handleStart} />
