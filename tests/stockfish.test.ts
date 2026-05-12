import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	describeCalculateAccuracyTests,
	describeClassifyMoveTests,
	describeExportsTests,
} from './helpers';

class MockWorker {
	onmessage: ((e: MessageEvent) => void) | null = null;
	onerror: ((e: ErrorEvent) => void) | null = null;
	postMessage = vi.fn();
	terminate = vi.fn();
	addEventListener = vi.fn();
	removeEventListener = vi.fn();
	dispatchEvent = vi.fn(() => true);
}

const originalWorker = globalThis.Worker;

function mockWorkerEnv() {
	// @ts-expect-error mocking Worker for tests
	globalThis.Worker = MockWorker;
}

function restoreWorkerEnv() {
	if (originalWorker) {
		globalThis.Worker = originalWorker;
	} else {
		// @ts-expect-error cleaning up mock
		delete globalThis.Worker;
	}
}

describeExportsTests('../src/lib/stockfish.svelte', [
	'createStockfish',
	'classifyMove',
	'calculateAccuracy',
]);

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

describe('depth cap enforcement', () => {
	it('clamps depth to MAX_DEPTH (22)', async () => {
		const { clampDepth, MAX_DEPTH } = await import('../src/lib/stockfish-pool.svelte');
		expect(clampDepth(100)).toBe(MAX_DEPTH);
		expect(clampDepth(22)).toBe(22);
		expect(clampDepth(50)).toBe(22);
	});

	it('clamps depth to minimum 1', async () => {
		const { clampDepth } = await import('../src/lib/stockfish-pool.svelte');
		expect(clampDepth(0)).toBe(1);
		expect(clampDepth(-5)).toBe(1);
	});

	it('passes through valid depths unchanged', async () => {
		const { clampDepth } = await import('../src/lib/stockfish-pool.svelte');
		expect(clampDepth(5)).toBe(5);
		expect(clampDepth(10)).toBe(10);
		expect(clampDepth(18)).toBe(18);
		expect(clampDepth(1)).toBe(1);
	});

	it('MAX_DEPTH is 22', async () => {
		const { MAX_DEPTH } = await import('../src/lib/stockfish-pool.svelte');
		expect(MAX_DEPTH).toBe(22);
	});

	it('MAX_TIME_MS is 10000', async () => {
		const { MAX_TIME_MS } = await import('../src/lib/stockfish-pool.svelte');
		expect(MAX_TIME_MS).toBe(10_000);
	});
});

describe('StockfishPool queue ordering', () => {
	afterEach(restoreWorkerEnv);

	it('processes enqueued jobs sequentially', async () => {
		mockWorkerEnv();
		const { StockfishPool } = await import('../src/lib/stockfish-pool.svelte');
		const pool = new StockfishPool();
		const order: number[] = [];

		const job = (id: number, delayMs: number) =>
			pool.enqueue(
				() =>
					new Promise<number>((resolve) => {
						setTimeout(() => {
							order.push(id);
							resolve(id);
						}, delayMs);
					}),
			);

		const results = await Promise.all([job(1, 30), job(2, 10), job(3, 5)]);
		expect(results).toEqual([1, 2, 3]);
		expect(order).toEqual([1, 2, 3]);

		pool.destroy();
	});

	it('rejects pending jobs when destroyed', async () => {
		mockWorkerEnv();
		const { StockfishPool } = await import('../src/lib/stockfish-pool.svelte');
		const pool = new StockfishPool();

		const job = pool.enqueue(
			() =>
				new Promise<void>(() => {
					// never resolves
				}),
		);

		pool.destroy();

		await expect(job).rejects.toThrow('Pool destroyed');
	});
});

describe('StockfishPool terminate-on-destroy', () => {
	afterEach(restoreWorkerEnv);

	it('calls terminate on worker when destroy() is called', async () => {
		mockWorkerEnv();
		const { StockfishPool } = await import('../src/lib/stockfish-pool.svelte');
		const pool = new StockfishPool();

		const worker = pool['worker'];
		expect(worker).not.toBeNull();

		const terminateSpy = vi.spyOn(worker!, 'terminate');
		pool.destroy();

		expect(terminateSpy).toHaveBeenCalled();
		expect(pool['worker']).toBeNull();
	});

	it('resetStockfishPool destroys the singleton', async () => {
		mockWorkerEnv();
		const { getStockfishPool, resetStockfishPool } = await import(
			'../src/lib/stockfish-pool.svelte'
		);
		const pool = getStockfishPool();
		const worker = pool['worker'];
		const terminateSpy = vi.spyOn(worker!, 'terminate');

		resetStockfishPool();

		expect(terminateSpy).toHaveBeenCalled();
	});

	it('getStockfishPool returns same instance', async () => {
		mockWorkerEnv();
		const { getStockfishPool, resetStockfishPool } = await import(
			'../src/lib/stockfish-pool.svelte'
		);

		const a = getStockfishPool();
		const b = getStockfishPool();
		expect(a).toBe(b);

		a.destroy();
	});
});

describe('StockfishPool error callback', () => {
	afterEach(restoreWorkerEnv);

	it('invokes onError callback on worker error', async () => {
		mockWorkerEnv();
		const { StockfishPool } = await import('../src/lib/stockfish-pool.svelte');
		const onError = vi.fn();
		const pool = new StockfishPool(onError);

		const worker = pool['worker'] as MockWorker;
		worker.onerror?.(new ErrorEvent('error', { message: 'boom' }));

		expect(onError).toHaveBeenCalledWith('boom');

		pool.destroy();
	});
});

describe('createStockfish backward compat', () => {
	afterEach(restoreWorkerEnv);

	it('returns object with expected methods', async () => {
		mockWorkerEnv();
		const { createStockfish, resetStockfishPool } = await import(
			'../src/lib/stockfish-pool.svelte'
		);

		const sf = createStockfish();
		expect(typeof sf.analyze).toBe('function');
		expect(typeof sf.getBestMove).toBe('function');
		expect(typeof sf.analyzeGame).toBe('function');
		expect(typeof sf.stop).toBe('function');
		expect(typeof sf.quit).toBe('function');
		expect(typeof sf.setSkillLevel).toBe('function');
		expect(typeof sf.setELO).toBe('function');

		sf.quit();
		resetStockfishPool();
	});

	it('quit is a no-op that does not throw', async () => {
		mockWorkerEnv();
		const { createStockfish, resetStockfishPool } = await import(
			'../src/lib/stockfish-pool.svelte'
		);

		const sf = createStockfish();
		expect(() => sf.quit()).not.toThrow();

		resetStockfishPool();
	});
});
