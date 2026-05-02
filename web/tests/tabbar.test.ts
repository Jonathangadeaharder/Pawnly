import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { Brand } from '../src/lib/brand';
import TabBar from '../src/lib/components/TabBar.svelte';

describe('TabBar', () => {
	it('renders all five tabs', () => {
		const { getByText } = render(TabBar, {
			props: { active: 'home' },
		});
		expect(getByText('Home')).toBeInTheDocument();
		expect(getByText('Play')).toBeInTheDocument();
		expect(getByText('Learn')).toBeInTheDocument();
		expect(getByText('Train')).toBeInTheDocument();
		expect(getByText('You')).toBeInTheDocument();
	});

	it('highlights the active tab with sunny background', () => {
		const { getByText } = render(TabBar, {
			props: { active: 'play' },
		});
		const playBtn = getByText('Play').closest('button');
		expect(playBtn).toHaveStyle({ background: Brand.colors.sunny });
	});

	it('inactive tabs have transparent background', () => {
		const { getByText } = render(TabBar, {
			props: { active: 'home' },
		});
		const playBtn = getByText('Play').closest('button');
		expect(playBtn).not.toHaveStyle({ background: Brand.colors.sunny });
	});

	it('active tab label has ink color', () => {
		const { getByText } = render(TabBar, {
			props: { active: 'learn' },
		});
		const learnLabel = getByText('Learn');
		expect(learnLabel).toHaveStyle({ color: Brand.colors.ink });
	});

	it('inactive tab label has cream color', () => {
		const { getByText } = render(TabBar, {
			props: { active: 'home' },
		});
		const playLabel = getByText('Play');
		expect(playLabel).toHaveStyle({ color: Brand.colors.cream });
	});

	it('active tab label has full opacity', () => {
		const { getByText } = render(TabBar, {
			props: { active: 'train' },
		});
		const trainLabel = getByText('Train');
		expect(trainLabel).toHaveStyle({ opacity: '1' });
	});

	it('inactive tab label has 0.7 opacity', () => {
		const { getByText } = render(TabBar, {
			props: { active: 'home' },
		});
		const playLabel = getByText('Play');
		expect(playLabel).toHaveStyle({ opacity: '0.7' });
	});

	it('calls onChange when a tab is clicked', async () => {
		const onChange = vi.fn();
		const { getByText } = render(TabBar, {
			props: { active: 'home', onChange },
		});
		await fireEvent.click(getByText('Play'));
		expect(onChange).toHaveBeenCalledWith('play');
	});

	it('calls onChange with correct tab id', async () => {
		const onChange = vi.fn();
		const { getByText } = render(TabBar, {
			props: { active: 'home', onChange },
		});
		await fireEvent.click(getByText('Train'));
		expect(onChange).toHaveBeenCalledWith('train');
	});

	it('does not throw when onChange is not provided', async () => {
		const { getByText } = render(TabBar, {
			props: { active: 'home' },
		});
		await expect(fireEvent.click(getByText('Play'))).resolves.not.toThrow();
	});

	it('defaults active to home', () => {
		const { getByText } = render(TabBar);
		const homeBtn = getByText('Home').closest('button');
		expect(homeBtn).toHaveStyle({ background: Brand.colors.sunny });
	});

	it('has ink pill container', () => {
		const { container } = render(TabBar, {
			props: { active: 'home' },
		});
		const pill = container.querySelector('.tabbar-pill');
		expect(pill).toHaveStyle({
			background: Brand.colors.ink,
			borderRadius: '22px',
		});
	});

	it('has gradient fade outer container', () => {
		const { container } = render(TabBar, {
			props: { active: 'home' },
		});
		const outer = container.querySelector('.tabbar-outer');
		expect(outer).toHaveStyle({ position: 'absolute', bottom: '0' });
	});

	it('uses body font for labels', () => {
		const { getByText } = render(TabBar, {
			props: { active: 'home' },
		});
		const homeLabel = getByText('Home');
		expect(homeLabel).toHaveStyle({ fontFamily: Brand.fonts.body });
	});

	it('tab buttons have border-radius 16px', () => {
		const { getByText } = render(TabBar, {
			props: { active: 'home' },
		});
		const homeBtn = getByText('Home').closest('button');
		expect(homeBtn).toHaveStyle({ borderRadius: '16px' });
	});
});
