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

describe('Pill', () => {
	it('renders children content', () => {
		const { getByText } = render(Pill, {
			props: {
				children: createChildrenSnippet('STREAK'),
			},
		});
		expect(getByText('STREAK')).toBeInTheDocument();
	});

	it('uses default background color', () => {
		const { container } = render(Pill, {
			props: {
				children: createChildrenSnippet('Label'),
			},
		});
		const span = container.querySelector('span');
		expect(span).toHaveStyle({ background: 'rgba(31,36,23,0.06)' });
	});

	it('uses Brand.colors.ink as default text color', () => {
		const { container } = render(Pill, {
			props: {
				children: createChildrenSnippet('Label'),
			},
		});
		const span = container.querySelector('span');
		expect(span).toHaveStyle({ color: Brand.colors.ink });
	});

	it('accepts custom bg prop', () => {
		const { container } = render(Pill, {
			props: {
				children: createChildrenSnippet('Label'),
				bg: '#FF0000',
			},
		});
		const span = container.querySelector('span');
		expect(span).toHaveStyle({ background: '#FF0000' });
	});

	it('accepts custom color prop', () => {
		const { container } = render(Pill, {
			props: {
				children: createChildrenSnippet('Label'),
				color: '#00FF00',
			},
		});
		const span = container.querySelector('span');
		expect(span).toHaveStyle({ color: '#00FF00' });
	});

	it('uses Brand.fonts.body as font family', () => {
		const { container } = render(Pill, {
			props: {
				children: createChildrenSnippet('Label'),
			},
		});
		const span = container.querySelector('span');
		expect(span).toHaveStyle({ fontFamily: Brand.fonts.body });
	});

	it('has uppercase text styling', () => {
		const { container } = render(Pill, {
			props: {
				children: createChildrenSnippet('Label'),
			},
		});
		const span = container.querySelector('span');
		expect(span).toHaveClass('uppercase');
	});

	it('has rounded-full styling', () => {
		const { container } = render(Pill, {
			props: {
				children: createChildrenSnippet('Label'),
			},
		});
		const span = container.querySelector('span');
		expect(span).toHaveClass('rounded-full');
	});

	it('spreads rest props to span element', () => {
		const { container } = render(Pill, {
			props: {
				children: createChildrenSnippet('Label'),
				'data-testid': 'my-pill',
			},
		});
		const span = container.querySelector('span');
		expect(span).toHaveAttribute('data-testid', 'my-pill');
	});
});
