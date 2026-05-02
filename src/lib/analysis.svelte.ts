/**
 * Post-Game Analysis Module
 * Replays games, evaluates positions with Stockfish, classifies moves
 */

import { Chess } from 'chess.js';
import { createStockfish, type MoveAnalysis } from './stockfish.svelte';
import { calculateAccuracy, classifyMove, createMoveAnalysis, getMoveComment } from './chess-utils';

export type { MoveAnalysis, PositionAnalysis } from './stockfish.svelte';
import type { GameAnalysis } from './stockfish.svelte';

export interface AnalysisState extends GameAnalysis {
	isAnalyzing: boolean;
	progress: number;
	currentMoveIndex: number;
	currentEvaluation: MoveAnalysis | null;
	currentPosition: string;
	goToMove: (index: number) => void;
	nextMove: () => void;
	prevMove: () => void;
	analyze: () => Promise<void>;
}

export { classifyMove, calculateAccuracy } from './chess-utils';

export function createAnalysis(moves: string[], startFen?: string): AnalysisState {
	const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
	const fen = startFen ?? DEFAULT_FEN;

	let isAnalyzing = $state(false);
	let progress = $state(0);
	let moveAnalyses = $state<MoveAnalysis[]>([]);
	let currentMoveIndex = $state(-1);

	const accuracy = $derived.by(() => {
		if (moveAnalyses.length === 0) return { white: 100, black: 100 };
		const stats = computeStats(moveAnalyses);
		return {
			white: calculateAccuracy(stats.white.totalLoss, stats.white.moves),
			black: calculateAccuracy(stats.black.totalLoss, stats.black.moves),
		};
	});

	const blunders = $derived.by(() => {
		if (moveAnalyses.length === 0) return { white: 0, black: 0 };
		const stats = computeStats(moveAnalyses);
		return { white: stats.white.blunders, black: stats.black.blunders };
	});

	const mistakes = $derived.by(() => {
		if (moveAnalyses.length === 0) return { white: 0, black: 0 };
		const stats = computeStats(moveAnalyses);
		return { white: stats.white.mistakes, black: stats.black.mistakes };
	});

	const inaccuracies = $derived.by(() => {
		if (moveAnalyses.length === 0) return { white: 0, black: 0 };
		const stats = computeStats(moveAnalyses);
		return { white: stats.white.inaccuracies, black: stats.black.inaccuracies };
	});

	const averageCentipawnLoss = $derived.by(() => {
		if (moveAnalyses.length === 0) return { white: 0, black: 0 };
		const stats = computeStats(moveAnalyses);
		return {
			white: stats.white.moves > 0 ? stats.white.totalLoss / stats.white.moves : 0,
			black: stats.black.moves > 0 ? stats.black.totalLoss / stats.black.moves : 0,
		};
	});

	const currentEvaluation = $derived(
		currentMoveIndex >= 0 && currentMoveIndex < moveAnalyses.length
			? moveAnalyses[currentMoveIndex]
			: null,
	);

	const currentPosition = $derived.by(() => {
		const chess = new Chess(fen);
		const endIndex = currentMoveIndex >= 0 ? currentMoveIndex + 1 : 0;
		for (let i = 0; i < endIndex && i < moves.length; i++) {
			chess.move(moves[i]);
		}
		return chess.fen();
	});

	function goToMove(index: number) {
		if (index >= -1 && index < moves.length) {
			currentMoveIndex = index;
		}
	}

	function nextMove() {
		if (currentMoveIndex < moves.length - 1) {
			currentMoveIndex++;
		}
	}

	function prevMove() {
		if (currentMoveIndex > -1) {
			currentMoveIndex--;
		}
	}

	async function analyze() {
		if (isAnalyzing) return;
		isAnalyzing = true;
		progress = 0;
		moveAnalyses = [];
		currentMoveIndex = -1;

		if (moves.length === 0) {
			progress = 100;
			isAnalyzing = false;
			return;
		}

		const stockfish = createStockfish();

		await new Promise<void>((resolve) => {
			const check = () => {
				if (stockfish.isReady) {
					resolve();
				} else {
					setTimeout(check, 50);
				}
			};
			check();
		});

		const chess = new Chess(fen);
		let previousEval = 0;
		const results: MoveAnalysis[] = [];

		for (let i = 0; i < moves.length; i++) {
			const move = moves[i];
			const isWhite = chess.turn() === 'w';
			chess.move(move);
			const afterFen = chess.fen();

			const posAnalysis = await stockfish.analyze(afterFen);
			const analysis = createMoveAnalysis(move, posAnalysis, previousEval, isWhite);
			results.push(analysis);
			previousEval = isWhite ? analysis.evaluation : -analysis.evaluation;
			progress = Math.round(((i + 1) / moves.length) * 100);
		}

		moveAnalyses = results;
		currentMoveIndex = moves.length > 0 ? 0 : -1;
		isAnalyzing = false;
		stockfish.quit();
	}

	return {
		get isAnalyzing() {
			return isAnalyzing;
		},
		get progress() {
			return progress;
		},
		get moves() {
			return moveAnalyses;
		},
		get accuracy() {
			return accuracy;
		},
		get blunders() {
			return blunders;
		},
		get mistakes() {
			return mistakes;
		},
		get inaccuracies() {
			return inaccuracies;
		},
		get averageCentipawnLoss() {
			return averageCentipawnLoss;
		},
		get currentMoveIndex() {
			return currentMoveIndex;
		},
		get currentEvaluation() {
			return currentEvaluation;
		},
		get currentPosition() {
			return currentPosition;
		},
		goToMove,
		nextMove,
		prevMove,
		analyze,
	};
}

interface PlayerStats {
	blunders: number;
	mistakes: number;
	inaccuracies: number;
	totalLoss: number;
	moves: number;
}

function computeStats(moveAnalyses: MoveAnalysis[]) {
	const stats = {
		white: { blunders: 0, mistakes: 0, inaccuracies: 0, totalLoss: 0, moves: 0 } as PlayerStats,
		black: { blunders: 0, mistakes: 0, inaccuracies: 0, totalLoss: 0, moves: 0 } as PlayerStats,
	};

	for (let i = 0; i < moveAnalyses.length; i++) {
		const analysis = moveAnalyses[i];
		const isWhite = i % 2 === 0;
		const player = isWhite ? stats.white : stats.black;

		player.moves++;
		player.totalLoss += Math.max(0, analysis.loss);
		if (analysis.classification === 'blunder') player.blunders++;
		else if (analysis.classification === 'mistake') player.mistakes++;
		else if (analysis.classification === 'inaccuracy') player.inaccuracies++;
	}

	return stats;
}


