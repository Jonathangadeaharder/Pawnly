<script lang="ts">
import { Brand } from '$lib/brand';
import LearnScreen from '$lib/components/screens/LearnScreen.svelte';

function onOpenLesson(lessonId: string) {
	console.log('open lesson', lessonId);
}
</script>

<svelte:head>
	<title>{Brand.name} — Learn</title>
</svelte:head>

<LearnScreen {onOpenLesson} />
