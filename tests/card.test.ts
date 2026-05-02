import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import Card from '../src/lib/components/Card.svelte';
import { createSnippet } from './helpers';

function renderCard(props: Record<string, unknown> = {}) {
	return render(Card, {
		props: { children: createSnippet('Content'), ...props },
	});
}

describe('Card', () => {
	it('renders children content', () => {
		const { getByText } = render(Card, {
			props: { children: createSnippet('Card content') },
		});
		expect(getByText('Card content')).toBeInTheDocument();
	});

	it.each([
		['has cream background', { background: Brand.colors.cream }],
		['has creamDeep border', { border: `1.5px solid ${Brand.colors.creamDeep}` }],
		['has border-radius 18px', { borderRadius: '18px' }],
		['has padding 16px', { padding: '16px' }],
	])('%s', (_name, style) => {
		const { container } = renderCard();
		expect(container.firstElementChild as HTMLElement).toHaveStyle(style);
	});

	it('has inset shadow by default (not raised)', () => {
		const { container } = renderCard();
		const div = container.firstElementChild as HTMLElement;
		expect(div.style.boxShadow).toContain('inset');
		expect(div.style.boxShadow).not.toContain('12px');
	});

	it('has raised shadow when raised is true', () => {
		const { container } = renderCard({ raised: true });
		const div = container.firstElementChild as HTMLElement;
		expect(div.style.boxShadow).toContain('12px');
		expect(div.style.boxShadow).toContain('32px');
	});

	it('accepts custom style override', () => {
		const { container } = renderCard({ style: { padding: '24px' } });
		expect(container.firstElementChild as HTMLElement).toHaveStyle({ padding: '24px' });
	});
});
