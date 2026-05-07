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
		if (existing?.completed) return;

		const updates = { completed: true, completed_at: new Date().toISOString() };
		const newRecord: LessonProgress = {
			id: crypto.randomUUID(),
			user_id: userId,
			lesson_id: lessonId,
			completed: true,
			completed_at: new Date().toISOString(),
		};
		await base.upsert(existing, updates, newRecord);
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
