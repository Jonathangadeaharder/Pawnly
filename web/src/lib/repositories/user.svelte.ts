import { supabase } from '../supabase';

export interface UserProfile {
	id: string;
	display_name: string;
	avatar_url: string | null;
	rating: number;
	games_played: number;
	puzzles_solved: number;
	streak: number;
	joined_at: string;
}

export function createUserRepository() {
	let profile = $state<UserProfile | null>(null);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function loadProfile(): Promise<void> {
		loading = true;
		error = null;
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error('Not authenticated');

			const { data, error: err } = await supabase
				.from('profiles')
				.select('*')
				.eq('id', user.id)
				.single();

			if (err) throw err;
			profile = data;
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load profile';
		} finally {
			loading = false;
		}
	}

	async function updateProfile(updates: Partial<UserProfile>): Promise<void> {
		if (!profile) throw new Error('No profile loaded');
		const { error: err } = await supabase.from('profiles').update(updates).eq('id', profile.id);
		if (err) throw err;
		profile = { ...profile, ...updates };
	}

	function setProfile(p: UserProfile): void {
		profile = p;
	}

	return {
		get profile() {
			return profile;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		loadProfile,
		updateProfile,
		setProfile,
	};
}
