import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import TrainScreen from '../src/lib/components/screens/TrainScreen.svelte';

const defaultProps = { onOpenPuzzle: vi.fn(), onOpenScan: vi.fn() };

function renderTrainScreen(props: Record<string, unknown> = {}) {
	return render(TrainScreen, { props: { ...defaultProps, ...props } });
}

describe('TrainScreen', () => {
	it('renders header with title and subtitle', () => {
		renderTrainScreen();
		expect(screen.getByText('Train')).toBeInTheDocument();
		expect(screen.getByText('Sharpen your tactics')).toBeInTheDocument();
	});

	it('renders daily puzzle hero with pill', () => {
		renderTrainScreen();
		expect(screen.getByText('Daily challenge')).toBeInTheDocument();
		expect(screen.getByText('Mate in 2')).toBeInTheDocument();
		expect(screen.getByText('Can you find the winning move?')).toBeInTheDocument();
	});

	it('renders scan hero with pill', () => {
		renderTrainScreen();
		expect(screen.getByText('Scan trainer')).toBeInTheDocument();
		expect(screen.getByText('Find all threats')).toBeInTheDocument();
		expect(
			screen.getByText('Mark checks, captures & threats before time runs out'),
		).toBeInTheDocument();
	});

	it('calls onOpenScan when scan hero clicked', async () => {
		const onOpenScan = vi.fn();
		renderTrainScreen({ onOpenScan });
		const scanCard = screen.getByText('Find all threats').closest('button');
		expect(scanCard).toBeTruthy();
		await fireEvent.click(scanCard!);
		expect(onOpenScan).toHaveBeenCalledOnce();
	});

	it('calls onOpenPuzzle("daily") when daily hero clicked', async () => {
		const onOpenPuzzle = vi.fn();
		renderTrainScreen({ onOpenPuzzle });
		const dailyCard = screen.getByText('Mate in 2').closest('button');
		expect(dailyCard).toBeTruthy();
		await fireEvent.click(dailyCard!);
		expect(onOpenPuzzle).toHaveBeenCalledWith('daily');
	});

	it('renders Puzzles heading', () => {
		renderTrainScreen();
		expect(screen.getByText('Puzzles')).toBeInTheDocument();
	});

	it('renders all six puzzle titles', () => {
		renderTrainScreen();
		expect(screen.getByText('Fork!')).toBeInTheDocument();
		expect(screen.getByText('Pin & win')).toBeInTheDocument();
		expect(screen.getByText('Back rank mate')).toBeInTheDocument();
		expect(screen.getByText('Discovered attack')).toBeInTheDocument();
		expect(screen.getByText('Queen sacrifice')).toBeInTheDocument();
		expect(screen.getByText('Knight fork')).toBeInTheDocument();
	});

	it('renders puzzle emojis', () => {
		renderTrainScreen();
		expect(screen.getByText('🍴')).toBeInTheDocument();
		expect(screen.getByText('📌')).toBeInTheDocument();
		expect(screen.getByText('🏰')).toBeInTheDocument();
		expect(screen.getByText('💥')).toBeInTheDocument();
		expect(screen.getByText('👑')).toBeInTheDocument();
		expect(screen.getByText('♞')).toBeInTheDocument();
	});

	it('renders solved indicator for completed puzzles', () => {
		renderTrainScreen();
		const solved = screen.getAllByText('✓ Solved');
		expect(solved.length).toBe(2);
	});

	it('renders 8 buttons (1 daily hero + 1 scan hero + 6 puzzle cards)', () => {
		renderTrainScreen();
		const puzzleButtons = screen.getAllByRole('button');
		expect(puzzleButtons.length).toBe(8);
	});

	it('calls onOpenPuzzle with puzzle id when puzzle clicked', async () => {
		const onOpenPuzzle = vi.fn();
		renderTrainScreen({ onOpenPuzzle });
		const forkPuzzle = screen.getByText('Fork!').closest('button');
		expect(forkPuzzle).toBeTruthy();
		await fireEvent.click(forkPuzzle!);
		expect(onOpenPuzzle).toHaveBeenCalledWith('p1');
	});

	it('calls onOpenPuzzle with correct id for different puzzles', async () => {
		const onOpenPuzzle = vi.fn();
		renderTrainScreen({ onOpenPuzzle });
		const knightFork = screen.getByText('Knight fork').closest('button');
		await fireEvent.click(knightFork!);
		expect(onOpenPuzzle).toHaveBeenCalledWith('p6');
	});
});
