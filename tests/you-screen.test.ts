import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import YouScreen from '../src/lib/components/screens/YouScreen.svelte';

function renderYouScreen(props: Record<string, unknown> = {}) {
	return render(YouScreen, { props });
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
		expect(screen.getByText('1140')).toBeInTheDocument();
		expect(screen.getByText('Rating')).toBeInTheDocument();
		expect(screen.getByText('23')).toBeInTheDocument();
		expect(screen.getByText('Games')).toBeInTheDocument();
		expect(screen.getByText('12')).toBeInTheDocument();
		expect(screen.getByText('Puzzles')).toBeInTheDocument();
	});

	it('renders achievements heading', () => {
		renderYouScreen();
		expect(screen.getByText('Achievements')).toBeInTheDocument();
	});

	it('renders all six achievement badges', () => {
		renderYouScreen();
		expect(screen.getByText('7-day streak')).toBeInTheDocument();
		expect(screen.getByText('First game')).toBeInTheDocument();
		expect(screen.getByText('Puzzle master')).toBeInTheDocument();
		expect(screen.getByText('Student')).toBeInTheDocument();
		expect(screen.getByText('Checkmate!')).toBeInTheDocument();
		expect(screen.getByText('Rising star')).toBeInTheDocument();
	});

	it('renders achievement emojis', () => {
		renderYouScreen();
		expect(screen.getByText('🔥')).toBeInTheDocument();
		expect(screen.getByText('♟')).toBeInTheDocument();
		expect(screen.getByText('🎯')).toBeInTheDocument();
		expect(screen.getByText('📖')).toBeInTheDocument();
		expect(screen.getByText('👑')).toBeInTheDocument();
		expect(screen.getByText('⭐')).toBeInTheDocument();
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
