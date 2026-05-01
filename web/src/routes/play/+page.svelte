<script lang="ts">
import PlayScreen from '$lib/components/screens/PlayScreen.svelte';
import { goto } from '$app/navigation';

function handleStart() {
	goto('/play/game');
}
</script>

<PlayScreen onStart={handleStart} />
