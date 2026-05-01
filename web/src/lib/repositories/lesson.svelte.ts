import { supabase } from '../supabase';

export interface LessonProgress {
	id: string;
	user_id: string;
	lesson_id: string;
	completed: boolean;
	completed_at: string | null;
}

export function createLessonRepository() {
	let progress = $state<LessonProgress[]>([]);
	let loading = $state(false);
	let error = $state<string | null>(null);

	async function loadProgress(): Promise<void> {
		loading = true;
		error = null;
		try {
			const { data, error: err } = await supabase.from('lesson_progress').select('*');
			if (err) throw err;
			progress = data ?? [];
		} catch (e) {
			error = e instanceof Error ? e.message : 'Failed to load lesson progress';
		} finally {
			loading = false;
		}
	}

	async function markCompleted(lessonId: string, userId: string): Promise<void> {
		const existing = progress.find((p) => p.lesson_id === lessonId);
		if (existing && existing.completed) return;

		if (existing) {
			const updates = {
				completed: true,
				completed_at: new Date().toISOString(),
			};
			const { error: err } = await supabase
				.from('lesson_progress')
				.update(updates)
				.eq('id', existing.id);
			if (err) throw err;
			progress = progress.map((p) => (p.id === existing.id ? { ...p, ...updates } : p));
		} else {
			const record: LessonProgress = {
				id: crypto.randomUUID(),
				user_id: userId,
				lesson_id: lessonId,
				completed: true,
				completed_at: new Date().toISOString(),
			};
			const { error: err } = await supabase.from('lesson_progress').insert(record);
			if (err) throw err;
			progress = [...progress, record];
		}
	}

	function addLocalProgress(record: LessonProgress): void {
		progress = [...progress, record];
	}

	function getCompletedCount(): number {
		return progress.filter((p) => p.completed).length;
	}

	function isCompleted(lessonId: string): boolean {
		return progress.some((p) => p.lesson_id === lessonId && p.completed);
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
		markCompleted,
		addLocalProgress,
		getCompletedCount,
		isCompleted,
	};
}
