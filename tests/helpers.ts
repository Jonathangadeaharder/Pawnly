import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { Brand } from '../src/lib/brand';
import type { createGame } from '../src/lib/game.svelte';

export const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export async function createGameInstance(fen?: string): Promise<ReturnType<typeof createGame>> {
	const mod = await import('../src/lib/game.svelte');
	return mod.createGame(fen);
}

export function mockAppNavigation() {
	vi.mock('$app/navigation', () => ({
		goto: vi.fn(),
	}));
}

export function createSnippet(text: string) {
	return createRawSnippet(() => {
		return {
			render: () => `<span>${text}</span>`,
			setup: (node: Element) => {
				node.textContent = text;
			},
		};
	});
}

export function createDivSnippet(text: string) {
	return createRawSnippet(() => {
		return {
			render: () => `<div>${text}</div>`,
			setup: (node: Element) => {
				node.textContent = text;
			},
		};
	});
}

export function mockSupabaseAuth() {
	vi.mock('$lib/supabase', () => ({
		supabase: {
			auth: {
				signInWithPassword: vi.fn(),
				signUp: vi.fn(),
				signInWithOtp: vi.fn(),
				signOut: vi.fn(),
				getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
				onAuthStateChange: vi.fn().mockReturnValue({
					data: { subscription: { unsubscribe: vi.fn() } },
				}),
			},
		},
	}));
}

export function expectBoardSvg(container: HTMLElement) {
	const svg = container.querySelector('svg')!;
	return {
		toHaveDefaultColors() {
			const firstRect = svg.querySelector('rect')!;
			expect(firstRect).toHaveAttribute('fill', Brand.colors.boardLight);
		},
		toHaveSquares(count: number) {
			const rects = container.querySelectorAll('svg rect');
			expect(rects.length).toBeGreaterThanOrEqual(count);
		},
		toHaveCoords(count: number) {
			const texts = container.querySelectorAll('svg text');
			expect(texts.length).toBe(count);
		},
		toHaveCoordLabels() {
			const texts = container.querySelectorAll('svg text');
			const contents = Array.from(texts).map((t) => t.textContent);
			expect(contents).toContain('8');
			expect(contents).toContain('1');
			expect(contents).toContain('a');
			expect(contents).toContain('h');
		},
		toHaveRectsWithFill(fill: string, count: number) {
			const rects = container.querySelectorAll('svg rect');
			const matched = Array.from(rects).filter((r) => r.getAttribute('fill') === fill);
			expect(matched.length).toBe(count);
		},
		toHaveArrowCount(count: number) {
			const lines = container.querySelectorAll('svg line');
			expect(lines.length).toBe(count);
		},
		toHaveArrowPolygon() {
			const polygons = container.querySelectorAll('svg polygon');
			expect(polygons.length).toBeGreaterThanOrEqual(1);
		},
	};
}

export function expectBoardWrapper(container: HTMLElement) {
	const wrapper = container.firstElementChild as HTMLElement;
	return {
		toHaveSize(width: number, height: number) {
			expect(wrapper).toHaveStyle({ width: `${width}px`, height: `${height}px` });
		},
		toHaveBorderRadius() {
			expect(wrapper).toHaveStyle({ borderRadius: '12px' });
		},
		toHaveOverflowHidden() {
			expect(wrapper).toHaveStyle({ overflow: 'hidden' });
		},
		toHaveBoxShadow() {
			expect(wrapper.style.boxShadow).toContain('24px');
		},
	};
}

export function describeClassifyMoveTests(importPath: string) {
	describe('classifyMove', () => {
		it('classifies brilliant move (loss < -50)', async () => {
			const { classifyMove } = await import(importPath);
			expect(classifyMove(-60)).toBe('brilliant');
			expect(classifyMove(-100)).toBe('brilliant');
		});

		it('classifies great move (-50 <= loss < -20)', async () => {
			const { classifyMove } = await import(importPath);
			expect(classifyMove(-50)).toBe('great');
			expect(classifyMove(-30)).toBe('great');
		});

		it('classifies best move (-20 <= loss < 10)', async () => {
			const { classifyMove } = await import(importPath);
			expect(classifyMove(-20)).toBe('best');
			expect(classifyMove(0)).toBe('best');
			expect(classifyMove(5)).toBe('best');
		});

		it('classifies good move (10 <= loss < 40)', async () => {
			const { classifyMove } = await import(importPath);
			expect(classifyMove(10)).toBe('good');
			expect(classifyMove(25)).toBe('good');
		});

		it('classifies inaccuracy (40 <= loss < 100)', async () => {
			const { classifyMove } = await import(importPath);
			expect(classifyMove(40)).toBe('inaccuracy');
			expect(classifyMove(75)).toBe('inaccuracy');
		});

		it('classifies mistake (100 <= loss < 300)', async () => {
			const { classifyMove } = await import(importPath);
			expect(classifyMove(100)).toBe('mistake');
			expect(classifyMove(200)).toBe('mistake');
		});

		it('classifies blunder (loss >= 300)', async () => {
			const { classifyMove } = await import(importPath);
			expect(classifyMove(300)).toBe('blunder');
			expect(classifyMove(500)).toBe('blunder');
			expect(classifyMove(1000)).toBe('blunder');
		});
	});
}

export function describeCalculateAccuracyTests(importPath: string) {
	describe('calculateAccuracy', () => {
		it('returns 100 for zero loss', async () => {
			const { calculateAccuracy } = await import(importPath);
			expect(calculateAccuracy(0, 30)).toBe(100);
		});

		it('returns 100 for zero move count', async () => {
			const { calculateAccuracy } = await import(importPath);
			expect(calculateAccuracy(0, 0)).toBe(100);
		});

		it('decreases accuracy with higher average loss', async () => {
			const { calculateAccuracy } = await import(importPath);
			const perfect = calculateAccuracy(0, 10);
			const smallLoss = calculateAccuracy(100, 10);
			const bigLoss = calculateAccuracy(1000, 10);
			expect(perfect).toBeGreaterThan(smallLoss);
			expect(smallLoss).toBeGreaterThan(bigLoss);
		});

		it('clamps to minimum 0', async () => {
			const { calculateAccuracy } = await import(importPath);
			expect(calculateAccuracy(100000, 1)).toBe(0);
		});

		it('clamps to maximum 100', async () => {
			const { calculateAccuracy } = await import(importPath);
			expect(calculateAccuracy(-500, 10)).toBe(100);
		});

		it('rounds to one decimal place', async () => {
			const { calculateAccuracy } = await import(importPath);
			expect(calculateAccuracy(333, 10)).toBe(96.7);
		});
	});
}

export function describeRepoBasicTests(
	name: string,
	modulePath: string,
	factoryName: string,
	createArgs: unknown[],
	expectedFields: Record<string, unknown>,
	methods: string[],
) {
	describe(name, () => {
		it(`exports ${factoryName} function`, async () => {
			const mod = await import(modulePath);
			expect(typeof mod[factoryName]).toBe('function');
		});

		it(`creates a repository with initial state`, async () => {
			const mod = await import(modulePath);
			const repo = mod[factoryName](...createArgs);
			expect(repo).toBeDefined();
			expect(repo.loading).toBe(false);
			for (const [key, value] of Object.entries(expectedFields)) {
				expect(repo[key]).toEqual(value);
			}
		});

		for (const method of methods) {
			it(`has ${method} method`, async () => {
				const mod = await import(modulePath);
				const repo = mod[factoryName](...createArgs);
				expect(typeof repo[method]).toBe('function');
			});
		}
	});
}

export function describeExportsTests(modulePath: string, exports: string[]) {
	describe('module exports', () => {
		for (const name of exports) {
			it(`exports ${name} helper`, async () => {
				const mod = await import(modulePath);
				expect(typeof mod[name]).toBe('function');
			});
		}
	});
}
