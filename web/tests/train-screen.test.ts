import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import TrainScreen from '../src/lib/components/screens/TrainScreen.svelte';

describe('TrainScreen', () => {
	it('renders header with title and subtitle', () => {
		render(TrainScreen, { props: { onOpenPuzzle: vi.fn() } });
		expect(screen.getByText('Train')).toBeInTheDocument();
		expect(screen.getByText('Sharpen your tactics')).toBeInTheDocument();
	});

	it('renders daily puzzle hero with pill', () => {
		render(TrainScreen, { props: { onOpenPuzzle: vi.fn() } });
		expect(screen.getByText('Daily challenge')).toBeInTheDocument();
		expect(screen.getByText('Mate in 2')).toBeInTheDocument();
		expect(screen.getByText('Can you find the winning move?')).toBeInTheDocument();
	});

	it('calls onOpenPuzzle("daily") when daily hero clicked', async () => {
		const onOpenPuzzle = vi.fn();
		render(TrainScreen, { props: { onOpenPuzzle } });
		const dailyCard = screen.getByText('Mate in 2').closest('button');
		expect(dailyCard).toBeTruthy();
		await fireEvent.click(dailyCard!);
		expect(onOpenPuzzle).toHaveBeenCalledWith('daily');
	});

	it('renders Puzzles heading', () => {
		render(TrainScreen, { props: { onOpenPuzzle: vi.fn() } });
		expect(screen.getByText('Puzzles')).toBeInTheDocument();
	});

	it('renders all six puzzle titles', () => {
		render(TrainScreen, { props: { onOpenPuzzle: vi.fn() } });
		expect(screen.getByText('Fork!')).toBeInTheDocument();
		expect(screen.getByText('Pin & win')).toBeInTheDocument();
		expect(screen.getByText('Back rank mate')).toBeInTheDocument();
		expect(screen.getByText('Discovered attack')).toBeInTheDocument();
		expect(screen.getByText('Queen sacrifice')).toBeInTheDocument();
		expect(screen.getByText('Knight fork')).toBeInTheDocument();
	});

	it('renders puzzle emojis', () => {
		render(TrainScreen, { props: { onOpenPuzzle: vi.fn() } });
		expect(screen.getByText('🍴')).toBeInTheDocument();
		expect(screen.getByText('📌')).toBeInTheDocument();
		expect(screen.getByText('🏰')).toBeInTheDocument();
		expect(screen.getByText('💥')).toBeInTheDocument();
		expect(screen.getByText('👑')).toBeInTheDocument();
		expect(screen.getByText('♞')).toBeInTheDocument();
	});

	it('renders solved indicator for completed puzzles', () => {
		render(TrainScreen, { props: { onOpenPuzzle: vi.fn() } });
		const solved = screen.getAllByText('✓ Solved');
		expect(solved.length).toBe(2);
	});

	it('renders 7 buttons (1 daily hero + 6 puzzle cards)', () => {
		render(TrainScreen, { props: { onOpenPuzzle: vi.fn() } });
		const puzzleButtons = screen.getAllByRole('button');
		expect(puzzleButtons.length).toBe(7);
	});

	it('calls onOpenPuzzle with puzzle id when puzzle clicked', async () => {
		const onOpenPuzzle = vi.fn();
		render(TrainScreen, { props: { onOpenPuzzle } });
		const forkPuzzle = screen.getByText('Fork!').closest('button');
		expect(forkPuzzle).toBeTruthy();
		await fireEvent.click(forkPuzzle!);
		expect(onOpenPuzzle).toHaveBeenCalledWith('p1');
	});

	it('calls onOpenPuzzle with correct id for different puzzles', async () => {
		const onOpenPuzzle = vi.fn();
		render(TrainScreen, { props: { onOpenPuzzle } });
		const knightFork = screen.getByText('Knight fork').closest('button');
		await fireEvent.click(knightFork!);
		expect(onOpenPuzzle).toHaveBeenCalledWith('p6');
	});
});
