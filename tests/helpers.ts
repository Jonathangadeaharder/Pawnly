import { createRawSnippet } from 'svelte';
import { describe, expect, it, vi } from 'vitest';
import { Brand } from '../src/lib/brand';

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
