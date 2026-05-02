import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import Button from '../src/lib/components/Button.svelte';
import { createSnippet } from './helpers';

function renderButton(props: Record<string, unknown> = {}) {
	return render(Button, {
		props: { children: createSnippet('Btn'), ...props },
	});
}

function getBtn(container: HTMLElement) {
	return container.querySelector('button')!;
}

describe('Button', () => {
	it('renders children content', () => {
		const { getByText } = renderButton({ children: createSnippet('Click me') });
		expect(getByText('Click me')).toBeInTheDocument();
	});

	it.each([
		['defaults to primary variant', {}, { backgroundColor: Brand.colors.ink, color: Brand.colors.cream }],
		['applies moss variant styles', { kind: 'moss' }, { backgroundColor: Brand.colors.moss, color: Brand.colors.cream }],
		['applies sunny variant styles', { kind: 'sunny' }, { backgroundColor: Brand.colors.sunny, color: Brand.colors.ink }],
		['applies cream variant styles', { kind: 'cream' }, { backgroundColor: Brand.colors.creamSoft, color: Brand.colors.ink }],
		['has border-radius 14px', {}, { borderRadius: '14px' }],
		['uses Brand.fonts.body', {}, { fontFamily: Brand.fonts.body }],
		['sets full width when full is true', { full: true }, { width: '100%' }],
		['auto width when full is false', { full: false }, { width: 'auto' }],
	])('%s', (_name, props, expected) => {
		const { container } = renderButton(props);
		expect(getBtn(container)).toHaveStyle(expected);
	});

	it('applies ghost variant styles', () => {
		const { container } = renderButton({ kind: 'ghost' });
		const button = getBtn(container);
		expect(button.style.backgroundColor).toBe('transparent');
		expect(button).toHaveStyle({ color: Brand.colors.ink });
	});

	it('translates down on mousedown', async () => {
		const { container } = renderButton();
		const button = getBtn(container);
		await fireEvent.mouseDown(button);
		expect(button).toHaveStyle({ transform: 'translateY(2px)' });
	});

	it.each([
		['translates back on mouseup', 'mouseUp'],
		['translates back on mouseleave', 'mouseLeave'],
	])('%s', async (_name, event) => {
		const { container } = renderButton();
		const button = getBtn(container);
		await fireEvent.mouseDown(button);
		await fireEvent[event](button);
		expect(button).toHaveStyle({ transform: 'translateY(0)' });
	});

	it('renders icon snippet', () => {
		const { getByText } = renderButton({ children: createSnippet('Save'), icon: createSnippet('→') });
		expect(getByText('Save')).toBeInTheDocument();
		expect(getByText('→')).toBeInTheDocument();
	});

	it('calls onclick handler', async () => {
		let clicked = false;
		const { container } = renderButton({ onclick: () => { clicked = true; } });
		await fireEvent.click(getBtn(container));
		expect(clicked).toBe(true);
	});

	it('spreads rest props', () => {
		const { container } = renderButton({ 'data-testid': 'my-btn' });
		expect(getBtn(container)).toHaveAttribute('data-testid', 'my-btn');
	});
});
