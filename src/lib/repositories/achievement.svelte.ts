import { createRepository } from './base.svelte';

export interface AchievementRecord {
	id: string;
	user_id: string;
	achievement_id: string;
	unlocked_at: string;
}

export function createAchievementRepository() {
	const base = createRepository<AchievementRecord>({ table: 'achievements' });

	async function unlock(achievementId: string, userId: string): Promise<void> {
		const record: AchievementRecord = {
			id: crypto.randomUUID(),
			user_id: userId,
			achievement_id: achievementId,
			unlocked_at: new Date().toISOString(),
		};
		await base.insert(record);
	}

	function unlockLocal(achievementId: string): void {
		const record: AchievementRecord = {
			id: crypto.randomUUID(),
			user_id: 'local',
			achievement_id: achievementId,
			unlocked_at: new Date().toISOString(),
		};
		base.items = [...base.items, record];
	}

	function isUnlocked(achievementId: string): boolean {
		return base.items.some((a) => a.achievement_id === achievementId);
	}

	return {
		...base,
		loadAchievements: base.load,
		unlock,
		unlockLocal,
		isUnlocked,
		get unlocked() {
			return base.items;
		},
	};
}
