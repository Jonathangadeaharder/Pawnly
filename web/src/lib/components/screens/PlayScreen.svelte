<script lang="ts">
import { Brand } from '$lib/brand';
import Card from '$lib/components/Card.svelte';
import Header from '$lib/components/Header.svelte';
import Button from '$lib/components/Button.svelte';
import PlayIcon from '$lib/components/icons/PlayIcon.svelte';

let { onStart }: { onStart: () => void } = $props();

let timeControl = $state('10min');
let difficulty = $state('adaptive');

const timeControls = [
	{ id: '5min', label: '5 min', sub: 'Quick' },
	{ id: '10min', label: '10 min', sub: 'Standard' },
	{ id: '15min', label: '15 min', sub: 'Relaxed' },
];

const difficulties = [
	{ id: 'easy', label: 'Easy', sub: "I'm learning", color: Brand.colors.moss },
	{ id: 'adaptive', label: 'Adaptive', sub: 'Match my level', color: Brand.colors.sunny },
	{ id: 'hard', label: 'Hard', sub: 'Challenge me', color: Brand.colors.coral },
];
</script>

<div style:height="100%" style:overflow-y="auto" style:padding-bottom="120px">
	<div style:min-height="100%">
		<Header title="Play" sub="Set up your game" />

		<div style:padding="0 16px">
			<Card style={{ padding: '20px', marginBottom: '16px' }}>
				<div
					style:font-family={Brand.fonts.body}
					style:font-size="11px"
					style:font-weight="600"
					style:color={Brand.colors.inkMuted}
					style:letter-spacing="0.04em"
					style:text-transform="uppercase"
					style:margin-bottom="12px"
				>
					Time control
				</div>
				<div style:display="flex" style:gap="8px">
					{#each timeControls as tc (tc.id)}
						<button
							onclick={() => (timeControl = tc.id)}
							style:flex="1"
							style:padding="12px 8px"
							style:border="none"
							style:border-radius="14px"
							style:background={timeControl === tc.id ? Brand.colors.ink : Brand.colors.creamDeep}
							style:color={timeControl === tc.id ? Brand.colors.cream : Brand.colors.ink}
							style:cursor="pointer"
							style:transition="all 0.2s ease"
						>
							<div
								style:font-family={Brand.fonts.mono}
								style:font-size="16px"
								style:font-weight="700"
							>
								{tc.label}
							</div>
							<div
								style:font-family={Brand.fonts.body}
								style:font-size="11px"
								style:opacity="0.7"
								style:margin-top="2px"
							>
								{tc.sub}
							</div>
						</button>
					{/each}
				</div>
			</Card>

			<Card style={{ padding: '20px', marginBottom: '16px' }}>
				<div
					style:font-family={Brand.fonts.body}
					style:font-size="11px"
					style:font-weight="600"
					style:color={Brand.colors.inkMuted}
					style:letter-spacing="0.04em"
					style:text-transform="uppercase"
					style:margin-bottom="12px"
				>
					Difficulty
				</div>
				<div style:display="flex" style:flex-direction="column" style:gap="8px">
					{#each difficulties as d (d.id)}
						<button
							onclick={() => (difficulty = d.id)}
							style:padding="14px 16px"
							style:border={difficulty === d.id
								? `2px solid ${d.color}`
								: `1.5px solid ${Brand.colors.creamDeep}`}
							style:border-radius="16px"
							style:background={difficulty === d.id ? `${d.color}15` : 'transparent'}
							style:cursor="pointer"
							style:display="flex"
							style:align-items="center"
							style:gap="12px"
							style:transition="all 0.2s ease"
						>
							<div
								style:width="10px"
								style:height="10px"
								style:border-radius="5px"
								style:background={d.color}
							></div>
							<div style:flex="1" style:text-align="left">
								<div
									style:font-family={Brand.fonts.body}
									style:font-size="15px"
									style:font-weight="600"
									style:color={Brand.colors.ink}
								>
									{d.label}
								</div>
								<div
									style:font-family={Brand.fonts.body}
									style:font-size="12px"
									style:color={Brand.colors.inkMuted}
									style:margin-top="1px"
								>
									{d.sub}
								</div>
							</div>
							{#if difficulty === d.id}
								<div style:color={d.color} style:font-size="18px">✓</div>
							{/if}
						</button>
					{/each}
				</div>
			</Card>

			<Button kind="primary" onclick={onStart} full>
				<PlayIcon size={18} color={Brand.colors.cream} />
				<span>Start game</span>
			</Button>
		</div>
	</div>
</div>
