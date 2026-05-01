export type OverlayType = 'game' | 'lesson' | 'puzzle' | 'celebration' | null;

function createOverlayStore() {
	let current: OverlayType = $state(null);

	return {
		get current(): OverlayType {
			return current;
		},
		openGame(): void {
			current = 'game';
		},
		openLesson(): void {
			current = 'lesson';
		},
		openPuzzle(): void {
			current = 'puzzle';
		},
		openCelebration(): void {
			current = 'celebration';
		},
		close(): void {
			current = null;
		},
	};
}

export const overlay = createOverlayStore();
