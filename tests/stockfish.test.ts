import { describe, expect, it } from 'vitest';

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

describe('classifyMove', () => {
	it('classifies brilliant move (loss < -50)', async () => {
		const { classifyMove } = await import('../src/lib/stockfish.svelte');
		expect(classifyMove(-60)).toBe('brilliant');
		expect(classifyMove(-100)).toBe('brilliant');
	});

	it('classifies great move (-50 <= loss < -20)', async () => {
		const { classifyMove } = await import('../src/lib/stockfish.svelte');
		expect(classifyMove(-50)).toBe('great');
		expect(classifyMove(-30)).toBe('great');
	});

	it('classifies best move (-20 <= loss < 10)', async () => {
		const { classifyMove } = await import('../src/lib/stockfish.svelte');
		expect(classifyMove(-20)).toBe('best');
		expect(classifyMove(0)).toBe('best');
		expect(classifyMove(5)).toBe('best');
	});

	it('classifies good move (10 <= loss < 40)', async () => {
		const { classifyMove } = await import('../src/lib/stockfish.svelte');
		expect(classifyMove(10)).toBe('good');
		expect(classifyMove(25)).toBe('good');
	});

	it('classifies inaccuracy (40 <= loss < 100)', async () => {
		const { classifyMove } = await import('../src/lib/stockfish.svelte');
		expect(classifyMove(40)).toBe('inaccuracy');
		expect(classifyMove(75)).toBe('inaccuracy');
	});

	it('classifies mistake (100 <= loss < 300)', async () => {
		const { classifyMove } = await import('../src/lib/stockfish.svelte');
		expect(classifyMove(100)).toBe('mistake');
		expect(classifyMove(200)).toBe('mistake');
	});

	it('classifies blunder (loss >= 300)', async () => {
		const { classifyMove } = await import('../src/lib/stockfish.svelte');
		expect(classifyMove(300)).toBe('blunder');
		expect(classifyMove(500)).toBe('blunder');
		expect(classifyMove(1000)).toBe('blunder');
	});

	it('classifies missed-win separately when provided', async () => {
		const { classifyMove } = await import('../src/lib/stockfish.svelte');
		// missed-win is a special classification for when a winning move was available
		// but not played. The base classifyMove doesn't handle this — it's contextual.
		// This test documents that behavior.
		expect(classifyMove(50)).toBe('inaccuracy');
	});
});

describe('calculateAccuracy', () => {
	it('returns 100 for zero loss', async () => {
		const { calculateAccuracy } = await import('../src/lib/stockfish.svelte');
		expect(calculateAccuracy(0, 30)).toBe(100);
	});

	it('returns 100 for zero move count', async () => {
		const { calculateAccuracy } = await import('../src/lib/stockfish.svelte');
		expect(calculateAccuracy(0, 0)).toBe(100);
	});

	it('returns 100 for any loss with zero moves', async () => {
		const { calculateAccuracy } = await import('../src/lib/stockfish.svelte');
		expect(calculateAccuracy(500, 0)).toBe(100);
	});

	it('decreases accuracy with higher average loss', async () => {
		const { calculateAccuracy } = await import('../src/lib/stockfish.svelte');
		const perfect = calculateAccuracy(0, 10);
		const smallLoss = calculateAccuracy(100, 10); // avg 10cp per move
		const bigLoss = calculateAccuracy(1000, 10); // avg 100cp per move
		expect(perfect).toBeGreaterThan(smallLoss);
		expect(smallLoss).toBeGreaterThan(bigLoss);
	});

	it('clamps to minimum 0', async () => {
		const { calculateAccuracy } = await import('../src/lib/stockfish.svelte');
		// Very high average loss should not go below 0
		expect(calculateAccuracy(100000, 1)).toBe(0);
	});

	it('clamps to maximum 100', async () => {
		const { calculateAccuracy } = await import('../src/lib/stockfish.svelte');
		// Negative total loss (gaining advantage) should cap at 100
		expect(calculateAccuracy(-500, 10)).toBe(100);
	});

	it('rounds to one decimal place', async () => {
		const { calculateAccuracy } = await import('../src/lib/stockfish.svelte');
		const result = calculateAccuracy(333, 10); // avg 33.3cp → 96.67 → 96.7
		expect(result).toBe(96.7);
	});

	it('handles typical game scenario', async () => {
		const { calculateAccuracy } = await import('../src/lib/stockfish.svelte');
		// 40 moves, total loss 200cp → avg 5cp per move → 99.5% accuracy
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
