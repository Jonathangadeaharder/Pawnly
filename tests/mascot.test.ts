import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import Mascot from '../src/lib/components/Mascot.svelte';

function renderMascot(props: Record<string, unknown> = {}) {
	const { container } = render(Mascot, { props });
	return container.querySelector('svg')!;
}

describe('Mascot', () => {
	it('renders with default props', () => {
		const svg = renderMascot();
		expect(svg).toHaveAttribute('width', '64');
		expect(svg).toHaveAttribute('height', '64');
		expect(svg).toHaveAttribute('viewBox', '0 0 96 96');
	});

	it('renders with custom size', () => {
		const svg = renderMascot({ size: 128 });
		expect(svg).toHaveAttribute('width', '128');
		expect(svg).toHaveAttribute('height', '128');
	});

	it.each([
		['default mood', {}],
		['thinking mood', { mood: 'thinking' }],
	])('renders circle eyes for %s', (_name, props) => {
		const svg = renderMascot(props);
		expect(svg.querySelectorAll('circle').length).toBeGreaterThanOrEqual(2);
	});

	it('renders celebrating mood', () => {
		const svg = renderMascot({ mood: 'celebrating' });
		const paths = svg.querySelectorAll('path');
		expect(paths.length).toBeGreaterThanOrEqual(1);
	});

	it.each([
		['sleepy', {}],
		['surprised', {}],
		['custom color', { color: '#FF0000' }],
	])('renders with %s', (_name, extra) => {
		expect(renderMascot(extra)).toBeInTheDocument();
	});

	it('uses Brand.colors.ink as default color', () => {
		const svg = renderMascot();
		expect(svg.querySelector('path')).toHaveAttribute('fill', Brand.colors.ink);
	});

	it('renders cheek blush circles', () => {
		const svg = renderMascot();
		const blushCircles = Array.from(svg.querySelectorAll('circle')).filter(
			(c) => c.getAttribute('fill') === Brand.colors.coralSoft,
		);
		expect(blushCircles).toHaveLength(2);
	});
});
