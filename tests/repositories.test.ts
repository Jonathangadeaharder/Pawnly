import { beforeEach, describe, expect, it, vi } from 'vitest';
import { describeRepoBasicTests } from './helpers';

vi.mock('../src/lib/supabase', () => ({
	supabase: {
		auth: {
			getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'test-user-id' } } }),
		},
		from: vi.fn().mockReturnValue({
			select: vi.fn().mockReturnThis(),
			insert: vi.fn().mockReturnThis(),
			update: vi.fn().mockReturnThis(),
			upsert: vi.fn().mockReturnThis(),
			delete: vi.fn().mockReturnThis(),
			eq: vi.fn().mockReturnThis(),
			order: vi.fn().mockReturnThis(),
			limit: vi.fn().mockReturnThis(),
			single: vi.fn().mockResolvedValue({ data: null, error: null }),
			// biome-ignore lint/suspicious/noThenProperty: Supabase query builder is thenable
			then: vi.fn().mockResolvedValue({ data: [], error: null }),
		}),
		channel: vi.fn().mockReturnValue({
			on: vi.fn().mockReturnThis(),
			subscribe: vi.fn(),
		}),
		removeChannel: vi.fn(),
	},
}));

describe('BaseRepository', () => {
	it('exports createRepository function', async () => {
		const mod = await import('../src/lib/repositories/base.svelte');
		expect(typeof mod.createRepository).toBe('function');
	});

	it('creates a repository with initial state', async () => {
		const { createRepository } = await import('../src/lib/repositories/base.svelte');
		const repo = createRepository({ table: 'test' });
		expect(repo).toBeDefined();
		expect(repo.items).toBeDefined();
		expect(repo.loading).toBe(false);
		expect(repo.error).toBeNull();
	});

	it('items starts as empty array', async () => {
		const { createRepository } = await import('../src/lib/repositories/base.svelte');
		const repo = createRepository({ table: 'test' });
		expect(repo.items).toEqual([]);
	});

	it('has load method', async () => {
		const { createRepository } = await import('../src/lib/repositories/base.svelte');
		const repo = createRepository({ table: 'test' });
		expect(typeof repo.load).toBe('function');
	});

	it('has getById method', async () => {
		const { createRepository } = await import('../src/lib/repositories/base.svelte');
		const repo = createRepository({ table: 'test' });
		expect(typeof repo.getById).toBe('function');
	});

	it('getById returns null when not found', async () => {
		const { createRepository } = await import('../src/lib/repositories/base.svelte');
		const repo = createRepository({ table: 'test' });
		const result = repo.getById('nonexistent');
		expect(result).toBeNull();
	});
});

describe('UserRepository', () => {
	it('exports createUserRepository function', async () => {
		const mod = await import('../src/lib/repositories/user.svelte');
		expect(typeof mod.createUserRepository).toBe('function');
	});

	it('creates a user repository with profile state', async () => {
		const { createUserRepository } = await import('../src/lib/repositories/user.svelte');
		const repo = createUserRepository();
		expect(repo).toBeDefined();
		expect(repo.profile).toBeNull();
		expect(repo.loading).toBe(false);
		expect(repo.error).toBeNull();
	});

	it('has loadProfile method', async () => {
		const { createUserRepository } = await import('../src/lib/repositories/user.svelte');
		const repo = createUserRepository();
		expect(typeof repo.loadProfile).toBe('function');
	});

	it('has updateProfile method', async () => {
		const { createUserRepository } = await import('../src/lib/repositories/user.svelte');
		const repo = createUserRepository();
		expect(typeof repo.updateProfile).toBe('function');
	});

	it('profile has correct shape after set', async () => {
		const { createUserRepository } = await import('../src/lib/repositories/user.svelte');
		const repo = createUserRepository();
		repo.setProfile({
			id: 'test-id',
			display_name: 'Test User',
			avatar_url: null,
			rating: 1200,
			games_played: 0,
			puzzles_solved: 0,
			streak: 0,
			joined_at: '2024-01-01',
		});
		expect(repo.profile).not.toBeNull();
		expect(repo.profile!.display_name).toBe('Test User');
		expect(repo.profile!.rating).toBe(1200);
	});
});

describe('GameRepository', () => {
	it('exports createGameRepository function', async () => {
		const mod = await import('../src/lib/repositories/game.svelte');
		expect(typeof mod.createGameRepository).toBe('function');
	});

	it('creates a game repository', async () => {
		const { createGameRepository } = await import('../src/lib/repositories/game.svelte');
		const repo = createGameRepository();
		expect(repo).toBeDefined();
		expect(repo.games).toEqual([]);
		expect(repo.loading).toBe(false);
	});

	it('has saveGame method', async () => {
		const { createGameRepository } = await import('../src/lib/repositories/game.svelte');
		const repo = createGameRepository();
		expect(typeof repo.saveGame).toBe('function');
	});

	it('has loadGames method', async () => {
		const { createGameRepository } = await import('../src/lib/repositories/game.svelte');
		const repo = createGameRepository();
		expect(typeof repo.loadGames).toBe('function');
	});

	it('has getStats method', async () => {
		const { createGameRepository } = await import('../src/lib/repositories/game.svelte');
		const repo = createGameRepository();
		expect(typeof repo.getStats).toBe('function');
	});

	it('getStats returns zero stats when empty', async () => {
		const { createGameRepository } = await import('../src/lib/repositories/game.svelte');
		const repo = createGameRepository();
		const stats = repo.getStats();
		expect(stats.wins).toBe(0);
		expect(stats.losses).toBe(0);
		expect(stats.draws).toBe(0);
		expect(stats.total).toBe(0);
	});

	it('getStats computes from local games', async () => {
		const { createGameRepository } = await import('../src/lib/repositories/game.svelte');
		const repo = createGameRepository();
		repo.addLocalGame({
			id: 'g1',
			user_id: 'u1',
			opponent_type: 'ai',
			result: 'win',
			moves: [],
			time_control: null,
			difficulty: 'easy',
			played_at: '2024-01-01',
		});
		repo.addLocalGame({
			id: 'g2',
			user_id: 'u1',
			opponent_type: 'ai',
			result: 'loss',
			moves: [],
			time_control: null,
			difficulty: 'easy',
			played_at: '2024-01-02',
		});
		const stats = repo.getStats();
		expect(stats.wins).toBe(1);
		expect(stats.losses).toBe(1);
		expect(stats.total).toBe(2);
	});
});

describeRepoBasicTests(
	'AchievementRepository',
	'../src/lib/repositories/achievement.svelte',
	'createAchievementRepository',
	[],
	{ unlocked: [] },
	['loadAchievements', 'unlock', 'isUnlocked'],
);

describe('AchievementRepository behavior', () => {
	it('isUnlocked returns false when not unlocked', async () => {
		const { createAchievementRepository } = await import(
			'../src/lib/repositories/achievement.svelte'
		);
		const repo = createAchievementRepository();
		expect(repo.isUnlocked('streak7')).toBe(false);
	});

	it('isUnlocked returns true after unlock', async () => {
		const { createAchievementRepository } = await import(
			'../src/lib/repositories/achievement.svelte'
		);
		const repo = createAchievementRepository();
		repo.unlockLocal('streak7');
		expect(repo.isUnlocked('streak7')).toBe(true);
	});
});

describeRepoBasicTests(
	'PuzzleRepository',
	'../src/lib/repositories/puzzle.svelte',
	'createPuzzleRepository',
	[],
	{ progress: [] },
	['loadProgress', 'recordAttempt', 'getSolvedCount'],
);

describe('PuzzleRepository behavior', () => {
	it('getSolvedCount returns 0 when empty', async () => {
		const { createPuzzleRepository } = await import('../src/lib/repositories/puzzle.svelte');
		const repo = createPuzzleRepository();
		expect(repo.getSolvedCount()).toBe(0);
	});

	it('getSolvedCount counts solved puzzles', async () => {
		const { createPuzzleRepository } = await import('../src/lib/repositories/puzzle.svelte');
		const repo = createPuzzleRepository();
		repo.addLocalProgress({
			id: 'pp1',
			user_id: 'u1',
			puzzle_id: 'p1',
			solved: true,
			attempts: 1,
			solved_at: '2024-01-01',
		});
		repo.addLocalProgress({
			id: 'pp2',
			user_id: 'u1',
			puzzle_id: 'p2',
			solved: false,
			attempts: 2,
			solved_at: null,
		});
		expect(repo.getSolvedCount()).toBe(1);
	});
});

describeRepoBasicTests(
	'LessonRepository',
	'../src/lib/repositories/lesson.svelte',
	'createLessonRepository',
	[],
	{ progress: [] },
	['loadProgress', 'markCompleted', 'getCompletedCount'],
);

describe('LessonRepository behavior', () => {
	it('getCompletedCount returns 0 when empty', async () => {
		const { createLessonRepository } = await import('../src/lib/repositories/lesson.svelte');
		const repo = createLessonRepository();
		expect(repo.getCompletedCount()).toBe(0);
	});

	it('isCompleted returns false when not completed', async () => {
		const { createLessonRepository } = await import('../src/lib/repositories/lesson.svelte');
		const repo = createLessonRepository();
		expect(repo.isCompleted('l1')).toBe(false);
	});

	it('isCompleted returns true after marking complete', async () => {
		const { createLessonRepository } = await import('../src/lib/repositories/lesson.svelte');
		const repo = createLessonRepository();
		repo.addLocalProgress({
			id: 'lp1',
			user_id: 'u1',
			lesson_id: 'l1',
			completed: true,
			completed_at: '2024-01-01',
		});
		expect(repo.isCompleted('l1')).toBe(true);
		expect(repo.getCompletedCount()).toBe(1);
	});
});
