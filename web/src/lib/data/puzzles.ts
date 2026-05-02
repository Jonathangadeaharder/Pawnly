export interface Puzzle {
	id: string;
	title: string;
	emoji: string;
	difficulty: 1 | 2 | 3 | 4;
	fen: string;
	solution: string[];
	playerColor: 'w' | 'b';
	hint?: string;
}

export const puzzles: Puzzle[] = [
	{
		id: 'p1',
		title: 'Fork!',
		emoji: '🍴',
		difficulty: 1,
		fen: 'r2q1rk1/pppn1ppp/4pn2/4N3/8/8/PPP2PPP/R1BQKB1R w KQ - 0 1',
		solution: ['Nf7', 'Kh8', 'Nxd8'],
		playerColor: 'w',
		hint: 'The knight can attack two pieces at once',
	},
	{
		id: 'p2',
		title: 'Pin & win',
		emoji: '📌',
		difficulty: 2,
		fen: 'r1bqk2r/ppp2ppp/2n1pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQkq - 0 1',
		solution: ['Bg5', 'Be7', 'Bxf6'],
		playerColor: 'w',
		hint: 'Pin the knight to the queen',
	},
	{
		id: 'p3',
		title: 'Back rank mate',
		emoji: '🏰',
		difficulty: 2,
		fen: '3r2k1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
		solution: ['Ra8+'],
		playerColor: 'w',
		hint: 'The king is trapped behind its own pawns',
	},
	{
		id: 'p4',
		title: 'Discovered attack',
		emoji: '💥',
		difficulty: 3,
		fen: 'r1bk3r/pppq1ppp/4pn2/8/3P4/8/PPP1BPPP/RNBQK2R w KQ - 0 1',
		solution: ['Nc6+', 'Ke8', 'Nxd4'],
		playerColor: 'w',
		hint: 'Move the knight to reveal the bishop attack',
	},
	{
		id: 'p5',
		title: 'Queen sacrifice',
		emoji: '👑',
		difficulty: 4,
		fen: 'r1bq1rk1/pppp2pp/5p2/7Q/2B5/8/PPPP1PPP/RNB3RK w - - 0 1',
		solution: ['Qh5+', 'Kxh7', 'Rh3#'],
		playerColor: 'w',
		hint: 'Sacrifice the queen to open the h-file',
	},
	{
		id: 'p6',
		title: 'Knight fork',
		emoji: '♞',
		difficulty: 2,
		fen: 'r1bq1rk1/pppp1ppp/2n2n2/4N3/8/8/PPPP1PPP/RNBQKB1R w KQ - 0 1',
		solution: ['Nf7', 'Qe8', 'Nxd8'],
		playerColor: 'w',
		hint: 'The knight lands with check, attacking the queen',
	},
	{
		id: 'p7',
		title: 'Skewer',
		emoji: '🗡️',
		difficulty: 3,
		fen: 'r2qk2r/pppb1ppp/2n1b3/3p4/8/8/PPP1BPPP/RNBQK2R w KQkq - 0 1',
		solution: ['Bb5', 'Ke7', 'Bxd7'],
		playerColor: 'w',
		hint: 'Attack the king, then capture behind it',
	},
	{
		id: 'p8',
		title: 'Deflection',
		emoji: '🎯',
		difficulty: 3,
		fen: '3r1rk1/5ppp/8/8/8/8/5PPP/R5K1 w - - 0 1',
		solution: ['Rd1', 'Rxd1', 'Rxe8#'],
		playerColor: 'w',
		hint: 'Force the defender away from the back rank',
	},
];

export const dailyPuzzle: Puzzle = {
	id: 'daily',
	title: 'Mate in 2',
	emoji: '⚔️',
	difficulty: 3,
	fen: 'r1bq1rk1/pppp2pp/5p2/7Q/2B5/8/PPPP1PPP/RNB3RK w - - 0 1',
	solution: ['Qh5+', 'Kxh7', 'Rh3#'],
	playerColor: 'w',
	hint: 'Sacrifice the queen to open the h-file',
};
