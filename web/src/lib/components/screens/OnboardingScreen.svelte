<script lang="ts">
import { Brand } from '$lib/brand';
import Button from '$lib/components/Button.svelte';
import Mascot from '$lib/components/Mascot.svelte';

let { onComplete }: { onComplete: () => void } = $props();

let step = $state(0);

const steps = [
	{
		title: 'Welcome to Pawnly!',
		mascot: 'happy' as const,
		text: 'Your friendly chess coach is here to make learning fun. No pressure, just play!',
	},
	{
		title: 'Learn by playing',
		mascot: 'thinking' as const,
		text: "We'll teach you chess through short, interactive lessons. No boring lectures — just hands-on practice.",
	},
	{
		title: 'Daily rituals',
		mascot: 'celebrating' as const,
		text: 'Just 5 minutes a day keeps your skills sharp. Build a streak and watch yourself improve.',
	},
	{
		title: 'Track your progress',
		mascot: 'thinking' as const,
		text: 'Watch your rating climb as you complete lessons and puzzles. Every move counts.',
	},
	{
		title: "Let's go!",
		mascot: 'happy' as const,
		text: 'Your first lesson awaits. Ready to make your first move?',
	},
];

function next() {
	if (step < steps.length - 1) {
		step++;
	} else {
		onComplete();
	}
}

function back() {
	if (step > 0) {
		step--;
	}
}
</script>

<div
	style:height="100%"
	style:display="flex"
	style:flex-direction="column"
	style:background={Brand.colors.cream}
>
	<!-- Step content -->
	<div
		style:flex="1"
		style:display="flex"
		style:flex-direction="column"
		style:align-items="center"
		style:justify-content="center"
		style:padding="32px"
	>
		<Mascot size={100} mood={steps[step].mascot} />
		<div
			style:font-family={Brand.fonts.display}
			style:font-style="italic"
			style:font-size="28px"
			style:font-weight="600"
			style:color={Brand.colors.ink}
			style:margin-top="24px"
			style:text-align="center"
		>
			{steps[step].title}
		</div>
		<div
			style:font-family={Brand.fonts.body}
			style:font-size="15px"
			style:color={Brand.colors.inkMuted}
			style:margin-top="12px"
			style:text-align="center"
			style:line-height="1.5"
		>
			{steps[step].text}
		</div>
	</div>

	<!-- Step indicator dots -->
	<div
		style:display="flex"
		style:justify-content="center"
		style:gap="8px"
		style:margin-bottom="24px"
	>
		{#each steps as _, i (i)}
			<div
				data-testid="dot"
				style:width={i === step ? '24px' : '8px'}
				style:height="8px"
				style:border-radius="4px"
				style:background={i === step ? Brand.colors.sunny : Brand.colors.creamDeep}
				style:transition="all 0.3s ease"
			></div>
		{/each}
	</div>

	<!-- Navigation -->
	<div
		style:padding="0 24px 48px"
		style:display="flex"
		style:gap="12px"
	>
		{#if step > 0}
			<Button kind="ghost" onclick={back} style={{ flex: '1' }}>Back</Button>
		{/if}
		<Button kind="primary" onclick={next} style={{ flex: '2' }}>
			{step < steps.length - 1 ? 'Continue' : 'Start learning!'}
		</Button>
	</div>
</div>
