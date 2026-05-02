import { describe, expect, it } from 'vitest';
import { achievements, getUnlockedAchievements } from '../src/lib/data/achievements';

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

	it('labels are non-empty', () => {
		for (const a of achievements) {
			expect(a.label.length).toBeGreaterThan(0);
		}
	});

	it('descriptions are non-empty', () => {
		for (const a of achievements) {
			expect(a.description.length).toBeGreaterThan(0);
		}
	});

	it('conditions are non-empty', () => {
		for (const a of achievements) {
			expect(a.condition.length).toBeGreaterThan(0);
		}
	});
});

describe('getUnlockedAchievements', () => {
	it('returns empty array when stats are all zero', () => {
		const unlocked = getUnlockedAchievements({
			games: 0,
			puzzles: 0,
			lessons: 0,
			rating: 0,
			streak: 0,
		});
		expect(unlocked).toHaveLength(0);
	});

	it('unlocks streak7 with streak >= 7', () => {
		const unlocked = getUnlockedAchievements({
			games: 0,
			puzzles: 0,
			lessons: 0,
			rating: 0,
			streak: 7,
		});
		expect(unlocked.some((a) => a.id === 'streak7')).toBe(true);
	});

	it('does not unlock streak7 with streak < 7', () => {
		const unlocked = getUnlockedAchievements({
			games: 0,
			puzzles: 0,
			lessons: 0,
			rating: 0,
			streak: 6,
		});
		expect(unlocked.some((a) => a.id === 'streak7')).toBe(false);
	});

	it('unlocks first_game with games >= 1', () => {
		const unlocked = getUnlockedAchievements({
			games: 1,
			puzzles: 0,
			lessons: 0,
			rating: 0,
			streak: 0,
		});
		expect(unlocked.some((a) => a.id === 'first_game')).toBe(true);
	});

	it('unlocks puzzle_master with puzzles >= 50', () => {
		const unlocked = getUnlockedAchievements({
			games: 0,
			puzzles: 50,
			lessons: 0,
			rating: 0,
			streak: 0,
		});
		expect(unlocked.some((a) => a.id === 'puzzle_master')).toBe(true);
	});

	it('does not unlock puzzle_master with puzzles < 50', () => {
		const unlocked = getUnlockedAchievements({
			games: 0,
			puzzles: 49,
			lessons: 0,
			rating: 0,
			streak: 0,
		});
		expect(unlocked.some((a) => a.id === 'puzzle_master')).toBe(false);
	});

	it('unlocks student with lessons >= 5', () => {
		const unlocked = getUnlockedAchievements({
			games: 0,
			puzzles: 0,
			lessons: 5,
			rating: 0,
			streak: 0,
		});
		expect(unlocked.some((a) => a.id === 'student')).toBe(true);
	});

	it('unlocks rising_star with rating >= 1200', () => {
		const unlocked = getUnlockedAchievements({
			games: 0,
			puzzles: 0,
			lessons: 0,
			rating: 1200,
			streak: 0,
		});
		expect(unlocked.some((a) => a.id === 'rising_star')).toBe(true);
	});

	it('does not unlock rising_star with rating < 1200', () => {
		const unlocked = getUnlockedAchievements({
			games: 0,
			puzzles: 0,
			lessons: 0,
			rating: 1199,
			streak: 0,
		});
		expect(unlocked.some((a) => a.id === 'rising_star')).toBe(false);
	});

	it('unlocks all achievements when stats are maxed', () => {
		const unlocked = getUnlockedAchievements({
			games: 100,
			puzzles: 100,
			lessons: 10,
			rating: 2000,
			streak: 30,
		});
		expect(unlocked).toHaveLength(6);
	});

	it('unlocks multiple achievements at once', () => {
		const unlocked = getUnlockedAchievements({
			games: 1,
			puzzles: 50,
			lessons: 5,
			rating: 1200,
			streak: 7,
		});
		expect(unlocked).toHaveLength(6);
	});
});
