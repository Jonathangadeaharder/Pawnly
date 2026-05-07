import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { Brand } from '../src/lib/brand';
import PlayScreen from '../src/lib/components/screens/PlayScreen.svelte';

function renderPlayScreen(onStart: () => void = () => {}) {
	return render(PlayScreen, { props: { onStart } });
}

function expectTexts(getByText: ReturnType<typeof renderPlayScreen>['getByText'], texts: string[]) {
	for (const text of texts) {
		expect(getByText(text)).toBeInTheDocument();
	}
}

describe('PlayScreen', () => {
	it('renders the Play title', () => {
		const { getByText } = renderPlayScreen();
		expect(getByText('Play')).toBeInTheDocument();
	});

	it('renders the subtitle', () => {
		const { getByText } = renderPlayScreen();
		expect(getByText('Set up your game')).toBeInTheDocument();
	});

	it('renders time control section label', () => {
		const { getByText } = renderPlayScreen();
		expect(getByText('Time control')).toBeInTheDocument();
	});

	it('renders all time control options', () => {
		const { getByText } = renderPlayScreen();
		expectTexts(getByText, ['5 min', '10 min', '15 min', 'Quick', 'Standard', 'Relaxed']);
	});

	it('renders difficulty section label', () => {
		const { getByText } = renderPlayScreen();
		expect(getByText('Difficulty')).toBeInTheDocument();
	});

	it('renders all difficulty options', () => {
		const { getByText } = renderPlayScreen();
		expectTexts(getByText, [
			'Easy',
			"I'm learning",
			'Adaptive',
			'Match my level',
			'Hard',
			'Challenge me',
		]);
	});

	it('renders start game button', () => {
		const { getByText } = renderPlayScreen();
		expect(getByText('Start game')).toBeInTheDocument();
	});

	it('calls onStart when start button is clicked', async () => {
		const onStart = vi.fn();
		const { getByText } = renderPlayScreen(onStart);
		await fireEvent.click(getByText('Start game'));
		expect(onStart).toHaveBeenCalledTimes(1);
	});

	it('defaults to 10min time control with active style', () => {
		const { getByText } = renderPlayScreen();
		const btn = getByText('10 min').closest('button');
		expect(btn).toHaveStyle({ background: Brand.colors.ink });
	});

	it('switches time control on click', async () => {
		const { getByText } = renderPlayScreen();
		const btn5 = getByText('5 min').closest('button');
		await fireEvent.click(btn5!);
		expect(btn5).toHaveStyle({ background: Brand.colors.ink });
	});

	it('defaults to adaptive difficulty with active style', () => {
		const { getByText } = renderPlayScreen();
		const btn = getByText('Adaptive').closest('button');
		expect(btn).toHaveStyle({
			border: `2px solid ${Brand.colors.sunny}`,
			background: `${Brand.colors.sunny}15`,
		});
	});

	it('switches difficulty on click', async () => {
		const { getByText } = renderPlayScreen();
		const easyBtn = getByText('Easy').closest('button');
		await fireEvent.click(easyBtn!);
		expect(easyBtn).toHaveStyle({
			border: `2px solid ${Brand.colors.moss}`,
			background: `${Brand.colors.moss}15`,
		});
	});

	it('shows checkmark on selected difficulty', () => {
		const { getByText } = renderPlayScreen();
		expect(getByText('✓')).toBeInTheDocument();
	});

	it('uses Brand font families', () => {
		const { getByText } = renderPlayScreen();
		const timeLabel = getByText('Time control');
		expect(timeLabel).toHaveStyle({ fontFamily: Brand.fonts.body });
		const timeBtn = getByText('5 min');
		expect(timeBtn).toHaveStyle({ fontFamily: Brand.fonts.mono });
	});
});
