import { supabase } from '../supabase';
import { createProgressRepository } from './base.svelte';

export interface LessonProgress {
	id: string;
	user_id: string;
	lesson_id: string;
	completed: boolean;
	completed_at: string | null;
}

export function createLessonRepository() {
	const base = createProgressRepository<LessonProgress>('lesson_progress');

	async function markCompleted(lessonId: string, userId: string): Promise<void> {
		const existing = base.progress.find((p) => p.lesson_id === lessonId);
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
			base.progress = base.progress.map((p) => (p.id === existing.id ? { ...p, ...updates } : p));
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
			base.addLocalProgress(record);
		}
	}

	function getCompletedCount(): number {
		return base.progress.filter((p) => p.completed).length;
	}

	function isCompleted(lessonId: string): boolean {
		return base.progress.some((p) => p.lesson_id === lessonId && p.completed);
	}

	return {
		...base,
		markCompleted,
		getCompletedCount,
		isCompleted,
	};
}
