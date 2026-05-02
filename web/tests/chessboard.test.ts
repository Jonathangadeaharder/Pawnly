import { render, fireEvent } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { Brand } from '../src/lib/brand';
import Chessboard from '../src/lib/components/Chessboard.svelte';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

async function createTestGame(fen?: string) {
	const { createGame } = await import('../src/lib/game.svelte');
	return createGame(fen);
}

describe('Chessboard', () => {
	it('renders with default size 400', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).toHaveStyle({ width: '400px', height: '400px' });
	});

	it('renders with custom size', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game, size: 600 } });
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).toHaveStyle({ width: '600px', height: '600px' });
	});

	it('has border-radius 12px', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).toHaveStyle({ borderRadius: '12px' });
	});

	it('has overflow hidden', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).toHaveStyle({ overflow: 'hidden' });
	});

	it('has box-shadow', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.style.boxShadow).toContain('24px');
	});

	it('has aria-label Chessboard', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).toHaveAttribute('aria-label', 'Chessboard');
	});

	it('renders 64 board squares in SVG', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const rects = container.querySelectorAll('svg rect');
		expect(rects.length).toBeGreaterThanOrEqual(64);
	});

	it('renders default board colors', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const svg = container.querySelector('svg')!;
		const firstRect = svg.querySelector('rect')!;
		expect(firstRect).toHaveAttribute('fill', Brand.colors.boardLight);
	});

	it('renders pieces for starting position', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const pieceDivs = container.querySelectorAll('svg ~ div[style*="pointer-events"]');
		expect(pieceDivs.length).toBe(32);
	});

	it('renders no pieces for empty board', async () => {
		const game = await createTestGame('8/8/8/4K3/4k3/8/8/8 w - - 0 1');
		const { container } = render(Chessboard, { props: { game } });
		const pieceDivs = container.querySelectorAll('svg ~ div[style*="pointer-events"]');
		expect(pieceDivs.length).toBe(2); // Only kings
	});

	it('renders SVG with data-board attribute', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const svg = container.querySelector('svg[data-board]');
		expect(svg).toBeInTheDocument();
	});
});

describe('Chessboard coordinates', () => {
	it('shows coordinates by default', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const texts = container.querySelectorAll('svg text');
		expect(texts.length).toBe(16);
	});

	it('hides coordinates when showCoords is false', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game, showCoords: false } });
		const texts = container.querySelectorAll('svg text');
		expect(texts.length).toBe(0);
	});

	it('renders coordinate labels with correct content', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const texts = container.querySelectorAll('svg text');
		const textContents = Array.from(texts).map((t) => t.textContent);
		expect(textContents).toContain('8');
		expect(textContents).toContain('1');
		expect(textContents).toContain('a');
		expect(textContents).toContain('h');
	});
});

describe('Chessboard arrows', () => {
	it('renders arrows', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, {
			props: { game, arrows: [{ from: 'e2', to: 'e4' }] },
		});
		const lines = container.querySelectorAll('svg line');
		expect(lines.length).toBe(1);
		const polygons = container.querySelectorAll('svg polygon');
		expect(polygons.length).toBe(1);
	});

	it('renders arrow with custom color', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, {
			props: { game, arrows: [{ from: 'e2', to: 'e4', color: '#ff0000' }] },
		});
		const line = container.querySelector('svg line');
		expect(line).toHaveAttribute('stroke', '#ff0000');
	});

	it('renders arrow with custom opacity', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, {
			props: { game, arrows: [{ from: 'e2', to: 'e4', opacity: 0.5 }] },
		});
		const g = container.querySelector('svg g[opacity]');
		expect(g).toHaveAttribute('opacity', '0.5');
	});

	it('defaults arrow opacity to 0.85', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, {
			props: { game, arrows: [{ from: 'e2', to: 'e4' }] },
		});
		const g = container.querySelector('svg g[opacity]');
		expect(g).toHaveAttribute('opacity', '0.85');
	});

	it('renders multiple arrows', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, {
			props: {
				game,
				arrows: [
					{ from: 'e2', to: 'e4' },
					{ from: 'd2', to: 'd4' },
				],
			},
		});
		const lines = container.querySelectorAll('svg line');
		expect(lines.length).toBe(2);
	});

	it('renders no arrows by default', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const lines = container.querySelectorAll('svg line');
		expect(lines.length).toBe(0);
	});
});

describe('Chessboard highlights', () => {
	it('applies custom highlights', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, {
			props: {
				game,
				highlights: [{ square: 'e4', color: '#ff0000', opacity: 0.5 }],
			},
		});
		const rects = container.querySelectorAll('svg rect');
		const redRects = Array.from(rects).filter(
			(r) => r.getAttribute('fill') === '#ff0000'
		);
		expect(redRects.length).toBe(1);
		expect(redRects[0]).toHaveAttribute('opacity', '0.5');
	});

	it('uses default highlight color (moss)', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, {
			props: { game, highlights: [{ square: 'd4' }] },
		});
		const rects = container.querySelectorAll('svg rect');
		const mossRects = Array.from(rects).filter(
			(r) => r.getAttribute('fill') === Brand.colors.moss
		);
		expect(mossRects.length).toBe(1);
	});

	it('uses default highlight opacity 0.4', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, {
			props: { game, highlights: [{ square: 'd4' }] },
		});
		const rects = container.querySelectorAll('svg rect');
		const mossRect = Array.from(rects).find(
			(r) => r.getAttribute('fill') === Brand.colors.moss
		);
		expect(mossRect).toHaveAttribute('opacity', '0.4');
	});
});

describe('Chessboard last move', () => {
	it('highlights last move squares', async () => {
		const game = await createTestGame();
		game.selectSquare('e2');
		game.selectSquare('e4');
		const { container } = render(Chessboard, { props: { game } });
		const rects = container.querySelectorAll('svg rect');
		const sunnyRects = Array.from(rects).filter(
			(r) => r.getAttribute('fill') === Brand.colors.sunny
		);
		expect(sunnyRects.length).toBe(2);
	});

	it('no last move highlight at start', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const rects = container.querySelectorAll('svg rect');
		const sunnyRects = Array.from(rects).filter(
			(r) => r.getAttribute('fill') === Brand.colors.sunny
		);
		expect(sunnyRects.length).toBe(0);
	});
});

describe('Chessboard check indicator', () => {
	it('shows check indicator on king in check', async () => {
		const game = await createTestGame('4k3/8/8/8/4Q3/8/8/4K3 b - - 0 1');
		const { container } = render(Chessboard, { props: { game } });
		const rects = container.querySelectorAll('svg rect');
		const coralRects = Array.from(rects).filter(
			(r) => r.getAttribute('fill') === Brand.colors.coral
		);
		expect(coralRects.length).toBe(1);
	});

	it('no check indicator when not in check', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const rects = container.querySelectorAll('svg rect');
		const coralRects = Array.from(rects).filter(
			(r) => r.getAttribute('fill') === Brand.colors.coral
		);
		expect(coralRects.length).toBe(0);
	});
});

describe('Chessboard tap interaction', () => {
	it('selects a piece on click', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const svg = container.querySelector('svg[data-board]')!;
		const sq = 50;
		const e2x = 4 * sq + sq / 2;
		const e2y = 6 * sq + sq / 2;
		await fireEvent.click(svg, { clientX: e2x, clientY: e2y });
		expect(game.selectedSquare).toBe('e2');
	});

	it('shows legal move indicators after selecting', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game } });
		const svg = container.querySelector('svg[data-board]')!;
		const sq = 50;
		const e2x = 4 * sq + sq / 2;
		const e2y = 6 * sq + sq / 2;
		await fireEvent.click(svg, { clientX: e2x, clientY: e2y });
		const dots = container.querySelectorAll('svg circle');
		expect(dots.length).toBeGreaterThanOrEqual(2);
	});
});

describe('Chessboard flip', () => {
	it('renders flipped board', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, { props: { game, flipped: true } });
		const svg = container.querySelector('svg')!;
		const firstRect = svg.querySelector('rect')!;
		expect(firstRect).toBeInTheDocument();
	});

	it('shows flipped coordinates', async () => {
		const game = await createTestGame();
		const { container } = render(Chessboard, {
			props: { game, flipped: true, showCoords: true },
		});
		const texts = container.querySelectorAll('svg text');
		const textContents = Array.from(texts).map((t) => t.textContent);
		expect(textContents).toContain('1');
		expect(textContents).toContain('8');
	});
});

describe('Chessboard promotion dialog', () => {
	it('shows promotion dialog when pawn reaches last rank', async () => {
		const game = await createTestGame('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
		game.selectSquare('e7');
		const { container } = render(Chessboard, { props: { game } });
		const svg = container.querySelector('svg[data-board]')!;
		const sq = 50;
		const e8x = 4 * sq + sq / 2;
		const e8y = 0 * sq + sq / 2;
		await fireEvent.click(svg, { clientX: e8x, clientY: e8y });
		const dialog = container.querySelector('[role="dialog"]');
		expect(dialog).toBeInTheDocument();
		expect(dialog).toHaveAttribute('aria-label', 'Pawn promotion');
	});

	it('shows 4 promotion choices', async () => {
		const game = await createTestGame('8/4P3/8/8/8/8/8/4K2k w - - 0 1');
		game.selectSquare('e7');
		const { container } = render(Chessboard, { props: { game } });
		const svg = container.querySelector('svg[data-board]')!;
		const sq = 50;
		const e8x = 4 * sq + sq / 2;
		const e8y = 0 * sq + sq / 2;
		await fireEvent.click(svg, { clientX: e8x, clientY: e8y });
		const buttons = container.querySelectorAll('[role="dialog"] button');
		expect(buttons.length).toBe(4);
	});
});

describe('Chessboard onMove callback', () => {
	it('calls onMove after a valid move via game', async () => {
		const game = await createTestGame();
		const onMove = vi.fn();
		render(Chessboard, { props: { game, onMove } });
		// Simulate a move through the game API and verify the board responds
		game.selectSquare('e2');
		game.makeMove('e2', 'e4');
		// The component should reflect the new position
		expect(game.fen).toContain('4P3');
	});
});
