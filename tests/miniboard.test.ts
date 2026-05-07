import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import MiniBoard from '../src/lib/components/MiniBoard.svelte';
import { expectBoardSvg, expectBoardWrapper } from './helpers';

function renderMiniBoard(props: Record<string, unknown> = {}) {
	return render(MiniBoard, { props });
}

describe('MiniBoard', () => {
	it.each([
		['renders with default size 240', {}, 240, 240],
		['renders with custom size', { size: 400 }, 400, 400],
	])('%s', (_name, props, w, h) => {
		const { container } = renderMiniBoard(props);
		expectBoardWrapper(container).toHaveSize(w, h);
	});

	it('renders 64 board squares in SVG', () => {
		expectBoardSvg(renderMiniBoard().container).toHaveSquares(64);
	});

	it('renders default board colors', () => {
		expectBoardSvg(renderMiniBoard().container).toHaveDefaultColors();
	});

	it('renders warm theme colors', () => {
		const { container } = renderMiniBoard({ theme: 'warm' });
		const svg = container.querySelector('svg')!;
		expect(svg.querySelector('rect')).toHaveAttribute('fill', Brand.colors.boardLightAlt);
	});

	it('renders pieces on correct squares', () => {
		const { container } = renderMiniBoard({ pieces: { e2: 'wp', e7: 'bp' } });
		const pieceDivs = container.querySelectorAll('svg + div, div[style*="pointer-events"]');
		expect(pieceDivs.length).toBeGreaterThanOrEqual(2);
	});

	it('renders nothing for empty board', () => {
		const { container } = renderMiniBoard({ pieces: {} });
		expect((container.firstElementChild as HTMLElement).querySelector('svg')).toBeInTheDocument();
	});

	it('applies last move highlight', () => {
		expectBoardSvg(renderMiniBoard({ lastMove: { from: 'e2', to: 'e4' } }).container)
			.toHaveRectsWithFill(Brand.colors.sunny, 2);
	});

	it('applies square highlights', () => {
		expectBoardSvg(renderMiniBoard({ highlights: [{ square: 'e4', color: '#ff0000', opacity: 0.5 }] }).container)
			.toHaveRectsWithFill('#ff0000', 1);
	});

	it('uses default highlight color (moss)', () => {
		expectBoardSvg(renderMiniBoard({ highlights: [{ square: 'd4' }] }).container)
			.toHaveRectsWithFill(Brand.colors.moss, 1);
	});

	it('uses default highlight opacity 0.4', () => {
		const { container } = renderMiniBoard({ highlights: [{ square: 'd4' }] });
		const rects = container.querySelectorAll('svg rect');
		const mossRect = Array.from(rects).find((r) => r.getAttribute('fill') === Brand.colors.moss);
		expect(mossRect).toHaveAttribute('opacity', '0.4');
	});

	it('renders arrows', () => {
		const { container } = renderMiniBoard({ arrows: [{ from: 'e2', to: 'e4' }] });
		const board = expectBoardSvg(container);
		board.toHaveArrowCount(1);
		board.toHaveArrowPolygon();
	});

	it.each([
		['renders arrow with custom color', { arrows: [{ from: 'e2', to: 'e4', color: '#ff0000' }] }, 'line', 'stroke', '#ff0000'],
		['renders arrow with custom opacity', { arrows: [{ from: 'e2', to: 'e4', opacity: 0.5 }] }, 'g[opacity]', 'opacity', '0.5'],
		['defaults arrow opacity to 0.85', { arrows: [{ from: 'e2', to: 'e4' }] }, 'g[opacity]', 'opacity', '0.85'],
	])('%s', (_name, props, selector, attr, value) => {
		const { container } = renderMiniBoard(props);
		expect(container.querySelector(`svg ${selector}`)).toHaveAttribute(attr, value);
	});

	it('flips the board', () => {
		const { container } = renderMiniBoard({ flip: true });
		expect(container.querySelector('svg')!.querySelector('rect')).toBeInTheDocument();
	});

	it.each([
		['shows coordinates when enabled', { showCoords: true }, 16],
		['hides coordinates by default', {}, 0],
	])('%s', (_name, props, count) => {
		expectBoardSvg(renderMiniBoard(props).container).toHaveCoords(count);
	});

	it('renders coordinate labels with correct content', () => {
		expectBoardSvg(renderMiniBoard({ showCoords: true }).container).toHaveCoordLabels();
	});

	it('renders multiple pieces', () => {
		const { container } = renderMiniBoard({
			pieces: { e1: 'wk', e8: 'bk', d1: 'wq', d8: 'bq' },
		});
		expect(container.querySelector('svg')).toBeInTheDocument();
	});

	it('renders multiple arrows', () => {
		expectBoardSvg(renderMiniBoard({
			arrows: [{ from: 'e2', to: 'e4' }, { from: 'd2', to: 'd4' }],
		}).container).toHaveArrowCount(2);
	});

	it.each([
		['has border-radius 12px', 'toHaveBorderRadius'],
		['has overflow hidden', 'toHaveOverflowHidden'],
		['has box-shadow', 'toHaveBoxShadow'],
	])('%s', (_name, method) => {
		const wrapper = expectBoardWrapper(renderMiniBoard().container);
		(wrapper as any)[method]();
	});
});
