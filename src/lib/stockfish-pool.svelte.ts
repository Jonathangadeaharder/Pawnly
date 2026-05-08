import type { Square } from 'chess.js';
import { calculateAccuracy, createMoveAnalysis } from './chess-utils';

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

export const MAX_DEPTH = 22;
export const MAX_TIME_MS = 10_000;

export function clampDepth(requested: number): number {
	return Math.min(Math.max(1, requested), MAX_DEPTH);
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

	const depthRe = /\bdepth\s+(\d+)/;
	const cpRe = /\bscore\s+cp\s+(-?\d+)/;
	const mateRe = /\bscore\s+mate\s+(-?\d+)/;
	const pvRe = /\bpv\s+(.+)/;
	const depthMatch = depthRe.exec(line);
	const cpMatch = cpRe.exec(line);
	const mateMatch = mateRe.exec(line);
	const pvMatch = pvRe.exec(line);

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

export type ErrorCallback = (message: string) => void;

interface QueuedJob<T> {
	execute: () => Promise<T>;
	resolve: (value: T) => void;
	reject: (reason: unknown) => void;
}

let poolInstance: StockfishPool | null = null;

export function getStockfishPool(onError?: ErrorCallback): StockfishPool {
	if (!poolInstance) {
		poolInstance = new StockfishPool(onError);
	}
	if (onError) {
		poolInstance.onError = onError;
	}
	return poolInstance;
}

export function resetStockfishPool(): void {
	if (poolInstance) {
		poolInstance.destroy();
		poolInstance = null;
	}
}

export class StockfishPool {
	private worker: Worker | null = null;
	private isReady = false;
	private readyResolve: (() => void) | null = null;
	private queue: QueuedJob<unknown>[] = [];
	private processing = false;
	private currentReject: ((reason: unknown) => void) | null = null;
	private timeLimitTimer: ReturnType<typeof setTimeout> | null = null;

	private currentDepth = 0;
	private currentScore: number | undefined;
	private currentMate: number | undefined;
	private currentPv: string[] = [];
	private analysisResolve: ((value: PositionAnalysis) => void) | null = null;
	private bestMoveResolve: ((value: StockfishMove) => void) | null = null;

	onError: ErrorCallback | null = null;

	constructor(onError?: ErrorCallback) {
		this.onError = onError ?? null;
		this.initWorker();
	}

	private handleReady() {
		this.isReady = true;
		if (this.readyResolve) {
			this.readyResolve();
			this.readyResolve = null;
		}
	}

	private handleBestmove(data: string) {
		this.clearTimeLimit();
		if (!data) return;
		const parsed = parseBestMove(data);
		const result: StockfishMove = {
			from: uciToSquare(parsed.bestMove),
			to: uciToSquare(parsed.bestMove.slice(2)),
			san: parsed.bestMove,
			evaluation: this.currentScore ?? 0,
			mate: this.currentMate,
			depth: this.currentDepth,
			pv: [...this.currentPv],
		};

		if (this.bestMoveResolve) {
			this.bestMoveResolve(result);
			this.bestMoveResolve = null;
		}
		if (this.analysisResolve) {
			this.analysisResolve({
				evaluation: this.currentScore ?? 0,
				mate: this.currentMate,
				bestMove: parsed.bestMove,
				pv: [...this.currentPv],
				depth: this.currentDepth,
			});
			this.analysisResolve = null;
		}
	}

	private handleInfo(data: string) {
		const parsed = parseInfoLine(data);
		if (parsed) {
			this.currentDepth = parsed.depth;
			if (parsed.score !== undefined) this.currentScore = parsed.score;
			if (parsed.mate !== undefined) this.currentMate = parsed.mate;
			if (parsed.pv.length > 0) this.currentPv = parsed.pv;
		}
	}

	private resetWorker() {
		if (this.worker) {
			try {
				this.worker.terminate();
			} catch {
				// worker already dead
			}
			this.worker = null;
		}
		this.isReady = false;
		this.readyResolve = null;
		this.analysisResolve = null;
		this.bestMoveResolve = null;
		this.currentReject = null;
		this.clearTimeLimit();
		this.initWorker();
	}

	private clearTimeLimit() {
		if (this.timeLimitTimer) {
			clearTimeout(this.timeLimitTimer);
			this.timeLimitTimer = null;
		}
	}

	private initWorker() {
		this.worker = new Worker('/stockfish/worker.js');

		this.worker.onmessage = (e: MessageEvent<WorkerMessage>) => {
			const msg = e.data;

			switch (msg.type) {
				case 'ready':
					this.handleReady();
					break;

				case 'bestmove':
					this.handleBestmove(msg.data ?? '');
					break;

				case 'info':
					this.handleInfo(msg.data ?? '');
					break;

				case 'error':
					this.handleWorkerError(msg.data ?? 'Unknown worker error');
					break;
			}
		};

		this.worker.onerror = (e) => {
			this.handleWorkerError(e.message || 'Worker error');
		};
	}

	private handleWorkerError(message: string) {
		console.error('[StockfishPool]', message);
		if (this.onError) {
			this.onError(message);
		}
		if (this.currentReject) {
			this.currentReject(new Error(`Stockfish error: ${message}`));
			this.currentReject = null;
		}
		this.resetWorker();
	}

	private sendCommand(cmd: string) {
		if (!this.worker) return;
		this.worker.postMessage({ type: 'command', data: cmd });
	}

	waitForReady(): Promise<void> {
		if (this.isReady) return Promise.resolve();
		return new Promise((resolve) => {
			this.readyResolve = resolve;
		});
	}

	private startTimeLimit(reject: (reason: unknown) => void) {
		this.clearTimeLimit();
		this.timeLimitTimer = setTimeout(() => {
			this.sendCommand('stop');
			reject(new Error('Stockfish analysis timed out'));
			this.analysisResolve = null;
			this.bestMoveResolve = null;
			this.currentReject = null;
		}, MAX_TIME_MS);
	}

	enqueue<T>(execute: () => Promise<T>): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			this.queue.push({ execute, resolve, reject });
			this.processQueue();
		});
	}

	private processQueue() {
		if (this.processing || this.queue.length === 0) return;
		this.processing = true;

		const job = this.queue.shift()!;
		this.currentReject = job.reject;

		job
			.execute()
			.then((result) => {
				this.processing = false;
				this.currentReject = null;
				job.resolve(result);
				this.processQueue();
			})
			.catch((err) => {
				this.processing = false;
				this.currentReject = null;
				job.reject(err);
				this.processQueue();
			});
	}

	analyze(fen: string, targetDepth = 18): Promise<PositionAnalysis> {
		const clampedDepth = clampDepth(targetDepth);
		return this.enqueue(() =>
			this.waitForReady().then(
				() =>
					new Promise<PositionAnalysis>((resolve, reject) => {
						this.analysisResolve = resolve;
						this.currentReject = reject;
						this.currentDepth = 0;
						this.currentScore = undefined;
						this.currentMate = undefined;
						this.currentPv = [];

						this.startTimeLimit(reject);
						this.sendCommand(`position fen ${fen}`);
						this.sendCommand(`go depth ${clampedDepth}`);
					}),
			),
		);
	}

	getBestMove(
		fen: string,
		difficulty: StockfishDifficulty = 'advanced',
	): Promise<StockfishMove> {
		const settings = getDifficultySettings(difficulty);
		const clampedDepth = clampDepth(settings.depth);
		return this.enqueue(() =>
			this.waitForReady().then(
				() =>
					new Promise<StockfishMove>((resolve, reject) => {
						this.bestMoveResolve = resolve;
						this.currentReject = reject;
						this.currentDepth = 0;
						this.currentScore = undefined;
						this.currentMate = undefined;
						this.currentPv = [];

						this.startTimeLimit(reject);
						this.sendCommand(`setoption name Skill Level value ${settings.skillLevel}`);
						this.sendCommand(`position fen ${fen}`);
						this.sendCommand(`go depth ${clampedDepth}`);
					}),
			),
		);
	}

	analyzeGame(
		moves: string[],
		startFen = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
		targetDepth = 18,
	): Promise<GameAnalysis> {
		const clampedDepth = clampDepth(targetDepth);
		return this.enqueue(async () => {
			await this.waitForReady();
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

				const posAnalysis = await this.analyze(afterFen, clampedDepth);
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

	stop() {
		this.clearTimeLimit();
		if (this.worker) {
			this.worker.postMessage({ type: 'stop' });
		}
	}

	destroy() {
		this.clearTimeLimit();
		this.queue.forEach((job) => job.reject(new Error('Pool destroyed')));
		this.queue = [];

		if (this.currentReject) {
			this.currentReject(new Error('Pool destroyed'));
			this.currentReject = null;
		}

		this.processing = false;
		this.analysisResolve = null;
		this.bestMoveResolve = null;
		this.readyResolve = null;

		if (this.worker) {
			try {
				this.worker.postMessage({ type: 'quit' });
			} catch {
				// worker already dead
			}
			try {
				this.worker.terminate();
			} catch {
				// worker already dead
			}
			this.worker = null;
		}
		this.isReady = false;
	}
}

export function createStockfish(onError?: ErrorCallback) {
	const pool = getStockfishPool(onError);

	return {
		get isReady() {
			return pool['isReady'];
		},
		get isThinking() {
			return pool['processing'];
		},
		get bestMove() {
			return null;
		},
		get evaluation() {
			return 0;
		},
		get depth() {
			return 0;
		},
		get pv() {
			return [];
		},
		analyze: (fen: string, targetDepth?: number) => pool.analyze(fen, targetDepth),
		getBestMove: (fen: string, difficulty?: StockfishDifficulty) =>
			pool.getBestMove(fen, difficulty),
		analyzeGame: (moves: string[], startFen?: string, targetDepth?: number) =>
			pool.analyzeGame(moves, startFen, targetDepth),
		stop: () => pool.stop(),
		quit: () => {
			// no-op for pool — pool lifetime is managed globally
		},
		setSkillLevel: (level: number) => {
			pool['sendCommand'](
				`setoption name Skill Level value ${Math.max(0, Math.min(20, level))}`,
			);
		},
		setELO: (elo: number) => {
			const clampedElo = Math.max(1000, Math.min(3200, elo));
			pool['sendCommand']('setoption name UCI_LimitStrength value true');
			pool['sendCommand'](`setoption name UCI_Elo value ${clampedElo}`);
		},
	};
}
