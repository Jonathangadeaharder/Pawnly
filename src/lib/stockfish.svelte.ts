import type { Square } from 'chess.js';
import { calculateAccuracy, classifyMove, createMoveAnalysis, getMoveComment } from './chess-utils';

export { calculateAccuracy, classifyMove, createMoveAnalysis } from './chess-utils';

export type StockfishDifficulty =
	| 'beginner'
	| 'intermediate'
	| 'advanced'
	| 'expert'
	| 'master'
	| 'grandmaster';

export interface StockfishMove {
	from: Square;
	to: Square;
	san: string;
	evaluation: number;
	mate?: number;
	depth: number;
	pv?: string[];
}

export interface MoveAnalysis {
	move: string;
	evaluation: number;
	previousEval: number;
	loss: number;
	classification:
		| 'brilliant'
		| 'great'
		| 'best'
		| 'good'
		| 'inaccuracy'
		| 'mistake'
		| 'blunder'
		| 'missed-win';
	comment: string;
	bestMove?: string;
	depth: number;
}

export interface PositionAnalysis {
	evaluation: number;
	mate?: number;
	bestMove: string;
	pv: string[];
	depth: number;
}

export interface GameAnalysis {
	moves: MoveAnalysis[];
	accuracy: { white: number; black: number };
	blunders: { white: number; black: number };
	mistakes: { white: number; black: number };
	inaccuracies: { white: number; black: number };
	averageCentipawnLoss: { white: number; black: number };
}

interface ParsedBestMove {
	bestMove: string;
	ponder?: string;
}

interface ParsedInfo {
	depth: number;
	score?: number;
	mate?: number;
	pv: string[];
}

interface DifficultySettings {
	depth: number;
	skillLevel: number;
	elo: number;
}

interface WorkerMessage {
	type: 'ready' | 'bestmove' | 'info' | 'error';
	data?: string;
}

export function parseBestMove(line: string): ParsedBestMove {
	const parts = line.split(' ');
	const bestMove = parts[1];
	const ponderIdx = parts.indexOf('ponder');
	const ponder =
		ponderIdx !== -1 && ponderIdx + 1 < parts.length ? parts[ponderIdx + 1] : undefined;
	return { bestMove, ponder };
}

export function parseInfoLine(line: string): ParsedInfo | null {
	if (!line.startsWith('info ')) return null;

	const depthMatch = line.match(/\bdepth\s+(\d+)/);
	const cpMatch = line.match(/\bscore\s+cp\s+(-?\d+)/);
	const mateMatch = line.match(/\bscore\s+mate\s+(-?\d+)/);
	const pvMatch = line.match(/\bpv\s+(.+)/);

	if (!depthMatch) return null;

	const depth = Number.parseInt(depthMatch[1], 10);
	const score = cpMatch ? Number.parseInt(cpMatch[1], 10) : undefined;
	const mate = mateMatch ? Number.parseInt(mateMatch[1], 10) : undefined;
	const pv = pvMatch ? pvMatch[1].split(' ') : [];

	return { depth, score, mate, pv };
}

export function getDifficultySettings(difficulty: StockfishDifficulty): DifficultySettings {
	const settings: Record<StockfishDifficulty, DifficultySettings> = {
		beginner: { depth: 1, skillLevel: 0, elo: 1000 },
		intermediate: { depth: 5, skillLevel: 5, elo: 1400 },
		advanced: { depth: 10, skillLevel: 10, elo: 1800 },
		expert: { depth: 15, skillLevel: 15, elo: 2200 },
		master: { depth: 18, skillLevel: 18, elo: 2600 },
		grandmaster: { depth: 20, skillLevel: 20, elo: 3200 },
	};
	return settings[difficulty];
}

function uciToSquare(uci: string): Square {
	return uci.slice(0, 2) as Square;
}

export function createStockfish() {
	let isReady = $state(false);
	let isThinking = $state(false);
	let bestMove = $state<StockfishMove | null>(null);
	let evaluation = $state(0);
	let depth = $state(0);
	let pv = $state<string[]>([]);

	let worker: Worker | null = null;
	let readyResolve: (() => void) | null = null;
	let analysisResolve: ((value: PositionAnalysis) => void) | null = null;
	let bestMoveResolve: ((value: StockfishMove) => void) | null = null;
	let currentDepth = 0;
	let currentScore: number | undefined;
	let currentMate: number | undefined;
	let currentPv: string[] = [];

	function initWorker() {
		worker = new Worker('/stockfish/worker.js');

		worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
			const msg = e.data;

			switch (msg.type) {
				case 'ready':
					isReady = true;
					if (readyResolve) {
						readyResolve();
						readyResolve = null;
					}
					break;

				case 'bestmove': {
					isThinking = false;
					if (!msg.data) break;
					const parsed = parseBestMove(msg.data);
					const result: StockfishMove = {
						from: uciToSquare(parsed.bestMove),
						to: uciToSquare(parsed.bestMove.slice(2)),
						san: parsed.bestMove,
						evaluation: currentScore ?? 0,
						mate: currentMate,
						depth: currentDepth,
						pv: [...currentPv],
					};
					bestMove = result;
					evaluation = currentScore ?? 0;
					depth = currentDepth;
					pv = [...currentPv];

					if (bestMoveResolve) {
						bestMoveResolve(result);
						bestMoveResolve = null;
					}
					if (analysisResolve) {
						analysisResolve({
							evaluation: currentScore ?? 0,
							mate: currentMate,
							bestMove: parsed.bestMove,
							pv: [...currentPv],
							depth: currentDepth,
						});
						analysisResolve = null;
					}
					break;
				}

				case 'info': {
					if (!msg.data) break;
					const parsed = parseInfoLine(msg.data);
					if (parsed) {
						currentDepth = parsed.depth;
						if (parsed.score !== undefined) currentScore = parsed.score;
						if (parsed.mate !== undefined) currentMate = parsed.mate;
						if (parsed.pv.length > 0) currentPv = parsed.pv;
					}
					break;
				}

				case 'error':
					console.error('[Stockfish Worker]', msg.data);
					break;
			}
		};

		worker.onerror = (e) => {
			console.error('[Stockfish Worker Error]', e);
		};
	}

	function sendCommand(cmd: string) {
		if (!worker) return;
		worker.postMessage({ type: 'command', data: cmd });
	}

	function waitForReady(): Promise<void> {
		if (isReady) return Promise.resolve();
		return new Promise((resolve) => {
			readyResolve = resolve;
		});
	}

	function analyze(fen: string, targetDepth = 18): Promise<PositionAnalysis> {
		return waitForReady().then(() => {
			isThinking = true;
			currentDepth = 0;
			currentScore = undefined;
			currentMate = undefined;
			currentPv = [];

			return new Promise<PositionAnalysis>((resolve) => {
				analysisResolve = resolve;
				sendCommand(`position fen ${fen}`);
				sendCommand(`go depth ${targetDepth}`);
			});
		});
	}

	function getBestMove(
		fen: string,
		difficulty: StockfishDifficulty = 'advanced',
	): Promise<StockfishMove> {
		return waitForReady().then(() => {
			const settings = getDifficultySettings(difficulty);
			isThinking = true;
			currentDepth = 0;
			currentScore = undefined;
			currentMate = undefined;
			currentPv = [];

			sendCommand(`setoption name Skill Level value ${settings.skillLevel}`);
			sendCommand(`position fen ${fen}`);
			sendCommand(`go depth ${settings.depth}`);

			return new Promise<StockfishMove>((resolve) => {
				bestMoveResolve = resolve;
			});
		});
	}

	function analyzeGame(
		moves: string[],
		startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		targetDepth = 18,
	): Promise<GameAnalysis> {
		return waitForReady().then(async () => {
			const { Chess } = await import('chess.js');
			const chess = new Chess(startFen);
			const analysis: MoveAnalysis[] = [];
			let previousEval = 0;

			const stats = {
				white: { blunders: 0, mistakes: 0, inaccuracies: 0, totalLoss: 0, moves: 0 },
				black: { blunders: 0, mistakes: 0, inaccuracies: 0, totalLoss: 0, moves: 0 },
			};

			for (const move of moves) {
				const isWhite = chess.turn() === 'w';
				chess.move(move);
				const afterFen = chess.fen();

				const posAnalysis = await analyze(afterFen, targetDepth);
				const moveAnalysis = createMoveAnalysis(move, posAnalysis, previousEval, isWhite);

				const player = isWhite ? stats.white : stats.black;
				player.moves++;
				player.totalLoss += Math.max(0, moveAnalysis.loss);
				if (moveAnalysis.classification === 'blunder') player.blunders++;
				else if (moveAnalysis.classification === 'mistake') player.mistakes++;
				else if (moveAnalysis.classification === 'inaccuracy') player.inaccuracies++;

				analysis.push(moveAnalysis);
				previousEval = isWhite ? moveAnalysis.evaluation : -moveAnalysis.evaluation;
			}

			return {
				moves: analysis,
				accuracy: {
					white: calculateAccuracy(stats.white.totalLoss, stats.white.moves),
					black: calculateAccuracy(stats.black.totalLoss, stats.black.moves),
				},
				blunders: { white: stats.white.blunders, black: stats.black.blunders },
				mistakes: { white: stats.white.mistakes, black: stats.black.mistakes },
				inaccuracies: { white: stats.white.inaccuracies, black: stats.black.inaccuracies },
				averageCentipawnLoss: {
					white: stats.white.moves > 0 ? stats.white.totalLoss / stats.white.moves : 0,
					black: stats.black.moves > 0 ? stats.black.totalLoss / stats.black.moves : 0,
				},
			};
		});
	}

	function stop() {
		if (worker) {
			worker.postMessage({ type: 'stop' });
			isThinking = false;
		}
	}

	function quit() {
		if (worker) {
			worker.postMessage({ type: 'quit' });
			worker = null;
			isReady = false;
			isThinking = false;
		}
	}

	function setSkillLevel(level: number) {
		sendCommand(`setoption name Skill Level value ${Math.max(0, Math.min(20, level))}`);
	}

	function setELO(elo: number) {
		const clampedElo = Math.max(1000, Math.min(3200, elo));
		sendCommand('setoption name UCI_LimitStrength value true');
		sendCommand(`setoption name UCI_Elo value ${clampedElo}`);
	}

	initWorker();

	return {
		get isReady() {
			return isReady;
		},
		get isThinking() {
			return isThinking;
		},
		get bestMove() {
			return bestMove;
		},
		get evaluation() {
			return evaluation;
		},
		get depth() {
			return depth;
		},
		get pv() {
			return pv;
		},
		analyze,
		getBestMove,
		analyzeGame,
		stop,
		quit,
		setSkillLevel,
		setELO,
	};
}
