import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import Overlay from '../src/lib/components/Overlay.svelte';
import { createDivSnippet } from './helpers';

function renderOverlay(props: Record<string, unknown> = {}) {
	return render(Overlay, {
		props: { visible: true, children: createDivSnippet('Content'), ...props },
	});
}

function getBackdrop(container: HTMLElement) {
	return container.querySelector('[data-overlay-backdrop]') as HTMLElement;
}

function getCloseBtn(container: HTMLElement) {
	return container.querySelector('button[aria-label="Close"]');
}

describe('Overlay', () => {
	it('renders children when visible', () => {
		const { getByText } = renderOverlay();
		expect(getByText('Content')).toBeInTheDocument();
	});

	it('does not render when not visible', () => {
		const { queryByText } = renderOverlay({ visible: false });
		expect(queryByText('Content')).not.toBeInTheDocument();
	});

	it('shows close button by default', () => {
		const { container } = renderOverlay();
		expect(getCloseBtn(container)).toBeInTheDocument();
	});

	it('hides close button when showCloseButton is false', () => {
		const { container } = renderOverlay({ showCloseButton: false });
		expect(getCloseBtn(container)).not.toBeInTheDocument();
	});

	it('calls onClose when close button clicked', async () => {
		const onClose = vi.fn();
		const { container } = renderOverlay({ onClose });
		await fireEvent.click(getCloseBtn(container)!);
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('calls onClose when backdrop clicked', async () => {
		const onClose = vi.fn();
		const { container } = renderOverlay({ onClose });
		await fireEvent.click(getBackdrop(container));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('does not call onClose when content clicked', async () => {
		const onClose = vi.fn();
		const { getByText } = renderOverlay({ onClose });
		await fireEvent.click(getByText('Content'));
		expect(onClose).not.toHaveBeenCalled();
	});

	it.each([
		['calls onClose on Escape key', 'Escape', true],
		['does not call onClose on other keys', 'Enter', false],
	])('%s', async (_name, key, shouldCall) => {
		const onClose = vi.fn();
		renderOverlay({ onClose });
		await fireEvent.keyDown(document, { key });
		if (shouldCall) {
			expect(onClose).toHaveBeenCalledOnce();
		} else {
			expect(onClose).not.toHaveBeenCalled();
		}
	});

	it.each([
		['applies custom zIndex', { zIndex: 200 }, '200'],
		['defaults zIndex to 100', {}, '100'],
	])('%s', (_name, props, expected) => {
		const { container } = renderOverlay(props);
		expect(getBackdrop(container).style.zIndex).toBe(expected);
	});

	it('has fixed positioning covering full screen', () => {
		const { container } = renderOverlay();
		expect(getBackdrop(container)).toHaveStyle({
			position: 'fixed',
			top: '0',
			left: '0',
			right: '0',
			bottom: '0',
		});
	});
});
