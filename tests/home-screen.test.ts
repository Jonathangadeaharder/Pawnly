import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import HomeScreen from '../src/lib/components/screens/HomeScreen.svelte';

describe('HomeScreen', () => {
	it('renders greeting with default name', () => {
		render(HomeScreen, { props: { onNavigate: vi.fn() } });
		expect(screen.getByText(/Welcome back,/)).toBeInTheDocument();
		expect(screen.getByText(/Maya/)).toBeInTheDocument();
	});

	it('renders greeting with custom name', () => {
		render(HomeScreen, { props: { onNavigate: vi.fn(), name: 'Alex' } });
		expect(screen.getByText(/Alex/)).toBeInTheDocument();
	});

	it('renders streak badge with number 7', () => {
		render(HomeScreen, { props: { onNavigate: vi.fn(), streak: 7 } });
		expect(screen.getAllByText('7').length).toBeGreaterThanOrEqual(1);
	});

	it('renders daily ritual hero card', () => {
		render(HomeScreen, { props: { onNavigate: vi.fn() } });
		expect(screen.getByText("Today's ritual")).toBeInTheDocument();
		expect(screen.getByText(/The Italian opening/)).toBeInTheDocument();
		expect(screen.getByText(/4 mins/)).toBeInTheDocument();
		expect(screen.getByText(/Start ritual/)).toBeInTheDocument();
	});

	it('renders progress strip - streak card', () => {
		render(HomeScreen, { props: { onNavigate: vi.fn() } });
		expect(screen.getByText('Streak')).toBeInTheDocument();
		expect(screen.getByText(/days/)).toBeInTheDocument();
	});

	it('renders progress strip - today card', () => {
		render(HomeScreen, { props: { onNavigate: vi.fn() } });
		expect(screen.getByText('Today')).toBeInTheDocument();
		expect(screen.getByText(/\/5m/)).toBeInTheDocument();
	});

	it('renders quick actions heading', () => {
		render(HomeScreen, { props: { onNavigate: vi.fn() } });
		expect(screen.getByText('Pick something')).toBeInTheDocument();
	});

	it('renders all four quick action buttons', () => {
		render(HomeScreen, { props: { onNavigate: vi.fn() } });
		expect(screen.getByText('Play a game')).toBeInTheDocument();
		expect(screen.getByText('Daily puzzle')).toBeInTheDocument();
		expect(screen.getByText('Continue lesson')).toBeInTheDocument();
		expect(screen.getByText("Bishop's Prison")).toBeInTheDocument();
	});

	it('renders rating peek card', () => {
		render(HomeScreen, { props: { onNavigate: vi.fn(), rating: 1140 } });
		expect(screen.getByText('Your rating')).toBeInTheDocument();
		expect(screen.getByText(/1140/)).toBeInTheDocument();
		expect(screen.getByText(/Details/)).toBeInTheDocument();
	});

	it('calls onNavigate with "play" when hero card clicked', async () => {
		const onNavigate = vi.fn();
		render(HomeScreen, { props: { onNavigate } });
		const heroButton = screen.getByText(/Start ritual/).closest('button');
		expect(heroButton).toBeTruthy();
		await fireEvent.click(heroButton!);
		expect(onNavigate).toHaveBeenCalledWith('play');
	});

	it('calls onNavigate with correct id for quick actions', async () => {
		const onNavigate = vi.fn();
		render(HomeScreen, { props: { onNavigate } });

		await fireEvent.click(screen.getByText('Play a game').closest('button')!);
		expect(onNavigate).toHaveBeenCalledWith('play');

		await fireEvent.click(screen.getByText('Daily puzzle').closest('button')!);
		expect(onNavigate).toHaveBeenCalledWith('train');

		await fireEvent.click(screen.getByText('Continue lesson').closest('button')!);
		expect(onNavigate).toHaveBeenCalledWith('learn');

		await fireEvent.click(screen.getByText("Bishop's Prison").closest('button')!);
		expect(onNavigate).toHaveBeenCalledWith('train');
	});

	it('calls onNavigate with "you" when details clicked', async () => {
		const onNavigate = vi.fn();
		render(HomeScreen, { props: { onNavigate } });
		await fireEvent.click(screen.getByText(/Details/));
		expect(onNavigate).toHaveBeenCalledWith('you');
	});

	it('renders 7 streak bar segments', () => {
		const { container } = render(HomeScreen, { props: { onNavigate: vi.fn() } });
		const streakBars = container.querySelectorAll('[style*="background: rgb(63, 107, 67)"]');
		expect(streakBars.length).toBeGreaterThanOrEqual(7);
	});

	it('renders MiniBoard inside hero card', () => {
		const { container } = render(HomeScreen, { props: { onNavigate: vi.fn() } });
		const svg = container.querySelector('svg');
		expect(svg).toBeTruthy();
	});

	it('renders Mascot in rating card', () => {
		const { container } = render(HomeScreen, { props: { onNavigate: vi.fn() } });
		const mascotSvg = container.querySelector('ellipse[opacity="0.12"]');
		expect(mascotSvg).toBeTruthy();
	});
});
