import type { Session, User } from '@supabase/supabase-js';
import posthog from 'posthog-js';
import { browser } from '$app/environment';
import { supabase } from '$lib/supabase';

function createAuthStore() {
	let user: User | null = $state(null);
	let session: Session | null = $state(null);
	let loading = $state(true);

	supabase.auth.getSession().then(({ data }) => {
		session = data.session;
		user = data.session?.user ?? null;
		loading = false;
	});

	supabase.auth.onAuthStateChange((_event, newSession) => {
		session = newSession;
		user = newSession?.user ?? null;
		loading = false;
		if (browser && newSession?.user) {
			posthog.identify(newSession.user.id);
		} else if (browser && !newSession) {
			posthog.reset();
		}
	});

	return {
		get user(): User | null {
			return user;
		},
		get session(): Session | null {
			return session;
		},
		get loading(): boolean {
			return loading;
		},
		async signInWithEmail(email: string, password: string) {
			const { error } = await supabase.auth.signInWithPassword({ email, password });
			return { error: error?.message ?? null };
		},
		async signUpWithEmail(email: string, password: string, displayName: string) {
			const { error } = await supabase.auth.signUp({
				email,
				password,
				options: { data: { display_name: displayName } },
			});
			return { error: error?.message ?? null };
		},
		async signInWithMagicLink(email: string) {
			const { error } = await supabase.auth.signInWithOtp({ email });
			return { error: error?.message ?? null };
		},
		async signOut() {
			const { error } = await supabase.auth.signOut();
			return { error: error?.message ?? null };
		},
	};
}

export const auth = createAuthStore();
