import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mockSupabaseAuth } from './helpers';

mockSupabaseAuth();

import { supabase } from '$lib/supabase';

async function getAuth() {
	return (await import('$lib/stores/auth.svelte')).auth;
}

function mockSuccess(method: keyof typeof supabase.auth, data: unknown) {
	(supabase.auth[method] as any).mockResolvedValueOnce({ data, error: null });
}

function mockError(method: keyof typeof supabase.auth, message: string) {
	(supabase.auth[method] as any).mockResolvedValueOnce({
		data: method === 'signInWithOtp' ? {} : { user: null, session: null },
		error: { message },
	});
}

describe('auth store', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('exports an auth store object', async () => {
		expect(await getAuth()).toBeDefined();
	});

	it('has initial state with no user and no session', async () => {
		const auth = await getAuth();
		expect(auth.user).toBeNull();
		expect(auth.session).toBeNull();
	});

	it('has loading as false initially after init', async () => {
		const auth = await getAuth();
		expect(auth.loading).toBe(false);
	});

	it('signInWithEmail calls supabase.auth.signInWithPassword', async () => {
		mockSuccess('signInWithPassword', { user: { id: '1' }, session: { access_token: 'tok' } });
		const result = await (await getAuth()).signInWithEmail('test@test.com', 'test-password-not-real');
		expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
			email: 'test@test.com',
			password: 'test-password-not-real',
		});
		expect(result.error).toBeNull();
	});

	it('signInWithEmail returns error on failure', async () => {
		mockError('signInWithPassword', 'Invalid login credentials');
		const result = await (await getAuth()).signInWithEmail('bad@test.com', 'wrong');
		expect(result.error).toBe('Invalid login credentials');
	});

	it('signUpWithEmail calls supabase.auth.signUp with display name', async () => {
		mockSuccess('signUp', { user: { id: '1' }, session: null });
		const result = await (await getAuth()).signUpWithEmail('new@test.com', 'test-password-not-real', 'PawnyFan');
		expect(supabase.auth.signUp).toHaveBeenCalledWith({
			email: 'new@test.com',
			password: 'test-password-not-real',
			options: { data: { display_name: 'PawnyFan' } },
		});
		expect(result.error).toBeNull();
	});

	it('signUpWithEmail returns error on failure', async () => {
		mockError('signUp', 'User already registered');
		const result = await (await getAuth()).signUpWithEmail('dup@test.com', 'pass', 'Name');
		expect(result.error).toBe('User already registered');
	});

	it('signInWithMagicLink calls supabase.auth.signInWithOtp', async () => {
		mockSuccess('signInWithOtp', {});
		const result = await (await getAuth()).signInWithMagicLink('magic@test.com');
		expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({ email: 'magic@test.com' });
		expect(result.error).toBeNull();
	});

	it('signInWithMagicLink returns error on failure', async () => {
		mockError('signInWithOtp', 'Rate limit exceeded');
		const result = await (await getAuth()).signInWithMagicLink('spam@test.com');
		expect(result.error).toBe('Rate limit exceeded');
	});

	it('signOut calls supabase.auth.signOut', async () => {
		mockSuccess('signOut', undefined);
		const result = await (await getAuth()).signOut();
		expect(supabase.auth.signOut).toHaveBeenCalled();
		expect(result.error).toBeNull();
	});

	it('signOut returns error on failure', async () => {
		mockError('signOut', 'Sign out failed');
		const result = await (await getAuth()).signOut();
		expect(result.error).toBe('Sign out failed');
	});
});
