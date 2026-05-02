import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import LessonViewer from '../src/lib/components/screens/LessonViewer.svelte';

function renderLessonViewer(props: Record<string, unknown> = {}) {
	return render(LessonViewer, { props: { onClose: () => {}, ...props } });
}

describe('LessonViewer', () => {
	it('renders the lesson title', () => {
		const { getByText } = renderLessonViewer();
		expect(getByText('Special moves')).toBeInTheDocument();
	});

	it('renders the first coach message', () => {
		const { getByText } = renderLessonViewer();
		expect(getByText("Welcome! Let's learn about special moves.")).toBeInTheDocument();
	});

	it('shows step counter at 1 / 4', () => {
		const { getByText } = renderLessonViewer();
		expect(getByText('1 / 4')).toBeInTheDocument();
	});

	it('renders Next button on first step', () => {
		const { getByText } = renderLessonViewer();
		expect(getByText('Next')).toBeInTheDocument();
	});

	it('does not render Back button on first step', () => {
		const { queryByText } = renderLessonViewer();
		expect(queryByText('Back')).not.toBeInTheDocument();
	});

	it('advances to step 2 when Next is clicked', async () => {
		const { getByText } = renderLessonViewer();
		await fireEvent.click(getByText('Next'));
		expect(getByText('2 / 4')).toBeInTheDocument();
		expect(getByText(/En passant/)).toBeInTheDocument();
	});

	it('shows Back button after advancing', async () => {
		const { getByText } = renderLessonViewer();
		await fireEvent.click(getByText('Next'));
		expect(getByText('Back')).toBeInTheDocument();
	});

	it('goes back when Back is clicked', async () => {
		const { getByText } = renderLessonViewer();
		await fireEvent.click(getByText('Next'));
		await fireEvent.click(getByText('Back'));
		expect(getByText('1 / 4')).toBeInTheDocument();
	});

	it('shows Finish on last step', async () => {
		const { getByText, queryByText } = renderLessonViewer();
		await fireEvent.click(getByText('Next'));
		await fireEvent.click(getByText('Next'));
		await fireEvent.click(getByText('Next'));
		expect(getByText('4 / 4')).toBeInTheDocument();
		expect(getByText('Finish')).toBeInTheDocument();
		expect(queryByText(/Promotion/)).toBeInTheDocument();
	});

	it('calls onClose when Finish is clicked on last step', async () => {
		const onClose = vi.fn();
		const { getByText } = renderLessonViewer({ onClose });
		await fireEvent.click(getByText('Next'));
		await fireEvent.click(getByText('Next'));
		await fireEvent.click(getByText('Next'));
		await fireEvent.click(getByText('Finish'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('calls onClose when Header back button is clicked', async () => {
		const onClose = vi.fn();
		const { getByText } = renderLessonViewer({ onClose });
		await fireEvent.click(getByText('← Back'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('renders all four lesson steps', async () => {
		const { getByText } = renderLessonViewer();
		expect(getByText(/Welcome/)).toBeInTheDocument();
		await fireEvent.click(getByText('Next'));
		expect(getByText(/En passant/)).toBeInTheDocument();
		await fireEvent.click(getByText('Next'));
		expect(getByText(/Castling/)).toBeInTheDocument();
		await fireEvent.click(getByText('Next'));
		expect(getByText(/Promotion/)).toBeInTheDocument();
	});
});
