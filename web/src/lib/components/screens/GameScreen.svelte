<script lang="ts">
import { Brand } from '$lib/brand';
import { createGame } from '$lib/game.svelte';
import { createStockfish, type StockfishDifficulty } from '$lib/stockfish.svelte';
import { createAnalysis } from '$lib/analysis.svelte';
import Chessboard from '$lib/components/Chessboard.svelte';
import Pill from '$lib/components/Pill.svelte';
import Button from '$lib/components/Button.svelte';
import Card from '$lib/components/Card.svelte';
import type { Square } from '$lib/game.svelte';

let {
	onExit,
	difficulty = 'intermediate',
	timeControl = '10+0',
}: {
	onExit?: () => void;
	difficulty?: string;
	timeControl?: string;
} = $props();

const game = createGame();
const engine = createStockfish();

let isThinking = $state(false);
let whiteTime = $state(parseTimeControl(timeControl));
let blackTime = $state(parseTimeControl(timeControl));
let clockInterval = $state<ReturnType<typeof setInterval> | null>(null);
let showGameOver = $state(false);
let gameOverReason = $state<'resign' | 'draw' | 'timeout' | 'engine' | null>(null);
let isAnalyzing = $state(false);
let analysisResult = $state<ReturnType<typeof createAnalysis> | null>(null);
let moveListEl = $state<HTMLDivElement | null>(null);

const boardSize = $derived.by(() => {
	if (typeof window === 'undefined') return 400;
	return Math.min(window.innerWidth - 32, 400);
});

const formattedWhiteTime = $derived(formatTime(whiteTime));
const formattedBlackTime = $derived(formatTime(blackTime));

const difficultyLabel = $derived(
	difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
);

const gameOverMessage = $derived.by(() => {
	if (!showGameOver) return '';
	if (gameOverReason === 'resign') return 'Coach wins';
	if (gameOverReason === 'draw') return 'Draw';
	if (gameOverReason === 'timeout') return 'Time out';
	if (game.isGameOver) {
		if (game.result === '1-0') return 'You win!';
		if (game.result === '0-1') return 'Coach wins';
		return 'Draw';
	}
	return '';
});

const gameOverSubtext = $derived.by(() => {
	if (!showGameOver) return '';
	if (gameOverReason === 'resign') return 'by resignation';
	if (gameOverReason === 'draw') return 'by agreement';
	if (gameOverReason === 'timeout') return '';
	if (game.isCheckmate) return 'by checkmate';
	if (game.isStalemate) return 'by stalemate';
	if (game.result === '1/2-1/2') return 'by agreement';
	return '';
});

function parseTimeControl(tc: string): number {
	const parts = tc.split('+');
	const minutes = Number.parseInt(parts[0], 10) || 10;
	return minutes * 60;
}

function formatTime(seconds: number): string {
	const m = Math.floor(seconds / 60);
	const s = seconds % 60;
	return `${m}:${s.toString().padStart(2, '0')}`;
}

function startClock() {
	if (clockInterval) clearInterval(clockInterval);
	clockInterval = setInterval(() => {
		if (game.isGameOver) {
			if (clockInterval) clearInterval(clockInterval);
			return;
		}
		if (game.turn === 'w') {
			whiteTime = Math.max(0, whiteTime - 1);
			if (whiteTime === 0) {
				gameOverByTimeout('w');
			}
		} else {
			blackTime = Math.max(0, blackTime - 1);
			if (blackTime === 0) {
				gameOverByTimeout('b');
			}
		}
	}, 1000);
}

function gameOverByTimeout(_side: 'w' | 'b') {
	if (clockInterval) clearInterval(clockInterval);
	gameOverReason = 'timeout';
	showGameOver = true;
}

function handlePlayerMove(from: Square, to: Square) {
	if (game.isGameOver || game.turn !== 'w') return;

	startClock();

	setTimeout(async () => {
		if (game.isGameOver) return;
		isThinking = true;
		try {
			const bestMove = await engine.getBestMove(game.fen, difficulty as StockfishDifficulty);
			if (!game.isGameOver && bestMove) {
				game.makeMove(bestMove.from, bestMove.to);
			}
		} catch (e) {
			console.error('[GameScreen] Engine error:', e);
		} finally {
			isThinking = false;
			if (game.isGameOver) {
				gameOverReason = 'engine';
				showGameOver = true;
			}
		}
	}, 300);
}

function handleResign() {
	if (game.isGameOver || showGameOver) return;
	gameOverReason = 'resign';
	showGameOver = true;
	if (clockInterval) clearInterval(clockInterval);
}

function handleOfferDraw() {
	if (game.isGameOver || showGameOver) return;
	gameOverReason = 'draw';
	showGameOver = true;
	if (clockInterval) clearInterval(clockInterval);
}

function handleUndo() {
	if (game.moves.length < 2) return;
	game.undoMove();
	game.undoMove();
}

async function handleAnalyze() {
	if (!game.moves.length) return;
	isAnalyzing = true;
	const moveSans = game.moves.map((m) => m.san!);
	const analysis = createAnalysis(moveSans);
	analysisResult = analysis;
	await analysis.analyze();
	isAnalyzing = false;
}

function handleNewGame() {
	game.resetGame();
	whiteTime = parseTimeControl(timeControl);
	blackTime = parseTimeControl(timeControl);
	showGameOver = false;
	gameOverReason = null;
	analysisResult = null;
	isThinking = false;
	if (clockInterval) clearInterval(clockInterval);
}

function handleExit() {
	if (clockInterval) clearInterval(clockInterval);
	engine.quit();
	onExit?.();
}

$effect(() => {
	if (moveListEl && game.moves.length > 0) {
		moveListEl.scrollTop = moveListEl.scrollHeight;
	}
});

$effect(() => {
	return () => {
		if (clockInterval) clearInterval(clockInterval);
		engine.quit();
	};
});
</script>

<div
	class="game-screen"
	role="dialog"
	aria-label="Chess game"
>
	<!-- Header -->
	<div class="game-header">
		<button
			class="close-btn"
			onclick={handleExit}
			aria-label="Exit game"
		>
			✕
		</button>
		<Pill bg="rgba(63,107,67,0.15)" color={Brand.colors.moss}>
			{difficultyLabel}
		</Pill>
		<div class="clocks">
			<div class="clock" class:active-turn={game.turn === 'b' && !game.isGameOver}>
				<span class="clock-label">⚫</span>
				<span class="clock-time">{formattedBlackTime}</span>
			</div>
			<div class="clock" class:active-turn={game.turn === 'w' && !game.isGameOver}>
				<span class="clock-label">⚪</span>
				<span class="clock-time">{formattedWhiteTime}</span>
			</div>
		</div>
	</div>

	<!-- Board -->
	<div class="board-container">
		<Chessboard
			{game}
			size={boardSize}
			onMove={handlePlayerMove}
		/>
		{#if isThinking}
			<div class="thinking-overlay">
				<div class="thinking-dots">
					<span></span><span></span><span></span>
				</div>
			</div>
		{/if}
	</div>

	<!-- Move list -->
	<div class="move-list" bind:this={moveListEl}>
		{#if game.moves.length === 0}
			<div class="move-list-empty">Your move — tap a piece</div>
		{:else}
			{#each game.moves as move, i (i)}
				{#if i % 2 === 0}
					<div class="move-pair">
						<span class="move-number">{Math.floor(i / 2) + 1}.</span>
						<span class="move-san">{move.san}</span>
						{#if i + 1 < game.moves.length}
							<span class="move-san">{game.moves[i + 1].san}</span>
						{/if}
					</div>
				{/if}
			{/each}
		{/if}
	</div>

	<!-- Controls -->
	<div class="controls">
		<button
			class="control-btn"
			onclick={handleUndo}
			disabled={game.moves.length < 2 || game.isGameOver || showGameOver}
			aria-label="Undo move"
		>
			↩ Undo
		</button>
		<button
			class="control-btn"
			onclick={handleOfferDraw}
			disabled={game.isGameOver || showGameOver}
			aria-label="Offer draw"
		>
			½ Draw
		</button>
		<button
			class="control-btn resign"
			onclick={handleResign}
			disabled={game.isGameOver || showGameOver}
			aria-label="Resign"
		>
			🏳 Resign
		</button>
	</div>

	<!-- Game Over Dialog -->
	{#if showGameOver || game.isGameOver}
		<div class="game-over-backdrop">
			<Card raised>
				<div class="game-over-content">
					<div class="game-over-result">{gameOverMessage}</div>
					<div class="game-over-sub">{gameOverSubtext}</div>

					{#if analysisResult && analysisResult.moves.length > 0}
						<div class="analysis-summary">
							<div class="analysis-row">
								<span>Accuracy</span>
								<span>{analysisResult.accuracy.white}% / {analysisResult.accuracy.black}%</span>
							</div>
							<div class="analysis-row">
								<span>Blunders</span>
								<span>{analysisResult.blunders.white} / {analysisResult.blunders.black}</span>
							</div>
							<div class="analysis-row">
								<span>Mistakes</span>
								<span>{analysisResult.mistakes.white} / {analysisResult.mistakes.black}</span>
							</div>
						</div>
					{/if}

					<div class="game-over-actions">
						<Button kind="moss" full onclick={handleAnalyze} disabled={isAnalyzing}>
							{isAnalyzing ? 'Analyzing…' : 'Analyze game'}
						</Button>
						<Button kind="ghost" full onclick={handleNewGame}>
							New game
						</Button>
						<Button kind="ghost" full onclick={handleExit}>
							Exit
						</Button>
					</div>
				</div>
			</Card>
		</div>
	{/if}
</div>

<style>
	.game-screen {
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

	.game-header {
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

	.clocks {
		display: flex;
		gap: 8px;
	}

	.clock {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 4px 10px;
		border-radius: 8px;
		background: rgba(31, 36, 23, 0.06);
		font-family: 'Geist Mono', ui-monospace, monospace;
		font-size: 14px;
		font-weight: 600;
		transition: background 0.2s ease;
	}

	.clock.active-turn {
		background: rgba(63, 107, 67, 0.15);
		box-shadow: 0 0 0 1.5px rgba(63, 107, 67, 0.3);
	}

	.clock-label {
		font-size: 12px;
	}

	.clock-time {
		font-variant-numeric: tabular-nums;
	}

	.board-container {
		display: flex;
		justify-content: center;
		padding: 0 16px;
		position: relative;
		flex-shrink: 0;
	}

	.thinking-overlay {
		position: absolute;
		bottom: 8px;
		right: 24px;
		background: rgba(31, 36, 23, 0.8);
		border-radius: 8px;
		padding: 6px 12px;
	}

	.thinking-dots {
		display: flex;
		gap: 4px;
	}

	.thinking-dots span {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #F6EFE2;
		animation: dot-pulse 1.2s infinite ease-in-out;
	}

	.thinking-dots span:nth-child(2) {
		animation-delay: 0.2s;
	}

	.thinking-dots span:nth-child(3) {
		animation-delay: 0.4s;
	}

	@keyframes dot-pulse {
		0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
		40% { opacity: 1; transform: scale(1); }
	}

	.move-list {
		flex: 1;
		overflow-y: auto;
		padding: 8px 16px;
		min-height: 60px;
	}

	.move-list-empty {
		text-align: center;
		padding: 16px;
		color: var(--color-ink-muted, #6B7361);
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 14px;
	}

	.move-pair {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 3px 0;
		font-family: 'Geist Mono', ui-monospace, monospace;
		font-size: 14px;
	}

	.move-number {
		color: var(--color-ink-muted, #6B7361);
		min-width: 24px;
		text-align: right;
	}

	.move-san {
		min-width: 48px;
	}

	.controls {
		display: flex;
		gap: 8px;
		padding: 12px 16px 24px;
	}

	.control-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 4px;
		padding: 12px 8px;
		border: 1.5px solid rgba(31, 36, 23, 0.12);
		background: rgba(255, 255, 255, 0.5);
		border-radius: 12px;
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
		color: var(--color-ink, #1F2417);
		transition: all 0.15s ease;
	}

	.control-btn:hover:not(:disabled) {
		background: rgba(255, 255, 255, 0.8);
		border-color: rgba(31, 36, 23, 0.2);
	}

	.control-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.control-btn.resign {
		color: var(--color-coral, #D86B5A);
		border-color: rgba(216, 107, 90, 0.2);
	}

	.control-btn.resign:hover:not(:disabled) {
		background: rgba(216, 107, 90, 0.08);
	}

	.game-over-backdrop {
		position: fixed;
		inset: 0;
		z-index: 300;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(31, 36, 23, 0.5);
		padding: 24px;
		animation: fade-in 0.2s ease-out;
	}

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.game-over-content {
		text-align: center;
		min-width: 260px;
	}

	.game-over-result {
		font-family: 'Fraunces', 'Iowan Old Style', Georgia, serif;
		font-size: 32px;
		font-weight: 600;
		font-style: italic;
		color: var(--color-ink, #1F2417);
		letter-spacing: -0.02em;
	}

	.game-over-sub {
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 14px;
		color: var(--color-ink-muted, #6B7361);
		margin-top: 4px;
	}

	.analysis-summary {
		margin-top: 16px;
		padding: 12px;
		background: rgba(31, 36, 23, 0.04);
		border-radius: 12px;
	}

	.analysis-row {
		display: flex;
		justify-content: space-between;
		padding: 4px 0;
		font-family: 'Geist', -apple-system, system-ui, sans-serif;
		font-size: 13px;
	}

	.analysis-row span:first-child {
		color: var(--color-ink-muted, #6B7361);
	}

	.analysis-row span:last-child {
		font-weight: 600;
		font-family: 'Geist Mono', ui-monospace, monospace;
	}

	.game-over-actions {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-top: 20px;
	}
</style>
