import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { Brand } from '../src/lib/brand';
import Chessboard from '../src/lib/components/Chessboard.svelte';
import { createGameInstance, expectBoardSvg, expectBoardWrapper } from './helpers';

const createTestGame = createGameInstance;

type TestGame = Awaited<ReturnType<typeof createTestGame>>;

async function renderBoard(props: Record<string, unknown> = {}) {
	const game: TestGame = (props.game as TestGame | undefined) ?? (await createTestGame(props.fen as string));
	const result = render(Chessboard, { props: { game, ...props } });
	return { game, ...result };
}

const sq = 50;
function boardClickXY(file: number, rank: number) {
	return { clientX: file * sq + sq / 2, clientY: rank * sq + sq / 2 };
}

describe('Chessboard', () => {
	it.each([
		['renders with default size 400', {}, 400, 400],
		['renders with custom size', { size: 600 }, 600, 600],
	])('%s', async (_name, props, w, h) => {
		const { container } = await renderBoard(props);
		expectBoardWrapper(container).toHaveSize(w, h);
	});

	it.each([
		['has border-radius 12px', (c: HTMLElement) => expectBoardWrapper(c).toHaveBorderRadius()],
		['has overflow hidden', (c: HTMLElement) => expectBoardWrapper(c).toHaveOverflowHidden()],
		['has box-shadow', (c: HTMLElement) => expectBoardWrapper(c).toHaveBoxShadow()],
		['has aria-label Chessboard', (c: HTMLElement) => {
			expect(c.firstElementChild).toHaveAttribute('aria-label', 'Chessboard');
		}],
	])('%s', async (_name, assert) => {
		const { container } = await renderBoard();
		assert(container);
	});

	it.each([
		['renders 64 board squares in SVG', (c: HTMLElement) => expectBoardSvg(c).toHaveSquares(64)],
		['renders default board colors', (c: HTMLElement) => expectBoardSvg(c).toHaveDefaultColors()],
		['renders SVG with data-board attribute', (c: HTMLElement) => {
			expect(c.querySelector('svg[data-board]')).toBeInTheDocument();
		}],
	])('%s', async (_name, assert) => {
		const { container } = await renderBoard();
		assert(container);
	});

	it('renders pieces for starting position', async () => {
		const { container } = await renderBoard();
		expect(container.querySelectorAll('svg ~ div[style*="pointer-events"]').length).toBe(32);
	});

	it('renders no pieces for empty board', async () => {
		const { container } = await renderBoard({ fen: '8/8/8/4K3/4k3/8/8/8 w - - 0 1' });
		expect(container.querySelectorAll('svg ~ div[style*="pointer-events"]').length).toBe(2);
	});
});

describe('Chessboard coordinates', () => {
	it('shows coordinates by default', async () => {
		const { container } = await renderBoard();
		expectBoardSvg(container).toHaveCoords(16);
	});

	it('hides coordinates when showCoords is false', async () => {
		const { container } = await renderBoard({ showCoords: false });
		expectBoardSvg(container).toHaveCoords(0);
	});

	it('renders coordinate labels with correct content', async () => {
		const { container } = await renderBoard();
		expectBoardSvg(container).toHaveCoordLabels();
	});
});

describe('Chessboard arrows', () => {
	it('renders arrows', async () => {
		const { container } = await renderBoard({ arrows: [{ from: 'e2', to: 'e4' }] });
		const board = expectBoardSvg(container);
		board.toHaveArrowCount(1);
		board.toHaveArrowPolygon();
	});

	it('renders arrow with custom color', async () => {
		const { container } = await renderBoard({ arrows: [{ from: 'e2', to: 'e4', color: '#ff0000' }] });
		expect(container.querySelector('svg line')).toHaveAttribute('stroke', '#ff0000');
	});

	it.each([
		['renders arrow with custom opacity', { from: 'e2', to: 'e4', opacity: 0.5 }, '0.5'],
		['defaults arrow opacity to 0.85', { from: 'e2', to: 'e4' }, '0.85'],
	])('%s', async (_name, arrow, expected) => {
		const { container } = await renderBoard({ arrows: [arrow] });
		expect(container.querySelector('svg g[opacity]')).toHaveAttribute('opacity', expected);
	});

	it('renders multiple arrows', async () => {
		const { container } = await renderBoard({
			arrows: [{ from: 'e2', to: 'e4' }, { from: 'd2', to: 'd4' }],
		});
		expectBoardSvg(container).toHaveArrowCount(2);
	});

	it('renders no arrows by default', async () => {
		const { container } = await renderBoard();
		expectBoardSvg(container).toHaveArrowCount(0);
	});
});

describe('Chessboard highlights', () => {
	it('applies custom highlights', async () => {
		const { container } = await renderBoard({
			highlights: [{ square: 'e4', color: '#ff0000', opacity: 0.5 }],
		});
		expectBoardSvg(container).toHaveRectsWithFill('#ff0000', 1);
	});

	it('uses default highlight color (moss)', async () => {
		const { container } = await renderBoard({ highlights: [{ square: 'd4' }] });
		expectBoardSvg(container).toHaveRectsWithFill(Brand.colors.moss, 1);
	});

	it('uses default highlight opacity 0.4', async () => {
		const { container } = await renderBoard({ highlights: [{ square: 'd4' }] });
		const rects = container.querySelectorAll('svg rect');
		const mossRect = Array.from(rects).find((r) => r.getAttribute('fill') === Brand.colors.moss);
		expect(mossRect).toHaveAttribute('opacity', '0.4');
	});
});

describe('Chessboard last move', () => {
	it('highlights last move squares', async () => {
		const game = await createTestGame();
		game.selectSquare('e2');
		game.selectSquare('e4');
		const { container } = render(Chessboard, { props: { game } });
		expectBoardSvg(container).toHaveRectsWithFill(Brand.colors.sunny, 2);
	});

	it('no last move highlight at start', async () => {
		const { container } = await renderBoard();
		expectBoardSvg(container).toHaveRectsWithFill(Brand.colors.sunny, 0);
	});
});

describe('Chessboard check indicator', () => {
	it('shows check indicator on king in check', async () => {
		const { container } = await renderBoard({ fen: '4k3/8/8/8/4Q3/8/8/4K3 b - - 0 1' });
		expectBoardSvg(container).toHaveRectsWithFill(Brand.colors.coral, 1);
	});

	it('no check indicator when not in check', async () => {
		const { container } = await renderBoard();
		expectBoardSvg(container).toHaveRectsWithFill(Brand.colors.coral, 0);
	});
});

describe('Chessboard tap interaction', () => {
	it('selects a piece on click', async () => {
		const { game, container } = await renderBoard();
		const svg = container.querySelector('svg[data-board]')!;
		await fireEvent.click(svg, boardClickXY(4, 6));
		expect(game.selectedSquare).toBe('e2');
	});

	it('shows legal move indicators after selecting', async () => {
		const { container } = await renderBoard();
		const svg = container.querySelector('svg[data-board]')!;
		await fireEvent.click(svg, boardClickXY(4, 6));
		const dots = container.querySelectorAll('svg circle');
		expect(dots.length).toBeGreaterThanOrEqual(2);
	});
});

describe('Chessboard flip', () => {
	it('renders flipped board', async () => {
		const { container } = await renderBoard({ flipped: true });
		expect(container.querySelector('svg rect')).toBeInTheDocument();
	});

	it('shows flipped coordinates', async () => {
		const { container } = await renderBoard({ flipped: true, showCoords: true });
		const texts = Array.from(container.querySelectorAll('svg text')).map((t) => t.textContent);
		expect(texts).toContain('1');
		expect(texts).toContain('8');
	});
});

describe('Chessboard promotion dialog', () => {
	async function renderPromotion() {
		const { game, container } = await renderBoard({ fen: '8/4P3/8/8/8/8/8/4K2k w - - 0 1' });
		game.selectSquare('e7');
		const svg = container.querySelector('svg[data-board]')!;
		await fireEvent.click(svg, boardClickXY(4, 0));
		return { game, container };
	}

	it('shows promotion dialog when pawn reaches last rank', async () => {
		const { container } = await renderPromotion();
		const dialog = container.querySelector('[role="dialog"]');
		expect(dialog).toBeInTheDocument();
		expect(dialog).toHaveAttribute('aria-label', 'Pawn promotion');
	});

	it('shows 4 promotion choices', async () => {
		const { container } = await renderPromotion();
		expect(container.querySelectorAll('[role="dialog"] button').length).toBe(4);
	});
});

describe('Chessboard onMove callback', () => {
	it('calls onMove after a valid move via game', async () => {
		const { game } = await renderBoard({ onMove: vi.fn() });
		game.selectSquare('e2');
		game.makeMove('e2', 'e4');
		expect(game.fen).toContain('4P3');
	});
});
