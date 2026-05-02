import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';
import { mockSupabaseAuth } from './helpers';

mockSupabaseAuth();

vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
}));

import AuthPage from '../src/routes/auth/+page.svelte';

describe('AuthPage', () => {
	it('renders the Pawnly wordmark', () => {
		render(AuthPage);
		expect(screen.getByText('Pawnly')).toBeInTheDocument();
	});

	it('renders email input', () => {
		render(AuthPage);
		expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
	});

	it('renders password input', () => {
		render(AuthPage);
		expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
	});

	it('renders Log in as default mode', () => {
		render(AuthPage);
		expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
	});

	it('toggles to sign up mode', async () => {
		render(AuthPage);
		await fireEvent.click(screen.getByText(/create account/i));
		expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument();
	});

	it('shows display name field in sign up mode', async () => {
		render(AuthPage);
		await fireEvent.click(screen.getByText(/create account/i));
		expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
	});

	it('toggles back to login mode', async () => {
		render(AuthPage);
		await fireEvent.click(screen.getByText(/create account/i));
		await fireEvent.click(screen.getByText(/log in instead/i));
		expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
	});

	it('renders magic link option', () => {
		render(AuthPage);
		expect(screen.getByText(/magic link/i)).toBeInTheDocument();
	});

	it('shows mascot', () => {
		const { container } = render(AuthPage);
		const svg = container.querySelector('svg');
		expect(svg).toBeInTheDocument();
	});

	it('has email input of type email', () => {
		render(AuthPage);
		const emailInput = screen.getByLabelText(/email/i);
		expect(emailInput).toHaveAttribute('type', 'email');
	});

	it('has password input of type password', () => {
		render(AuthPage);
		const passwordInput = screen.getByLabelText(/password/i);
		expect(passwordInput).toHaveAttribute('type', 'password');
	});
});
