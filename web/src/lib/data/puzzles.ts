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
		fen: 'r1bqkb1r/pppp1ppp/5n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
		solution: ['Bxf7+', 'Ke7', 'Bb3'],
		playerColor: 'w',
		hint: 'The bishop attacks the king while winning material',
	},
	{
		id: 'p2',
		title: 'Pin & win',
		emoji: '📌',
		difficulty: 2,
		fen: 'r1bqk2r/ppp2ppp/2n1pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQkq - 0 1',
		solution: ['Bg5', 'h6', 'Bxf6', 'Qxf6', 'cxd5'],
		playerColor: 'w',
		hint: 'Pin the knight to the queen',
	},
	{
		id: 'p3',
		title: 'Back rank mate',
		emoji: '🏰',
		difficulty: 2,
		fen: '6k1/5ppp/8/8/8/8/8/R5K1 w - - 0 1',
		solution: ['Ra8#'],
		playerColor: 'w',
		hint: 'The king is trapped behind its own pawns',
	},
	{
		id: 'p4',
		title: 'Discovered attack',
		emoji: '💥',
		difficulty: 3,
		fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQ - 0 1',
		solution: ['c5', 'e5', 'dxe5', 'Nxe5'],
		playerColor: 'w',
		hint: 'Push the pawn to reveal a powerful diagonal attack',
	},
	{
		id: 'p5',
		title: 'Queen sacrifice',
		emoji: '👑',
		difficulty: 4,
		fen: 'r1bq1rk1/pppp1Bpp/5p2/7Q/8/5R2/PPPP1PPP/RNB3K1 w - - 0 1',
		solution: ['Qxh7+', 'Kxh7', 'Rh3#'],
		playerColor: 'w',
		hint: 'Sacrifice the queen to open the h-file',
	},
	{
		id: 'p6',
		title: 'Knight fork',
		emoji: '♞',
		difficulty: 2,
		fen: 'r1bq1rk1/ppp2ppp/2n2n2/3pp3/4P3/3B1N2/PPPP1PPP/RNBQ1RK1 w - - 0 1',
		solution: ['exd5', 'Nxd5', 'Bxh7+', 'Kxh7', 'Ng5+'],
		playerColor: 'w',
		hint: 'Open the position then strike with the knight',
	},
	{
		id: 'p7',
		title: 'Skewer',
		emoji: '🗡️',
		difficulty: 3,
		fen: '8/8/8/8/5k2/8/1K6/R7 w - - 0 1',
		solution: ['Ra4+', 'Ke3', 'Rg4'],
		playerColor: 'w',
		hint: 'Attack the king, then capture what is behind it',
	},
	{
		id: 'p8',
		title: 'Deflection',
		emoji: '🎯',
		difficulty: 3,
		fen: '2r3k1/5ppp/8/8/8/8/5PPP/1Q2R1K1 w - - 0 1',
		solution: ['Qb8', 'Rxb8', 'Re8#'],
		playerColor: 'w',
		hint: 'Force the defender away from the back rank',
	},
];

export const dailyPuzzle: Puzzle = {
	id: 'daily',
	title: 'Mate in 2',
	emoji: '⚔️',
	difficulty: 3,
	fen: 'r1bq1rk1/pppp1Bpp/5p2/7Q/8/5R2/PPPP1PPP/RNB3K1 w - - 0 1',
	solution: ['Qxh7+', 'Kxh7', 'Rh3#'],
	playerColor: 'w',
	hint: 'Sacrifice the queen to open the h-file',
};
