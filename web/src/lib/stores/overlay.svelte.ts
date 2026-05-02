export type OverlayType = 'game' | 'lesson' | 'puzzle' | 'celebration' | 'scan' | null;

function createOverlayStore() {
	let current: OverlayType = $state(null);
	let scanLevel: number = $state(1);

	return {
		get current(): OverlayType {
			return current;
		},
		get scanLevel(): number {
			return scanLevel;
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
		openScan(level = 1): void {
			scanLevel = level;
			current = 'scan';
		},
		close(): void {
			current = null;
		},
	};
}

export const overlay = createOverlayStore();
