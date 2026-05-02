import { describe, expect, it } from 'vitest';

const { overlay } = await import('../src/lib/stores/overlay.svelte');

describe('overlay store', () => {
	it('starts with null current', () => {
		expect(overlay.current).toBeNull();
	});

	it('starts with scanLevel 1', () => {
		expect(overlay.scanLevel).toBe(1);
	});

	it('openGame sets current to game', () => {
		overlay.openGame();
		expect(overlay.current).toBe('game');
	});

	it('openLesson sets current to lesson', () => {
		overlay.openLesson();
		expect(overlay.current).toBe('lesson');
	});

	it('openPuzzle sets current to puzzle', () => {
		overlay.openPuzzle();
		expect(overlay.current).toBe('puzzle');
	});

	it('openCelebration sets current to celebration', () => {
		overlay.openCelebration();
		expect(overlay.current).toBe('celebration');
	});

	it('openScan sets current to scan with default level', () => {
		overlay.openScan();
		expect(overlay.current).toBe('scan');
		expect(overlay.scanLevel).toBe(1);
	});

	it('openScan sets current to scan with custom level', () => {
		overlay.openScan(5);
		expect(overlay.current).toBe('scan');
		expect(overlay.scanLevel).toBe(5);
	});

	it('close resets current to null', () => {
		overlay.openGame();
		overlay.close();
		expect(overlay.current).toBeNull();
	});
});
