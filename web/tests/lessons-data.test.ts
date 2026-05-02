import { describe, expect, it } from 'vitest';
import { fenToPieces } from '../src/lib/board.svelte';
import { lessons } from '../src/lib/data/lessons';

describe('lessons data', () => {
	it('exports 5 lessons', () => {
		expect(lessons).toHaveLength(5);
	});

	it('each lesson has required fields', () => {
		for (const lesson of lessons) {
			expect(lesson.id).toBeTypeOf('string');
			expect(lesson.title).toBeTypeOf('string');
			expect(lesson.emoji).toBeTypeOf('string');
			expect(lesson.duration).toBeTypeOf('string');
			expect(lesson.steps).toBeInstanceOf(Array);
		}
	});

	it('each step has required fields', () => {
		for (const lesson of lessons) {
			for (const step of lesson.steps) {
				expect(step.fen).toBeTypeOf('string');
				expect(step.coach).toBeTypeOf('string');
				expect(step.highlight).toBeInstanceOf(Array);
			}
		}
	});

	it('lessons have ids l1 through l5', () => {
		const ids = lessons.map((l) => l.id);
		expect(ids).toEqual(['l1', 'l2', 'l3', 'l4', 'l5']);
	});

	it('each lesson has 4 steps', () => {
		for (const lesson of lessons) {
			expect(lesson.steps).toHaveLength(4);
		}
	});

	it('first lesson is "How pieces move"', () => {
		expect(lessons[0].title).toBe('How pieces move');
		expect(lessons[0].id).toBe('l1');
	});

	it('second lesson is "Capture & check"', () => {
		expect(lessons[1].title).toBe('Capture & check');
		expect(lessons[1].id).toBe('l2');
	});

	it('third lesson is "Special moves"', () => {
		expect(lessons[2].title).toBe('Special moves');
		expect(lessons[2].id).toBe('l3');
	});

	it('fourth lesson is "Checkmate patterns"', () => {
		expect(lessons[3].title).toBe('Checkmate patterns');
		expect(lessons[3].id).toBe('l4');
	});

	it('fifth lesson is "Opening principles"', () => {
		expect(lessons[4].title).toBe('Opening principles');
		expect(lessons[4].id).toBe('l5');
	});

	it('coach text is non-empty for all steps', () => {
		for (const lesson of lessons) {
			for (const step of lesson.steps) {
				expect(step.coach.length).toBeGreaterThan(0);
			}
		}
	});

	it('highlight arrays contain square strings', () => {
		for (const lesson of lessons) {
			for (const step of lesson.steps) {
				for (const sq of step.highlight) {
					expect(sq).toMatch(/^[a-h][1-8]$/);
				}
			}
		}
	});

	it('arrow has from and to squares when present', () => {
		for (const lesson of lessons) {
			for (const step of lesson.steps) {
				if (step.arrow) {
					expect(step.arrow.from).toMatch(/^[a-h][1-8]$/);
					expect(step.arrow.to).toMatch(/^[a-h][1-8]$/);
				}
			}
		}
	});
});

describe('fenToPieces', () => {
	it('converts starting position', () => {
		const pieces = fenToPieces('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR');
		expect(pieces.e1).toBe('K');
		expect(pieces.d1).toBe('Q');
		expect(pieces.a1).toBe('R');
		expect(pieces.b1).toBe('N');
		expect(pieces.c1).toBe('B');
		expect(pieces.e8).toBe('k');
		expect(pieces.d8).toBe('q');
		expect(pieces.a8).toBe('r');
	});

	it('converts empty board', () => {
		const pieces = fenToPieces('8/8/8/8/8/8/8/8');
		expect(Object.keys(pieces)).toHaveLength(0);
	});

	it('converts mixed position', () => {
		const pieces = fenToPieces('4k3/8/8/8/4P3/8/8/4K3');
		expect(pieces.e8).toBe('k');
		expect(pieces.e4).toBe('P');
		expect(pieces.e1).toBe('K');
		expect(Object.keys(pieces)).toHaveLength(3);
	});

	it('handles all piece types', () => {
		const pieces = fenToPieces('rnbqkbnr/8/8/8/8/8/8/RNBQKBNR');
		expect(pieces.a8).toBe('r');
		expect(pieces.b8).toBe('n');
		expect(pieces.c8).toBe('b');
		expect(pieces.d8).toBe('q');
		expect(pieces.e8).toBe('k');
		expect(pieces.f8).toBe('b');
		expect(pieces.g8).toBe('n');
		expect(pieces.h8).toBe('r');
		expect(pieces.a1).toBe('R');
		expect(pieces.b1).toBe('N');
		expect(pieces.c1).toBe('B');
		expect(pieces.d1).toBe('Q');
		expect(pieces.e1).toBe('K');
	});
});
