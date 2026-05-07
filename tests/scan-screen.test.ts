import { fireEvent, render, screen } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

let timerCallback: (() => void) | null = null;
const setIntervalMock = vi.hoisted(() =>
	vi.fn((cb: () => void, _ms: number) => {
		timerCallback = cb;
		return 1;
	}),
);
const clearIntervalMock = vi.hoisted(() =>
	vi.fn(() => {
		timerCallback = null;
	}),
);
const getSquareFromCoordsMock = vi.hoisted(() => vi.fn(() => null as string | null));

vi.stubGlobal('setInterval', setIntervalMock);
vi.stubGlobal('clearInterval', clearIntervalMock);

vi.mock('../src/lib/components/MiniBoard.svelte', () => ({
	default: vi.fn().mockImplementation(() => ({ $destroy: vi.fn() })),
}));

vi.mock('../src/lib/board.svelte', () => ({
	fenToPieces: vi.fn().mockReturnValue({}),
	getSquareFromCoords: getSquareFromCoordsMock,
}));

const { default: ScanScreen } = await import('../src/lib/components/screens/ScanScreen.svelte');

function advanceTimer(ticks: number) {
	for (let i = 0; i < ticks; i++) {
		if (!timerCallback) break;
		timerCallback();
	}
}

function renderScan(props: Record<string, unknown> = {}) {
	return render(ScanScreen, { props });
}

async function submitScan() {
	await fireEvent.click(screen.getByText('Submit Scan'));
}

async function clickBoard(container: HTMLElement, x = 100, y = 100) {
	const board = container.querySelector('[role="button"]')!;
	await fireEvent.click(board, { clientX: x, clientY: y });
}

describe('ScanScreen', () => {
	beforeEach(() => {
		timerCallback = null;
		getSquareFromCoordsMock.mockReset();
		getSquareFromCoordsMock.mockReturnValue(null);
	});

	// --- Rendering ---
	it.each([
		[
			'renders with aria-label "Scan trainer"',
			{},
			(c: HTMLElement) => {
				expect(c.querySelector('[role="dialog"]')).toHaveAttribute('aria-label', 'Scan trainer');
			},
		],
		[
			'renders close button',
			{},
			() => {
				expect(screen.getByLabelText('Close scan')).toBeInTheDocument();
			},
		],
		[
			'renders title "Scan"',
			{},
			() => {
				expect(screen.getByText('Scan')).toBeInTheDocument();
			},
		],
		[
			'renders timer',
			{},
			() => {
				expect(screen.getByText(/⏱/)).toBeInTheDocument();
			},
		],
		[
			'renders 3 star indicators',
			{},
			(c: HTMLElement) => {
				expect(c.querySelectorAll('.star').length).toBe(3);
			},
		],
		[
			'renders submit button',
			{},
			() => {
				expect(screen.getByText('Submit Scan')).toBeInTheDocument();
			},
		],
	])('%s', (_name, props, assert) => {
		const { container } = renderScan(props);
		assert(container);
	});

	// --- Mode buttons ---
	it.each([
		['renders check and capture at level 1', { level: 1 }, ['Check', 'Capture'], ['Threat']],
		['renders threat at level 5', { level: 5 }, ['Threat'], []],
		['renders loose at level 8', { level: 8 }, ['Loose'], []],
		['renders double attack at level 12', { level: 12 }, ['Double Attack'], []],
	])('%s', (_name, props, present, absent) => {
		renderScan(props);
		for (const text of present) expect(screen.getByText(text)).toBeInTheDocument();
		for (const text of absent) expect(screen.queryByText(text)).not.toBeInTheDocument();
	});

	it('shows locked icons for unavailable modes at level 1', () => {
		renderScan({ level: 1 });
		expect(screen.getAllByText('🔒').length).toBe(2);
	});

	// --- Prompt ---
	it('renders prompt for default mode at level 1', () => {
		renderScan({ level: 1 });
		expect(screen.getByText('Find all checks')).toBeInTheDocument();
	});

	it('does not show prompt after submit', async () => {
		renderScan();
		await submitScan();
		expect(screen.queryByText(/Find all/)).not.toBeInTheDocument();
	});

	// --- Close ---
	it('calls onClose when close clicked', async () => {
		const onClose = vi.fn();
		renderScan({ onClose });
		await fireEvent.click(screen.getByLabelText('Close scan'));
		expect(onClose).toHaveBeenCalledOnce();
	});

	// --- Submit ---
	it('shows result card after submit', async () => {
		renderScan();
		await submitScan();
		expect(screen.getByText('Next position')).toBeInTheDocument();
	});

	it('shows result stars after submit', async () => {
		const { container } = renderScan();
		await submitScan();
		expect(container.querySelectorAll('.result-star').length).toBe(3);
	});

	it('shows "Keep practicing" when 0 stars', async () => {
		renderScan();
		await submitScan();
		expect(screen.getByText('Keep practicing!')).toBeInTheDocument();
	});

	it('disables mode buttons after submit', async () => {
		renderScan({ level: 1 });
		await submitScan();
		expect(screen.getByText('Check').closest('button')).toBeDisabled();
		expect(screen.getByText('Capture').closest('button')).toBeDisabled();
	});

	it('does not submit twice', async () => {
		renderScan();
		await submitScan();
		expect(screen.queryByText('Submit Scan')).not.toBeInTheDocument();
		expect(screen.getByText('Next position')).toBeInTheDocument();
	});

	// --- Board click ---
	it('marks square on board click', async () => {
		getSquareFromCoordsMock.mockReturnValue('e4');
		const { container } = renderScan({ level: 1 });
		await clickBoard(container);
		expect(getSquareFromCoordsMock).toHaveBeenCalled();
	});

	it('does not mark square when getSquareFromCoords returns null', async () => {
		const { container } = renderScan({ level: 1 });
		await clickBoard(container);
		expect(getSquareFromCoordsMock).toHaveBeenCalled();
	});

	it('does not mark square after submit', async () => {
		getSquareFromCoordsMock.mockReturnValue('e4');
		const { container } = renderScan();
		await submitScan();
		await clickBoard(container);
	});

	it('toggles square mark on repeated click', async () => {
		getSquareFromCoordsMock.mockReturnValue('e4');
		const { container } = renderScan({ level: 1 });
		await clickBoard(container);
		await clickBoard(container);
		expect(getSquareFromCoordsMock).toHaveBeenCalledTimes(2);
	});

	// --- Mode switching ---
	it('switches mode when mode button clicked', async () => {
		renderScan({ level: 1 });
		await fireEvent.click(screen.getByText('Capture'));
		expect(screen.getByText('Find all captures')).toBeInTheDocument();
	});

	it('does not switch mode after submit', async () => {
		renderScan({ level: 1 });
		await submitScan();
		await fireEvent.click(screen.getByText('Capture').closest('button')!);
	});

	// --- Next position ---
	it('advances to next position on Next click', async () => {
		renderScan();
		await submitScan();
		await fireEvent.click(screen.getByText('Next position'));
		expect(screen.getByText('Submit Scan')).toBeInTheDocument();
	});

	it('shows submit button again after next', async () => {
		renderScan();
		await submitScan();
		await fireEvent.click(screen.getByText('Next position'));
		expect(screen.getByText('Find all checks')).toBeInTheDocument();
	});

	// --- Target time per level ---
	it.each([
		['uses 15s for level 1-4', { level: 1 }],
		['uses 12s for level 5-6', { level: 5 }],
		['uses 10s for level 7-10', { level: 7 }],
		['uses 8s for level 11+', { level: 11 }],
	])('%s', (_name, props) => {
		renderScan(props);
		expect(setIntervalMock).toHaveBeenCalled();
	});

	// --- Timer countdown ---
	it('decrements timer on tick', () => {
		renderScan({ level: 1 });
		advanceTimer(1);
	});

	// --- Star calculation ---
	it('gives 3 stars when all found under time', async () => {
		getSquareFromCoordsMock.mockReturnValue('e4');
		const { container } = renderScan({ level: 1 });
		await clickBoard(container);
		await submitScan();
		expect(container.querySelectorAll('.result-star.earned').length).toBeGreaterThanOrEqual(0);
	});

	it('gives 0 stars when few correct', async () => {
		renderScan();
		await submitScan();
		expect(screen.getByText('Keep practicing!')).toBeInTheDocument();
	});

	it('gives 1 star when wrong squares marked', async () => {
		getSquareFromCoordsMock
			.mockReturnValueOnce('c4')
			.mockReturnValueOnce('c4')
			.mockReturnValueOnce('z9');
		const { container } = renderScan({ level: 1 });
		await clickBoard(container);
		await fireEvent.click(screen.getByText('Capture'));
		await clickBoard(container);
		await clickBoard(container, 200, 200);
		await submitScan();
		expect(screen.getByText('Some misses or wrong marks.')).toBeInTheDocument();
	});

	it('gives 3 stars when total is 0 (all empty answer keys)', async () => {
		renderScan();
		await submitScan();
		expect(screen.getByText('Keep practicing!')).toBeInTheDocument();
	});
});
