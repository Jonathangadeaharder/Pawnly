/**
 * ELO-Tiered Tactical Drill Library
 * Based on "A Statistical Analysis of Tactical Motif Probability in Chess"
 *
 * Key Findings:
 * - ELO 800-900: Fork, Skewer (most common blunders)
 * - ELO 1400: Deflection, X-Ray Attack
 * - ELO 1600: Trapped Piece
 * - "Big 4" Most Frequent: Fork, Hanging Piece, Discovered Attack, Pin
 *
 * Progressive time limits enforce "flash recognition":
 * - Beginner (800): 8 seconds
 * - Intermediate (1200): 6 seconds
 * - Advanced (1600): 5 seconds
 * - Expert (1800): 4 seconds
 * - Master (2000+): 3 seconds
 */

export type ELORating = 800 | 1000 | 1200 | 1400 | 1600 | 1800 | 2000;

export type TacticalMotif =
  | 'fork'
  | 'hanging-piece'
  | 'pin'
  | 'discovered-attack'
  | 'skewer'
  | 'back-rank-mate'
  | 'double-attack'
  | 'deflection'
  | 'x-ray'
  | 'trapped-piece'
  | 'removing-defender'
  | 'greek-gift'
  | 'zwischenzug'
  | 'desperado'
  | 'smothered-mate'
  | 'attraction'
  | 'clearance'
  | 'interference';

export interface TacticalDrill {
  id: string;
  name: string;
  fen: string;
  solution: string; // SAN notation
  solutionSquare: string; // Target square (e.g., "h7" for destination-based matching)
  motif: TacticalMotif;
  eloRating: ELORating;
  timeLimit: number; // Seconds - STRICT enforcement
  hint: string;
  explanation: string;
  frequency: 'very-high' | 'high' | 'medium' | 'low'; // Based on Lichess data
}

/**
 * ===== ELO 800: BEGINNER DRILLS =====
 * Focus: "Big 4" basics - Fork, Hanging Piece, Pin, Discovered Attack
 * Time Limit: 8 seconds
 * Statistical Priority: These are the MOST COMMON tactical blunders
 */

export const DRILLS_800: TacticalDrill[] = [
  // FORK - Highest frequency tactic (20,514 occurrences in Lichess data)
  {
    id: '800-fork-1',
    name: 'Knight Fork - King and Rook',
    fen: '4k3/8/8/8/3N4/8/4r3/4K3 w - - 0 1',
    solution: 'Nf5',
    solutionSquare: 'f5',
    motif: 'fork',
    eloRating: 800,
    timeLimit: 8,
    hint: 'Your knight can attack two pieces at once.',
    explanation: 'Nf5 forks the king and rook. This is THE most common tactic in chess - you must see it instantly!',
    frequency: 'very-high',
  },
  {
    id: '800-fork-2',
    name: 'Pawn Fork',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: 'd3',
    solutionSquare: 'd3',
    motif: 'fork',
    eloRating: 800,
    timeLimit: 8,
    hint: 'A pawn can fork two pieces.',
    explanation: 'd3 forks the bishop and knight! Never underestimate pawn forks.',
    frequency: 'very-high',
  },
  {
    id: '800-fork-3',
    name: 'Queen Fork',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 0 1',
    solution: 'Qa4',
    solutionSquare: 'a4',
    motif: 'fork',
    eloRating: 800,
    timeLimit: 8,
    hint: 'Your queen can attack the king and another piece.',
    explanation: 'Qa4 pins the knight to the king and threatens to win it. Queen forks are powerful!',
    frequency: 'very-high',
  },

  // HANGING PIECE - #3 most frequent (8,307 occurrences)
  {
    id: '800-hanging-1',
    name: 'Undefended Knight',
    fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
    solution: 'Nxe5',
    solutionSquare: 'e5',
    motif: 'hanging-piece',
    eloRating: 800,
    timeLimit: 8,
    hint: 'One of Black\'s pieces is completely undefended.',
    explanation: 'Nxe5 wins the hanging pawn for free. Always check: "What\'s undefended?"',
    frequency: 'very-high',
  },
  {
    id: '800-hanging-2',
    name: 'Hanging Rook',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R b KQkq - 0 1',
    solution: 'Nxe4',
    solutionSquare: 'e4',
    motif: 'hanging-piece',
    eloRating: 800,
    timeLimit: 8,
    hint: 'White left a piece undefended.',
    explanation: 'Nxe4 captures the hanging pawn. The most common blunder is leaving pieces en prise!',
    frequency: 'very-high',
  },

  // PIN - #6 most frequent (6,299 occurrences)
  {
    id: '800-pin-1',
    name: 'Simple Pin to King',
    fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
    solution: 'Bb5',
    solutionSquare: 'b5',
    motif: 'pin',
    eloRating: 800,
    timeLimit: 8,
    hint: 'You can pin a knight to the king.',
    explanation: 'Bb5 pins the knight to the king. The knight cannot move without exposing the king to check.',
    frequency: 'very-high',
  },
  {
    id: '800-pin-2',
    name: 'Pin to Queen',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/2N2N2/PPPP1PPP/R1BQKB1R w KQkq - 0 1',
    solution: 'Bg5',
    solutionSquare: 'g5',
    motif: 'pin',
    eloRating: 800,
    timeLimit: 8,
    hint: 'Pin the knight to the queen.',
    explanation: 'Bg5 pins the f6 knight to the queen on d8. Pins are everywhere!',
    frequency: 'very-high',
  },

  // SKEWER - Peak frequency at 800-900 ELO
  {
    id: '800-skewer-1',
    name: 'Rook Skewer',
    fen: '6k1/5ppp/8/3K4/8/8/8/3R4 w - - 0 1',
    solution: 'Rd8+',
    solutionSquare: 'd8',
    motif: 'skewer',
    eloRating: 800,
    timeLimit: 8,
    hint: 'Check the king, then win material.',
    explanation: 'Rd8+ skewers the king. After Kf7/Kg7, the rook on d8 is yours.',
    frequency: 'high',
  },
  {
    id: '800-skewer-2',
    name: 'Bishop Skewer',
    fen: 'r3k2r/8/8/8/8/8/8/R3K2R w KQkq - 0 1',
    solution: 'Ra8+',
    solutionSquare: 'a8',
    motif: 'skewer',
    eloRating: 800,
    timeLimit: 8,
    hint: 'Your rook can check and win material.',
    explanation: 'Ra8+ skewers king and rook. Always check for skewers on open lines!',
    frequency: 'high',
  },

  // DISCOVERED ATTACK - #4 most frequent (8,110 occurrences)
  {
    id: '800-discovered-1',
    name: 'Basic Discovered Attack',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: 'Nxe5',
    solutionSquare: 'e5',
    motif: 'discovered-attack',
    eloRating: 800,
    timeLimit: 8,
    hint: 'Moving your knight will unveil an attack.',
    explanation: 'Nxe5 discovers an attack on f7 from your Bc4. Double threats win games!',
    frequency: 'very-high',
  },
];

/**
 * ===== ELO 1000-1200: INTERMEDIATE DRILLS =====
 * Focus: "Big 4" variations + Back Rank + Double Attack
 * Time Limit: 6 seconds
 * Must solve 800-level drills in < 8 seconds before unlocking
 */

export const DRILLS_1200: TacticalDrill[] = [
  // More complex FORKS
  {
    id: '1200-fork-1',
    name: 'Knight Fork - Queen and Rook',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 0 1',
    solution: 'Nd4',
    solutionSquare: 'd4',
    motif: 'fork',
    eloRating: 1200,
    timeLimit: 6,
    hint: 'Your knight can fork the queen and bishop.',
    explanation: 'Nd4 forks queen on d1 and bishop on c4. Calculate this instantly!',
    frequency: 'very-high',
  },
  {
    id: '1200-fork-2',
    name: 'Bishop Fork (Royalty Fork)',
    fen: 'r2qkb1r/ppp2ppp/2n5/3pPb2/3Pn3/2N1BN2/PPP2PPP/R2QKB1R b KQkq - 0 1',
    solution: 'Bb4',
    solutionSquare: 'b4',
    motif: 'fork',
    eloRating: 1200,
    timeLimit: 6,
    hint: 'Your bishop can attack king and knight.',
    explanation: 'Bb4+ forks king and knight on c3. Bishops fork too!',
    frequency: 'high',
  },

  // DISCOVERED ATTACK variations
  {
    id: '1200-discovered-1',
    name: 'Discovered Check',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
    solution: 'Nxe5',
    solutionSquare: 'e5',
    motif: 'discovered-attack',
    eloRating: 1200,
    timeLimit: 6,
    hint: 'Your knight move will discover check.',
    explanation: 'Nxe5 discovers check from Bc4. Discovered checks are forcing!',
    frequency: 'very-high',
  },

  // BACK RANK MATE
  {
    id: '1200-backrank-1',
    name: 'Classic Back Rank',
    fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
    solution: 'Rd8#',
    solutionSquare: 'd8',
    motif: 'back-rank-mate',
    eloRating: 1200,
    timeLimit: 6,
    hint: 'The king is trapped by its own pawns.',
    explanation: 'Rd8# is mate! Back rank weaknesses are fatal.',
    frequency: 'high',
  },
  {
    id: '1200-backrank-2',
    name: 'Back Rank Threat',
    fen: '2r3k1/5ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1',
    solution: 'Rxc8#',
    solutionSquare: 'c8',
    motif: 'back-rank-mate',
    eloRating: 1200,
    timeLimit: 6,
    hint: 'Trade rooks with check.',
    explanation: 'Rxc8# is checkmate. Always watch your back rank!',
    frequency: 'high',
  },

  // DOUBLE ATTACK
  {
    id: '1200-double-1',
    name: 'Queen Double Attack',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/4P3/3P1N2/PPP2PPP/RNBQKB1R w KQkq - 0 1',
    solution: 'Qa4',
    solutionSquare: 'a4',
    motif: 'double-attack',
    eloRating: 1200,
    timeLimit: 6,
    hint: 'Your queen can attack two pieces.',
    explanation: 'Qa4 pins the c6 knight and threatens the e5 pawn.',
    frequency: 'high',
  },

  // More complex PINS
  {
    id: '1200-pin-1',
    name: 'Exploiting a Pin',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
    solution: 'Ng5',
    solutionSquare: 'g5',
    motif: 'pin',
    eloRating: 1200,
    timeLimit: 6,
    hint: 'Attack f7, which is pinned.',
    explanation: 'Ng5 attacks f7, which cannot move due to the pin. Exploit pins!',
    frequency: 'very-high',
  },
];

/**
 * ===== ELO 1400-1600: ADVANCED DRILLS =====
 * Focus: Deflection, X-Ray, Trapped Piece, Removing Defender
 * Time Limit: 5 seconds
 * Peak complexity for this ELO range per research
 */

export const DRILLS_1400: TacticalDrill[] = [
  // DEFLECTION - Peak at 1400 ELO
  {
    id: '1400-deflection-1',
    name: 'Deflect the Defender',
    fen: 'r2qkb1r/ppp2ppp/2n2n2/3pPb2/3P4/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 1',
    solution: 'exf6',
    solutionSquare: 'f6',
    motif: 'deflection',
    eloRating: 1400,
    timeLimit: 5,
    hint: 'Deflect the f7 pawn from defending the king.',
    explanation: 'exf6 deflects the defense. After gxf6 or Qxf6, lines open for attack.',
    frequency: 'high',
  },
  {
    id: '1400-deflection-2',
    name: 'Queen Deflection',
    fen: 'r2q1rk1/ppp2ppp/2n5/3pPb2/1b1P4/2N1BN2/PPP2PPP/R2QKB1R w KQ - 0 1',
    solution: 'Qd3',
    solutionSquare: 'd3',
    motif: 'deflection',
    eloRating: 1400,
    timeLimit: 5,
    hint: 'Force the queen away from defending.',
    explanation: 'Qd3 deflects the queen from defending the bishop on f5.',
    frequency: 'high',
  },

  // X-RAY ATTACK - Peak at 1400 ELO
  {
    id: '1400-xray-1',
    name: 'X-Ray Attack on King',
    fen: 'r4rk1/ppp2ppp/2n5/8/1b1P4/2N1Q3/PPP2PPP/R1B2RK1 w - - 0 1',
    solution: 'Qe8',
    solutionSquare: 'e8',
    motif: 'x-ray',
    eloRating: 1400,
    timeLimit: 5,
    hint: 'Your queen can x-ray through the rook.',
    explanation: 'Qe8! pins the rook via x-ray. X-rays see through pieces!',
    frequency: 'medium',
  },

  // TRAPPED PIECE - Peak at 1600 ELO
  {
    id: '1600-trapped-1',
    name: 'Trapped Bishop',
    fen: 'rnbqkb1r/pp1p1ppp/4pn2/2p5/2PP4/5N2/PP2PPPP/RNBQKB1R w KQkq - 0 1',
    solution: 'Qa4+',
    solutionSquare: 'a4',
    motif: 'trapped-piece',
    eloRating: 1600,
    timeLimit: 5,
    hint: 'The bishop has no good squares.',
    explanation: 'Qa4+ and the bishop on c8 is trapped after Nc6.',
    frequency: 'medium',
  },
  {
    id: '1600-trapped-2',
    name: 'Trapped Knight',
    fen: 'r1bqkb1r/pppp1ppp/2n5/4p3/2BnP3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1',
    solution: 'c6',
    solutionSquare: 'c6',
    motif: 'trapped-piece',
    eloRating: 1600,
    timeLimit: 5,
    hint: 'Trap the bishop with pawns.',
    explanation: 'c6 and b5 trap the bishop. Noah\'s Ark Trap pattern!',
    frequency: 'medium',
  },

  // REMOVING DEFENDER
  {
    id: '1400-removing-1',
    name: 'Remove the Key Defender',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b5/2BpP3/5N2/PPP2PPP/RNBQ1RK1 w kq - 0 1',
    solution: 'Bxf7+',
    solutionSquare: 'f7',
    motif: 'removing-defender',
    eloRating: 1400,
    timeLimit: 5,
    hint: 'The king defends a critical piece.',
    explanation: 'Bxf7+ removes the defender of d4. After Kxf7 Nxd4, material won.',
    frequency: 'medium',
  },
];

/**
 * ===== ELO 1800-2000: EXPERT DRILLS =====
 * Focus: Multi-step tactics, Zwischenzug, Greek Gift, Desperado
 * Time Limit: 4 seconds
 * Requires deep pattern recognition
 */

export const DRILLS_1800: TacticalDrill[] = [
  // GREEK GIFT SACRIFICE
  {
    id: '1800-greek-1',
    name: 'Greek Gift Sacrifice',
    fen: 'r1bq1rk1/ppp2ppp/2n2n2/3p4/1b1P4/2NBPN2/PPP2PPP/R1BQK2R w KQ - 0 1',
    solution: 'Bxh7+',
    solutionSquare: 'h7',
    motif: 'greek-gift',
    eloRating: 1800,
    timeLimit: 4,
    hint: 'Sacrifice on h7 to expose the king.',
    explanation: 'Bxh7+! Kxh7 Ng5+ and White wins the queen or delivers mate.',
    frequency: 'medium',
  },

  // ZWISCHENZUG (In-between move)
  {
    id: '1800-zwischenzug-1',
    name: 'In-Between Move',
    fen: 'r1bqk2r/ppp2ppp/2n5/3pPb2/1b1Pn3/2N2N2/PPP1QPPP/R1B1KB1R w KQkq - 0 1',
    solution: 'Nxd5',
    solutionSquare: 'd5',
    motif: 'zwischenzug',
    eloRating: 1800,
    timeLimit: 4,
    hint: 'Before recapturing, create a bigger threat.',
    explanation: 'Nxd5! threatens Nc7+ before dealing with e4. Zwischenzug wins material!',
    frequency: 'low',
  },

  // DESPERADO
  {
    id: '1800-desperado-1',
    name: 'Desperado Rook',
    fen: '2r3k1/5ppp/8/3R4/8/2P5/5PPP/6K1 w - - 0 1',
    solution: 'Rxc8+',
    solutionSquare: 'c8',
    motif: 'desperado',
    eloRating: 1800,
    timeLimit: 4,
    hint: 'Your rook is doomed - cause maximum damage.',
    explanation: 'Rxc8+! Desperado tactic - trade the doomed rook for maximum value.',
    frequency: 'low',
  },

  // ATTRACTION (advanced motif)
  {
    id: '1800-attraction-1',
    name: 'King Attraction',
    fen: 'r1bq1rk1/ppp2ppp/2n5/3pPb2/1b1Pn3/2N2N2/PPPBQPPP/R3KB1R w KQ - 0 1',
    solution: 'Qh5',
    solutionSquare: 'h5',
    motif: 'attraction',
    eloRating: 1800,
    timeLimit: 4,
    hint: 'Lure the king to a vulnerable square.',
    explanation: 'Qh5 threatens Qxh7#, forcing the king to h8 where it\'s vulnerable.',
    frequency: 'low',
  },
];

/**
 * ===== ELO 2000+: MASTER DRILLS =====
 * Focus: Deep calculation, quiet moves, complex sacrifices
 * Time Limit: 3 seconds (!!)
 * Only for players who have mastered all previous levels
 */

export const DRILLS_2000: TacticalDrill[] = [
  // Complex multi-move combinations
  {
    id: '2000-complex-1',
    name: 'Quiet Killer Move',
    fen: 'r2q1rk1/ppp2ppp/2n1bn2/3p4/3P1B2/2N1PN2/PPP1QPPP/R3K2R w KQ - 0 1',
    solution: 'Qd2',
    solutionSquare: 'd2',
    motif: 'attraction',
    eloRating: 2000,
    timeLimit: 3,
    hint: 'A quiet move sets up unstoppable threats.',
    explanation: 'Qd2! threatens Bh6 and Qg5 with overwhelming attack. Quiet moves kill!',
    frequency: 'low',
  },
  {
    id: '2000-complex-2',
    name: 'Interference Tactic',
    fen: 'r2qr1k1/ppp2ppp/2n5/3pPb2/1b1P4/2N1BN2/PPP2PPP/R2QKB1R w KQ - 0 1',
    solution: 'Nd5',
    solutionSquare: 'd5',
    motif: 'interference',
    eloRating: 2000,
    timeLimit: 3,
    hint: 'Cut the connection between defenders.',
    explanation: 'Nd5! interferes with the c6 knight\'s defense. Advanced geometry!',
    frequency: 'low',
  },
  {
    id: '2000-complex-3',
    name: 'Clearance Sacrifice',
    fen: 'r1bq1rk1/pp3ppp/2n1pn2/3p4/1b1P1B2/2N1PN2/PPP1QPPP/R3KB1R w KQ - 0 1',
    solution: 'Bxf6',
    solutionSquare: 'f6',
    motif: 'clearance',
    eloRating: 2000,
    timeLimit: 3,
    hint: 'Clear the path for your pieces.',
    explanation: 'Bxf6 clears the f-file and opens lines for devastating attack.',
    frequency: 'low',
  },
];

/**
 * ALL DRILLS BY ELO
 */
export const DRILLS_BY_ELO: Record<ELORating, TacticalDrill[]> = {
  800: DRILLS_800,
  1000: DRILLS_1200, // Reuse 1200 for gradual progression
  1200: DRILLS_1200,
  1400: DRILLS_1400,
  1600: DRILLS_1400, // Reuse 1400 - focus is on speed mastery
  1800: DRILLS_1800,
  2000: DRILLS_2000,
};

export const ALL_DRILLS: TacticalDrill[] = [
  ...DRILLS_800,
  ...DRILLS_1200,
  ...DRILLS_1400,
  ...DRILLS_1800,
  ...DRILLS_2000,
];

/**
 * DRILLS BY MOTIF (for targeted training)
 */
export const DRILLS_BY_MOTIF: Partial<Record<TacticalMotif, TacticalDrill[]>> = {
  'fork': ALL_DRILLS.filter(d => d.motif === 'fork'),
  'hanging-piece': ALL_DRILLS.filter(d => d.motif === 'hanging-piece'),
  'pin': ALL_DRILLS.filter(d => d.motif === 'pin'),
  'discovered-attack': ALL_DRILLS.filter(d => d.motif === 'discovered-attack'),
  'skewer': ALL_DRILLS.filter(d => d.motif === 'skewer'),
  'back-rank-mate': ALL_DRILLS.filter(d => d.motif === 'back-rank-mate'),
  'deflection': ALL_DRILLS.filter(d => d.motif === 'deflection'),
  'x-ray': ALL_DRILLS.filter(d => d.motif === 'x-ray'),
  'trapped-piece': ALL_DRILLS.filter(d => d.motif === 'trapped-piece'),
  'greek-gift': ALL_DRILLS.filter(d => d.motif === 'greek-gift'),
  'zwischenzug': ALL_DRILLS.filter(d => d.motif === 'zwischenzug'),
};

/**
 * Get drills for specific ELO rating
 */
export function getDrillsByELO(elo: ELORating): TacticalDrill[] {
  return DRILLS_BY_ELO[elo] || DRILLS_800;
}

/**
 * Get drills by motif
 */
export function getDrillsByMotif(motif: TacticalMotif): TacticalDrill[] {
  return DRILLS_BY_MOTIF[motif] || [];
}

/**
 * Get "Big 4" drills (highest frequency tactics)
 */
export function getBig4Drills(elo: ELORating = 800): TacticalDrill[] {
  const allDrills = getDrillsByELO(elo);
  return allDrills.filter(d =>
    d.motif === 'fork' ||
    d.motif === 'hanging-piece' ||
    d.motif === 'discovered-attack' ||
    d.motif === 'pin'
  );
}

/**
 * Get next ELO tier
 */
export function getNextELOTier(currentELO: ELORating): ELORating | null {
  const tiers: ELORating[] = [800, 1000, 1200, 1400, 1600, 1800, 2000];
  const currentIndex = tiers.indexOf(currentELO);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
}

/**
 * Get motif display name
 */
export function getMotifDisplayName(motif: TacticalMotif): string {
  const names: Record<TacticalMotif, string> = {
    'fork': 'Fork',
    'hanging-piece': 'Hanging Piece',
    'pin': 'Pin',
    'discovered-attack': 'Discovered Attack',
    'skewer': 'Skewer',
    'back-rank-mate': 'Back Rank Mate',
    'double-attack': 'Double Attack',
    'deflection': 'Deflection',
    'x-ray': 'X-Ray Attack',
    'trapped-piece': 'Trapped Piece',
    'removing-defender': 'Removing Defender',
    'greek-gift': 'Greek Gift',
    'zwischenzug': 'Zwischenzug',
    'desperado': 'Desperado',
    'smothered-mate': 'Smothered Mate',
    'attraction': 'Attraction',
    'clearance': 'Clearance',
    'interference': 'Interference',
  };
  return names[motif] || motif;
}

/**
 * Calculate speed rating based on time used
 * Returns: "flash" | "fast" | "good" | "slow" | "too-slow"
 */
export function calculateSpeedRating(timeLimit: number, timeUsed: number): string {
  const percentage = (timeUsed / timeLimit) * 100;

  if (percentage <= 40) return 'flash';      // Solved in < 40% of time
  if (percentage <= 60) return 'fast';       // Solved in < 60% of time
  if (percentage <= 80) return 'good';       // Solved in < 80% of time
  if (percentage <= 100) return 'slow';      // Solved before timeout
  return 'too-slow';                         // Failed to solve
}

/**
 * Check if player can advance to next ELO tier
 * Requirement: 80% accuracy + 70% solved in "fast" or "flash" time
 */
export function canAdvanceToNextTier(
  accuracy: number,
  flashCount: number,
  fastCount: number,
  totalAttempts: number
): boolean {
  const speedPercentage = ((flashCount + fastCount) / totalAttempts) * 100;
  return accuracy >= 80 && speedPercentage >= 70;
}
