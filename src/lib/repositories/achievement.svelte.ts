import { supabase } from '../supabase';

export interface AchievementRecord {
	id: string;
	user_id: string;
	achievement_id: string;
	unlocked_at: string;
}

export function createAchievementRepository() {
	let unlocked = $state<AchievementRecord[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function loadAchievements(): Promise<void> {
		loading = true;
		error = null;
		try {
			const { data, error: err } = await supabase.from('achievements').select('*');
			if (err) throw err;
			unlocked = data ?? [];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load achievements';
		} finally {
			loading = false;
		}
	}

	async function unlock(achievementId: string, userId: string): Promise<void> {
		const record: AchievementRecord = {
			id: crypto.randomUUID(),
			user_id: userId,
			achievement_id: achievementId,
			unlocked_at: new Date().toISOString(),
		};
		const { error: err } = await supabase.from('achievements').insert(record);
		if (err) throw err;
		unlocked = [...unlocked, record];
	}

	function unlockLocal(achievementId: string): void {
		const record: AchievementRecord = {
			id: crypto.randomUUID(),
			user_id: 'local',
			achievement_id: achievementId,
			unlocked_at: new Date().toISOString(),
		};
		unlocked = [...unlocked, record];
	}

	function isUnlocked(achievementId: string): boolean {
		return unlocked.some((a) => a.achievement_id === achievementId);
	}

	return {
		get unlocked() {
			return unlocked;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		loadAchievements,
		unlock,
		unlockLocal,
		isUnlocked,
	};
}
