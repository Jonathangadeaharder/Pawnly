<script lang="ts">
import { Brand } from '$lib/brand';
import {
	HomeIcon,
	PlayIcon,
	LearnIcon,
	TrainIcon,
	YouIcon,
} from '$lib/components/icons';

let {
	active = 'home',
	onChange,
}: {
	active?: string;
	onChange?: (id: string) => void;
} = $props();

const tabs = [
	{ id: 'home', label: 'Home', Icon: HomeIcon },
	{ id: 'play', label: 'Play', Icon: PlayIcon },
	{ id: 'learn', label: 'Learn', Icon: LearnIcon },
	{ id: 'train', label: 'Train', Icon: TrainIcon },
	{ id: 'you', label: 'You', Icon: YouIcon },
];
</script>

<div
	class="tabbar-outer"
	style:position="absolute"
	style:bottom="0"
	style:left="0"
	style:right="0"
	style:padding-bottom="28px"
	style:padding-top="8px"
	style:background="linear-gradient(180deg, {Brand.colors.cream}00 0%, {Brand.colors.cream} 30%)"
>
	<div
		class="tabbar-pill"
		style:margin="0 16px"
		style:padding="6px"
		style:background={Brand.colors.ink}
		style:border-radius="22px"
		style:display="flex"
		style:justify-content="space-between"
		style:box-shadow="0 12px 32px rgba(31,36,23,0.25)"
	>
		{#each tabs as tab (tab.id)}
			{@const isActive = active === tab.id}
			<button
				onclick={() => onChange?.(tab.id)}
				class="tab-btn"
				style:flex="1"
				style:padding="10px 4px"
				style:border="none"
				style:background={isActive ? Brand.colors.sunny : 'transparent'}
				style:border-radius="16px"
				style:cursor="pointer"
				style:display="flex"
				style:flex-direction="column"
				style:align-items="center"
				style:gap="2px"
				style:transition="all 0.2s ease"
			>
				<tab.Icon size={20} color={isActive ? Brand.colors.ink : Brand.colors.cream} />
				<span
					style:font-family={Brand.fonts.body}
					style:font-size="10px"
					style:font-weight="600"
					style:color={isActive ? Brand.colors.ink : Brand.colors.cream}
					style:opacity={isActive ? 1 : 0.7}
				>
					{tab.label}
				</span>
			</button>
		{/each}
	</div>
</div>
