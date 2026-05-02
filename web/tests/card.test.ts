import { render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import Card from '../src/lib/components/Card.svelte';

function createSnippet(text: string) {
	return createRawSnippet(() => {
		return {
			render: () => `<span>${text}</span>`,
			setup: (node) => {
				node.textContent = text;
			},
		};
	});
}

describe('Card', () => {
	it('renders children content', () => {
		const { getByText } = render(Card, {
			props: {
				children: createSnippet('Card content'),
			},
		});
		expect(getByText('Card content')).toBeInTheDocument();
	});

	it('has cream background', () => {
		const { container } = render(Card, {
			props: {
				children: createSnippet('Content'),
			},
		});
		const div = container.firstElementChild as HTMLElement;
		expect(div).toHaveStyle({ background: Brand.colors.cream });
	});

	it('has creamDeep border', () => {
		const { container } = render(Card, {
			props: {
				children: createSnippet('Content'),
			},
		});
		const div = container.firstElementChild as HTMLElement;
		expect(div).toHaveStyle({ border: `1.5px solid ${Brand.colors.creamDeep}` });
	});

	it('has border-radius 18px', () => {
		const { container } = render(Card, {
			props: {
				children: createSnippet('Content'),
			},
		});
		const div = container.firstElementChild as HTMLElement;
		expect(div).toHaveStyle({ borderRadius: '18px' });
	});

	it('has padding 16px', () => {
		const { container } = render(Card, {
			props: {
				children: createSnippet('Content'),
			},
		});
		const div = container.firstElementChild as HTMLElement;
		expect(div).toHaveStyle({ padding: '16px' });
	});

	it('has inset shadow by default (not raised)', () => {
		const { container } = render(Card, {
			props: {
				children: createSnippet('Content'),
			},
		});
		const div = container.firstElementChild as HTMLElement;
		expect(div.style.boxShadow).toContain('inset');
		expect(div.style.boxShadow).not.toContain('12px');
	});

	it('has raised shadow when raised is true', () => {
		const { container } = render(Card, {
			props: {
				children: createSnippet('Content'),
				raised: true,
			},
		});
		const div = container.firstElementChild as HTMLElement;
		expect(div.style.boxShadow).toContain('12px');
		expect(div.style.boxShadow).toContain('32px');
	});

	it('accepts custom style override', () => {
		const { container } = render(Card, {
			props: {
				children: createSnippet('Content'),
				style: { padding: '24px' },
			},
		});
		const div = container.firstElementChild as HTMLElement;
		expect(div).toHaveStyle({ padding: '24px' });
	});
});
