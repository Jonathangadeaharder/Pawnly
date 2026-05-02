import { describe, expect, it, vi } from 'vitest';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

vi.mock('../src/lib/stockfish.svelte', async () => {
	const actual = await vi.importActual<typeof import('../src/lib/chess-utils')>(
		'../src/lib/chess-utils',
	);
	return {
		createStockfish: () => ({
			isReady: true,
			isThinking: false,
			analyze: vi.fn().mockResolvedValue({
				evaluation: 0,
				bestMove: 'e2e4',
				pv: ['e2e4'],
				depth: 18,
			}),
			quit: vi.fn(),
		}),
		classifyMove: actual.classifyMove,
		calculateAccuracy: actual.calculateAccuracy,
	};
});

describe('analysis module exports', () => {
	it('exports createAnalysis function', async () => {
		const mod = await import('../src/lib/analysis.svelte');
		expect(typeof mod.createAnalysis).toBe('function');
	});

	it('exports classifyMove helper', async () => {
		const mod = await import('../src/lib/analysis.svelte');
		expect(typeof mod.classifyMove).toBe('function');
	});

	it('exports calculateAccuracy helper', async () => {
		const mod = await import('../src/lib/analysis.svelte');
		expect(typeof mod.calculateAccuracy).toBe('function');
	});
});

describe('classifyMove (re-exported)', () => {
	it('classifies brilliant move (loss < -50)', async () => {
		const { classifyMove } = await import('../src/lib/analysis.svelte');
		expect(classifyMove(-60)).toBe('brilliant');
		expect(classifyMove(-100)).toBe('brilliant');
	});

	it('classifies great move (-50 <= loss < -20)', async () => {
		const { classifyMove } = await import('../src/lib/analysis.svelte');
		expect(classifyMove(-50)).toBe('great');
		expect(classifyMove(-30)).toBe('great');
	});

	it('classifies best move (-20 <= loss < 10)', async () => {
		const { classifyMove } = await import('../src/lib/analysis.svelte');
		expect(classifyMove(-20)).toBe('best');
		expect(classifyMove(0)).toBe('best');
		expect(classifyMove(5)).toBe('best');
	});

	it('classifies good move (10 <= loss < 40)', async () => {
		const { classifyMove } = await import('../src/lib/analysis.svelte');
		expect(classifyMove(10)).toBe('good');
		expect(classifyMove(25)).toBe('good');
	});

	it('classifies inaccuracy (40 <= loss < 100)', async () => {
		const { classifyMove } = await import('../src/lib/analysis.svelte');
		expect(classifyMove(40)).toBe('inaccuracy');
		expect(classifyMove(75)).toBe('inaccuracy');
	});

	it('classifies mistake (100 <= loss < 300)', async () => {
		const { classifyMove } = await import('../src/lib/analysis.svelte');
		expect(classifyMove(100)).toBe('mistake');
		expect(classifyMove(200)).toBe('mistake');
	});

	it('classifies blunder (loss >= 300)', async () => {
		const { classifyMove } = await import('../src/lib/analysis.svelte');
		expect(classifyMove(300)).toBe('blunder');
		expect(classifyMove(500)).toBe('blunder');
		expect(classifyMove(1000)).toBe('blunder');
	});
});

describe('calculateAccuracy (re-exported)', () => {
	it('returns 100 for zero loss', async () => {
		const { calculateAccuracy } = await import('../src/lib/analysis.svelte');
		expect(calculateAccuracy(0, 30)).toBe(100);
	});

	it('returns 100 for zero move count', async () => {
		const { calculateAccuracy } = await import('../src/lib/analysis.svelte');
		expect(calculateAccuracy(0, 0)).toBe(100);
	});

	it('decreases accuracy with higher average loss', async () => {
		const { calculateAccuracy } = await import('../src/lib/analysis.svelte');
		const perfect = calculateAccuracy(0, 10);
		const smallLoss = calculateAccuracy(100, 10);
		const bigLoss = calculateAccuracy(1000, 10);
		expect(perfect).toBeGreaterThan(smallLoss);
		expect(smallLoss).toBeGreaterThan(bigLoss);
	});

	it('clamps to minimum 0', async () => {
		const { calculateAccuracy } = await import('../src/lib/analysis.svelte');
		expect(calculateAccuracy(100000, 1)).toBe(0);
	});

	it('clamps to maximum 100', async () => {
		const { calculateAccuracy } = await import('../src/lib/analysis.svelte');
		expect(calculateAccuracy(-500, 10)).toBe(100);
	});

	it('rounds to one decimal place', async () => {
		const { calculateAccuracy } = await import('../src/lib/analysis.svelte');
		expect(calculateAccuracy(333, 10)).toBe(96.7);
	});
});

describe('createAnalysis', () => {
	it('returns analysis state with correct API shape', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		expect(analysis).toBeDefined();
		expect(typeof analysis.isAnalyzing).toBe('boolean');
		expect(typeof analysis.progress).toBe('number');
		expect(Array.isArray(analysis.moves)).toBe(true);
		expect(analysis.accuracy).toEqual({ white: 100, black: 100 });
		expect(analysis.blunders).toEqual({ white: 0, black: 0 });
		expect(analysis.mistakes).toEqual({ white: 0, black: 0 });
		expect(analysis.inaccuracies).toEqual({ white: 0, black: 0 });
		expect(analysis.averageCentipawnLoss).toEqual({ white: 0, black: 0 });
		expect(typeof analysis.currentMoveIndex).toBe('number');
		expect(typeof analysis.analyze).toBe('function');
		expect(typeof analysis.goToMove).toBe('function');
		expect(typeof analysis.nextMove).toBe('function');
		expect(typeof analysis.prevMove).toBe('function');
	});

	it('starts with no analysis in progress', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5']);
		expect(analysis.isAnalyzing).toBe(false);
		expect(analysis.progress).toBe(0);
		expect(analysis.moves).toEqual([]);
	});

	it('starts with currentMoveIndex at -1', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5']);
		expect(analysis.currentMoveIndex).toBe(-1);
	});

	it('starts with null currentEvaluation', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5']);
		expect(analysis.currentEvaluation).toBeNull();
	});

	it('accepts custom starting FEN', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
		const analysis = createAnalysis(['e5'], fen);
		expect(analysis).toBeDefined();
		expect(analysis.currentPosition).toBe(fen);
	});

	it('uses default FEN when none provided', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis([]);
		expect(analysis.currentPosition).toBe(STARTING_FEN);
	});
});

describe('move navigation', () => {
	it('goToMove sets currentMoveIndex', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		analysis.goToMove(1);
		expect(analysis.currentMoveIndex).toBe(1);
	});

	it('goToMove clamps to valid range', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		analysis.goToMove(-2);
		expect(analysis.currentMoveIndex).toBe(-1);
		analysis.goToMove(10);
		expect(analysis.currentMoveIndex).toBe(-1);
	});

	it('nextMove increments index', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		analysis.goToMove(0);
		analysis.nextMove();
		expect(analysis.currentMoveIndex).toBe(1);
	});

	it('nextMove does not exceed bounds', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		analysis.goToMove(2);
		analysis.nextMove();
		expect(analysis.currentMoveIndex).toBe(2);
	});

	it('prevMove decrements index', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		analysis.goToMove(2);
		analysis.prevMove();
		expect(analysis.currentMoveIndex).toBe(1);
	});

	it('prevMove does not go below -1', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		analysis.goToMove(-1);
		analysis.prevMove();
		expect(analysis.currentMoveIndex).toBe(-1);
	});
});

describe('currentPosition', () => {
	it('returns starting FEN at index -1', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		expect(analysis.currentPosition).toBe(STARTING_FEN);
	});

	it('returns FEN after first move at index 0', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		analysis.goToMove(0);
		expect(analysis.currentPosition).toContain('4P3');
		expect(analysis.currentPosition).toContain(' b ');
	});

	it('returns FEN after second move at index 1', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		analysis.goToMove(1);
		expect(analysis.currentPosition).toContain('4P3');
		expect(analysis.currentPosition).toContain('4p3');
		expect(analysis.currentPosition).toContain(' w ');
	});
});

describe('analyze', () => {
	it('runs analysis and populates moves', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		await analysis.analyze();
		expect(analysis.moves.length).toBe(3);
		expect(analysis.isAnalyzing).toBe(false);
		expect(analysis.progress).toBe(100);
	});

	it('sets currentMoveIndex to 0 after analysis', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3']);
		await analysis.analyze();
		expect(analysis.currentMoveIndex).toBe(0);
	});

	it('each move has required fields', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5']);
		await analysis.analyze();
		for (const move of analysis.moves) {
			expect(move).toHaveProperty('move');
			expect(move).toHaveProperty('evaluation');
			expect(move).toHaveProperty('previousEval');
			expect(move).toHaveProperty('loss');
			expect(move).toHaveProperty('classification');
			expect(move).toHaveProperty('comment');
			expect(move).toHaveProperty('depth');
			expect(typeof move.move).toBe('string');
			expect(typeof move.evaluation).toBe('number');
			expect(typeof move.classification).toBe('string');
			expect(typeof move.comment).toBe('string');
		}
	});

	it('classifies moves correctly', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5']);
		await analysis.analyze();
		const validClassifications = [
			'brilliant',
			'great',
			'best',
			'good',
			'inaccuracy',
			'mistake',
			'blunder',
			'missed-win',
		];
		for (const move of analysis.moves) {
			expect(validClassifications).toContain(move.classification);
		}
	});

	it('handles empty moves array', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis([]);
		await analysis.analyze();
		expect(analysis.moves).toEqual([]);
		expect(analysis.isAnalyzing).toBe(false);
		expect(analysis.progress).toBe(100);
	});
});

describe('accuracy metrics after analysis', () => {
	it('calculates accuracy for both sides', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3', 'Nc6']);
		await analysis.analyze();
		expect(typeof analysis.accuracy.white).toBe('number');
		expect(typeof analysis.accuracy.black).toBe('number');
		expect(analysis.accuracy.white).toBeGreaterThanOrEqual(0);
		expect(analysis.accuracy.white).toBeLessThanOrEqual(100);
		expect(analysis.accuracy.black).toBeGreaterThanOrEqual(0);
		expect(analysis.accuracy.black).toBeLessThanOrEqual(100);
	});

	it('counts blunders for both sides', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3', 'Nc6']);
		await analysis.analyze();
		expect(typeof analysis.blunders.white).toBe('number');
		expect(typeof analysis.blunders.black).toBe('number');
		expect(analysis.blunders.white).toBeGreaterThanOrEqual(0);
		expect(analysis.blunders.black).toBeGreaterThanOrEqual(0);
	});

	it('counts mistakes for both sides', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3', 'Nc6']);
		await analysis.analyze();
		expect(typeof analysis.mistakes.white).toBe('number');
		expect(typeof analysis.mistakes.black).toBe('number');
		expect(analysis.mistakes.white).toBeGreaterThanOrEqual(0);
		expect(analysis.mistakes.black).toBeGreaterThanOrEqual(0);
	});

	it('counts inaccuracies for both sides', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3', 'Nc6']);
		await analysis.analyze();
		expect(typeof analysis.inaccuracies.white).toBe('number');
		expect(typeof analysis.inaccuracies.black).toBe('number');
		expect(analysis.inaccuracies.white).toBeGreaterThanOrEqual(0);
		expect(analysis.inaccuracies.black).toBeGreaterThanOrEqual(0);
	});

	it('calculates average centipawn loss for both sides', async () => {
		const { createAnalysis } = await import('../src/lib/analysis.svelte');
		const analysis = createAnalysis(['e4', 'e5', 'Nf3', 'Nc6']);
		await analysis.analyze();
		expect(typeof analysis.averageCentipawnLoss.white).toBe('number');
		expect(typeof analysis.averageCentipawnLoss.black).toBe('number');
		expect(analysis.averageCentipawnLoss.white).toBeGreaterThanOrEqual(0);
		expect(analysis.averageCentipawnLoss.black).toBeGreaterThanOrEqual(0);
	});
});
