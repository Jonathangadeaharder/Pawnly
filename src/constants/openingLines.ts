/**
 * Sample Opening Lines Data
 * Example repertoire for King's Indian Attack and other universal systems
 */

import type { OpeningLine, OpeningSystem } from '../types';

/**
 * King's Indian Attack (KIA) - Main Lines
 */
export const KIA_MAIN_LINE: OpeningLine = {
  id: 'kia-main-1',
  system: 'kings-indian-attack',
  name: 'KIA: Classic Setup vs ...e6',
  moves: ['Nf3', 'g3', 'Bg2', 'd3', 'O-O', 'Nbd2', 'e4'],
  targetFen: 'rnbqkb1r/pppp1ppp/4pn2/8/4P3/3P1NP1/PPPN1PBP/R1BQ1RK1 b kq - 0 1',
  variations: [
    {
      id: 'kia-var-1',
      name: 'Against French Defense setup',
      moves: ['Nf3', 'g3', 'Bg2', 'O-O', 'd3', 'Nbd2', 'e4', 'Re1'],
      explanation: 'This transposes to the KIA against Black\'s French-style setup with ...e6 and ...d5',
    },
  ],
  concepts: [
    'Kingside fianchetto',
    'Central control with e4',
    'Flexible piece development',
    'Kingside attack preparation',
  ],
};

export const KIA_VS_CARO: OpeningLine = {
  id: 'kia-caro-1',
  system: 'kings-indian-attack',
  name: 'KIA vs Caro-Kann Setup',
  moves: ['Nf3', 'g3', 'Bg2', 'O-O', 'd3', 'Nbd2'],
  targetFen: 'rnbqkbnr/pp2pppp/2p5/3p4/8/3P1NP1/PPPN1PBP/R1BQK2R w KQkq - 0 1',
  variations: [
    {
      id: 'kia-caro-var-1',
      name: 'Solid central control',
      moves: ['Nf3', 'g3', 'Bg2', 'O-O', 'd3', 'Nbd2', 'e4'],
      explanation: 'We establish strong central presence while maintaining flexibility',
    },
  ],
  concepts: [
    'Universal setup',
    'Avoiding main line theory',
    'Central tension',
  ],
};

/**
 * Colle System - Main Lines
 */
export const COLLE_MAIN: OpeningLine = {
  id: 'colle-main-1',
  system: 'colle-system',
  name: 'Colle System: Standard Setup',
  moves: ['d4', 'Nf3', 'e3', 'Bd3', 'O-O', 'Nbd2', 'c3'],
  targetFen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P4/2PBPN2/PP1N1PPP/R1BQK2R b KQkq - 0 1',
  variations: [
    {
      id: 'colle-var-1',
      name: 'Central break with e4',
      moves: ['d4', 'Nf3', 'e3', 'Bd3', 'Nbd2', 'O-O', 'e4'],
      explanation: 'The key thematic break in the Colle - we launch e4 to open lines',
    },
  ],
  concepts: [
    'Slow positional buildup',
    'e4 central break',
    'Kingside pressure',
    'Safe king position',
  ],
};

/**
 * Stonewall Attack - Main Lines
 */
export const STONEWALL_MAIN: OpeningLine = {
  id: 'stonewall-main-1',
  system: 'stonewall-attack',
  name: 'Stonewall: Classic Formation',
  moves: ['d4', 'e3', 'Bd3', 'Nd2', 'f4', 'Nf3', 'O-O'],
  targetFen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1P2/3BPN2/PPPN2PP/R1BQK2R b KQkq - 0 1',
  variations: [
    {
      id: 'stonewall-var-1',
      name: 'Stonewall pawn chain',
      moves: ['d4', 'e3', 'f4', 'Nf3', 'Bd3', 'O-O', 'Nbd2'],
      explanation: 'The characteristic d4-e3-f4 pawn chain controls e5 and prepares kingside attack',
    },
  ],
  concepts: [
    'Pawn chain d4-e3-f4',
    'Control of e5 square',
    'Bad light-squared bishop',
    'Kingside attack with pawns',
  ],
};

/**
 * London System - Main Lines
 */
export const LONDON_MAIN: OpeningLine = {
  id: 'london-main-1',
  system: 'london-system',
  name: 'London System: Standard Setup',
  moves: ['d4', 'Nf3', 'Bf4', 'e3', 'Nbd2', 'c3', 'Bd3'],
  targetFen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/2PBPN2/PP1N1PPP/R2QK2R b KQkq - 0 1',
  variations: [
    {
      id: 'london-var-1',
      name: 'Early Bf4 development',
      moves: ['d4', 'Bf4', 'Nf3', 'e3', 'Bd3', 'Nbd2', 'c3'],
      explanation: 'Developing the bishop early to avoid being locked in by e3',
    },
  ],
  concepts: [
    'Bishop outside the pawn chain',
    'Solid central control',
    'Flexible piece placement',
  ],
};

/**
 * Torre Attack - Main Lines
 */
export const TORRE_MAIN: OpeningLine = {
  id: 'torre-main-1',
  system: 'torre-attack',
  name: 'Torre Attack: Classical',
  moves: ['d4', 'Nf3', 'Bg5', 'Nbd2', 'e3', 'Bd3', 'c3'],
  targetFen: 'rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/2PBPN2/PP1N1PPP/R2QK2R b KQkq - 0 1',
  variations: [
    {
      id: 'torre-var-1',
      name: 'Pin on the knight',
      moves: ['d4', 'Nf3', 'Bg5', 'e3', 'Nbd2', 'Bd3', 'c3'],
      explanation: 'The bishop on g5 pins the knight and controls key central squares',
    },
  ],
  concepts: [
    'Early Bg5 pin',
    'Central control',
    'Flexible pawn structure',
  ],
};

/**
 * Common tactical patterns in universal systems
 */
export const TACTICAL_PATTERNS: OpeningLine[] = [
  {
    id: 'pattern-greek-gift',
    system: 'kings-indian-attack',
    name: 'Greek Gift Sacrifice',
    moves: ['Nf3', 'g3', 'Bg2', 'O-O', 'd3', 'Nbd2', 'e4', 'Re1', 'Bxh7+'],
    targetFen: 'r1bq1rk1/pppn1pBp/4pn2/3p4/3PP3/3P1NP1/PPPN1P1P/R1BQR1K1 b - - 0 1',
    variations: [],
    concepts: ['Tactical sacrifice', 'Kingside attack', 'Bishop sacrifice on h7'],
  },
];

/**
 * Additional KIA Lines
 */
export const KIA_VS_SICILIAN: OpeningLine = {
  id: 'kia-sicilian-1',
  system: 'kings-indian-attack',
  name: 'KIA vs Sicilian',
  moves: ['Nf3', 'g3', 'Bg2', 'd3', 'O-O', 'e4', 'Nbd2'],
  targetFen: 'rnbqkbnr/pp1ppppp/8/2p5/4P3/3P1NP1/PPPN1PBP/R1BQK2R b KQkq - 0 1',
  variations: [
    {
      id: 'kia-sicilian-var-1',
      name: 'Central pressure',
      moves: ['Nf3', 'g3', 'Bg2', 'O-O', 'd3', 'e4', 'Nbd2', 'c3'],
      explanation: 'Building solid center before launching kingside attack',
    },
  ],
  concepts: ['Reverse Dragon formation', 'Central control', 'Kingside pressure'],
};

/**
 * Additional Colle Lines
 */
export const COLLE_VS_SLAV: OpeningLine = {
  id: 'colle-slav-1',
  system: 'colle-system',
  name: 'Colle vs Slav Defense',
  moves: ['d4', 'Nf3', 'e3', 'Bd3', 'Nbd2', 'c3', 'O-O'],
  targetFen: 'rnbqkb1r/pp2pppp/2p2n2/3p4/3P4/2PBPN2/PP1N1PPP/R1BQK2R b KQkq - 0 1',
  variations: [
    {
      id: 'colle-slav-var-1',
      name: 'Preparing e4',
      moves: ['d4', 'Nf3', 'e3', 'Bd3', 'Nbd2', 'O-O', 'c3', 'e4'],
      explanation: 'All pieces support the e4 advance',
    },
  ],
  concepts: ['Methodical development', 'e4 preparation', 'Solid structure'],
};

/**
 * Additional Stonewall Lines
 */
export const STONEWALL_VS_KID: OpeningLine = {
  id: 'stonewall-kid-1',
  system: 'stonewall-attack',
  name: 'Stonewall vs King\'s Indian',
  moves: ['d4', 'e3', 'Bd3', 'f4', 'Nf3', 'O-O', 'c3'],
  targetFen: 'rnbqk2r/ppp1ppbp/5np1/3p4/3P1P2/2PBPN2/PP4PP/RNBQ1RK1 b kq - 0 1',
  variations: [
    {
      id: 'stonewall-kid-var-1',
      name: 'Controlling e5',
      moves: ['d4', 'e3', 'Bd3', 'f4', 'Nf3', 'O-O', 'c3', 'Qe2'],
      explanation: 'Solid formation controlling key e5 square',
    },
  ],
  concepts: ['Anti-KID', 'Central blockade', 'Piece vs pawn center'],
};

/**
 * Additional London Lines
 */
export const LONDON_VS_KID: OpeningLine = {
  id: 'london-kid-1',
  system: 'london-system',
  name: 'London vs King\'s Indian',
  moves: ['d4', 'Nf3', 'Bf4', 'e3', 'h3', 'Nbd2', 'Bd3'],
  targetFen: 'rnbqk2r/ppp1ppbp/5np1/3p4/3P1B2/3BPN1P/PPP2PP1/RN1QK2R b KQkq - 0 1',
  variations: [
    {
      id: 'london-kid-var-1',
      name: 'h3 and g4 plan',
      moves: ['d4', 'Nf3', 'Bf4', 'e3', 'h3', 'Bd3', 'Nbd2', 'g4'],
      explanation: 'Kingside expansion with h3-g4',
    },
  ],
  concepts: ['Space advantage', 'Kingside expansion', 'Bishop retreat to g3'],
};

export const LONDON_ACCELERATED: OpeningLine = {
  id: 'london-accelerated-1',
  system: 'london-system',
  name: 'Accelerated London',
  moves: ['d4', 'Bf4', 'e3', 'Nf3', 'Bd3', 'c3', 'Nbd2'],
  targetFen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/2PBPN2/PP1N1PPP/R2QK2R b KQkq - 0 1',
  variations: [
    {
      id: 'london-accel-var-1',
      name: 'Early Bf4',
      moves: ['d4', 'Bf4', 'Nf3', 'e3', 'Bd3', 'Nbd2', 'c3'],
      explanation: 'Developing bishop immediately on move 2',
    },
  ],
  concepts: ['Move order flexibility', 'Early piece development', 'Solid setup'],
};

/**
 * Additional Torre Lines
 */
export const TORRE_VS_KID: OpeningLine = {
  id: 'torre-kid-1',
  system: 'torre-attack',
  name: 'Torre vs King\'s Indian',
  moves: ['d4', 'Nf3', 'Bg5', 'Nbd2', 'e3', 'c3', 'Bd3'],
  targetFen: 'rnbqk2r/ppp1ppbp/5np1/3p2B1/3P4/2PBPN2/PP1N1PPP/R2QK2R b KQkq - 0 1',
  variations: [
    {
      id: 'torre-kid-var-1',
      name: 'Central control',
      moves: ['d4', 'Nf3', 'Bg5', 'Nbd2', 'e3', 'Bd3', 'c3', 'Ne5'],
      explanation: 'Ne5 outpost is powerful in this structure',
    },
  ],
  concepts: ['Pin on f6', 'Ne5 outpost', 'Central domination'],
};

export const TORRE_VERESOV: OpeningLine = {
  id: 'torre-veresov-1',
  system: 'torre-attack',
  name: 'Torre-Veresov Hybrid',
  moves: ['d4', 'Nf3', 'Bg5', 'Nbd2', 'e3', 'Bd3', 'O-O'],
  targetFen: 'rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/3BPN2/PPPN1PPP/R2QK2R b KQkq - 0 1',
  variations: [
    {
      id: 'torre-veresov-var-1',
      name: 'Solid development',
      moves: ['d4', 'Nf3', 'Bg5', 'e3', 'Nbd2', 'Bd3', 'O-O', 'c3'],
      explanation: 'Combining Torre pin with solid Colle-like setup',
    },
  ],
  concepts: ['Hybrid system', 'Flexible development', 'Safe king'],
};

/**
 * All opening lines organized by system
 */
export const OPENING_LINES_BY_SYSTEM: Record<OpeningSystem, OpeningLine[]> = {
  'kings-indian-attack': [KIA_MAIN_LINE, KIA_VS_CARO, KIA_VS_SICILIAN],
  'colle-system': [COLLE_MAIN, COLLE_VS_SLAV],
  'stonewall-attack': [STONEWALL_MAIN, STONEWALL_VS_KID],
  'london-system': [LONDON_MAIN, LONDON_VS_KID, LONDON_ACCELERATED],
  'torre-attack': [TORRE_MAIN, TORRE_VS_KID, TORRE_VERESOV],
};

/**
 * Get all lines for a specific system
 */
export function getOpeningLinesForSystem(system: OpeningSystem): OpeningLine[] {
  return OPENING_LINES_BY_SYSTEM[system] || [];
}

/**
 * Get a random opening line for practice
 */
export function getRandomOpeningLine(system?: OpeningSystem): OpeningLine {
  if (system) {
    const lines = getOpeningLinesForSystem(system);
    return lines[Math.floor(Math.random() * lines.length)];
  }

  // Get from all systems
  const allLines = Object.values(OPENING_LINES_BY_SYSTEM).flat();
  return allLines[Math.floor(Math.random() * allLines.length)];
}

/**
 * Get opening line by ID
 */
export function getOpeningLineById(id: string): OpeningLine | undefined {
  const allLines = Object.values(OPENING_LINES_BY_SYSTEM).flat();
  return allLines.find(line => line.id === id);
}
