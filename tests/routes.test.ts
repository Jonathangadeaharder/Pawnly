import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import Learn from '../src/routes/learn/+page.svelte';
import Train from '../src/routes/train/+page.svelte';
import You from '../src/routes/you/+page.svelte';

describe('route stubs', () => {
	it('learn page renders heading', () => {
		const { getByText } = render(Learn);
		expect(getByText('Learn')).toBeInTheDocument();
	});

	it('learn page has overflow-y-auto for scrolling', () => {
		const { getByText } = render(Learn);
		const wrapper = getByText('Learn').closest('[class*="overflow-y-auto"]');
		expect(wrapper).not.toBeNull();
	});

	it('learn page uses font-family display', () => {
		const { getByText } = render(Learn);
		const heading = getByText('Learn');
		expect(heading.style.fontFamily).toContain('Fraunces');
	});

	it('learn page uses ink color', () => {
		const { getByText } = render(Learn);
		const heading = getByText('Learn');
		expect(heading.style.color).toBe('rgb(31, 36, 23)');
	});

	it('train page renders heading', () => {
		const { getByText } = render(Train);
		expect(getByText('Train')).toBeInTheDocument();
	});

	it('train page has pb-28 for TabBar clearance', () => {
		const { getByText } = render(Train);
		const wrapper = getByText('Train').closest('[class*="pb-28"]');
		expect(wrapper).not.toBeNull();
	});

	it('train page uses font-family display', () => {
		const { getByText } = render(Train);
		const heading = getByText('Train');
		expect(heading.style.fontFamily).toContain('Fraunces');
	});

	it('train page uses ink color', () => {
		const { getByText } = render(Train);
		const heading = getByText('Train');
		expect(heading.style.color).toBe('rgb(31, 36, 23)');
	});

	it('you page renders profile name', () => {
		const { getByText } = render(You);
		expect(getByText('Player')).toBeInTheDocument();
	});

	it('you page has padding-bottom for TabBar clearance', () => {
		const { container } = render(You);
		const wrapper = container.querySelector('[style*="padding-bottom: 120px"]');
		expect(wrapper).not.toBeNull();
	});

	it('you page renders stats', () => {
		const { getByText } = render(You);
		expect(getByText('—')).toBeInTheDocument();
		expect(getByText('Games')).toBeInTheDocument();
		expect(getByText('Puzzles')).toBeInTheDocument();
	});

	it('you page renders achievements', () => {
		const { getByText } = render(You);
		expect(getByText('Achievements')).toBeInTheDocument();
	});
});
