export interface LessonStep {
	fen: string;
	coach: string;
	highlight: string[];
	arrow?: { from: string; to: string };
}

export interface Lesson {
	id: string;
	title: string;
	emoji: string;
	duration: string;
	steps: LessonStep[];
}

type StepTuple = [string, string, string[]?, [string, string]?];

function buildStep([fen, coach, highlight, arrow]: StepTuple): LessonStep {
	return {
		fen,
		coach,
		highlight: highlight ?? [],
		arrow: arrow ? { from: arrow[0], to: arrow[1] } : undefined,
	};
}

type LessonTuple = [string, string, string, string, StepTuple[]];

function buildLesson([id, title, emoji, duration, steps]: LessonTuple): Lesson {
	return { id, title, emoji, duration, steps: steps.map(buildStep) };
}

const lessonData: LessonTuple[] = [
	[
		'l1',
		'How pieces move',
		'♟',
		'3 min',
		[
			[
				'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
				"Welcome! Let's learn how each piece moves. Every piece has its own way of traveling across the board.",
			],
			[
				'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR',
				'Pawns move forward one square at a time. On their first move, they can advance two squares!',
				['e4', 'e3'],
				['e2', 'e4'],
			],
			[
				'r1bqkbnr/pppppppp/2n5/8/8/5N2/PPPPPPPP/RNBQKB1R',
				'Knights move in an L-shape: two squares in one direction, then one to the side. They can jump over other pieces!',
				['c6', 'd4', 'e5', 'f4'],
				['g1', 'f3'],
			],
			[
				'rnbqk2r/pppp1ppp/4pn2/8/1bPP4/2N5/PP2PPPP/R1BQKBNR',
				'Bishops slide diagonally any number of squares. Rooks move in straight lines along ranks and files.',
				['b4', 'c3'],
				['f8', 'b4'],
			],
		],
	],
	[
		'l2',
		'Capture & check',
		'⚔️',
		'4 min',
		[
			[
				'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
				"Now let's learn about capturing. When a piece lands on a square with an enemy piece, it takes that piece off the board!",
			],
			[
				'rnbqkbnr/ppp1pppp/8/3p4/4P3/8/PPPP1PPP/RNBQKBNR',
				"Here the white pawn on e4 can capture the black pawn on d5. Captures move diagonally for pawns — it's the only way they take pieces!",
				['e4', 'd5'],
				['e4', 'd5'],
			],
			[
				'rnb1kbnr/ppppqppp/8/4p3/4PP2/8/PPPP2PP/RNBQKBNR',
				'Check! The black queen on e7 attacks the white king on e1. When your king is in check, you must deal with it immediately!',
				['e1', 'e7'],
				['e7', 'e1'],
			],
			[
				'r1bqkbnr/pppp1Qpp/2n5/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR',
				"Checkmate! The queen on f7 delivers check and the king has no escape. That's how you win — trap the enemy king!",
				['f7', 'e8'],
				['f7', 'e8'],
			],
		],
	],
	[
		'l3',
		'Special moves',
		'✨',
		'5 min',
		[
			['rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR', "Welcome! Let's learn about special moves."],
			[
				'rnbqkbnr/ppp1p1pp/8/3pPp2/8/8/PPPP1PPP/RNBQKBNR',
				'En passant: the white pawn on e5 can capture the black pawn on d5 as if it only moved one square. Must be done immediately after the two-square advance!',
				['e5', 'd6'],
				['e5', 'd6'],
			],
			[
				'r3k2r/ppppqppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R',
				'Castling: the king moves two squares toward the rook, then the rook jumps over. Great for king safety and rook activation!',
				['e1', 'g1'],
				['e1', 'g1'],
			],
			[
				'rnbqkbnr/ppppppP1/8/8/8/8/PPPP1P1P/RNBQKBNR',
				"Promotion: when a pawn reaches the last rank, it becomes a queen, rook, bishop, or knight. Usually you'll want a queen!",
				['g8'],
				['g7', 'g8'],
			],
		],
	],
	[
		'l4',
		'Checkmate patterns',
		'👑',
		'6 min',
		[
			[
				'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
				'Checkmate ends the game. Learning common patterns helps you spot winning opportunities and avoid falling into traps.',
			],
			[
				'5rk1/5ppp/8/8/8/8/8/R3K3',
				'Back rank mate: the rook delivers check on the back rank. The king is trapped behind its own pawns with no escape squares!',
				['a1', 'f8', 'g8', 'h8'],
				['a1', 'a8'],
			],
			[
				'r1bqkb1r/pppp1Qpp/2n2n2/4p3/2B1P3/8/PPPP1PPP/RNB1K1NR',
				"Scholar's mate: the queen and bishop combine for a quick checkmate on f7. A common trap for beginners — watch out for it!",
				['f7', 'c4'],
				['f7', 'e8'],
			],
			[
				'r1bk3r/ppppqppp/2n5/8/2B5/8/PPPP1PPP/RNBQR1K1',
				"Queen and bishop battery: aim both at the f7 or f2 square. When the queen delivers check with bishop support, it's often decisive!",
				['f7', 'c4'],
				['e1', 'f7'],
			],
		],
	],
	[
		'l5',
		'Opening principles',
		'📖',
		'5 min',
		[
			[
				'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR',
				'The opening is the first phase of the game. Three key principles will guide your play: center control, development, and king safety.',
			],
			[
				'rnbqkbnr/pppppppp/8/8/3PP3/8/PPP2PPP/RNBQKBNR',
				'Control the center! Pawns on d4 and e4 (or d5 and e5) control key squares and give your pieces room to move.',
				['d4', 'e4', 'd5', 'e5'],
				['e2', 'e4'],
			],
			[
				'r1bqkbnr/pppp1ppp/2n5/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R',
				'Develop your pieces! Get knights and bishops out early. A good rule: "knights before bishops" — they\'re harder to place well.',
				['f3', 'c6'],
				['g1', 'f3'],
			],
			[
				'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1',
				'Castle early! Tuck your king behind a wall of pawns. Kingside castling is most common — aim to castle within the first 10 moves.',
				['g1', 'c1'],
				['e1', 'g1'],
			],
		],
	],
];

export const lessons: Lesson[] = lessonData.map(buildLesson);
