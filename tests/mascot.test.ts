import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import Mascot from '../src/lib/components/Mascot.svelte';

describe('Mascot', () => {
	it('renders with default props', () => {
		const { container } = render(Mascot);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
		expect(svg).toHaveAttribute('width', '64');
		expect(svg).toHaveAttribute('height', '64');
		expect(svg).toHaveAttribute('viewBox', '0 0 96 96');
	});

	it('renders with custom size', () => {
		const { container } = render(Mascot, { props: { size: 128 } });
		const svg = container.querySelector('svg');
		expect(svg).toHaveAttribute('width', '128');
		expect(svg).toHaveAttribute('height', '128');
	});

	it('renders happy mood by default', () => {
		const { container } = render(Mascot);
		const svg = container.querySelector('svg')!;
		expect(svg).toBeInTheDocument();
		// Happy mood has two circle eyes
		const circles = svg.querySelectorAll('circle');
		expect(circles.length).toBeGreaterThanOrEqual(2);
	});

	it('renders thinking mood', () => {
		const { container } = render(Mascot, { props: { mood: 'thinking' } });
		const svg = container.querySelector('svg')!;
		expect(svg).toBeInTheDocument();
		// Thinking mood has circle eyes and straight line mouth
		const circles = svg.querySelectorAll('circle');
		expect(circles.length).toBeGreaterThanOrEqual(2);
	});

	it('renders celebrating mood', () => {
		const { container } = render(Mascot, { props: { mood: 'celebrating' } });
		const svg = container.querySelector('svg')!;
		expect(svg).toBeInTheDocument();
		// Celebrating mood has arc eyes and open mouth
		const paths = svg.querySelectorAll('path');
		expect(paths.length).toBeGreaterThanOrEqual(1);
	});

	it('renders sleepy mood', () => {
		const { container } = render(Mascot, { props: { mood: 'sleepy' } });
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('renders surprised mood', () => {
		const { container } = render(Mascot, { props: { mood: 'surprised' } });
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('uses custom color when provided', () => {
		const { container } = render(Mascot, { props: { color: '#FF0000' } });
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('uses Brand.colors.ink as default color', () => {
		const { container } = render(Mascot);
		const svg = container.querySelector('svg')!;
		expect(svg).toBeInTheDocument();
		// The base path should use Brand.colors.ink
		const basePath = svg.querySelector('path');
		expect(basePath).toHaveAttribute('fill', Brand.colors.ink);
	});

	it('renders cheek blush circles', () => {
		const { container } = render(Mascot);
		const svg = container.querySelector('svg')!;
		// Should have cheek blush circles with coralSoft color
		const blushCircles = Array.from(svg.querySelectorAll('circle')).filter(
			(c) => c.getAttribute('fill') === Brand.colors.coralSoft,
		);
		expect(blushCircles).toHaveLength(2);
	});
});
