<script lang="ts">
import { Brand } from '$lib/brand';
import Button from '$lib/components/Button.svelte';
import MiniBoard from '$lib/components/MiniBoard.svelte';
import { fenToPieces, getSquareFromCoords } from '$lib/board.svelte';
import {
	SCAN_COLORS,
	SCAN_MODE_LABELS,
	SCAN_MODE_ICONS,
	scanPositions,
	getActiveModes,
	getTargetTime,
	type ScanMode,
	type ScanPosition,
} from '$lib/data/scan-positions';

let {
	onClose,
	level = 1,
}: {
	onClose?: () => void;
	level?: number;
} = $props();

const activeModes = $derived(getActiveModes(level));
const targetTime = $derived(getTargetTime(level));

let currentIndex = $state(0);
let selectedMode = $state<ScanMode>('check');
let markedSquares = $state<Record<ScanMode, Set<string>>>({
	check: new Set(),
	capture: new Set(),
	threat: new Set(),
	loose: new Set(),
	doubleAttack: new Set(),
});
let timeLeft = $state(0);
let timerInterval = $state<ReturnType<typeof setInterval> | null>(null);
let submitted = $state(false);
let stars = $state(0);
let streak = $state(0);
let totalStars = $state(0);
let showResult = $state(false);

const position = $derived(
	scanPositions.filter((p) => p.level <= level)[currentIndex] ?? scanPositions[0],
);

const pieces = $derived(fenToPieces(position.fen));
const isFlipped = $derived(position.playerColor === 'b');

const boardSize = $derived.by(() => {
	if (typeof window === 'undefined') return 400;
	return Math.min(window.innerWidth - 32, 400);
});

const squareSize = $derived(boardSize / 8);

const lockedModes = $derived(
	(['loose', 'doubleAttack'] as ScanMode[]).filter((m) => !activeModes.includes(m)),
);

const highlights = $derived.by(() => {
	const h: { square: string; color: string; opacity: number }[] = [];
	for (const mode of activeModes) {
		for (const sq of markedSquares[mode]) {
			h.push({ square: sq, color: SCAN_COLORS[mode], opacity: submitted ? 0.55 : 0.4 });
		}
	}
	if (submitted) {
		const answerKey = position.answerKey;
		for (const mode of activeModes) {
			const correct = getCorrectSquares(mode);
			for (const sq of correct) {
				if (!markedSquares[mode].has(sq)) {
					h.push({ square: sq, color: '#4CAF50', opacity: 0.5 });
				}
			}
		}
	}
	return h;
});

const timerPercent = $derived(timeLeft > 0 ? (timeLeft / targetTime) * 100 : 0);
const timerColor = $derived(
	timerPercent > 50 ? Brand.colors.moss : timerPercent > 25 ? Brand.colors.sunny : Brand.colors.coral,
);

const formattedTime = $derived(() => {
	const m = Math.floor(timeLeft / 60);
	const s = timeLeft % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
});

const promptText = $derived.by(() => {
	if (submitted) return '';
	const mode = selectedMode;
	return `Find all ${SCAN_MODE_LABELS[mode].toLowerCase()}s`;
});

function getCorrectSquares(mode: ScanMode): string[] {
	const ak = position.answerKey;
	switch (mode) {
		case 'check': return ak.checks;
		case 'capture': return ak.captures;
		case 'threat': return ak.threats;
		case 'loose': return ak.loose ?? [];
		case 'doubleAttack': return ak.doubleAttack ?? [];
	}
}

function startTimer() {
	timeLeft = targetTime;
	if (timerInterval) clearInterval(timerInterval);
	timerInterval = setInterval(() => {
		timeLeft--;
		if (timeLeft <= 0) {
			timeLeft = 0;
			if (!submitted) handleSubmit();
		}
	}, 1000);
}

function stopTimer() {
	if (timerInterval) {
		clearInterval(timerInterval);
		timerInterval = null;
	}
}

function handleSquareClick(sq: string) {
	if (submitted) return;
	if (!activeModes.includes(selectedMode)) return;

	const mode = selectedMode;
	const current = new Set(markedSquares[mode]);
	if (current.has(sq)) {
		current.delete(sq);
	} else {
		current.add(sq);
	}
	markedSquares = { ...markedSquares, [mode]: current };
}

function handleBoardClick(event: MouseEvent) {
	if (submitted) return;
	const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
	const x = event.clientX - rect.left;
	const y = event.clientY - rect.top;
	const sq = getSquareFromCoords(x, y, squareSize, isFlipped);
	if (sq) handleSquareClick(sq);
}

function calculateStars(): number {
	let correct = 0;
	let total = 0;
	let wrong = 0;

	for (const mode of activeModes) {
		const expected = new Set(getCorrectSquares(mode));
		const marked = markedSquares[mode];
		total += expected.size;
		for (const sq of marked) {
			if (expected.has(sq)) {
				correct++;
			} else {
				wrong++;
			}
		}
	}

	if (total === 0) return 3;
	const percent = correct / total;
	if (percent < 0.5) return 0;
	if (wrong > 0) return 1;
	if (timeLeft > 0) return 3;
	return 2;
}

function handleSubmit() {
	if (submitted) return;
	submitted = true;
	stopTimer();
	stars = calculateStars();
	totalStars += stars;
	if (stars === 3) streak++;
	else streak = 0;
	showResult = true;
}

function handleNext() {
	const positions = scanPositions.filter((p) => p.level <= level);
	currentIndex = (currentIndex + 1) % positions.length;
	resetPosition();
}

function resetPosition() {
	submitted = false;
	showResult = false;
	stars = 0;
	markedSquares = {
		check: new Set(),
		capture: new Set(),
		threat: new Set(),
		loose: new Set(),
		doubleAttack: new Set(),
	};
	selectedMode = activeModes[0] ?? 'check';
	startTimer();
}

$effect(() => {
	startTimer();
	return () => stopTimer();
});
</script>

<div class="scan-screen" role="dialog" aria-label="Scan trainer">
	<!-- Header -->
	<div class="scan-header">
		<button class="close-btn" onclick={onClose} aria-label="Close scan">✕</button>
		<div class="scan-title">Scan</div>
		<div class="timer" style:color={timerColor}>
			⏱ {formattedTime()}
		</div>
		<div class="stars-display">
			{#each Array(3) as _, i (i)}
				<span class="star" class:earned={i < stars}>★</span>
			{/each}
		</div>
	</div>

	<!-- Timer bar -->
	<div class="timer-bar-track">
		<div
			class="timer-bar-fill"
			style:width="{timerPercent}%"
			style:background={timerColor}
		></div>
	</div>

	<!-- Board -->
	<div class="board-container">
		<div class="board-wrapper" onclick={handleBoardClick} role="button" tabindex="-1" aria-label="Chess board - tap squares to mark">
			<MiniBoard
				size={boardSize}
				{pieces}
				highlights={highlights}
				flip={isFlipped}
				showCoords={true}
			/>
		</div>
	</div>

	<!-- Prompt -->
	{#if promptText}
		<div class="prompt">{promptText}</div>
	{/if}

	<!-- Mode buttons -->
	<div class="mode-buttons">
		{#each activeModes as mode (mode)}
			<button
				class="mode-btn"
				class:active={selectedMode === mode}
				class:submitted
				style:--mode-color={SCAN_COLORS[mode]}
				onclick={() => { if (!submitted) selectedMode = mode; }}
				disabled={submitted}
			>
				<span class="mode-icon">{SCAN_MODE_ICONS[mode]}</span>
				<span class="mode-label">{SCAN_MODE_LABELS[mode]}</span>
			</button>
		{/each}
		{#each lockedModes as mode (mode)}
			<button class="mode-btn locked" disabled>
				<span class="mode-icon">🔒</span>
				<span class="mode-label">{SCAN_MODE_LABELS[mode]}</span>
			</button>
		{/each}
	</div>

	<!-- Submit / Result -->
	<div class="controls">
		{#if !submitted}
			<Button kind="moss" full onclick={handleSubmit}>Submit Scan</Button>
		{:else}
			<div class="result-card">
				<div class="result-stars">
					{#each Array(3) as _, i (i)}
						<span class="result-star" class:earned={i < stars}>★</span>
					{/each}
				</div>
				<div class="result-text">
					{#if stars === 3}
						Perfect! All found in time.
					{:else if stars === 2}
						All found, but over time.
					{:else if stars === 1}
						Some misses or wrong marks.
					{:else}
						Keep practicing!
					{/if}
				</div>
				{#if streak > 1}
					<div class="streak">🔥 {streak} streak!</div>
				{/if}
				<Button kind="moss" full onclick={handleNext}>Next position</Button>
			</div>
		{/if}
	</div>
</div>

<style>
	.scan-screen {
		position: fixed;
		inset: 0;
		z-index: 200;
		display: flex;
		flex-direction: column;
		background: var(--color-cream, #F6EFE2);
		background-image:
			radial-gradient(circle at 20% 10%, rgba(232, 181, 71, 0.06) 0px, transparent 40%),
			radial-gradient(circle at 80% 90%, rgba(63, 107, 67, 0.05) 0px, transparent 50%);
	}

	.scan-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 16px;
		gap: 12px;
	}

	.close-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: rgba(31, 36, 23, 0.08);
		border-radius: 10px;
		font-size: 18px;
		cursor: pointer;
		color: var(--color-ink, #1F2417);
		transition: background 0.15s ease;
	}

	.close-btn:hover {
		background: rgba(31, 36, 23, 0.14);
	}

	.scan-title {
		font-family: 'Fraunces', 'Iowan Old Style', Georgia, serif;
		font-size: 18px;
		font-weight: 600;
		color: var(--color-ink, #1F2417);
	}

	.timer {
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 16px;
		font-weight: 700;
	}

	.stars-display {
		display: flex;
		gap: 2px;
	}

	.star {
		font-size: 18px;
		color: rgba(31, 36, 23, 0.15);
	}

	.star.earned {
		color: #E8B547;
	}

	.timer-bar-track {
		height: 3px;
		background: rgba(31, 36, 23, 0.08);
	}

	.timer-bar-fill {
		height: 100%;
		transition: width 1s linear, background 0.3s ease;
	}

	.board-container {
		display: flex;
		justify-content: center;
		padding: 12px 16px;
		flex-shrink: 0;
	}

	.board-wrapper {
		cursor: pointer;
		border-radius: 12px;
	}

	.prompt {
		text-align: center;
		padding: 4px 16px 8px;
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 15px;
		font-weight: 600;
		color: var(--color-ink, #1F2417);
	}

	.mode-buttons {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		padding: 8px 16px;
	}

	.mode-btn {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 8px 14px;
		border: 2px solid transparent;
		border-radius: 12px;
		background: rgba(31, 36, 23, 0.06);
		cursor: pointer;
		transition: all 0.15s ease;
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 13px;
		font-weight: 600;
		color: var(--color-ink, #1F2417);
	}

	.mode-btn:hover:not(:disabled) {
		background: rgba(31, 36, 23, 0.1);
	}

	.mode-btn.active {
		border-color: var(--mode-color);
		background: color-mix(in srgb, var(--mode-color) 15%, transparent);
	}

	.mode-btn.locked {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.mode-btn.submitted {
		cursor: default;
	}

	.mode-icon {
		font-size: 16px;
	}

	.mode-label {
		font-size: 12px;
	}

	.controls {
		display: flex;
		gap: 8px;
		padding: 12px 16px 24px;
		margin-top: auto;
	}

	.result-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		width: 100%;
		gap: 8px;
	}

	.result-stars {
		display: flex;
		gap: 4px;
	}

	.result-star {
		font-size: 32px;
		color: rgba(31, 36, 23, 0.15);
		transition: color 0.3s ease;
	}

	.result-star.earned {
		color: #E8B547;
	}

	.result-text {
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 15px;
		font-weight: 600;
		color: var(--color-ink, #1F2417);
	}

	.streak {
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 14px;
		font-weight: 600;
		color: #E87A41;
	}
</style>
