export type OverlayType = 'game' | 'lesson' | 'puzzle' | 'celebration' | null;

export let currentOverlay: OverlayType = $state(null);

export function openGame(): void {
	currentOverlay = 'game';
}

export function openLesson(): void {
	currentOverlay = 'lesson';
}

export function openPuzzle(): void {
	currentOverlay = 'puzzle';
}

export function openCelebration(): void {
	currentOverlay = 'celebration';
}

export function closeOverlay(): void {
	currentOverlay = null;
}
