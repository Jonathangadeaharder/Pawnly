import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import FlameIcon from '../src/lib/components/icons/FlameIcon.svelte';
import HeartIcon from '../src/lib/components/icons/HeartIcon.svelte';
import HomeIcon from '../src/lib/components/icons/HomeIcon.svelte';
import LearnIcon from '../src/lib/components/icons/LearnIcon.svelte';
import PlayIcon from '../src/lib/components/icons/PlayIcon.svelte';
import SparkIcon from '../src/lib/components/icons/SparkIcon.svelte';
import StarIcon from '../src/lib/components/icons/StarIcon.svelte';
import TrainIcon from '../src/lib/components/icons/TrainIcon.svelte';
import YouIcon from '../src/lib/components/icons/YouIcon.svelte';

const strokeIcons = [
	{ name: 'HomeIcon', component: HomeIcon },
	{ name: 'PlayIcon', component: PlayIcon },
	{ name: 'LearnIcon', component: LearnIcon },
	{ name: 'TrainIcon', component: TrainIcon },
	{ name: 'YouIcon', component: YouIcon },
];

const fillIcons = [
	{ name: 'FlameIcon', component: FlameIcon },
	{ name: 'StarIcon', component: StarIcon },
	{ name: 'SparkIcon', component: SparkIcon },
	{ name: 'HeartIcon', component: HeartIcon },
];

describe('Stroke icons', () => {
	for (const { name, component } of strokeIcons) {
		describe(name, () => {
			it('renders an svg with default size 20', () => {
				const { container } = render(component);
				const svg = container.querySelector('svg');
				expect(svg).toBeInTheDocument();
				expect(svg).toHaveAttribute('width', '20');
				expect(svg).toHaveAttribute('height', '20');
				expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
			});

			it('applies custom size', () => {
				const { container } = render(component, { props: { size: 32 } });
				const svg = container.querySelector('svg');
				expect(svg).toHaveAttribute('width', '32');
				expect(svg).toHaveAttribute('height', '32');
			});

			it('uses Brand.colors.ink as default color', () => {
				const { container } = render(component);
				const path = container.querySelector('svg :first-child');
				expect(path).toHaveAttribute('stroke', Brand.colors.ink);
			});

			it('applies custom color', () => {
				const { container } = render(component, { props: { color: '#ff0000' } });
				const path = container.querySelector('svg :first-child');
				expect(path).toHaveAttribute('stroke', '#ff0000');
			});

			it('uses stroke style (fill=none)', () => {
				const { container } = render(component);
				const paths = container.querySelectorAll('svg [fill="none"]');
				expect(paths.length).toBeGreaterThan(0);
			});
		});
	}
});

describe('Fill icons', () => {
	for (const { name, component } of fillIcons) {
		describe(name, () => {
			it('renders an svg with default size 20', () => {
				const { container } = render(component);
				const svg = container.querySelector('svg');
				expect(svg).toBeInTheDocument();
				expect(svg).toHaveAttribute('width', '20');
				expect(svg).toHaveAttribute('height', '20');
				expect(svg).toHaveAttribute('viewBox', '0 0 24 24');
			});

			it('applies custom size', () => {
				const { container } = render(component, { props: { size: 32 } });
				const svg = container.querySelector('svg');
				expect(svg).toHaveAttribute('width', '32');
				expect(svg).toHaveAttribute('height', '32');
			});

			it('uses Brand.colors.ink as default color', () => {
				const { container } = render(component);
				const path = container.querySelector('svg path');
				expect(path).toHaveAttribute('fill', Brand.colors.ink);
			});

			it('applies custom color', () => {
				const { container } = render(component, { props: { color: '#ff0000' } });
				const path = container.querySelector('svg path');
				expect(path).toHaveAttribute('fill', '#ff0000');
			});
		});
	}
});

describe('Icon index exports', () => {
	it('re-exports all 9 icons', async () => {
		const icons = await import('../src/lib/components/icons/index');
		expect(icons.HomeIcon).toBeDefined();
		expect(icons.PlayIcon).toBeDefined();
		expect(icons.LearnIcon).toBeDefined();
		expect(icons.TrainIcon).toBeDefined();
		expect(icons.YouIcon).toBeDefined();
		expect(icons.FlameIcon).toBeDefined();
		expect(icons.StarIcon).toBeDefined();
		expect(icons.SparkIcon).toBeDefined();
		expect(icons.HeartIcon).toBeDefined();
	});
});
