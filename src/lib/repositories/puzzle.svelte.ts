import { supabase } from '../supabase';
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
		const existing = base.progress.find((p) => p.puzzle_id === puzzleId);
		if (existing) {
			const updates = {
				attempts: existing.attempts + 1,
				solved: solved || existing.solved,
				solved_at: solved && !existing.solved ? new Date().toISOString() : existing.solved_at,
			};
			const { error: err } = await supabase
				.from('puzzle_progress')
				.update(updates)
				.eq('id', existing.id);
			if (err) throw err;
			base.progress = base.progress.map((p) => (p.id === existing.id ? { ...p, ...updates } : p));
		} else {
			const record: PuzzleProgress = {
				id: crypto.randomUUID(),
				user_id: userId,
				puzzle_id: puzzleId,
				solved,
				attempts: 1,
				solved_at: solved ? new Date().toISOString() : null,
			};
			const { error: err } = await supabase.from('puzzle_progress').insert(record);
			if (err) throw err;
			base.addLocalProgress(record);
		}
	}

	function getSolvedCount(): number {
		return base.progress.filter((p) => p.solved).length;
	}

	return {
		get progress() {
			return base.progress;
		},
		get loading() {
			return base.loading;
		},
		get error() {
			return base.error;
		},
		loadProgress: base.loadProgress,
		recordAttempt,
		addLocalProgress: base.addLocalProgress,
		getSolvedCount,
	};
}
