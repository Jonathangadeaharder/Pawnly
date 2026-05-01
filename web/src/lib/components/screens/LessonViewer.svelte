<script lang="ts">
import { Brand } from '$lib/brand';
import Header from '$lib/components/Header.svelte';
import Mascot from '$lib/components/Mascot.svelte';
import MiniBoard from '$lib/components/MiniBoard.svelte';
import Button from '$lib/components/Button.svelte';

let {
	onClose,
	lessonId = 'special-moves',
}: {
	onClose: () => void;
	lessonId?: string;
} = $props();

let step = $state(0);

const steps = [
	{
		pieces: {} as Record<string, string>,
		coach: 'Welcome! Let\'s learn about special moves.',
		highlights: [] as { square: string }[],
	},
	{
		pieces: {
			e5: 'wp',
			d5: 'bp',
			e8: 'bk',
			e1: 'wk',
		} as Record<string, string>,
		coach: 'En passant is when a pawn captures an enemy pawn that just moved two squares. It looks like the pawn moves diagonally past the enemy!',
		highlights: [{ square: 'e5' }, { square: 'd6' }],
	},
	{
		pieces: {
			e1: 'wk',
			h1: 'wr',
			a1: 'wr',
			e8: 'bk',
		} as Record<string, string>,
		coach: 'Castling moves the king two squares toward a rook, then the rook jumps to the other side. Great for safety!',
		highlights: [{ square: 'e1' }, { square: 'g1' }],
	},
	{
		pieces: {
			e7: 'wp',
			e8: 'bk',
			e1: 'wk',
		} as Record<string, string>,
		coach: 'Promotion happens when a pawn reaches the other end of the board. It becomes a queen, rook, bishop, or knight!',
		highlights: [{ square: 'e8' }],
	},
];

const currentStep = $derived(steps[step]);
const isFirstStep = $derived(step === 0);
const isLastStep = $derived(step === steps.length - 1);

function goBack() {
	if (step > 0) step--;
}

function goNext() {
	if (step < steps.length - 1) {
		step++;
	} else {
		onClose();
	}
}
</script>

<div class="flex h-full flex-col">
	<Header title="Special moves" onBack={onClose} />

	<div style:padding="0 16px">
		<div
			style:background={Brand.colors.cream}
			style:border-radius="18px"
			style:padding="16px"
			style:margin-bottom="16px"
		>
			<div class="flex items-start gap-2.5">
				<Mascot size={36} mood="thinking" />
				<div class="flex-1">
					<div
						style:font-family={Brand.fonts.body}
						style:font-size="14px"
						style:color={Brand.colors.ink}
						style:line-height="1.5"
					>
						{currentStep.coach}
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="flex flex-1 items-center justify-center" style:padding="16px">
		<MiniBoard size={280} pieces={currentStep.pieces} highlights={currentStep.highlights} />
	</div>

	<div class="flex gap-2.5" style:padding="16px">
		{#if isFirstStep}
			<div style:width="80px"></div>
		{:else}
			<Button kind="ghost" onclick={goBack}>
				Back
			</Button>
		{/if}
		<div
			class="flex-1 self-center text-center"
			style:font-family={Brand.fonts.mono}
			style:font-size="13px"
			style:color={Brand.colors.inkMuted}
		>
			{step + 1} / {steps.length}
		</div>
		<Button kind="primary" onclick={goNext}>
			{isLastStep ? 'Finish' : 'Next'}
		</Button>
	</div>
</div>
