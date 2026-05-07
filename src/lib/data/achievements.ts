export interface Achievement {
	id: string;
	emoji: string;
	label: string;
	description: string;
	condition: string;
}

type AchievementTuple = [string, string, string, string, string];

const achievementData: AchievementTuple[] = [
	['streak7', '🔥', '7-day streak', 'Play for 7 consecutive days', 'Log in 7 days in a row'],
	['first_game', '♟', 'First game', 'Complete your first game', 'Finish 1 game'],
	['puzzle_master', '🎯', 'Puzzle master', 'Solve 50 puzzles', 'Solve 50 puzzles'],
	['student', '📖', 'Student', 'Complete 5 lessons', 'Finish 5 lessons'],
	['checkmate', '👑', 'Checkmate!', 'Win by checkmate', 'Win 1 game by checkmate'],
	['rising_star', '⭐', 'Rising star', 'Reach 1200 rating', 'Reach rating of 1200'],
];

export const achievements: Achievement[] = achievementData.map(
	([id, emoji, label, description, condition]) => ({ id, emoji, label, description, condition }),
);

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
