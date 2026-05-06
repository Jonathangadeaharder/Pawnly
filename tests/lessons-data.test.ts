import { describe, expect, it } from 'vitest';
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
		const arrows = lessons.flatMap((l) => l.steps.map((s) => s.arrow).filter(Boolean));
		for (const arrow of arrows) {
			expect(arrow.from).toMatch(/^[a-h][1-8]$/);
			expect(arrow.to).toMatch(/^[a-h][1-8]$/);
		}
	});
});
