import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { Brand } from '../src/lib/brand';
import OnboardingScreen from '../src/lib/components/screens/OnboardingScreen.svelte';
import { createSnippet } from './helpers';

describe('OnboardingScreen', () => {
	it('renders first step by default', () => {
		const { getByText } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		expect(getByText('Welcome to Pawnly!')).toBeInTheDocument();
	});

	it('renders mascot on first step', () => {
		const { container } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('renders step indicator dots', () => {
		const { container } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		const dots = container.querySelectorAll('[data-testid="dot"]');
		expect(dots).toHaveLength(5);
	});

	it('highlights first dot as active', () => {
		const { container } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		const dots = container.querySelectorAll('[data-testid="dot"]');
		expect(dots[0]).toHaveStyle({ width: '24px' });
	});

	it('does not show back button on first step', () => {
		const { queryByText } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		expect(queryByText('Back')).not.toBeInTheDocument();
	});

	it('shows Continue button on first step', () => {
		const { getByText } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		expect(getByText('Continue')).toBeInTheDocument();
	});

	it('advances to step 2 on Continue click', async () => {
		const { getByText, container } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		await fireEvent.click(getByText('Continue'));
		expect(getByText('Learn by playing')).toBeInTheDocument();
		const dots = container.querySelectorAll('[data-testid="dot"]');
		expect(dots[1]).toHaveStyle({ width: '24px' });
	});

	it('shows Back button after advancing', async () => {
		const { getByText } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		await fireEvent.click(getByText('Continue'));
		expect(getByText('Back')).toBeInTheDocument();
	});

	it('goes back to previous step on Back click', async () => {
		const { getByText, container } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		await fireEvent.click(getByText('Continue'));
		await fireEvent.click(getByText('Back'));
		expect(getByText('Welcome to Pawnly!')).toBeInTheDocument();
		const dots = container.querySelectorAll('[data-testid="dot"]');
		expect(dots[0]).toHaveStyle({ width: '24px' });
	});

	it('navigates through all 5 steps', async () => {
		const { getByText } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});

		await fireEvent.click(getByText('Continue'));
		expect(getByText('Learn by playing')).toBeInTheDocument();

		await fireEvent.click(getByText('Continue'));
		expect(getByText('Daily rituals')).toBeInTheDocument();

		await fireEvent.click(getByText('Continue'));
		expect(getByText('Track your progress')).toBeInTheDocument();

		await fireEvent.click(getByText('Continue'));
		expect(getByText("Let's go!")).toBeInTheDocument();
	});

	it('shows Start learning button on last step', async () => {
		const { getByText } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});

		for (let i = 0; i < 4; i++) {
			await fireEvent.click(getByText('Continue'));
		}
		expect(getByText('Start learning!')).toBeInTheDocument();
	});

	it('calls onComplete on last step button click', async () => {
		const onComplete = vi.fn();
		const { getByText } = render(OnboardingScreen, {
			props: { onComplete },
		});

		for (let i = 0; i < 4; i++) {
			await fireEvent.click(getByText('Continue'));
		}
		await fireEvent.click(getByText('Start learning!'));
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it('uses cream background', () => {
		const { container } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		const root = container.firstElementChild;
		expect(root).toHaveStyle({ backgroundColor: Brand.colors.cream });
	});

	it('uses display font for title', () => {
		const { getByText } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		const title = getByText('Welcome to Pawnly!');
		expect(title).toHaveStyle({ fontFamily: Brand.fonts.display });
	});

	it('renders step description text', () => {
		const { getByText } = render(OnboardingScreen, {
			props: { onComplete: () => {} },
		});
		expect(getByText(/Your friendly chess coach/)).toBeInTheDocument();
	});
});
