import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import MiniBoard from '../src/lib/components/MiniBoard.svelte';

describe('MiniBoard', () => {
	it('renders with default size 240', () => {
		const { container } = render(MiniBoard);
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).toHaveStyle({ width: '240px', height: '240px' });
	});

	it('renders with custom size', () => {
		const { container } = render(MiniBoard, { props: { size: 400 } });
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).toHaveStyle({ width: '400px', height: '400px' });
	});

	it('renders 64 board squares in SVG', () => {
		const { container } = render(MiniBoard);
		const rects = container.querySelectorAll('svg rect');
		expect(rects.length).toBeGreaterThanOrEqual(64);
	});

	it('renders default board colors', () => {
		const { container } = render(MiniBoard);
		const svg = container.querySelector('svg')!;
		const firstRect = svg.querySelector('rect')!;
		expect(firstRect).toHaveAttribute('fill', Brand.colors.boardLight);
	});

	it('renders warm theme colors', () => {
		const { container } = render(MiniBoard, { props: { theme: 'warm' } });
		const svg = container.querySelector('svg')!;
		const firstRect = svg.querySelector('rect')!;
		expect(firstRect).toHaveAttribute('fill', Brand.colors.boardLightAlt);
	});

	it('renders pieces on correct squares', () => {
		const { container } = render(MiniBoard, {
			props: {
				pieces: { e2: 'wp', e7: 'bp' },
			},
		});
		const pieceDivs = container.querySelectorAll('svg + div, div[style*="pointer-events"]');
		expect(pieceDivs.length).toBeGreaterThanOrEqual(2);
	});

	it('renders nothing for empty board', () => {
		const { container } = render(MiniBoard, { props: { pieces: {} } });
		const wrapper = container.firstElementChild as HTMLElement;
		const svg = wrapper.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('applies last move highlight', () => {
		const { container } = render(MiniBoard, {
			props: {
				lastMove: { from: 'e2', to: 'e4' },
			},
		});
		const rects = container.querySelectorAll('svg rect');
		const sunnyRects = Array.from(rects).filter(
			(r) => r.getAttribute('fill') === Brand.colors.sunny
		);
		expect(sunnyRects.length).toBe(2);
	});

	it('applies square highlights', () => {
		const { container } = render(MiniBoard, {
			props: {
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

	it('uses default highlight color (moss)', () => {
		const { container } = render(MiniBoard, {
			props: {
				highlights: [{ square: 'd4' }],
			},
		});
		const rects = container.querySelectorAll('svg rect');
		const mossRects = Array.from(rects).filter(
			(r) => r.getAttribute('fill') === Brand.colors.moss
		);
		expect(mossRects.length).toBe(1);
	});

	it('uses default highlight opacity 0.4', () => {
		const { container } = render(MiniBoard, {
			props: {
				highlights: [{ square: 'd4' }],
			},
		});
		const rects = container.querySelectorAll('svg rect');
		const mossRect = Array.from(rects).find(
			(r) => r.getAttribute('fill') === Brand.colors.moss
		);
		expect(mossRect).toHaveAttribute('opacity', '0.4');
	});

	it('renders arrows', () => {
		const { container } = render(MiniBoard, {
			props: {
				arrows: [{ from: 'e2', to: 'e4' }],
			},
		});
		const lines = container.querySelectorAll('svg line');
		expect(lines.length).toBe(1);
		const polygons = container.querySelectorAll('svg polygon');
		expect(polygons.length).toBe(1);
	});

	it('renders arrow with custom color', () => {
		const { container } = render(MiniBoard, {
			props: {
				arrows: [{ from: 'e2', to: 'e4', color: '#ff0000' }],
			},
		});
		const line = container.querySelector('svg line');
		expect(line).toHaveAttribute('stroke', '#ff0000');
	});

	it('renders arrow with custom opacity', () => {
		const { container } = render(MiniBoard, {
			props: {
				arrows: [{ from: 'e2', to: 'e4', opacity: 0.5 }],
			},
		});
		const g = container.querySelector('svg g[opacity]');
		expect(g).toHaveAttribute('opacity', '0.5');
	});

	it('defaults arrow opacity to 0.85', () => {
		const { container } = render(MiniBoard, {
			props: {
				arrows: [{ from: 'e2', to: 'e4' }],
			},
		});
		const g = container.querySelector('svg g[opacity]');
		expect(g).toHaveAttribute('opacity', '0.85');
	});

	it('flips the board', () => {
		const { container } = render(MiniBoard, {
			props: { flip: true },
		});
		const svg = container.querySelector('svg')!;
		const firstRect = svg.querySelector('rect')!;
		expect(firstRect).toBeInTheDocument();
	});

	it('shows coordinates when enabled', () => {
		const { container } = render(MiniBoard, {
			props: { showCoords: true },
		});
		const texts = container.querySelectorAll('svg text');
		expect(texts.length).toBe(16);
	});

	it('hides coordinates by default', () => {
		const { container } = render(MiniBoard);
		const texts = container.querySelectorAll('svg text');
		expect(texts.length).toBe(0);
	});

	it('renders coordinate labels with correct content', () => {
		const { container } = render(MiniBoard, {
			props: { showCoords: true },
		});
		const texts = container.querySelectorAll('svg text');
		const textContents = Array.from(texts).map((t) => t.textContent);
		expect(textContents).toContain('8');
		expect(textContents).toContain('1');
		expect(textContents).toContain('a');
		expect(textContents).toContain('h');
	});

	it('renders multiple pieces', () => {
		const pieces = {
			e1: 'wk',
			e8: 'bk',
			d1: 'wq',
			d8: 'bq',
		};
		const { container } = render(MiniBoard, { props: { pieces } });
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('renders multiple arrows', () => {
		const { container } = render(MiniBoard, {
			props: {
				arrows: [
					{ from: 'e2', to: 'e4' },
					{ from: 'd2', to: 'd4' },
				],
			},
		});
		const lines = container.querySelectorAll('svg line');
		expect(lines.length).toBe(2);
	});

	it('has border-radius 12px', () => {
		const { container } = render(MiniBoard);
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).toHaveStyle({ borderRadius: '12px' });
	});

	it('has overflow hidden', () => {
		const { container } = render(MiniBoard);
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper).toHaveStyle({ overflow: 'hidden' });
	});

	it('has box-shadow', () => {
		const { container } = render(MiniBoard);
		const wrapper = container.firstElementChild as HTMLElement;
		expect(wrapper.style.boxShadow).toContain('24px');
	});
});
