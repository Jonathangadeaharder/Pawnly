import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import LessonViewer from '../src/lib/components/screens/LessonViewer.svelte';

function renderLessonViewer(props: Record<string, unknown> = {}) {
	return render(LessonViewer, { props: { onClose: () => {}, ...props } });
}

describe('LessonViewer', () => {
	it('renders the lesson title', () => {
		renderLessonViewer();
		expect(screen.getByText('Special moves')).toBeInTheDocument();
	});

	it('renders the first coach message', () => {
		renderLessonViewer();
		expect(screen.getByText("Welcome! Let's learn about special moves.")).toBeInTheDocument();
	});

	it('shows step counter at 1 / 4', () => {
		renderLessonViewer();
		expect(screen.getByText('1 / 4')).toBeInTheDocument();
	});

	it('renders Next button on first step', () => {
		renderLessonViewer();
		expect(screen.getByText('Next')).toBeInTheDocument();
	});

	it('does not render Back button on first step', () => {
		renderLessonViewer();
		expect(screen.queryByText('Back')).not.toBeInTheDocument();
	});

	it.each([
		['advances to step 2', 1, '2 / 4', /En passant/],
		['advances to step 3', 2, '3 / 4', /Castling/],
		['advances to step 4', 3, '4 / 4', /Promotion/],
	])('%s', async (_name, clicks, counter, contentPattern) => {
		renderLessonViewer();
		for (let i = 0; i < clicks; i++) {
			await fireEvent.click(screen.getByText('Next'));
		}
		expect(screen.getByText(counter)).toBeInTheDocument();
		expect(screen.getByText(contentPattern)).toBeInTheDocument();
	});

	it('shows Back button after advancing', async () => {
		renderLessonViewer();
		await fireEvent.click(screen.getByText('Next'));
		expect(screen.getByText('Back')).toBeInTheDocument();
	});

	it('goes back when Back is clicked', async () => {
		renderLessonViewer();
		await fireEvent.click(screen.getByText('Next'));
		await fireEvent.click(screen.getByText('Back'));
		expect(screen.getByText('1 / 4')).toBeInTheDocument();
	});

	it('shows Finish on last step', async () => {
		renderLessonViewer();
		await fireEvent.click(screen.getByText('Next'));
		await fireEvent.click(screen.getByText('Next'));
		await fireEvent.click(screen.getByText('Next'));
		expect(screen.getByText('4 / 4')).toBeInTheDocument();
		expect(screen.getByText('Finish')).toBeInTheDocument();
		expect(screen.queryByText(/Promotion/)).toBeInTheDocument();
	});

	it('calls onClose when Finish is clicked on last step', async () => {
		const onClose = vi.fn();
		renderLessonViewer({ onClose });
		await fireEvent.click(screen.getByText('Next'));
		await fireEvent.click(screen.getByText('Next'));
		await fireEvent.click(screen.getByText('Next'));
		await fireEvent.click(screen.getByText('Finish'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('calls onClose when Header back button is clicked', async () => {
		const onClose = vi.fn();
		renderLessonViewer({ onClose });
		await fireEvent.click(screen.getByText('← Back'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('renders all four lesson steps', async () => {
		renderLessonViewer();
		expect(screen.getByText(/Welcome/)).toBeInTheDocument();
		await fireEvent.click(screen.getByText('Next'));
		expect(screen.getByText(/En passant/)).toBeInTheDocument();
		await fireEvent.click(screen.getByText('Next'));
		expect(screen.getByText(/Castling/)).toBeInTheDocument();
		await fireEvent.click(screen.getByText('Next'));
		expect(screen.getByText(/Promotion/)).toBeInTheDocument();
	});
});
