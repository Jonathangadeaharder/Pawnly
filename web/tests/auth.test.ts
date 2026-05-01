import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('$lib/supabase', () => ({
	supabase: {
		auth: {
			signInWithPassword: vi.fn(),
			signUp: vi.fn(),
			signInWithOtp: vi.fn(),
			signOut: vi.fn(),
			getSession: vi.fn().mockResolvedValue({ data: { session: null } }),
			onAuthStateChange: vi.fn().mockReturnValue({
				data: { subscription: { unsubscribe: vi.fn() } },
			}),
		},
	},
}));

import { supabase } from '$lib/supabase';

describe('auth store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('exports an auth store object', async () => {
		const { auth } = await import('$lib/stores/auth.svelte');
		expect(auth).toBeDefined();
	});

	it('has initial state with no user and no session', async () => {
		const { auth } = await import('$lib/stores/auth.svelte');
		expect(auth.user).toBeNull();
		expect(auth.session).toBeNull();
	});

	it('has loading as false initially after init', async () => {
		const { auth } = await import('$lib/stores/auth.svelte');
		expect(auth.loading).toBe(false);
	});

	it('signInWithEmail calls supabase.auth.signInWithPassword', async () => {
		const { auth } = await import('$lib/stores/auth.svelte');
		vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
			data: { user: { id: '1' }, session: { access_token: 'tok' } },
			error: null,
		} as any);

		const result = await auth.signInWithEmail('test@test.com', 'password123');

		expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
			email: 'test@test.com',
			password: 'password123',
		});
		expect(result.error).toBeNull();
	});

	it('signInWithEmail returns error on failure', async () => {
		const { auth } = await import('$lib/stores/auth.svelte');
		vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({
			data: { user: null, session: null },
			error: { message: 'Invalid login credentials' },
		} as any);

		const result = await auth.signInWithEmail('bad@test.com', 'wrong');

		expect(result.error).toBe('Invalid login credentials');
	});

	it('signUpWithEmail calls supabase.auth.signUp with display name', async () => {
		const { auth } = await import('$lib/stores/auth.svelte');
		vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
			data: { user: { id: '1' }, session: null },
			error: null,
		} as any);

		const result = await auth.signUpWithEmail('new@test.com', 'pass123', 'PawnyFan');

		expect(supabase.auth.signUp).toHaveBeenCalledWith({
			email: 'new@test.com',
			password: 'pass123',
			options: {
				data: { display_name: 'PawnyFan' },
			},
		});
		expect(result.error).toBeNull();
	});

	it('signUpWithEmail returns error on failure', async () => {
		const { auth } = await import('$lib/stores/auth.svelte');
		vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
			data: { user: null, session: null },
			error: { message: 'User already registered' },
		} as any);

		const result = await auth.signUpWithEmail('dup@test.com', 'pass', 'Name');

		expect(result.error).toBe('User already registered');
	});

	it('signInWithMagicLink calls supabase.auth.signInWithOtp', async () => {
		const { auth } = await import('$lib/stores/auth.svelte');
		vi.mocked(supabase.auth.signInWithOtp).mockResolvedValueOnce({
			data: {},
			error: null,
		} as any);

		const result = await auth.signInWithMagicLink('magic@test.com');

		expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({
			email: 'magic@test.com',
		});
		expect(result.error).toBeNull();
	});

	it('signInWithMagicLink returns error on failure', async () => {
		const { auth } = await import('$lib/stores/auth.svelte');
		vi.mocked(supabase.auth.signInWithOtp).mockResolvedValueOnce({
			data: {},
			error: { message: 'Rate limit exceeded' },
		} as any);

		const result = await auth.signInWithMagicLink('spam@test.com');

		expect(result.error).toBe('Rate limit exceeded');
	});

	it('signOut calls supabase.auth.signOut', async () => {
		const { auth } = await import('$lib/stores/auth.svelte');
		vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
			error: null,
		} as any);

		const result = await auth.signOut();

		expect(supabase.auth.signOut).toHaveBeenCalled();
		expect(result.error).toBeNull();
	});

	it('signOut returns error on failure', async () => {
		const { auth } = await import('$lib/stores/auth.svelte');
		vi.mocked(supabase.auth.signOut).mockResolvedValueOnce({
			error: { message: 'Sign out failed' },
		} as any);

		const result = await auth.signOut();

		expect(result.error).toBe('Sign out failed');
	});
});
