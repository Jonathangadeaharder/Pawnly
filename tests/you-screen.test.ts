import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import YouScreen from '../src/lib/components/screens/YouScreen.svelte';

function renderYouScreen(props: Record<string, unknown> = {}) {
	return render(YouScreen, { props });
}

function expectTextsPresent(texts: string[]) {
	for (const text of texts) {
		expect(screen.getByText(text)).toBeInTheDocument();
	}
}

describe('YouScreen', () => {
	it('renders profile header with default name', () => {
		renderYouScreen();
		expect(screen.getByText('Maya')).toBeInTheDocument();
	});

	it('renders profile header with custom name', () => {
		renderYouScreen({ name: 'Alex' });
		expect(screen.getByText('Alex')).toBeInTheDocument();
	});

	it('renders join date', () => {
		renderYouScreen();
		expect(screen.getByText('Joined 3 weeks ago')).toBeInTheDocument();
	});

	it('renders all three stat cards', () => {
		renderYouScreen({ rating: 1140, gamesPlayed: 23, puzzlesSolved: 12 });
		expectTextsPresent(['1140', 'Rating', '23', 'Games', '12', 'Puzzles']);
	});

	it('renders achievements heading', () => {
		renderYouScreen();
		expect(screen.getByText('Achievements')).toBeInTheDocument();
	});

	it('renders all six achievement badges', () => {
		renderYouScreen();
		expectTextsPresent([
			'7-day streak',
			'First game',
			'Puzzle master',
			'Student',
			'Checkmate!',
			'Rising star',
		]);
	});

	it('renders achievement emojis', () => {
		renderYouScreen();
		expectTextsPresent(['🔥', '♟', '🎯', '📖', '👑', '⭐']);
	});

	it('renders settings button', () => {
		renderYouScreen();
		expect(screen.getByText('Settings')).toBeInTheDocument();
	});

	it('calls onSettings when settings button clicked', async () => {
		const onSettings = vi.fn();
		renderYouScreen({ onSettings });
		await fireEvent.click(screen.getByText('Settings'));
		expect(onSettings).toHaveBeenCalled();
	});

	it('renders Mascot with happy mood', () => {
		const { container } = renderYouScreen();
		const mascotSvg = container.querySelector('ellipse[opacity="0.12"]');
		expect(mascotSvg).toBeTruthy();
	});

	it('applies brand font to name', () => {
		renderYouScreen();
		const name = screen.getByText('Maya');
		expect(name.style.fontFamily).toContain('Fraunces');
	});

	it('applies brand font to stat values', () => {
		renderYouScreen({ rating: 1140 });
		const rating = screen.getByText('1140');
		expect(rating.style.fontFamily).toContain('Geist Mono');
	});
});
