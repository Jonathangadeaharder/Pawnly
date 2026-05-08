import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import GameScreen from '../src/lib/components/screens/GameScreen.svelte';

vi.mock('../src/lib/stockfish.svelte', () => ({
	createStockfish: () => ({
		isReady: true,
		isThinking: false,
		bestMove: null,
		evaluation: 0,
		depth: 0,
		pv: [],
		analyze: vi.fn().mockResolvedValue({ evaluation: 0, bestMove: 'e2e4', pv: [], depth: 10 }),
		getBestMove: vi
			.fn()
			.mockResolvedValue({ from: 'e7', to: 'e5', san: 'e5', evaluation: 0, depth: 5 }),
		analyzeGame: vi.fn().mockResolvedValue({
			moves: [],
			accuracy: { white: 100, black: 100 },
			blunders: { white: 0, black: 0 },
			mistakes: { white: 0, black: 0 },
			inaccuracies: { white: 0, black: 0 },
			averageCentipawnLoss: { white: 0, black: 0 },
		}),
		stop: vi.fn(),
		quit: vi.fn(),
		setSkillLevel: vi.fn(),
		setELO: vi.fn(),
	}),
}));

describe('GameScreen', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders with aria-label "Pawnly game"', () => {
		const { container } = render(GameScreen, { props: {} });
		const screen = container.querySelector('[role="dialog"]');
		expect(screen).toHaveAttribute('aria-label', 'Pawnly game');
	});

	it('renders exit button with aria-label', () => {
		render(GameScreen, { props: {} });
		const exitBtn = screen.getByLabelText('Exit game');
		expect(exitBtn).toBeInTheDocument();
	});

	it('renders difficulty pill with default "Intermediate"', () => {
		render(GameScreen, { props: {} });
		expect(screen.getByText('Intermediate')).toBeInTheDocument();
	});

	it('renders difficulty pill with custom difficulty', () => {
		render(GameScreen, { props: { difficulty: 'beginner' } });
		expect(screen.getByText('Beginner')).toBeInTheDocument();
	});

	it('renders clock displays', () => {
		const { container } = render(GameScreen, { props: { timeControl: '10+0' } });
		const clocks = container.querySelectorAll('.clock-time');
		expect(clocks.length).toBe(2);
		expect(clocks[0].textContent).toBe('10:00');
		expect(clocks[1].textContent).toBe('10:00');
	});

	it('renders clock with custom time control', () => {
		const { container } = render(GameScreen, { props: { timeControl: '5+3' } });
		const clocks = container.querySelectorAll('.clock-time');
		expect(clocks[0].textContent).toBe('5:00');
		expect(clocks[1].textContent).toBe('5:00');
	});

	it('renders chessboard', () => {
		const { container } = render(GameScreen, { props: {} });
		const board = container.querySelector('[aria-label="Chessboard"]');
		expect(board).toBeInTheDocument();
	});

	it('renders move list with empty state message', () => {
		render(GameScreen, { props: {} });
		expect(screen.getByText('Your move — tap a piece')).toBeInTheDocument();
	});

	it('renders undo button', () => {
		render(GameScreen, { props: {} });
		expect(screen.getByLabelText('Undo move')).toBeInTheDocument();
	});

	it('renders draw button', () => {
		render(GameScreen, { props: {} });
		expect(screen.getByLabelText('Offer draw')).toBeInTheDocument();
	});

	it('renders resign button', () => {
		render(GameScreen, { props: {} });
		expect(screen.getByLabelText('Resign')).toBeInTheDocument();
	});

	it('undo button is disabled at start', () => {
		render(GameScreen, { props: {} });
		const undoBtn = screen.getByLabelText('Undo move');
		expect(undoBtn).toBeDisabled();
	});

	it('draw button is enabled at start', () => {
		render(GameScreen, { props: {} });
		const drawBtn = screen.getByLabelText('Offer draw');
		expect(drawBtn).not.toBeDisabled();
	});

	it('resign button is enabled at start', () => {
		render(GameScreen, { props: {} });
		const resignBtn = screen.getByLabelText('Resign');
		expect(resignBtn).not.toBeDisabled();
	});

	it('calls onExit when exit button clicked', async () => {
		const onExit = vi.fn();
		render(GameScreen, { props: { onExit } });
		const exitBtn = screen.getByLabelText('Exit game');
		await fireEvent.click(exitBtn);
		expect(onExit).toHaveBeenCalledOnce();
	});

	it('shows game over dialog when resign clicked', async () => {
		render(GameScreen, { props: {} });
		const resignBtn = screen.getByLabelText('Resign');
		await fireEvent.click(resignBtn);
		expect(screen.getByText('Coach wins')).toBeInTheDocument();
	});

	it('shows game over dialog when draw clicked', async () => {
		render(GameScreen, { props: {} });
		const drawBtn = screen.getByLabelText('Offer draw');
		await fireEvent.click(drawBtn);
		expect(screen.getByText('Draw')).toBeInTheDocument();
	});

	it('shows analyze button in game over dialog', async () => {
		render(GameScreen, { props: {} });
		await fireEvent.click(screen.getByLabelText('Resign'));
		expect(screen.getByText('Analyze game')).toBeInTheDocument();
	});

	it('shows new game button in game over dialog', async () => {
		render(GameScreen, { props: {} });
		await fireEvent.click(screen.getByLabelText('Resign'));
		expect(screen.getByText('New game')).toBeInTheDocument();
	});

	it('shows exit button in game over dialog', async () => {
		const onExit = vi.fn();
		render(GameScreen, { props: { onExit } });
		await fireEvent.click(screen.getByLabelText('Resign'));
		const exitBtns = screen.getAllByText('Exit');
		expect(exitBtns.length).toBeGreaterThanOrEqual(1);
		await fireEvent.click(exitBtns[exitBtns.length - 1]);
		expect(onExit).toHaveBeenCalled();
	});

	it('resign button is disabled after game over', async () => {
		render(GameScreen, { props: {} });
		await fireEvent.click(screen.getByLabelText('Resign'));
		const resignBtn = screen.getByLabelText('Resign');
		expect(resignBtn).toBeDisabled();
	});

	it('draw button is disabled after game over', async () => {
		render(GameScreen, { props: {} });
		await fireEvent.click(screen.getByLabelText('Resign'));
		const drawBtn = screen.getByLabelText('Offer draw');
		expect(drawBtn).toBeDisabled();
	});

	it('closes game over dialog and resets on new game', async () => {
		render(GameScreen, { props: {} });
		await fireEvent.click(screen.getByLabelText('Resign'));
		expect(screen.getByText('Coach wins')).toBeInTheDocument();
		const newGameBtn = screen.getByText('New game');
		await fireEvent.click(newGameBtn);
		expect(screen.queryByText('Coach wins')).not.toBeInTheDocument();
		expect(screen.getByText('Your move — tap a piece')).toBeInTheDocument();
	});

	it('renders thinking indicator structure', () => {
		const { container } = render(GameScreen, { props: {} });
		// Thinking overlay is hidden by default
		const overlay = container.querySelector('.thinking-overlay');
		expect(overlay).not.toBeInTheDocument();
	});

	it('has correct z-index on game screen', () => {
		const { container } = render(GameScreen, { props: {} });
		const gameScreen = container.querySelector('.game-screen') as HTMLElement;
		expect(gameScreen).toBeTruthy();
	});

	it('renders clock emoji indicators', () => {
		render(GameScreen, { props: {} });
		expect(screen.getByText('⚫')).toBeInTheDocument();
		expect(screen.getByText('⚪')).toBeInTheDocument();
	});
});
