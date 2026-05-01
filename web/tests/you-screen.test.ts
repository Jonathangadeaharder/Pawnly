import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import YouScreen from '../src/lib/components/screens/YouScreen.svelte';

describe('YouScreen', () => {
	it('renders profile header with default name', () => {
		render(YouScreen);
		expect(screen.getByText('Maya')).toBeInTheDocument();
	});

	it('renders profile header with custom name', () => {
		render(YouScreen, { props: { name: 'Alex' } });
		expect(screen.getByText('Alex')).toBeInTheDocument();
	});

	it('renders join date', () => {
		render(YouScreen);
		expect(screen.getByText('Joined 3 weeks ago')).toBeInTheDocument();
	});

	it('renders all three stat cards', () => {
		render(YouScreen);
		expect(screen.getByText('1140')).toBeInTheDocument();
		expect(screen.getByText('Rating')).toBeInTheDocument();
		expect(screen.getByText('23')).toBeInTheDocument();
		expect(screen.getByText('Games')).toBeInTheDocument();
		expect(screen.getByText('12')).toBeInTheDocument();
		expect(screen.getByText('Puzzles')).toBeInTheDocument();
	});

	it('renders achievements heading', () => {
		render(YouScreen);
		expect(screen.getByText('Achievements')).toBeInTheDocument();
	});

	it('renders all six achievement badges', () => {
		render(YouScreen);
		expect(screen.getByText('7-day streak')).toBeInTheDocument();
		expect(screen.getByText('First game')).toBeInTheDocument();
		expect(screen.getByText('Puzzle master')).toBeInTheDocument();
		expect(screen.getByText('Student')).toBeInTheDocument();
		expect(screen.getByText('Checkmate!')).toBeInTheDocument();
		expect(screen.getByText('Rising star')).toBeInTheDocument();
	});

	it('renders achievement emojis', () => {
		render(YouScreen);
		expect(screen.getByText('🔥')).toBeInTheDocument();
		expect(screen.getByText('♟')).toBeInTheDocument();
		expect(screen.getByText('🎯')).toBeInTheDocument();
		expect(screen.getByText('📖')).toBeInTheDocument();
		expect(screen.getByText('👑')).toBeInTheDocument();
		expect(screen.getByText('⭐')).toBeInTheDocument();
	});

	it('renders settings button', () => {
		render(YouScreen);
		expect(screen.getByText('Settings')).toBeInTheDocument();
	});

	it('calls onSettings when settings button clicked', async () => {
		const onSettings = vi.fn();
		render(YouScreen, { props: { onSettings } });
		await fireEvent.click(screen.getByText('Settings'));
		expect(onSettings).toHaveBeenCalled();
	});

	it('renders Mascot with happy mood', () => {
		const { container } = render(YouScreen);
		const mascotSvg = container.querySelector('ellipse[opacity="0.12"]');
		expect(mascotSvg).toBeTruthy();
	});

	it('applies brand font to name', () => {
		render(YouScreen);
		const name = screen.getByText('Maya');
		expect(name.style.fontFamily).toContain('Fraunces');
	});

	it('applies brand font to stat values', () => {
		render(YouScreen);
		const rating = screen.getByText('1140');
		expect(rating.style.fontFamily).toContain('Geist Mono');
	});
});
