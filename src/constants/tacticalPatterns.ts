/**
 * Tactical Pattern Library
 * Collection of chess tactical puzzles for pattern recognition training
 * Used by The Fuse mini-game and other tactical trainers
 */

export type TacticalPattern =
  | 'greek-gift'
  | 'back-rank-mate'
  | 'pin'
  | 'skewer'
  | 'fork'
  | 'discovered-attack'
  | 'double-attack'
  | 'removing-defender'
  | 'deflection'
  | 'smothered-mate'
  | 'battery'
  | 'zwischenzug'
  | 'desperado'
  | 'x-ray';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface TacticalPuzzle {
  id: string;
  name: string;
  fen: string;
  solution: string; // Move in SAN notation (e.g., "Bxh7+")
  solutionUci?: string; // Optional UCI format (e.g., "c3h7")
  pattern: TacticalPattern;
  difficulty: Difficulty;
  hint: string;
  explanation: string;
  timeLimit: number; // Seconds (for timed challenges)
  followUpMoves?: string[]; // Optional continuation after solution
}

/**
 * EASY PUZZLES
 * Basic tactical patterns for beginners
 */

export const EASY_PUZZLES: TacticalPuzzle[] = [
  {
    id: 'easy-1',
    name: 'Simple Back Rank Mate',
    fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
    solution: 'Rd8#',
    pattern: 'back-rank-mate',
    difficulty: 'easy',
    hint: 'Black\'s king is trapped on the back rank by its own pawns.',
    explanation: 'Rd8# is checkmate! The king cannot escape because its own pawns block the escape squares. Always watch for back rank weaknesses.',
    timeLimit: 10,
  },
  {
    id: 'easy-2',
    name: 'Knight Fork - King and Rook',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: 'Nxe5',
    pattern: 'fork',
    difficulty: 'easy',
    hint: 'After taking on e5, your knight will attack multiple pieces.',
    explanation: 'Nxe5! and after Black recaptures, Nxc6 forks the queen and rook. Knights love to fork!',
    timeLimit: 12,
  },
  {
    id: 'easy-3',
    name: 'Basic Pin',
    fen: 'r1bqkbnr/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: 'Ng5',
    pattern: 'pin',
    difficulty: 'easy',
    hint: 'Your bishop on c4 creates an opportunity for a devastating pin on f7.',
    explanation: 'Ng5 attacks f7, which is pinned by the Bc4 to the king. Black cannot defend adequately, and White threatens Nxf7 or Qf3.',
    timeLimit: 12,
  },
  {
    id: 'easy-4',
    name: 'Skewer Attack',
    fen: '6k1/5ppp/8/3K4/8/8/8/3R4 w - - 0 1',
    solution: 'Rd8+',
    pattern: 'skewer',
    difficulty: 'easy',
    hint: 'Check the king first, then win material.',
    explanation: 'Rd8+! forces the king to move, then the rook on d8 is captured. This is a skewer - attacking a more valuable piece that shields a less valuable one.',
    timeLimit: 10,
  },
  {
    id: 'easy-5',
    name: 'Double Attack - Queen',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 0 1',
    solution: 'Nxe5',
    pattern: 'double-attack',
    difficulty: 'easy',
    hint: 'Take the pawn and threaten two pieces at once.',
    explanation: 'Nxe5! attacks both the c6 knight and threatens Nxc6, winning material through a double attack.',
    timeLimit: 12,
  },
  {
    id: 'easy-6',
    name: 'Simple Skewer',
    fen: 'r3k2r/8/8/8/8/8/8/3R3K w kq - 0 1',
    solution: 'Rd8+',
    pattern: 'skewer',
    difficulty: 'easy',
    hint: 'Check the king and win the rook.',
    explanation: 'Rd8+! forces the king to move, then Rxh8 wins the rook. A textbook skewer.',
    timeLimit: 10,
  },
  {
    id: 'easy-7',
    name: 'Queen Fork',
    fen: 'r1b1kb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N5/PPPP1PPP/R1BQK2R w KQkq - 0 1',
    solution: 'Qf3',
    pattern: 'fork',
    difficulty: 'easy',
    hint: 'Your queen can attack both a piece and threaten checkmate.',
    explanation: 'Qf3! attacks the rook on a8 while threatening Qxf7#. Black must defend the mate threat and loses the rook.',
    timeLimit: 12,
  },
  {
    id: 'easy-8',
    name: 'Discovered Check',
    fen: 'r2qkb1r/ppp2ppp/2n5/3pPb2/3Pn3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 1',
    solution: 'Nxd5',
    pattern: 'discovered-attack',
    difficulty: 'easy',
    hint: 'Moving your knight will give check while winning material.',
    explanation: 'Nxd5! gives discovered check from the Bf1 and simultaneously attacks the queen. Black must move the king and loses the queen.',
    timeLimit: 12,
  },
  {
    id: 'easy-9',
    name: 'Pin and Win',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 w kq - 0 1',
    solution: 'Bxf7+',
    pattern: 'pin',
    difficulty: 'easy',
    hint: 'The f7 pawn is pinned to the king.',
    explanation: 'Bxf7+! wins the pawn because it\'s pinned. After Kxf7, White has won material and damaged Black\'s king safety.',
    timeLimit: 10,
  },
  {
    id: 'easy-10',
    name: 'Basic Deflection',
    fen: '6k1/5pp1/7p/8/8/8/5PPP/4R1K1 w - - 0 1',
    solution: 'Re8+',
    pattern: 'deflection',
    difficulty: 'easy',
    hint: 'Force the king away from defending.',
    explanation: 'Re8+ deflects the king from the back rank, and after Kh7 or Kg7, White has won the important e-file.',
    timeLimit: 10,
  },
  {
    id: 'easy-11',
    name: 'Remove the Guard',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1',
    solution: 'Nxe5',
    pattern: 'removing-defender',
    difficulty: 'easy',
    hint: 'Remove the piece that guards the bishop on c5.',
    explanation: 'Nxe5! removes the defender of the Bc5. After Nxe5, White threatens Nxc6 and Black\'s pieces are uncoordinated.',
    timeLimit: 12,
  },
  {
    id: 'easy-12',
    name: 'Back Rank Weakness',
    fen: '5rk1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    solution: 'Re8+',
    pattern: 'back-rank-mate',
    difficulty: 'easy',
    hint: 'Black\'s king is trapped on the back rank.',
    explanation: 'Re8+! forces Rxe8, but if the position continues, this demonstrates the back rank weakness. Always look for these patterns!',
    timeLimit: 10,
  },
  {
    id: 'easy-13',
    name: 'Simple Double Attack',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: 'Nxe5',
    pattern: 'double-attack',
    difficulty: 'easy',
    hint: 'Take the pawn and create multiple threats.',
    explanation: 'Nxe5! wins the pawn and attacks the c6 knight. This simple double attack wins material.',
    timeLimit: 12,
  },
  {
    id: 'easy-14',
    name: 'Fork with Check',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b5/2BpP3/5N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
    solution: 'Nxd4',
    pattern: 'fork',
    difficulty: 'easy',
    hint: 'Capture the pawn with your knight.',
    explanation: 'Nxd4! and the knight forks multiple pieces from this central square. Knights love the center!',
    timeLimit: 12,
  },
  {
    id: 'easy-15',
    name: 'Battery Threat',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/2N2N2/PPPP1PPP/R1BQK2R w KQkq - 0 1',
    solution: 'Qd5',
    pattern: 'battery',
    difficulty: 'easy',
    hint: 'Align your queen with your bishop.',
    explanation: 'Qd5! creates a queen-bishop battery on the long diagonal, attacking f7 and putting pressure on Black\'s position.',
    timeLimit: 12,
  },
];

/**
 * MEDIUM PUZZLES
 * Intermediate tactical patterns
 */

export const MEDIUM_PUZZLES: TacticalPuzzle[] = [
  {
    id: 'medium-1',
    name: 'Greek Gift Sacrifice',
    fen: 'r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2NBPN2/PPP2PPP/R1BQK2R w KQ - 0 1',
    solution: 'Bxh7+',
    pattern: 'greek-gift',
    difficulty: 'medium',
    hint: 'Look at Black\'s castled king. What piece can sacrifice itself on h7?',
    explanation: 'The Greek Gift! Bxh7+ forces Kxh7, then Ng5+ wins the queen or delivers checkmate. This is one of the most famous attacking patterns.',
    timeLimit: 15,
    followUpMoves: ['Kxh7', 'Ng5+'],
  },
  {
    id: 'medium-2',
    name: 'Queen and Bishop Battery',
    fen: 'r2qkb1r/ppp2ppp/2n5/3pPb2/3Pn3/2N1BN2/PPP1QPPP/R3KB1R w KQkq - 0 1',
    solution: 'Qb5',
    pattern: 'battery',
    difficulty: 'medium',
    hint: 'Your queen and bishop can create a deadly battery on the long diagonal.',
    explanation: 'Qb5! creates a powerful pin on the c6 knight and threatens the undefended e5 pawn. The queen and bishop battery is devastating.',
    timeLimit: 15,
  },
  {
    id: 'medium-3',
    name: 'Smothered Mate Pattern',
    fen: '5rk1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
    solution: 'Re8+',
    pattern: 'smothered-mate',
    difficulty: 'medium',
    hint: 'Drive the king into the corner where it\'ll be smothered by its own pieces.',
    explanation: 'Re8+! forces Rxe8, then the follow-up delivers mate. The king is smothered by its own pawns - a beautiful pattern!',
    timeLimit: 15,
  },
  {
    id: 'medium-4',
    name: 'Discovered Attack',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
    solution: 'Nxe5',
    pattern: 'discovered-attack',
    difficulty: 'medium',
    hint: 'Moving your knight will unleash a powerful piece behind it.',
    explanation: 'Nxe5! removes the knight and discovers an attack from the Bc4 on f7. Black must deal with multiple threats.',
    timeLimit: 15,
  },
  {
    id: 'medium-5',
    name: 'Removing the Defender',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b5/2BpP3/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 1',
    solution: 'Bxf7+',
    pattern: 'removing-defender',
    difficulty: 'medium',
    hint: 'The king is the only defender of a critical square. Remove it!',
    explanation: 'Bxf7+! removes the key defender (the king) of the d4 pawn and wins material after Kxf7 Nxd4.',
    timeLimit: 15,
  },
  {
    id: 'medium-6',
    name: 'Deflection Tactic',
    fen: 'r2qkb1r/ppp2ppp/2n2n2/3pPb2/3P4/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 1',
    solution: 'exf6',
    pattern: 'deflection',
    difficulty: 'medium',
    hint: 'Deflect the f7 pawn away from defending the king.',
    explanation: 'exf6! deflects the f-pawn from defending the king. After Qxf6 or gxf6, White has opened lines for attack.',
    timeLimit: 15,
  },
  {
    id: 'medium-7',
    name: 'Advanced Fork Pattern',
    fen: 'r2qkb1r/ppp2ppp/2n2n2/3pPb2/3P4/2N2N2/PPP1QPPP/R1B1KB1R w KQkq - 0 1',
    solution: 'Nd5',
    pattern: 'fork',
    difficulty: 'medium',
    hint: 'Centralize your knight to attack multiple pieces.',
    explanation: 'Nd5! centralizes the knight and forks the bishop on f5 and threatens Nxf6+. Black loses material.',
    timeLimit: 16,
  },
  {
    id: 'medium-8',
    name: 'Pin Exploitation',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
    solution: 'd4',
    pattern: 'pin',
    difficulty: 'medium',
    hint: 'Attack the pinned piece with a pawn.',
    explanation: 'd4! attacks the Bc5 which is pinned to the king by the Bc4. Black must move the bishop and loses time.',
    timeLimit: 15,
  },
  {
    id: 'medium-9',
    name: 'Discovered Attack on Queen',
    fen: 'r2q1rk1/ppp2ppp/2n1bn2/3pPb2/3P4/2N2N2/PPP1QPPP/R1B1KB1R w KQ - 0 1',
    solution: 'Ng5',
    pattern: 'discovered-attack',
    difficulty: 'medium',
    hint: 'Move your knight to discover an attack on the queen.',
    explanation: 'Ng5! discovers an attack on the queen from the Qe2 while also attacking f7 and e6. Black is in serious trouble.',
    timeLimit: 16,
  },
  {
    id: 'medium-10',
    name: 'Skewer Through Pieces',
    fen: 'r3k2r/ppp2ppp/2n1b3/3q4/3P4/2N1Q3/PPP2PPP/R3K2R w KQkq - 0 1',
    solution: 'Qe5',
    pattern: 'skewer',
    difficulty: 'medium',
    hint: 'Attack the queen to win the bishop behind it.',
    explanation: 'Qe5! skewers the queen and bishop. After the queen moves, Qxe6 wins the bishop.',
    timeLimit: 15,
  },
  {
    id: 'medium-11',
    name: 'Removing Key Defender',
    fen: 'r1bqk2r/ppp2ppp/2n2n2/2bpP3/3P4/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 1',
    solution: 'exf6',
    pattern: 'removing-defender',
    difficulty: 'medium',
    hint: 'Remove the piece defending the weak d5 pawn.',
    explanation: 'exf6! removes the knight that was defending d5. After gxf6, Nxd5 wins the pawn with a strong position.',
    timeLimit: 16,
  },
  {
    id: 'medium-12',
    name: 'Back Rank Combination',
    fen: 'r4rk1/ppp2ppp/2n5/8/1b1P4/2N1Q3/PPP2PPP/R4RK1 w - - 0 1',
    solution: 'Qe8',
    pattern: 'back-rank-mate',
    difficulty: 'medium',
    hint: 'Invade the back rank with your queen.',
    explanation: 'Qe8! threatens Qxf8#. Black must give up material to prevent mate, as the back rank is fatally weak.',
    timeLimit: 16,
  },
  {
    id: 'medium-13',
    name: 'Deflecting the Defender',
    fen: 'r2q1rk1/ppp2ppp/2n1bn2/3p4/3P4/2NBPN2/PPP2PPP/R1BQ1RK1 w - - 0 1',
    solution: 'Bxh7+',
    pattern: 'deflection',
    difficulty: 'medium',
    hint: 'Deflect the king from defending f6.',
    explanation: 'Bxh7+! deflects the king. After Kxh7, Nxf6+ wins the bishop with a strong attack.',
    timeLimit: 16,
  },
  {
    id: 'medium-14',
    name: 'Double Attack with Bishop',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1',
    solution: 'Bb5',
    pattern: 'double-attack',
    difficulty: 'medium',
    hint: 'Your bishop can attack two pieces at once.',
    explanation: 'Bb5! pins the knight to the king and attacks it. Black must deal with the pin and loses the knight.',
    timeLimit: 15,
  },
  {
    id: 'medium-15',
    name: 'Queen-Rook Battery',
    fen: 'r3k2r/ppp2ppp/2n1bn2/3q4/3P4/2N1BN2/PPP1QPPP/R3K2R w KQkq - 0 1',
    solution: 'Qe4',
    pattern: 'battery',
    difficulty: 'medium',
    hint: 'Create a powerful central battery.',
    explanation: 'Qe4! creates a queen-bishop battery on the long diagonal, pressuring both sides of the board.',
    timeLimit: 15,
  },
  {
    id: 'medium-16',
    name: 'Smothered Mate Threat',
    fen: 'r1bq1rk1/ppp2p1p/2n3pn/3pP3/3P4/2N2N2/PPP1QPPP/R1B1K2R w KQ - 0 1',
    solution: 'Nf4',
    pattern: 'smothered-mate',
    difficulty: 'medium',
    hint: 'Bring your knight closer to deliver a smothered mate threat.',
    explanation: 'Nf4! threatens Nxg6 followed by Nh6# - a smothered mate. Black must weaken the kingside to prevent it.',
    timeLimit: 16,
  },
  {
    id: 'medium-17',
    name: 'In-Between Move',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/2NP1N2/PPP2PPP/R1BQK2R w KQkq - 0 1',
    solution: 'Nxe5',
    pattern: 'zwischenzug',
    difficulty: 'medium',
    hint: 'Before Black takes your bishop, create a bigger threat.',
    explanation: 'Nxe5! is a zwischenzug. Before dealing with the threat on c4, White creates the bigger threat of Nxc6, winning material.',
    timeLimit: 16,
  },
  {
    id: 'medium-18',
    name: 'X-Ray Pressure',
    fen: 'r2q1rk1/ppp2ppp/2n1bn2/3p4/3P4/2N1BN2/PPP1QPPP/R3K2R w KQ - 0 1',
    solution: 'Bg5',
    pattern: 'x-ray',
    difficulty: 'medium',
    hint: 'Your bishop can x-ray through the knight to attack the queen.',
    explanation: 'Bg5! pins the knight and x-rays the queen. Black must break the pin or lose material.',
    timeLimit: 15,
  },
  {
    id: 'medium-19',
    name: 'Desperado Knight',
    fen: 'r1bqk2r/pppp1ppp/8/2b1n3/2BnP3/5N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
    solution: 'Nxd4',
    pattern: 'desperado',
    difficulty: 'medium',
    hint: 'Your knight is attacked - make it count before it goes.',
    explanation: 'Nxd4! The knight is lost anyway, so it takes the most valuable target before being captured.',
    timeLimit: 15,
  },
  {
    id: 'medium-20',
    name: 'Advanced Greek Gift',
    fen: 'r1bq1rk1/ppp2ppp/2n5/3pPb2/1b1P4/2N2N2/PPP1BPPP/R1BQ1RK1 w - - 0 1',
    solution: 'Bxh7+',
    pattern: 'greek-gift',
    difficulty: 'medium',
    hint: 'The classic bishop sacrifice works here.',
    explanation: 'Bxh7+! Kxh7 Ng5+ and White has a winning attack. The Greek Gift strikes again!',
    timeLimit: 16,
    followUpMoves: ['Kxh7', 'Ng5+', 'Kg8', 'Qh5'],
  },
  {
    id: 'medium-21',
    name: 'Complex Pin Break',
    fen: 'r2qk2r/ppp2ppp/2n1bn2/3pPb2/3P4/2N2N2/PPP1BPPP/R1BQK2R w KQkq - 0 1',
    solution: 'Nd4',
    pattern: 'pin',
    difficulty: 'medium',
    hint: 'Break the pin with a powerful central move.',
    explanation: 'Nd4! breaks the pin and centralizes the knight with multiple threats including Nxf5 and Nxc6.',
    timeLimit: 16,
  },
];

/**
 * HARD PUZZLES
 * Advanced tactical patterns requiring deeper calculation
 */

export const HARD_PUZZLES: TacticalPuzzle[] = [
  {
    id: 'hard-1',
    name: 'Zwischenzug (In-Between Move)',
    fen: 'r1bqk2r/ppp2ppp/2n5/3pPb2/1b1Pn3/2N2N2/PPP1QPPP/R1B1KB1R w KQkq - 0 1',
    solution: 'Nxd5',
    pattern: 'zwischenzug',
    difficulty: 'hard',
    hint: 'Before recapturing on e4, there\'s an in-between move that wins material.',
    explanation: 'Nxd5! is a zwischenzug (in-between move). Before dealing with the threat on e2, White creates a bigger threat on c7, winning material.',
    timeLimit: 20,
  },
  {
    id: 'hard-2',
    name: 'X-Ray Attack',
    fen: 'r4rk1/ppp2ppp/2n5/8/1b1P4/2N1Q3/PPP2PPP/R1B2RK1 w - - 0 1',
    solution: 'Qe8',
    pattern: 'x-ray',
    difficulty: 'hard',
    hint: 'Your queen can x-ray through Black\'s rook to attack the king.',
    explanation: 'Qe8! pins the rook to the king via x-ray. Black loses the exchange or gets mated. X-ray attacks see through pieces!',
    timeLimit: 20,
  },
  {
    id: 'hard-3',
    name: 'Desperado Rook',
    fen: '2r3k1/5ppp/8/3R4/8/2P5/5PPP/6K1 w - - 0 1',
    solution: 'Rxc8+',
    pattern: 'desperado',
    difficulty: 'hard',
    hint: 'Your rook is attacked, but it can cause maximum damage before going down.',
    explanation: 'Rxc8+! is a desperado move. The rook is doomed anyway, so it trades itself for maximum value with check before being captured.',
    timeLimit: 18,
  },
  {
    id: 'hard-4',
    name: 'Complex Knight Fork',
    fen: 'r2qkb1r/ppp1pppp/2n2n2/3p1b2/3P1B2/2N2N2/PPP1PPPP/R2QKB1R w KQkq - 0 1',
    solution: 'Nxd5',
    pattern: 'fork',
    difficulty: 'hard',
    hint: 'Capture with the knight to create multiple threats.',
    explanation: 'Nxd5! forks multiple pieces. After Nxd5, White threatens Nxf6+ forking king and queen, and Nxc6 is also possible. Multi-layered tactics!',
    timeLimit: 20,
  },
  {
    id: 'hard-5',
    name: 'Advanced Pin Exploitation',
    fen: 'r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P1B2/2N1PN2/PPP2PPP/R2QKB1R w KQ - 0 1',
    solution: 'e4',
    pattern: 'pin',
    difficulty: 'hard',
    hint: 'Open up lines while the knight is pinned to the queen.',
    explanation: 'e4! exploits the pin on the f6 knight. Black cannot take because of the pin, and White gains central space with tempo.',
    timeLimit: 20,
  },
  {
    id: 'hard-6',
    name: 'Multi-Move Deflection',
    fen: 'r2q1rk1/ppp2ppp/2n1b3/3pPb2/3Pn3/2N2N2/PPP1BPPP/R1BQ1RK1 w - - 0 1',
    solution: 'Nxd5',
    pattern: 'deflection',
    difficulty: 'hard',
    hint: 'Deflect the bishop from defending the e4 knight.',
    explanation: 'Nxd5! deflects the Bf5 from defending e4. After Bxd5, White plays Bxe4 winning material through deflection.',
    timeLimit: 22,
  },
  {
    id: 'hard-7',
    name: 'Removing Defender Combination',
    fen: 'r1b1k2r/pppp1ppp/2n2q2/2b1n3/2B1P3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 1',
    solution: 'Nxe5',
    pattern: 'removing-defender',
    difficulty: 'hard',
    hint: 'Remove the knight that defends the queen.',
    explanation: 'Nxe5! removes the defender of the queen. After Nxe5, Bxf7+ forks king and queen, winning the queen.',
    timeLimit: 20,
  },
  {
    id: 'hard-8',
    name: 'Complex Discovered Check',
    fen: 'r2qkb1r/ppp2ppp/2n2n2/3pPb2/1b1P4/2N2N2/PPP1BPPP/R1BQK2R w KQkq - 0 1',
    solution: 'exf6',
    pattern: 'discovered-attack',
    difficulty: 'hard',
    hint: 'Opening the e-file creates a discovered attack.',
    explanation: 'exf6! opens the e-file with a discovered attack on the Bb4. After Qxf6 or gxf6, White gains a significant advantage.',
    timeLimit: 20,
  },
  {
    id: 'hard-9',
    name: 'Advanced Skewer Tactic',
    fen: 'r3k2r/pppq1ppp/2n1b3/3pPb2/3P4/2N1BN2/PPP1QPPP/R3K2R w KQkq - 0 1',
    solution: 'Bb5',
    pattern: 'skewer',
    difficulty: 'hard',
    hint: 'Pin the knight to skewer the queen behind it.',
    explanation: 'Bb5! pins the knight and skewers it to the queen. After the knight moves, Bxd7 wins the queen.',
    timeLimit: 20,
  },
  {
    id: 'hard-10',
    name: 'Devastating Greek Gift',
    fen: 'r1bq1rk1/ppp2ppp/2n5/3pPb2/1b1Pn3/2N2N2/PPP1BPPP/R1BQ1RK1 w - - 0 1',
    solution: 'Bxh7+',
    pattern: 'greek-gift',
    difficulty: 'hard',
    hint: 'The Greek Gift works even in complex positions.',
    explanation: 'Bxh7+! Kxh7 Ng5+ Kg8 Qh5 and White has a winning attack despite Black\'s extra pieces. The king\'s safety is paramount!',
    timeLimit: 22,
    followUpMoves: ['Kxh7', 'Ng5+', 'Kg8', 'Qh5', 'Nf6+'],
  },
  {
    id: 'hard-11',
    name: 'Advanced Double Attack',
    fen: 'r2qk2r/ppp2ppp/2n1bn2/3pPb2/3P4/2N2N2/PPP1BPPP/R1BQK2R w KQkq - 0 1',
    solution: 'Nd4',
    pattern: 'double-attack',
    difficulty: 'hard',
    hint: 'Centralize your knight to attack multiple weaknesses.',
    explanation: 'Nd4! centralizes the knight and attacks both the Bf5 and threatens Nxf6+. Black cannot defend everything.',
    timeLimit: 20,
  },
  {
    id: 'hard-12',
    name: 'Smothered Mate Setup',
    fen: 'r1bqr1k1/ppp2p1p/2n3pn/3pP3/3P4/2N2N2/PPP1QPPP/R1B1K2R w KQ - 0 1',
    solution: 'Nf4',
    pattern: 'smothered-mate',
    difficulty: 'hard',
    hint: 'Prepare a smothered mate pattern.',
    explanation: 'Nf4! threatens Nxg6 and then Nh6#, a smothered mate. Black\'s pieces are poorly coordinated to defend.',
    timeLimit: 22,
  },
  {
    id: 'hard-13',
    name: 'Back Rank Demolition',
    fen: 'r4rk1/ppp2ppp/2nq4/3p4/1b1P4/2NBQ3/PPP2PPP/R4RK1 w - - 0 1',
    solution: 'Qe8',
    pattern: 'back-rank-mate',
    difficulty: 'hard',
    hint: 'Invade the back rank decisively.',
    explanation: 'Qe8!! threatens Qxf8#. Black must sacrifice the queen with Qd1 to prevent mate, demonstrating total back rank collapse.',
    timeLimit: 22,
  },
  {
    id: 'hard-14',
    name: 'Powerful Battery Attack',
    fen: 'r2q1rk1/ppp2ppp/2n1bn2/3pPb2/3P4/2N1BN2/PPP1QPPP/R3K2R w KQ - 0 1',
    solution: 'Qd2',
    pattern: 'battery',
    difficulty: 'hard',
    hint: 'Align your queen and bishop for maximum pressure.',
    explanation: 'Qd2! creates a deadly queen-bishop battery. Combined with the Bf4 threats, Black\'s position collapses under the pressure.',
    timeLimit: 20,
  },
  {
    id: 'hard-15',
    name: 'Zwischenzug Masterclass',
    fen: 'r1bqk2r/ppp2ppp/2n2n2/2bpP3/2B1P3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 1',
    solution: 'exf6',
    pattern: 'zwischenzug',
    difficulty: 'hard',
    hint: 'Before Black takes your bishop, create threats.',
    explanation: 'exf6! is a powerful zwischenzug. Before dealing with Bxc4, White creates the bigger threat of fxg7 and Bxf7+.',
    timeLimit: 22,
  },
];

/**
 * All puzzles combined
 */
export const ALL_PUZZLES: TacticalPuzzle[] = [
  ...EASY_PUZZLES,
  ...MEDIUM_PUZZLES,
  ...HARD_PUZZLES,
];

/**
 * Puzzles organized by pattern type
 */
export const PUZZLES_BY_PATTERN: Record<TacticalPattern, TacticalPuzzle[]> = {
  'greek-gift': ALL_PUZZLES.filter(p => p.pattern === 'greek-gift'),
  'back-rank-mate': ALL_PUZZLES.filter(p => p.pattern === 'back-rank-mate'),
  'pin': ALL_PUZZLES.filter(p => p.pattern === 'pin'),
  'skewer': ALL_PUZZLES.filter(p => p.pattern === 'skewer'),
  'fork': ALL_PUZZLES.filter(p => p.pattern === 'fork'),
  'discovered-attack': ALL_PUZZLES.filter(p => p.pattern === 'discovered-attack'),
  'double-attack': ALL_PUZZLES.filter(p => p.pattern === 'double-attack'),
  'removing-defender': ALL_PUZZLES.filter(p => p.pattern === 'removing-defender'),
  'deflection': ALL_PUZZLES.filter(p => p.pattern === 'deflection'),
  'smothered-mate': ALL_PUZZLES.filter(p => p.pattern === 'smothered-mate'),
  'battery': ALL_PUZZLES.filter(p => p.pattern === 'battery'),
  'zwischenzug': ALL_PUZZLES.filter(p => p.pattern === 'zwischenzug'),
  'desperado': ALL_PUZZLES.filter(p => p.pattern === 'desperado'),
  'x-ray': ALL_PUZZLES.filter(p => p.pattern === 'x-ray'),
};

/**
 * Puzzles organized by difficulty
 */
export const PUZZLES_BY_DIFFICULTY: Record<Difficulty, TacticalPuzzle[]> = {
  'easy': EASY_PUZZLES,
  'medium': MEDIUM_PUZZLES,
  'hard': HARD_PUZZLES,
};

/**
 * Get puzzles by pattern type
 */
export function getPuzzlesByPattern(pattern: TacticalPattern): TacticalPuzzle[] {
  return PUZZLES_BY_PATTERN[pattern] || [];
}

/**
 * Get puzzles by difficulty
 */
export function getPuzzlesByDifficulty(difficulty: Difficulty): TacticalPuzzle[] {
  return PUZZLES_BY_DIFFICULTY[difficulty] || [];
}

/**
 * Get a random puzzle
 */
export function getRandomPuzzle(difficulty?: Difficulty): TacticalPuzzle {
  const pool = difficulty ? PUZZLES_BY_DIFFICULTY[difficulty] : ALL_PUZZLES;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Get puzzle by ID
 */
export function getPuzzleById(id: string): TacticalPuzzle | undefined {
  return ALL_PUZZLES.find(puzzle => puzzle.id === id);
}

/**
 * Get puzzles for The Fuse mini-game (mixed difficulty, time-pressured)
 */
export function getFusePuzzles(count: number = 5): TacticalPuzzle[] {
  // Mix of easy and medium puzzles for The Fuse
  const fuseCandidates = [...EASY_PUZZLES, ...MEDIUM_PUZZLES];
  const shuffled = fuseCandidates.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * Get pattern name in human-readable format
 */
export function getPatternDisplayName(pattern: TacticalPattern): string {
  const names: Record<TacticalPattern, string> = {
    'greek-gift': 'Greek Gift Sacrifice',
    'back-rank-mate': 'Back Rank Mate',
    'pin': 'Pin',
    'skewer': 'Skewer',
    'fork': 'Fork',
    'discovered-attack': 'Discovered Attack',
    'double-attack': 'Double Attack',
    'removing-defender': 'Removing the Defender',
    'deflection': 'Deflection',
    'smothered-mate': 'Smothered Mate',
    'battery': 'Battery',
    'zwischenzug': 'Zwischenzug',
    'desperado': 'Desperado',
    'x-ray': 'X-Ray Attack',
  };
  return names[pattern];
}

/**
 * Statistics about the puzzle library
 */
export const PUZZLE_LIBRARY_STATS = {
  total: ALL_PUZZLES.length,
  easy: EASY_PUZZLES.length,
  medium: MEDIUM_PUZZLES.length,
  hard: HARD_PUZZLES.length,
  patterns: Object.keys(PUZZLES_BY_PATTERN).length,
};
