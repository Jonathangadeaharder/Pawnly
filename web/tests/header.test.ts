import { fireEvent, render } from '@testing-library/svelte';
import { createRawSnippet } from 'svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import Header from '../src/lib/components/Header.svelte';

function createSnippet(text: string) {
	return createRawSnippet(() => {
		return {
			render: () => `<span>${text}</span>`,
			setup: (node) => {
				node.textContent = text;
			},
		};
	});
}

describe('Header', () => {
	it('renders title', () => {
		const { getByText } = render(Header, {
			props: {
				title: 'Settings',
			},
		});
		expect(getByText('Settings')).toBeInTheDocument();
	});

	it('uses Fraunces display font for title', () => {
		const { getByText } = render(Header, {
			props: {
				title: 'Settings',
			},
		});
		const title = getByText('Settings');
		expect(title).toHaveStyle({ fontFamily: Brand.fonts.display });
	});

	it('title has font-size 28px', () => {
		const { getByText } = render(Header, {
			props: {
				title: 'Settings',
			},
		});
		const title = getByText('Settings');
		expect(title).toHaveStyle({ fontSize: '28px' });
	});

	it('title has font-weight 600', () => {
		const { getByText } = render(Header, {
			props: {
				title: 'Settings',
			},
		});
		const title = getByText('Settings');
		expect(title).toHaveStyle({ fontWeight: '600' });
	});

	it('renders subtitle when sub is provided', () => {
		const { getByText } = render(Header, {
			props: {
				title: 'Settings',
				sub: 'Manage your preferences',
			},
		});
		expect(getByText('Manage your preferences')).toBeInTheDocument();
	});

	it('does not render subtitle when sub is omitted', () => {
		const { queryByText } = render(Header, {
			props: {
				title: 'Settings',
			},
		});
		expect(queryByText('Manage your preferences')).not.toBeInTheDocument();
	});

	it('renders back button when onBack is provided', () => {
		const { getByText } = render(Header, {
			props: {
				title: 'Settings',
				onBack: () => {},
			},
		});
		expect(getByText('← Back')).toBeInTheDocument();
	});

	it('does not render back button when onBack is omitted', () => {
		const { queryByText } = render(Header, {
			props: {
				title: 'Settings',
			},
		});
		expect(queryByText('← Back')).not.toBeInTheDocument();
	});

	it('calls onBack when back button is clicked', async () => {
		let called = false;
		const { getByText } = render(Header, {
			props: {
				title: 'Settings',
				onBack: () => {
					called = true;
				},
			},
		});
		await fireEvent.click(getByText('← Back'));
		expect(called).toBe(true);
	});

	it('renders right slot content', () => {
		const { getByText } = render(Header, {
			props: {
				title: 'Settings',
				right: createSnippet('Action'),
			},
		});
		expect(getByText('Action')).toBeInTheDocument();
	});

	it('title is not italic by default', () => {
		const { getByText } = render(Header, {
			props: {
				title: 'Settings',
			},
		});
		const title = getByText('Settings');
		expect(title).toHaveStyle({ fontStyle: 'normal' });
	});

	it('title is italic when accent is true', () => {
		const { getByText } = render(Header, {
			props: {
				title: 'Settings',
				accent: true,
			},
		});
		const title = getByText('Settings');
		expect(title).toHaveStyle({ fontStyle: 'italic' });
	});
});
