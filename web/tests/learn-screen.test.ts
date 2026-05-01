import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { Brand } from '../src/lib/brand';
import LearnScreen from '../src/lib/components/screens/LearnScreen.svelte';

describe('LearnScreen', () => {
	it('renders header with title and subtitle', () => {
		render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		expect(screen.getByText('Learn')).toBeInTheDocument();
		expect(screen.getByText('Your chess journey')).toBeInTheDocument();
	});

	it('renders progress overview card', () => {
		render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		expect(screen.getByText('Course progress')).toBeInTheDocument();
		expect(screen.getByText(/2 of 5 lessons/)).toBeInTheDocument();
	});

	it('renders Mascot with teaching mood', () => {
		const { container } = render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		const mascotSvg = container.querySelector('ellipse[opacity="0.12"]');
		expect(mascotSvg).toBeTruthy();
	});

	it('renders progress bar', () => {
		const { container } = render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		const mossBar = container.querySelector('[style*="background: rgb(63, 107, 67)"]');
		expect(mossBar).toBeTruthy();
	});

	it('renders Lessons heading', () => {
		render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		expect(screen.getByText('Lessons')).toBeInTheDocument();
	});

	it('renders all five lessons', () => {
		render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		expect(screen.getByText('How pieces move')).toBeInTheDocument();
		expect(screen.getByText('Capture & check')).toBeInTheDocument();
		expect(screen.getByText('Special moves')).toBeInTheDocument();
		expect(screen.getByText('Checkmate patterns')).toBeInTheDocument();
		expect(screen.getByText('Opening principles')).toBeInTheDocument();
	});

	it('renders lesson durations', () => {
		render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		expect(screen.getByText('3 min')).toBeInTheDocument();
		expect(screen.getByText('4 min')).toBeInTheDocument();
		expect(screen.getAllByText('5 min').length).toBe(2);
		expect(screen.getByText('6 min')).toBeInTheDocument();
	});

	it('renders checkmarks for completed lessons', () => {
		render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		const checkmarks = screen.getAllByText('✓');
		expect(checkmarks.length).toBe(2);
	});

	it('renders lock icons for locked lessons', () => {
		render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		const locks = screen.getAllByText('🔒');
		expect(locks.length).toBe(2);
	});

	it('calls onOpenLesson when current lesson clicked', async () => {
		const onOpenLesson = vi.fn();
		render(LearnScreen, { props: { onOpenLesson } });
		const currentLesson = screen.getByText('Special moves').closest('button');
		expect(currentLesson).toBeTruthy();
		await fireEvent.click(currentLesson!);
		expect(onOpenLesson).toHaveBeenCalledWith('l3');
	});

	it('calls onOpenLesson when done lesson clicked', async () => {
		const onOpenLesson = vi.fn();
		render(LearnScreen, { props: { onOpenLesson } });
		const doneLesson = screen.getByText('How pieces move').closest('button');
		expect(doneLesson).toBeTruthy();
		await fireEvent.click(doneLesson!);
		expect(onOpenLesson).toHaveBeenCalledWith('l1');
	});

	it('does not call onOpenLesson when locked lesson clicked', async () => {
		const onOpenLesson = vi.fn();
		render(LearnScreen, { props: { onOpenLesson } });
		const lockedLesson = screen.getByText('Checkmate patterns').closest('button');
		expect(lockedLesson).toBeTruthy();
		await fireEvent.click(lockedLesson!);
		expect(onOpenLesson).not.toHaveBeenCalled();
	});

	it('renders lesson emojis', () => {
		render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		expect(screen.getByText('♟')).toBeInTheDocument();
		expect(screen.getByText('⚔️')).toBeInTheDocument();
		expect(screen.getByText('✨')).toBeInTheDocument();
		expect(screen.getByText('👑')).toBeInTheDocument();
		expect(screen.getByText('📖')).toBeInTheDocument();
	});

	it('renders timeline dots', () => {
		const { container } = render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		const dots = container.querySelectorAll('.rounded-full');
		expect(dots.length).toBe(5);
	});

	it('applies reduced opacity to locked lessons', () => {
		const { container } = render(LearnScreen, { props: { onOpenLesson: vi.fn() } });
		const lockedButton = screen.getByText('Checkmate patterns').closest('button');
		expect(lockedButton).toBeTruthy();
		expect(lockedButton!.style.opacity).toBe('0.5');
	});
});
