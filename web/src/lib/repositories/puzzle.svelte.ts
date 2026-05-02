import { supabase } from '../supabase';

export interface PuzzleProgress {
	id: string;
	user_id: string;
	puzzle_id: string;
	solved: boolean;
	attempts: number;
	solved_at: string | null;
}

export function createPuzzleRepository() {
	let progress = $state<PuzzleProgress[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function loadProgress(): Promise<void> {
		loading = true;
		error = null;
		try {
			const { data, error: err } = await supabase.from('puzzle_progress').select('*');
			if (err) throw err;
			progress = data ?? [];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load puzzle progress';
		} finally {
			loading = false;
		}
	}

	async function recordAttempt(puzzleId: string, userId: string, solved: boolean): Promise<void> {
		const existing = progress.find((p) => p.puzzle_id === puzzleId);
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
			progress = progress.map((p) => (p.id === existing.id ? { ...p, ...updates } : p));
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
			progress = [...progress, record];
		}
	}

	function addLocalProgress(record: PuzzleProgress): void {
		progress = [...progress, record];
	}

	function getSolvedCount(): number {
		return progress.filter((p) => p.solved).length;
	}

	return {
		get progress() {
			return progress;
		},
		get loading() {
			return loading;
		},
		get error() {
			return error;
		},
		loadProgress,
		recordAttempt,
		addLocalProgress,
		getSolvedCount,
	};
}
