import { createProgressRepository } from './base.svelte';

export interface PuzzleProgress {
	id: string;
	user_id: string;
	puzzle_id: string;
	solved: boolean;
	attempts: number;
	solved_at: string | null;
}

export function createPuzzleRepository() {
	const base = createProgressRepository<PuzzleProgress>('puzzle_progress');

	async function recordAttempt(puzzleId: string, userId: string, solved: boolean): Promise<void> {
		const existing = base.progress.find((p) => p.puzzle_id === puzzleId && p.user_id === userId);
		const updates = existing
			? {
					attempts: existing.attempts + 1,
					solved: solved || existing.solved,
					solved_at: solved && !existing.solved ? new Date().toISOString() : existing.solved_at,
				}
			: {};
		const newRecord: PuzzleProgress = {
			id: crypto.randomUUID(),
			user_id: userId,
			puzzle_id: puzzleId,
			solved,
			attempts: 1,
			solved_at: solved ? new Date().toISOString() : null,
		};
		await base.upsert(existing, updates, newRecord);
	}

	function getSolvedCount(): number {
		return base.progress.filter((p) => p.solved).length;
	}

	return {
		get progress() {
			return base.progress;
		},
		set progress(value: PuzzleProgress[]) {
			base.progress = value;
		},
		get loading() {
			return base.loading;
		},
		get error() {
			return base.error;
		},
		loadProgress: base.loadProgress,
		addLocalProgress: base.addLocalProgress,
		upsert: base.upsert,
		recordAttempt,
		getSolvedCount,
	};
}
