<script lang="ts">
import { Brand } from '$lib/brand';
import Button from '$lib/components/Button.svelte';
import Chessboard from '$lib/components/Chessboard.svelte';
import { createGame, type Square } from '$lib/game.svelte';

interface PuzzleData {
	id: string;
	fen: string;
	solution: string[];
	turn: 'w' | 'b';
	title: string;
}

const PUZZLES: PuzzleData[] = [
	{
		id: 'p1',
		fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
		solution: ['h5f7'],
		turn: 'w',
		title: "Scholar's Mate",
	},
	{
		id: 'p2',
		fen: 'rnbqkb1r/ppp2ppp/3p4/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
		solution: ['f3e5', 'd6e5', 'd1h5'],
		turn: 'w',
		title: 'Fork Tactic',
	},
	{
		id: 'p3',
		fen: '2r3k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
		solution: ['e1e8'],
		turn: 'w',
		title: 'Back Rank Mate',
	},
];

let {
	onClose,
	onSolved,
	puzzleId = 'p1',
}: {
	onClose?: () => void;
	onSolved?: (puzzleId: string) => void;
	puzzleId?: string;
} = $props();

const puzzle = $derived(PUZZLES.find((p) => p.id === puzzleId) ?? PUZZLES[0]);
const game = $derived.by(() => createGame(puzzle.fen));

let attempts = $state(0);
let solved = $state(false);
let showingSolution = $state(false);
let feedback = $state<'correct' | 'incorrect' | null>(null);
let solutionStep = $state(0);

const maxAttempts = 3;

const boardSize = $derived.by(() => {
	if (typeof window === 'undefined') return 400;
	return Math.min(window.innerWidth - 32, 400);
});

const promptText = $derived(
	puzzle.turn === 'w' ? 'Find the best move for White' : 'Find the best move for Black',
);

const feedbackMessage = $derived.by(() => {
	if (feedback === 'correct') return 'Correct!';
	if (feedback === 'incorrect') return attempts >= maxAttempts ? 'Out of attempts' : 'Try again';
	return null;
});

const isFlipped = $derived(puzzle.turn === 'b');

const solutionArrow = $derived.by(() => {
	if (!showingSolution || solutionStep >= puzzle.solution.length) return [];
	const move = puzzle.solution[solutionStep];
	return [
		{ from: move.slice(0, 2) as Square, to: move.slice(2, 4) as Square, color: Brand.colors.sunny },
	];
});

function handleMove(from: Square, to: Square) {
	if (solved || showingSolution) return;

	const moveStr = `${from}${to}`;
	const expectedMove = puzzle.solution[0];

	if (moveStr === expectedMove) {
		solved = true;
		feedback = 'correct';
		onSolved?.(puzzle.id);
	} else {
		attempts++;
		feedback = 'incorrect';
		if (attempts >= maxAttempts) {
			showingSolution = true;
			solutionStep = 0;
		}
	}
}

function handleRetry() {
	attempts = 0;
	solved = false;
	showingSolution = false;
	feedback = null;
	solutionStep = 0;
}

function handleShowHint() {
	if (attempts < 2) {
		attempts = 2;
		feedback = 'incorrect';
	}
	attempts = maxAttempts;
	showingSolution = true;
	solutionStep = 0;
}

function handleNextPuzzle() {
	const currentIndex = PUZZLES.findIndex((p) => p.id === puzzle.id);
	const nextPuzzle = PUZZLES[(currentIndex + 1) % PUZZLES.length];
	puzzleId = nextPuzzle.id;
	handleRetry();
}

$effect(() => {
	if (showingSolution && solutionStep < puzzle.solution.length - 1) {
		const timer = setTimeout(() => {
			solutionStep++;
		}, 1500);
		return () => clearTimeout(timer);
	}
});
</script>

<div
	class="puzzle-screen"
	role="dialog"
	aria-label="Pawnly puzzle"
>
	<!-- Header -->
	<div class="puzzle-header">
		<button
			class="close-btn"
			onclick={onClose}
			aria-label="Close puzzle"
		>
			✕
		</button>
		<div class="puzzle-title">{puzzle.title}</div>
		<button
			class="hint-btn"
			onclick={handleShowHint}
			disabled={solved || showingSolution}
			aria-label="Show hint"
		>
			💡
		</button>
	</div>

	<!-- Board -->
	<div class="board-container">
		<Chessboard
			{game}
			size={boardSize}
			flipped={isFlipped}
			arrows={solutionArrow}
			onMove={handleMove}
		/>
	</div>

	<!-- Prompt -->
	<div class="prompt">
		{#if solved}
			<div class="prompt-solved">Solved!</div>
		{:else if showingSolution}
			<div class="prompt-solution">Solution revealed</div>
		{:else}
			<div class="prompt-text">{promptText}</div>
		{/if}
	</div>

	<!-- Feedback -->
	{#if feedbackMessage}
		<div class="feedback" class:correct={feedback === 'correct'} class:incorrect={feedback === 'incorrect'}>
			{feedbackMessage}
		</div>
	{/if}

	<!-- Attempts indicator -->
	{#if !solved && !showingSolution}
		<div class="attempts">
			{#each Array(maxAttempts) as _, i (i)}
				<span class="attempt-dot" class:used={i < attempts}></span>
			{/each}
		</div>
	{/if}

	<!-- Controls -->
	<div class="controls">
		{#if solved || showingSolution}
			<Button kind="moss" full onclick={handleNextPuzzle}>
				Next puzzle
			</Button>
			<Button kind="ghost" full onclick={handleRetry}>
				Retry
			</Button>
		{:else}
			<Button kind="ghost" full onclick={handleRetry} disabled={attempts === 0}>
				Retry
			</Button>
		{/if}
	</div>
</div>

<style>
	.puzzle-screen {
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

	.puzzle-header {
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

	.puzzle-title {
		font-family: 'Fraunces', 'Iowan Old Style', Georgia, serif;
		font-size: 18px;
		font-weight: 600;
		color: var(--color-ink, #1F2417);
	}

	.hint-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: rgba(232, 181, 71, 0.15);
		border-radius: 10px;
		font-size: 18px;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.hint-btn:hover:not(:disabled) {
		background: rgba(232, 181, 71, 0.25);
	}

	.hint-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.board-container {
		display: flex;
		justify-content: center;
		padding: 0 16px;
		flex-shrink: 0;
	}

	.prompt {
		text-align: center;
		padding: 16px 16px 8px;
	}

	.prompt-text {
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: var(--color-ink, #1F2417);
	}

	.prompt-solved {
		font-family: 'Fraunces', 'Iowan Old Style', Georgia, serif;
		font-size: 28px;
		font-weight: 600;
		font-style: italic;
		color: var(--color-moss, #3F6B43);
	}

	.prompt-solution {
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 16px;
		font-weight: 600;
		color: var(--color-sunny, #E8B547);
	}

	.feedback {
		text-align: center;
		padding: 4px 16px;
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 14px;
		font-weight: 600;
	}

	.feedback.correct {
		color: var(--color-moss, #3F6B43);
	}

	.feedback.incorrect {
		color: var(--color-coral, #D86B5A);
	}

	.attempts {
		display: flex;
		justify-content: center;
		gap: 8px;
		padding: 8px 16px;
	}

	.attempt-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: rgba(31, 36, 23, 0.12);
		transition: background 0.2s ease;
	}

	.attempt-dot.used {
		background: var(--color-coral, #D86B5A);
	}

	.controls {
		display: flex;
		gap: 8px;
		padding: 12px 16px 24px;
		margin-top: auto;
	}
</style>
