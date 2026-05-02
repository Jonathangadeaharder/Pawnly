import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { Brand } from '../src/lib/brand';
import TabBar from '../src/lib/components/TabBar.svelte';

function renderTabBar(active = 'home', props: Record<string, unknown> = {}) {
	return render(TabBar, { props: { active, ...props } });
}

function getButton(getByText: (text: string) => HTMLElement, tabName: string) {
	return getByText(tabName).closest('button')!;
}

describe('TabBar', () => {
	it('renders all five tabs', () => {
		const { getByText } = renderTabBar();
		for (const tab of ['Home', 'Play', 'Learn', 'Train', 'You']) {
			expect(getByText(tab)).toBeInTheDocument();
		}
	});

	it.each([
		['active tab label has ink color', 'learn', 'Learn', { color: Brand.colors.ink }],
		['inactive tab label has cream color', 'home', 'Play', { color: Brand.colors.cream }],
		['active tab label has full opacity', 'train', 'Train', { opacity: '1' }],
		['inactive tab label has 0.7 opacity', 'home', 'Play', { opacity: '0.7' }],
	])('%s', (_name, active, tab, style) => {
		const { getByText } = renderTabBar(active);
		expect(getByText(tab)).toHaveStyle(style);
	});

	it('highlights the active tab with sunny background', () => {
		const { getByText } = renderTabBar('play');
		expect(getButton(getByText, 'Play')).toHaveStyle({ background: Brand.colors.sunny });
	});

	it('inactive tabs have transparent background', () => {
		const { getByText } = renderTabBar('home');
		expect(getButton(getByText, 'Play')).not.toHaveStyle({ background: Brand.colors.sunny });
	});

	it('calls onChange when a tab is clicked', async () => {
		const onChange = vi.fn();
		const { getByText } = renderTabBar('home', { onChange });
		await fireEvent.click(getByText('Play'));
		expect(onChange).toHaveBeenCalledWith('play');
	});

	it('calls onChange with correct tab id', async () => {
		const onChange = vi.fn();
		const { getByText } = renderTabBar('home', { onChange });
		await fireEvent.click(getByText('Train'));
		expect(onChange).toHaveBeenCalledWith('train');
	});

	it('does not throw when onChange is not provided', async () => {
		const { getByText } = renderTabBar();
		await expect(fireEvent.click(getByText('Play'))).resolves.not.toThrow();
	});

	it('defaults active to home', () => {
		const { getByText } = render(TabBar);
		expect(getButton(getByText, 'Home')).toHaveStyle({ background: Brand.colors.sunny });
	});

	it('has ink pill container', () => {
		const { container } = renderTabBar();
		const pill = container.querySelector('.tabbar-pill');
		expect(pill).toHaveStyle({
			background: Brand.colors.ink,
			borderRadius: '22px',
		});
	});

	it('has gradient fade outer container', () => {
		const { container } = renderTabBar();
		const outer = container.querySelector('.tabbar-outer');
		expect(outer).toHaveStyle({ position: 'absolute', bottom: '0' });
	});

	it('uses body font for labels', () => {
		const { getByText } = renderTabBar();
		expect(getByText('Home')).toHaveStyle({ fontFamily: Brand.fonts.body });
	});

	it('tab buttons have border-radius 16px', () => {
		const { getByText } = renderTabBar();
		expect(getButton(getByText, 'Home')).toHaveStyle({ borderRadius: '16px' });
	});
});
