import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { Brand } from '../src/lib/brand';
import OnboardingScreen from '../src/lib/components/screens/OnboardingScreen.svelte';

function renderOnboarding(props: Record<string, unknown> = {}) {
	return render(OnboardingScreen, {
		props: { onComplete: () => {}, ...props },
	});
}

describe('OnboardingScreen', () => {
	it('renders first step by default', () => {
		const { getByText } = renderOnboarding();
		expect(getByText('Welcome to Pawnly!')).toBeInTheDocument();
	});

	it('renders mascot on first step', () => {
		const { container } = renderOnboarding();
		expect(container.querySelector('svg')).toBeInTheDocument();
	});

	it('renders step indicator dots', () => {
		const { container } = renderOnboarding();
		expect(container.querySelectorAll('[data-testid="dot"]')).toHaveLength(5);
	});

	it('highlights first dot as active', () => {
		const { container } = renderOnboarding();
		expect(container.querySelectorAll('[data-testid="dot"]')[0]).toHaveStyle({ width: '24px' });
	});

	it('does not show back button on first step', () => {
		const { queryByText } = renderOnboarding();
		expect(queryByText('Back')).not.toBeInTheDocument();
	});

	it('shows Continue button on first step', () => {
		const { getByText } = renderOnboarding();
		expect(getByText('Continue')).toBeInTheDocument();
	});

	it('advances to step 2 on Continue click', async () => {
		const { getByText, container } = renderOnboarding();
		await fireEvent.click(getByText('Continue'));
		expect(getByText('Learn by playing')).toBeInTheDocument();
		expect(container.querySelectorAll('[data-testid="dot"]')[1]).toHaveStyle({ width: '24px' });
	});

	it('shows Back button after advancing', async () => {
		const { getByText } = renderOnboarding();
		await fireEvent.click(getByText('Continue'));
		expect(getByText('Back')).toBeInTheDocument();
	});

	it('goes back to previous step on Back click', async () => {
		const { getByText, container } = renderOnboarding();
		await fireEvent.click(getByText('Continue'));
		await fireEvent.click(getByText('Back'));
		expect(getByText('Welcome to Pawnly!')).toBeInTheDocument();
		expect(container.querySelectorAll('[data-testid="dot"]')[0]).toHaveStyle({ width: '24px' });
	});

	it('navigates through all 5 steps', async () => {
		const { getByText } = renderOnboarding();
		const steps = ['Learn by playing', 'Daily rituals', 'Track your progress', "Let's go!"];
		for (const step of steps) {
			await fireEvent.click(getByText('Continue'));
			expect(getByText(step)).toBeInTheDocument();
		}
	});

	it('shows Start learning button on last step', async () => {
		const { getByText } = renderOnboarding();
		for (let i = 0; i < 4; i++) await fireEvent.click(getByText('Continue'));
		expect(getByText('Start learning!')).toBeInTheDocument();
	});

	it('calls onComplete on last step button click', async () => {
		const onComplete = vi.fn();
		const { getByText } = renderOnboarding({ onComplete });
		for (let i = 0; i < 4; i++) await fireEvent.click(getByText('Continue'));
		await fireEvent.click(getByText('Start learning!'));
		expect(onComplete).toHaveBeenCalledTimes(1);
	});

	it.each([
		['uses cream background', {}, { backgroundColor: Brand.colors.cream }],
		['uses display font for title', {}, { fontFamily: Brand.fonts.display }],
	])('%s', (_name, props, expected) => {
		const { container, getByText } = renderOnboarding(props);
		if ('backgroundColor' in expected) {
			expect(container.firstElementChild).toHaveStyle(expected);
		} else {
			expect(getByText('Welcome to Pawnly!')).toHaveStyle(expected);
		}
	});

	it('renders step description text', () => {
		const { getByText } = renderOnboarding();
		expect(getByText(/Your friendly coach/)).toBeInTheDocument();
	});
});
