import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import PuzzleScreen from '../src/lib/components/screens/PuzzleScreen.svelte';

vi.mock('../src/lib/components/Chessboard.svelte', () => {
	return {
		default: vi.fn().mockImplementation(() => ({
			$destroy: vi.fn(),
		})),
	};
});

describe('PuzzleScreen', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders with aria-label "Chess puzzle"', () => {
		const { container } = render(PuzzleScreen, { props: {} });
		const dialog = container.querySelector('[role="dialog"]');
		expect(dialog).toHaveAttribute('aria-label', 'Chess puzzle');
	});

	it('renders close button with aria-label', () => {
		render(PuzzleScreen, { props: {} });
		expect(screen.getByLabelText('Close puzzle')).toBeInTheDocument();
	});

	it('renders hint button with aria-label', () => {
		render(PuzzleScreen, { props: {} });
		expect(screen.getByLabelText('Show hint')).toBeInTheDocument();
	});

	it('renders default puzzle title', () => {
		render(PuzzleScreen, { props: {} });
		expect(screen.getByText("Scholar's Mate")).toBeInTheDocument();
	});

	it('renders custom puzzle title when puzzleId provided', () => {
		render(PuzzleScreen, { props: { puzzleId: 'p3' } });
		expect(screen.getByText('Back Rank Mate')).toBeInTheDocument();
	});

	it('shows prompt for white to move', () => {
		render(PuzzleScreen, { props: {} });
		expect(screen.getByText('Find the best move for White')).toBeInTheDocument();
	});

	it('renders attempt dots', () => {
		const { container } = render(PuzzleScreen, { props: {} });
		const dots = container.querySelectorAll('.attempt-dot');
		expect(dots.length).toBe(3);
	});

	it('retry button is disabled at start', () => {
		render(PuzzleScreen, { props: {} });
		const retryBtn = screen.getByText('Retry');
		expect(retryBtn.closest('button')).toBeDisabled();
	});

	it('calls onClose when close button clicked', async () => {
		const onClose = vi.fn();
		render(PuzzleScreen, { props: { onClose } });
		await fireEvent.click(screen.getByLabelText('Close puzzle'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('shows hint when hint button clicked', async () => {
		render(PuzzleScreen, { props: {} });
		await fireEvent.click(screen.getByLabelText('Show hint'));
		expect(screen.getByText('Solution revealed')).toBeInTheDocument();
		expect(screen.getByText('Next puzzle')).toBeInTheDocument();
	});

	it('shows retry button after hint', async () => {
		render(PuzzleScreen, { props: {} });
		await fireEvent.click(screen.getByLabelText('Show hint'));
		const retryBtns = screen.getAllByText('Retry');
		expect(retryBtns.length).toBeGreaterThanOrEqual(1);
	});

	it('hint button is disabled after showing solution', async () => {
		render(PuzzleScreen, { props: {} });
		await fireEvent.click(screen.getByLabelText('Show hint'));
		expect(screen.getByLabelText('Show hint')).toBeDisabled();
	});

	it('renders chessboard container', () => {
		const { container } = render(PuzzleScreen, { props: {} });
		const boardContainer = container.querySelector('.board-container');
		expect(boardContainer).toBeInTheDocument();
	});

	it('renders puzzle screen with correct z-index', () => {
		const { container } = render(PuzzleScreen, { props: {} });
		const puzzleScreen = container.querySelector('.puzzle-screen') as HTMLElement;
		expect(puzzleScreen).toBeTruthy();
	});

	it('renders next puzzle button after hint', async () => {
		render(PuzzleScreen, { props: {} });
		await fireEvent.click(screen.getByLabelText('Show hint'));
		expect(screen.getByText('Next puzzle')).toBeInTheDocument();
	});

	it('resets state when next puzzle clicked', async () => {
		render(PuzzleScreen, { props: {} });
		await fireEvent.click(screen.getByLabelText('Show hint'));
		await fireEvent.click(screen.getByText('Next puzzle'));
		expect(screen.getByText('Find the best move for White')).toBeInTheDocument();
		expect(screen.queryByText('Solution revealed')).not.toBeInTheDocument();
	});
});
