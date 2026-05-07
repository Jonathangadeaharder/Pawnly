import { fireEvent, render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import { Brand } from '../src/lib/brand';
import Header from '../src/lib/components/Header.svelte';
import { createSnippet } from './helpers';

function renderHeader(props: Record<string, unknown> = {}) {
	return render(Header, { props: { title: 'Settings', ...props } });
}

function getTitle(props: Record<string, unknown> = {}) {
	const { getByText } = renderHeader(props);
	return getByText((props.title as string) ?? 'Settings');
}

describe('Header', () => {
	it('renders title', () => {
		const { getByText } = renderHeader();
		expect(getByText('Settings')).toBeInTheDocument();
	});

	it.each([
		['uses Fraunces display font', { fontFamily: Brand.fonts.display }],
		['title has font-size 28px', { fontSize: '28px' }],
		['title has font-weight 600', { fontWeight: '600' }],
		['title is not italic by default', { fontStyle: 'normal' }],
	])('%s', (_name, style) => {
		expect(getTitle()).toHaveStyle(style);
	});

	it.each([
		['renders subtitle when sub is provided', { sub: 'Manage your preferences' }, 'Manage your preferences', true],
		['does not render subtitle when sub is omitted', {}, 'Manage your preferences', false],
	])('%s', async (_name, props, text, shouldExist) => {
		const { queryByText } = renderHeader(props);
		expect(queryByText(text) !== null).toBe(shouldExist);
	});

	it.each([
		['renders back button when onBack is provided', { onBack: () => {} }, '← Back', true],
		['does not render back button when onBack is omitted', {}, '← Back', false],
	])('%s', async (_name, props, text, shouldExist) => {
		const { queryByText } = renderHeader(props);
		expect(queryByText(text) !== null).toBe(shouldExist);
	});

	it('calls onBack when back button is clicked', async () => {
		let called = false;
		const { getByText } = renderHeader({ onBack: () => { called = true; } });
		await fireEvent.click(getByText('← Back'));
		expect(called).toBe(true);
	});

	it('renders right slot content', () => {
		const { getByText } = renderHeader({ right: createSnippet('Action') });
		expect(getByText('Action')).toBeInTheDocument();
	});

	it('title is italic when accent is true', () => {
		expect(getTitle({ accent: true })).toHaveStyle({ fontStyle: 'italic' });
	});
});
