import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

const setIntervalMock = vi.hoisted(() => vi.fn(() => 1));
const clearIntervalMock = vi.hoisted(() => vi.fn());

vi.stubGlobal('setInterval', setIntervalMock);
vi.stubGlobal('clearInterval', clearIntervalMock);

vi.mock('../src/lib/components/MiniBoard.svelte', () => ({
	default: vi.fn().mockImplementation(() => ({ $destroy: vi.fn() })),
}));

vi.mock('../src/lib/board.svelte', () => ({
	fenToPieces: vi.fn().mockReturnValue({}),
	getSquareFromCoords: vi.fn().mockReturnValue(null),
}));

const { default: ScanScreen } = await import('../src/lib/components/screens/ScanScreen.svelte');

describe('ScanScreen', () => {
	it('renders with aria-label "Scan trainer"', () => {
		const { container } = render(ScanScreen, { props: {} });
		const dialog = container.querySelector('[role="dialog"]');
		expect(dialog).toHaveAttribute('aria-label', 'Scan trainer');
	});

	it('renders close button', () => {
		render(ScanScreen, { props: {} });
		expect(screen.getByLabelText('Close scan')).toBeInTheDocument();
	});

	it('renders title "Scan"', () => {
		render(ScanScreen, { props: {} });
		expect(screen.getByText('Scan')).toBeInTheDocument();
	});

	it('renders timer with initial time', () => {
		render(ScanScreen, { props: {} });
		expect(screen.getByText(/⏱/)).toBeInTheDocument();
	});

	it('renders 3 star indicators', () => {
		const { container } = render(ScanScreen, { props: {} });
		const stars = container.querySelectorAll('.star');
		expect(stars.length).toBe(3);
	});

	it('renders mode buttons for level 1 (check, capture)', () => {
		render(ScanScreen, { props: { level: 1 } });
		expect(screen.getByText('Check')).toBeInTheDocument();
		expect(screen.getByText('Capture')).toBeInTheDocument();
	});

	it('renders locked mode buttons for level 1', () => {
		render(ScanScreen, { props: { level: 1 } });
		const locked = screen.getAllByText('🔒');
		expect(locked.length).toBe(2);
	});

	it('renders submit button', () => {
		render(ScanScreen, { props: {} });
		expect(screen.getByText('Submit Scan')).toBeInTheDocument();
	});

	it('renders prompt text for default mode', () => {
		render(ScanScreen, { props: { level: 1 } });
		expect(screen.getByText('Find all checks')).toBeInTheDocument();
	});

	it('calls onClose when close button clicked', async () => {
		const onClose = vi.fn();
		render(ScanScreen, { props: { onClose } });
		const closeBtn = screen.getByLabelText('Close scan');
		await fireEvent.click(closeBtn);
		expect(onClose).toHaveBeenCalledOnce();
	});

	it('shows result card after submit', async () => {
		render(ScanScreen, { props: {} });
		const submitBtn = screen.getByText('Submit Scan');
		await fireEvent.click(submitBtn);
		expect(screen.getByText('Next position')).toBeInTheDocument();
	});

	it('shows result stars after submit', async () => {
		const { container } = render(ScanScreen, { props: {} });
		await fireEvent.click(screen.getByText('Submit Scan'));
		const resultStars = container.querySelectorAll('.result-star');
		expect(resultStars.length).toBe(3);
	});

	it('shows result text after submit', async () => {
		render(ScanScreen, { props: {} });
		await fireEvent.click(screen.getByText('Submit Scan'));
		expect(screen.getByText(/Keep practicing|Perfect|All found|Some misses/)).toBeInTheDocument();
	});

	it('mode buttons are disabled after submit', async () => {
		render(ScanScreen, { props: { level: 1 } });
		await fireEvent.click(screen.getByText('Submit Scan'));
		const checkBtn = screen.getByText('Check').closest('button');
		expect(checkBtn).toBeDisabled();
	});

	it('renders level 5 with threat mode unlocked', () => {
		render(ScanScreen, { props: { level: 5 } });
		expect(screen.getByText('Threat')).toBeInTheDocument();
		const locked = screen.getAllByText('🔒');
		expect(locked.length).toBe(2);
	});

	it('renders level 8 with loose mode unlocked', () => {
		render(ScanScreen, { props: { level: 8 } });
		expect(screen.getByText('Loose')).toBeInTheDocument();
		const locked = screen.getAllByText('🔒');
		expect(locked.length).toBe(1);
	});
});
