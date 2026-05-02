import { describe, expect, it } from 'vitest';
import { achievements, getUnlockedAchievements } from '../src/lib/data/achievements';

const zeroStats = { games: 0, puzzles: 0, lessons: 0, rating: 0, streak: 0 };
function stats(overrides: Record<string, number> = {}) {
	return { ...zeroStats, ...overrides };
}

describe('achievements data', () => {
	it('exports 6 achievements', () => {
		expect(achievements).toHaveLength(6);
	});

	it('each achievement has required fields', () => {
		for (const a of achievements) {
			expect(a.id).toBeTypeOf('string');
			expect(a.emoji).toBeTypeOf('string');
			expect(a.label).toBeTypeOf('string');
			expect(a.description).toBeTypeOf('string');
			expect(a.condition).toBeTypeOf('string');
		}
	});

	it('has correct achievement ids', () => {
		const ids = achievements.map((a) => a.id);
		expect(ids).toEqual([
			'streak7',
			'first_game',
			'puzzle_master',
			'student',
			'checkmate',
			'rising_star',
		]);
	});

	it.each([
		['labels', 'label'],
		['descriptions', 'description'],
		['conditions', 'condition'],
	])('%s are non-empty', (_name, field) => {
		for (const a of achievements) {
			expect((a as any)[field].length).toBeGreaterThan(0);
		}
	});
});

describe('getUnlockedAchievements', () => {
	it('returns empty array when stats are all zero', () => {
		expect(getUnlockedAchievements(stats())).toHaveLength(0);
	});

	it.each([
		['unlocks streak7 with streak >= 7', { streak: 7 }, 'streak7', true],
		['does not unlock streak7 with streak < 7', { streak: 6 }, 'streak7', false],
		['unlocks first_game with games >= 1', { games: 1 }, 'first_game', true],
		['unlocks puzzle_master with puzzles >= 50', { puzzles: 50 }, 'puzzle_master', true],
		['does not unlock puzzle_master with puzzles < 50', { puzzles: 49 }, 'puzzle_master', false],
		['unlocks student with lessons >= 5', { lessons: 5 }, 'student', true],
		['unlocks rising_star with rating >= 1200', { rating: 1200 }, 'rising_star', true],
		['does not unlock rising_star with rating < 1200', { rating: 1199 }, 'rising_star', false],
	])('%s', (_name, overrides, id, expected) => {
		const unlocked = getUnlockedAchievements(stats(overrides));
		expect(unlocked.some((a) => a.id === id)).toBe(expected);
	});

	it('unlocks all achievements when stats are maxed', () => {
		expect(getUnlockedAchievements(stats({ games: 100, puzzles: 100, lessons: 10, rating: 2000, streak: 30 }))).toHaveLength(6);
	});

	it('unlocks multiple achievements at once', () => {
		expect(getUnlockedAchievements(stats({ games: 1, puzzles: 50, lessons: 5, rating: 1200, streak: 7 }))).toHaveLength(6);
	});
});
