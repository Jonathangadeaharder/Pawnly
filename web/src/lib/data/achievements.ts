export interface Achievement {
	id: string;
	emoji: string;
	label: string;
	description: string;
	condition: string;
}

export const achievements: Achievement[] = [
	{
		id: 'streak7',
		emoji: '🔥',
		label: '7-day streak',
		description: 'Play for 7 consecutive days',
		condition: 'Log in 7 days in a row',
	},
	{
		id: 'first_game',
		emoji: '♟',
		label: 'First game',
		description: 'Complete your first game',
		condition: 'Finish 1 game',
	},
	{
		id: 'puzzle_master',
		emoji: '🎯',
		label: 'Puzzle master',
		description: 'Solve 50 puzzles',
		condition: 'Solve 50 puzzles',
	},
	{
		id: 'student',
		emoji: '📖',
		label: 'Student',
		description: 'Complete 5 lessons',
		condition: 'Finish 5 lessons',
	},
	{
		id: 'checkmate',
		emoji: '👑',
		label: 'Checkmate!',
		description: 'Win by checkmate',
		condition: 'Win 1 game by checkmate',
	},
	{
		id: 'rising_star',
		emoji: '⭐',
		label: 'Rising star',
		description: 'Reach 1200 rating',
		condition: 'Reach rating of 1200',
	},
];

export interface PlayerStats {
	games: number;
	puzzles: number;
	lessons: number;
	rating: number;
	streak: number;
}

export function getUnlockedAchievements(stats: PlayerStats): Achievement[] {
	return achievements.filter((a) => {
		if (a.id === 'streak7') return stats.streak >= 7;
		if (a.id === 'first_game') return stats.games >= 1;
		if (a.id === 'puzzle_master') return stats.puzzles >= 50;
		if (a.id === 'student') return stats.lessons >= 5;
		if (a.id === 'checkmate') return stats.games >= 1;
		if (a.id === 'rising_star') return stats.rating >= 1200;
		return false;
	});
}
