import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import Overlay from '../src/lib/components/Overlay.svelte';
import { createDivSnippet } from './helpers';

const createSnippet = createDivSnippet;

describe('Overlay', () => {
	it('renders children when visible', () => {
		const { getByText } = render(Overlay, {
			props: {
				visible: true,
				children: createSnippet('Game content'),
			},
		});
		expect(getByText('Game content')).toBeInTheDocument();
	});

	it('does not render when not visible', () => {
		const { queryByText } = render(Overlay, {
			props: {
				visible: false,
				children: createSnippet('Game content'),
			},
		});
		expect(queryByText('Game content')).not.toBeInTheDocument();
	});

	it('shows close button by default', () => {
		const { container } = render(Overlay, {
			props: {
				visible: true,
				children: createSnippet('Content'),
			},
		});
		const closeBtn = container.querySelector('button[aria-label="Close"]');
		expect(closeBtn).toBeInTheDocument();
	});

	it('hides close button when showCloseButton is false', () => {
		const { container } = render(Overlay, {
			props: {
				visible: true,
				showCloseButton: false,
				children: createSnippet('Content'),
			},
		});
		const closeBtn = container.querySelector('button[aria-label="Close"]');
		expect(closeBtn).not.toBeInTheDocument();
	});

	it('calls onClose when close button clicked', async () => {
		const onClose = vi.fn();
		const { container } = render(Overlay, {
			props: {
				visible: true,
				onClose,
				children: createSnippet('Content'),
			},
		});
		const closeBtn = container.querySelector('button[aria-label="Close"]')!;
		await fireEvent.click(closeBtn);
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('calls onClose when backdrop clicked', async () => {
		const onClose = vi.fn();
		const { container } = render(Overlay, {
			props: {
				visible: true,
				onClose,
				children: createSnippet('Content'),
			},
		});
		const backdrop = container.querySelector('[data-overlay-backdrop]')!;
		await fireEvent.click(backdrop);
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('does not call onClose when content clicked', async () => {
		const onClose = vi.fn();
		const { getByText } = render(Overlay, {
			props: {
				visible: true,
				onClose,
				children: createSnippet('Content'),
			},
		});
		await fireEvent.click(getByText('Content'));
		expect(onClose).not.toHaveBeenCalled();
	});

	it('calls onClose on Escape key', async () => {
		const onClose = vi.fn();
		render(Overlay, {
			props: {
				visible: true,
				onClose,
				children: createSnippet('Content'),
			},
		});
		await fireEvent.keyDown(document, { key: 'Escape' });
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('does not call onClose on other keys', async () => {
		const onClose = vi.fn();
		render(Overlay, {
			props: {
				visible: true,
				onClose,
				children: createSnippet('Content'),
			},
		});
		await fireEvent.keyDown(document, { key: 'Enter' });
		expect(onClose).not.toHaveBeenCalled();
	});

	it('applies custom zIndex', () => {
		const { container } = render(Overlay, {
			props: {
				visible: true,
				zIndex: 200,
				children: createSnippet('Content'),
			},
		});
		const overlay = container.querySelector('[data-overlay-backdrop]') as HTMLElement;
		expect(overlay.style.zIndex).toBe('200');
	});

	it('defaults zIndex to 100', () => {
		const { container } = render(Overlay, {
			props: {
				visible: true,
				children: createSnippet('Content'),
			},
		});
		const overlay = container.querySelector('[data-overlay-backdrop]') as HTMLElement;
		expect(overlay.style.zIndex).toBe('100');
	});

	it('has fixed positioning covering full screen', () => {
		const { container } = render(Overlay, {
			props: {
				visible: true,
				children: createSnippet('Content'),
			},
		});
		const overlay = container.querySelector('[data-overlay-backdrop]') as HTMLElement;
		expect(overlay).toHaveStyle({
			position: 'fixed',
			top: '0',
			left: '0',
			right: '0',
			bottom: '0',
		});
	});
});
