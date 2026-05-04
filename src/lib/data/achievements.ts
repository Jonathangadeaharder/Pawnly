export interface Achievement {
	id: string;
	emoji: string;
	label: string;
	description: string;
	condition: string;
}

function createAchievement(
	id: string,
	emoji: string,
	label: string,
	description: string,
	condition: string,
): Achievement {
	return { id, emoji, label, description, condition };
}

export const achievements: Achievement[] = [
	createAchievement(
		'streak7',
		'🔥',
		'7-day streak',
		'Play for 7 consecutive days',
		'Log in 7 days in a row',
	),
	createAchievement('first_game', '♟', 'First game', 'Complete your first game', 'Finish 1 game'),
	createAchievement('puzzle_master', '🎯', 'Puzzle master', 'Solve 50 puzzles', 'Solve 50 puzzles'),
	createAchievement('student', '📖', 'Student', 'Complete 5 lessons', 'Finish 5 lessons'),
	createAchievement('checkmate', '👑', 'Checkmate!', 'Win by checkmate', 'Win 1 game by checkmate'),
	createAchievement(
		'rising_star',
		'⭐',
		'Rising star',
		'Reach 1200 rating',
		'Reach rating of 1200',
	),
];

export interface PlayerStats {
	games: number;
	puzzles: number;
	lessons: number;
	rating: number;
	streak: number;
}

const achievementConditions: Record<string, (stats: PlayerStats) => boolean> = {
	streak7: (s) => s.streak >= 7,
	first_game: (s) => s.games >= 1,
	puzzle_master: (s) => s.puzzles >= 50,
	student: (s) => s.lessons >= 5,
	checkmate: (s) => s.games >= 1,
	rising_star: (s) => s.rating >= 1200,
};

export function getUnlockedAchievements(stats: PlayerStats): Achievement[] {
	return achievements.filter((a) => achievementConditions[a.id]?.(stats) ?? false);
}
