import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import Pill from '../src/lib/components/Pill.svelte';

function createChildrenSnippet(text: string) {
	return createRawSnippet(() => {
		return {
			render: () => `<span>${text}</span>`,
			setup: (node) => {
				node.textContent = text;
			},
		};
	});
}

function renderPill(props: Record<string, unknown> = {}) {
	return render(Pill, {
		props: { children: createChildrenSnippet('Label'), ...props },
	});
}

function getSpan(container: HTMLElement) {
	return container.querySelector('span')!;
}

describe('Pill', () => {
	it('renders children content', () => {
		const { getByText } = renderPill({ children: createChildrenSnippet('STREAK') });
		expect(getByText('STREAK')).toBeInTheDocument();
	});

	it.each([
		['default background color', {}, { background: 'rgba(31,36,23,0.06)' }],
		['Brand.colors.ink as default text color', {}, { color: Brand.colors.ink }],
		['custom bg prop', { bg: '#FF0000' }, { background: '#FF0000' }],
		['custom color prop', { color: '#00FF00' }, { color: '#00FF00' }],
		['Brand.fonts.body as font family', {}, { fontFamily: Brand.fonts.body }],
	])('%s', (_name, props, expected) => {
		const { container } = renderPill(props);
		expect(getSpan(container)).toHaveStyle(expected);
	});

	it.each([
		['uppercase text styling', 'uppercase'],
		['rounded-full styling', 'rounded-full'],
	])('%s', (_name, className) => {
		const { container } = renderPill();
		expect(getSpan(container)).toHaveClass(className);
	});

	it('spreads rest props to span element', () => {
		const { container } = renderPill({ 'data-testid': 'my-pill' });
		expect(getSpan(container)).toHaveAttribute('data-testid', 'my-pill');
	});
});
