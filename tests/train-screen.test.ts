import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import TrainScreen from '../src/lib/components/screens/TrainScreen.svelte';

const defaultProps = { onOpenPuzzle: vi.fn(), onOpenScan: vi.fn() };

function renderTrainScreen(props: Record<string, unknown> = {}) {
	return render(TrainScreen, { props: { ...defaultProps, ...props } });
}

function expectTextsPresent(texts: string[]) {
	for (const text of texts) {
		expect(screen.getByText(text)).toBeInTheDocument();
	}
}

async function clickAndExpectCallback(
	text: string,
	callbackName: 'onOpenPuzzle' | 'onOpenScan',
	expected: string | string[],
) {
	const callback = vi.fn();
	renderTrainScreen({ [callbackName]: callback });
	await fireEvent.click(screen.getByText(text).closest('button')!);
	const args = Array.isArray(expected) ? expected : [expected];
	expect(callback).toHaveBeenCalledWith(...args);
}

describe('TrainScreen', () => {
	it('renders header with title and subtitle', () => {
		renderTrainScreen();
		expectTextsPresent(['Train', 'Sharpen your tactics']);
	});

	it('renders daily puzzle hero with pill', () => {
		renderTrainScreen();
		expectTextsPresent(['Daily challenge', 'Mate in 2', 'Can you find the winning move?']);
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
		expectTextsPresent([
			'Fork!',
			'Pin & win',
			'Back rank mate',
			'Discovered attack',
			'Queen sacrifice',
			'Knight fork',
		]);
	});

	it('renders puzzle emojis', () => {
		renderTrainScreen();
		expectTextsPresent(['🍴', '📌', '🏰', '💥', '👑', '♞']);
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
		await clickAndExpectCallback('Fork!', 'onOpenPuzzle', 'p1');
	});

	it('calls onOpenPuzzle with correct id for different puzzles', async () => {
		const onOpenPuzzle = vi.fn();
		renderTrainScreen({ onOpenPuzzle });
		const knightFork = screen.getByText('Knight fork').closest('button');
		await fireEvent.click(knightFork!);
		expect(onOpenPuzzle).toHaveBeenCalledWith('p6');
	});
});
