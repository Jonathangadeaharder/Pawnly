import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import Button from '../src/lib/components/Button.svelte';
import { createSnippet } from './helpers';

describe('Button', () => {
	it('renders children content', () => {
		const { getByText } = render(Button, {
			props: {
				children: createSnippet('Click me'),
			},
		});
		expect(getByText('Click me')).toBeInTheDocument();
	});

	it('defaults to primary variant', () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
			},
		});
		const button = container.querySelector('button');
		expect(button).toHaveStyle({
			backgroundColor: Brand.colors.ink,
			color: Brand.colors.cream,
		});
	});

	it('applies moss variant styles', () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
				kind: 'moss',
			},
		});
		const button = container.querySelector('button');
		expect(button).toHaveStyle({
			backgroundColor: Brand.colors.moss,
			color: Brand.colors.cream,
		});
	});

	it('applies sunny variant styles', () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
				kind: 'sunny',
			},
		});
		const button = container.querySelector('button');
		expect(button).toHaveStyle({
			backgroundColor: Brand.colors.sunny,
			color: Brand.colors.ink,
		});
	});

	it('applies ghost variant styles', () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
				kind: 'ghost',
			},
		});
		const button = container.querySelector('button');
		expect(button!.style.backgroundColor).toBe('transparent');
		expect(button).toHaveStyle({ color: Brand.colors.ink });
	});

	it('applies cream variant styles', () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
				kind: 'cream',
			},
		});
		const button = container.querySelector('button');
		expect(button).toHaveStyle({
			backgroundColor: Brand.colors.creamSoft,
			color: Brand.colors.ink,
		});
	});

	it('has border-radius 14px', () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
			},
		});
		const button = container.querySelector('button');
		expect(button).toHaveStyle({ borderRadius: '14px' });
	});

	it('uses Brand.fonts.body', () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
			},
		});
		const button = container.querySelector('button');
		expect(button).toHaveStyle({ fontFamily: Brand.fonts.body });
	});

	it('sets full width when full is true', () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
				full: true,
			},
		});
		const button = container.querySelector('button');
		expect(button).toHaveStyle({ width: '100%' });
	});

	it('auto width when full is false', () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
				full: false,
			},
		});
		const button = container.querySelector('button');
		expect(button).toHaveStyle({ width: 'auto' });
	});

	it('translates down on mousedown', async () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
			},
		});
		const button = container.querySelector('button');
		await fireEvent.mouseDown(button!);
		expect(button).toHaveStyle({ transform: 'translateY(2px)' });
	});

	it('translates back on mouseup', async () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
			},
		});
		const button = container.querySelector('button');
		await fireEvent.mouseDown(button!);
		await fireEvent.mouseUp(button!);
		expect(button).toHaveStyle({ transform: 'translateY(0)' });
	});

	it('translates back on mouseleave', async () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
			},
		});
		const button = container.querySelector('button');
		await fireEvent.mouseDown(button!);
		await fireEvent.mouseLeave(button!);
		expect(button).toHaveStyle({ transform: 'translateY(0)' });
	});

	it('renders icon snippet', () => {
		const { getByText } = render(Button, {
			props: {
				children: createSnippet('Save'),
				icon: createSnippet('→'),
			},
		});
		expect(getByText('Save')).toBeInTheDocument();
		expect(getByText('→')).toBeInTheDocument();
	});

	it('calls onclick handler', async () => {
		let clicked = false;
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
				onclick: () => {
					clicked = true;
				},
			},
		});
		const button = container.querySelector('button');
		await fireEvent.click(button!);
		expect(clicked).toBe(true);
	});

	it('spreads rest props', () => {
		const { container } = render(Button, {
			props: {
				children: createSnippet('Btn'),
				'data-testid': 'my-btn',
			},
		});
		const button = container.querySelector('button');
		expect(button).toHaveAttribute('data-testid', 'my-btn');
	});
});
