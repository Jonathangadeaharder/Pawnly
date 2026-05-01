<script lang="ts">
import { Brand } from '$lib/brand';
import Button from '$lib/components/Button.svelte';
import Header from '$lib/components/Header.svelte';
import Mascot from '$lib/components/Mascot.svelte';
import MiniBoard from '$lib/components/MiniBoard.svelte';
import { fenToPieces, lessons } from '$lib/data/lessons';

let {
	onClose,
	lessonId = 'l3',
}: {
	onClose: () => void;
	lessonId?: string;
} = $props();

const lesson = $derived(lessons.find((l) => l.id === lessonId) ?? lessons[0]);

let step = $state(0);

const currentStep = $derived({
	pieces: fenToPieces(lesson.steps[step].fen),
	coach: lesson.steps[step].coach,
	highlights: lesson.steps[step].highlight.map((square) => ({ square })),
});
const isFirstStep = $derived(step === 0);
const isLastStep = $derived(step === lesson.steps.length - 1);

function goBack() {
	if (step > 0) step--;
}

function goNext() {
	if (step < lesson.steps.length - 1) {
		step++;
	} else {
		onClose();
	}
}
</script>

<div class="flex h-full flex-col">
	<Header title={lesson.title} onBack={onClose} />

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
			{step + 1} / {lesson.steps.length}
		</div>
		<Button kind="primary" onclick={goNext}>
			{isLastStep ? 'Finish' : 'Next'}
		</Button>
	</div>
</div>
