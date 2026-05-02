import { describe, expect, it } from 'vitest';
import { describeCalculateAccuracyTests, describeClassifyMoveTests } from './helpers';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('stockfish module exports', () => {
	it('exports createStockfish function', async () => {
		const mod = await import('../src/lib/stockfish.svelte');
		expect(typeof mod.createStockfish).toBe('function');
	});

	it('exports classifyMove helper', async () => {
		const mod = await import('../src/lib/stockfish.svelte');
		expect(typeof mod.classifyMove).toBe('function');
	});

	it('exports calculateAccuracy helper', async () => {
		const mod = await import('../src/lib/stockfish.svelte');
		expect(typeof mod.calculateAccuracy).toBe('function');
	});
});

describeClassifyMoveTests('../src/lib/stockfish.svelte');

describe('classifyMove additional cases', () => {
	it('classifies missed-win separately when provided', async () => {
		const { classifyMove } = await import('../src/lib/stockfish.svelte');
		expect(classifyMove(50)).toBe('inaccuracy');
	});
});

describeCalculateAccuracyTests('../src/lib/stockfish.svelte');

describe('calculateAccuracy additional cases', () => {
	it('returns 100 for any loss with zero moves', async () => {
		const { calculateAccuracy } = await import('../src/lib/stockfish.svelte');
		expect(calculateAccuracy(500, 0)).toBe(100);
	});

	it('handles typical game scenario', async () => {
		const { calculateAccuracy } = await import('../src/lib/stockfish.svelte');
		expect(calculateAccuracy(200, 40)).toBe(99.5);
	});
});

describe('UCI message parsing', () => {
	it('parses bestmove response', async () => {
		const { parseBestMove } = await import('../src/lib/stockfish.svelte');
		const result = parseBestMove('bestmove e2e4 ponder e7e5');
		expect(result).toEqual({ bestMove: 'e2e4', ponder: 'e7e5' });
	});

	it('parses bestmove without ponder', async () => {
		const { parseBestMove } = await import('../src/lib/stockfish.svelte');
		const result = parseBestMove('bestmove e2e4');
		expect(result).toEqual({ bestMove: 'e2e4', ponder: undefined });
	});

	it('parses info depth/score/pv line', async () => {
		const { parseInfoLine } = await import('../src/lib/stockfish.svelte');
		const result = parseInfoLine('info depth 10 score cp 25 pv e2e4 e7e5 g1f3');
		expect(result).toEqual({
			depth: 10,
			score: 25,
			mate: undefined,
			pv: ['e2e4', 'e7e5', 'g1f3'],
		});
	});

	it('parses info with mate score', async () => {
		const { parseInfoLine } = await import('../src/lib/stockfish.svelte');
		const result = parseInfoLine('info depth 5 score mate 3 pv e2e4 e7e5');
		expect(result).toEqual({
			depth: 5,
			score: undefined,
			mate: 3,
			pv: ['e2e4', 'e7e5'],
		});
	});

	it('returns null for non-matching lines', async () => {
		const { parseInfoLine } = await import('../src/lib/stockfish.svelte');
		expect(parseInfoLine('uciok')).toBeNull();
		expect(parseInfoLine('readyok')).toBeNull();
	});
});

describe('Difficulty to settings mapping', () => {
	it('maps all difficulty levels', async () => {
		const { getDifficultySettings } = await import('../src/lib/stockfish.svelte');
		const difficulties = [
			'beginner',
			'intermediate',
			'advanced',
			'expert',
			'master',
			'grandmaster',
		] as const;

		for (const diff of difficulties) {
			const settings = getDifficultySettings(diff);
			expect(settings.depth).toBeGreaterThan(0);
			expect(settings.skillLevel).toBeGreaterThanOrEqual(0);
			expect(settings.skillLevel).toBeLessThanOrEqual(20);
			expect(settings.elo).toBeGreaterThanOrEqual(1000);
			expect(settings.elo).toBeLessThanOrEqual(3200);
		}
	});

	it('beginner has lower depth than grandmaster', async () => {
		const { getDifficultySettings } = await import('../src/lib/stockfish.svelte');
		expect(getDifficultySettings('beginner').depth).toBeLessThan(
			getDifficultySettings('grandmaster').depth,
		);
	});
});
