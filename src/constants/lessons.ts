/**
 * Lesson Content
 * Structured curriculum for learning universal chess opening systems
 */

import type { OpeningSystem } from '../types';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  system: OpeningSystem;
  order: number;
  estimatedMinutes: number;
  content: LessonContent[];
  completed?: boolean;
}

export interface LessonContent {
  type: 'text' | 'diagram' | 'interactive' | 'concept';
  heading?: string;
  text?: string;
  fen?: string;
  highlightSquares?: string[];
  conceptId?: string;
}

/**
 * King's Indian Attack Lessons
 */
export const KIA_LESSONS: Lesson[] = [
  {
    id: 'kia-lesson-1',
    title: 'Introduction to the KIA',
    description: 'Learn the basic setup and strategic ideas',
    system: 'kings-indian-attack',
    order: 1,
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        heading: 'Welcome to the King\'s Indian Attack',
        text: 'The King\'s Indian Attack (KIA) is a flexible opening system that White can play against almost any Black setup. It features a solid pawn structure and natural piece development.',
      },
      {
        type: 'diagram',
        heading: 'The Basic KIA Setup',
        text: 'White\'s ideal setup includes: pawns on d3, e4, and g3, knights on f3 and d2, bishop on g2, and castling kingside.',
        fen: 'rnbqkb1r/pppppppp/5n2/8/4P3/5NP1/PPPP1PBP/RNBQK2R w KQkq - 0 1',
        highlightSquares: ['e4', 'd3', 'g3', 'f3', 'g2'],
      },
      {
        type: 'text',
        heading: 'Key Strategic Ideas',
        text: 'The KIA is fundamentally about the kingside attack. White develops all pieces toward the kingside, then launches a pawn storm with f4-f5, g4-g5, and sometimes h4-h5. The fianchettoed bishop on g2 controls the long diagonal and supports both attack and defense.',
      },
      {
        type: 'interactive',
        heading: 'Practice the Setup',
        text: 'Try setting up the basic KIA position. Play the moves: 1.Nf3, 2.g3, 3.Bg2, 4.O-O, 5.d3, 6.Nbd2, 7.e4',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      },
    ],
  },
  {
    id: 'kia-lesson-2',
    title: 'The Central Break: e4',
    description: 'Master the thematic central advance',
    system: 'kings-indian-attack',
    order: 2,
    estimatedMinutes: 12,
    content: [
      {
        type: 'text',
        heading: 'Why e4 is Critical',
        text: 'The move e4 transforms the KIA from a quiet setup into an aggressive attacking formation. It establishes central control, opens the long diagonal for the g2 bishop, and prepares the f4-f5 pawn storm.',
      },
      {
        type: 'diagram',
        heading: 'Perfect Timing for e4',
        text: 'Play e4 after completing your development: Nf3, g3, Bg2, O-O, d3, Nbd2. This ensures you\'re ready to handle Black\'s central counterplay.',
        fen: 'rnbqkb1r/pppp1ppp/4pn2/8/4P3/3P1NP1/PPP2PBP/RNBQK2R w KQkq - 0 5',
        highlightSquares: ['e4', 'd3', 'g2'],
      },
      {
        type: 'concept',
        conceptId: 'kia-concept-2',
      },
      {
        type: 'text',
        heading: 'After e4',
        text: 'Once e4 is established, White follows with Qe2 (connecting rooks), Re1 (supporting e4), and prepares f4-f5 to launch the kingside attack. The d3-e4 pawn duo controls key central squares and gives White a space advantage.',
      },
    ],
  },
  {
    id: 'kia-lesson-3',
    title: 'The Kingside Attack',
    description: 'Learn how to execute the pawn storm',
    system: 'kings-indian-attack',
    order: 3,
    estimatedMinutes: 15,
    content: [
      {
        type: 'text',
        heading: 'The Pawn Storm Strategy',
        text: 'After establishing the e4 central stronghold, White launches a direct attack on Black\'s kingside with f4-f5, g4-g5, and h4-h5. These pawn advances create threats, open files, and weaken Black\'s king position.',
      },
      {
        type: 'diagram',
        heading: 'The Attack in Motion',
        text: 'White has played f4 and is preparing f5 to gain space and open attacking lines. Notice how all White\'s pieces support the kingside assault.',
        fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1PP2/2NP1NP1/PPP3BP/R1BQ1RK1 w - - 0 9',
        highlightSquares: ['f4', 'f5', 'g4', 'h4'],
      },
      {
        type: 'text',
        heading: 'Piece Coordination',
        text: 'The pawn storm is only effective when supported by pieces. The g2 bishop controls the long diagonal, the f3 knight can jump to e5 or g5, the queen can swing to h5 or f3, and the rooks can occupy the e- and f-files.',
      },
      {
        type: 'concept',
        conceptId: 'kia-concept-1',
      },
    ],
  },
];

/**
 * Stonewall Attack Lessons
 */
export const STONEWALL_LESSONS: Lesson[] = [
  {
    id: 'stonewall-lesson-1',
    title: 'The Stonewall Structure',
    description: 'Understand the pawn chain and its implications',
    system: 'stonewall-attack',
    order: 1,
    estimatedMinutes: 12,
    content: [
      {
        type: 'text',
        heading: 'The Stonewall Pawn Chain',
        text: 'The Stonewall Attack is built around a rock-solid pawn chain: pawns on d4, e3, and f4. This structure is incredibly stable but comes with a significant positional cost.',
      },
      {
        type: 'diagram',
        heading: 'The Basic Formation',
        text: 'White\'s pawns form a pyramid pointing at Black\'s kingside. The d4-e3-f4 chain controls key central squares but locks in the light-squared bishop.',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P1P2/4P3/PPP3PP/RNBQKBNR w KQkq - 0 3',
        highlightSquares: ['d4', 'e3', 'f4'],
      },
      {
        type: 'concept',
        conceptId: 'stonewall-concept-1',
      },
      {
        type: 'text',
        heading: 'Strengths and Weaknesses',
        text: 'Strengths: Solid central control, natural attacking chances on the kingside, simple to learn. Weaknesses: Bad light-squared bishop, weak e4 square, less flexible than other systems.',
      },
    ],
  },
  {
    id: 'stonewall-lesson-2',
    title: 'Handling the Bad Bishop',
    description: 'Learn how to manage your problematic piece',
    system: 'stonewall-attack',
    order: 2,
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        heading: 'The Light-Square Problem',
        text: 'In the Stonewall, White\'s light-squared bishop is blocked by the d4-e3-f4 pawn chain. This is the main positional drawback of the system.',
      },
      {
        type: 'diagram',
        heading: 'Develop Before Blocking',
        text: 'The key is to play Bd3 BEFORE completing the pawn chain with f4. This way, the bishop is actively placed before it gets locked in.',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1P2/3BPN2/PPP3PP/RNBQK2R w KQkq - 0 5',
        highlightSquares: ['d3', 'c1'],
      },
      {
        type: 'text',
        heading: 'Alternative: Trade It Off',
        text: 'If you didn\'t get Bd3 in early, consider trading the bishop. You can maneuver it via Bd2-e1-h4 or Bd2-c1-g5 to exchange it for Black\'s pieces. A bad piece is often worth trading even if the opponent\'s piece is better.',
      },
      {
        type: 'concept',
        conceptId: 'general-concept-1',
      },
    ],
  },
];

/**
 * Colle System Lessons
 */
export const COLLE_LESSONS: Lesson[] = [
  {
    id: 'colle-lesson-1',
    title: 'Introduction to the Colle',
    description: 'Learn the quiet but effective Colle System',
    system: 'colle-system',
    order: 1,
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        heading: 'The Colle System',
        text: 'The Colle System is one of the most solid and reliable openings for White. It features simple development and a powerful thematic break in the center.',
      },
      {
        type: 'diagram',
        heading: 'The Typical Setup',
        text: 'White develops with d4, Nf3, e3, Bd3, O-O, Nbd2, and c3. Every piece has a natural square and a clear purpose.',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P4/3BPN2/PPP2PPP/RNBQK2R w KQkq - 0 5',
        highlightSquares: ['d4', 'e3', 'd3', 'f3', 'd2'],
      },
      {
        type: 'text',
        heading: 'Simple but Effective',
        text: 'The beauty of the Colle is its simplicity. You develop your pieces to natural squares, castle quickly, and then execute the powerful e3-e4 break. Black has few ways to prevent this plan.',
      },
    ],
  },
  {
    id: 'colle-lesson-2',
    title: 'The e4 Break',
    description: 'Master the critical central thrust',
    system: 'colle-system',
    order: 2,
    estimatedMinutes: 12,
    content: [
      {
        type: 'text',
        heading: 'The Thematic Break',
        text: 'The move e3-e4 is the heart and soul of the Colle System. This pawn break transforms a quiet position into a dynamic battle.',
      },
      {
        type: 'diagram',
        heading: 'Ready for e4',
        text: 'White has completed development with all pieces supporting the e4 advance. The Nbd2 is crucial - it will recapture on e4 if Black takes.',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P4/3BPN2/PPPN1PPP/R1BQK2R w KQkq - 0 6',
        highlightSquares: ['e3', 'e4', 'd2'],
      },
      {
        type: 'concept',
        conceptId: 'colle-concept-1',
      },
      {
        type: 'text',
        heading: 'After the Break',
        text: 'Following e4 dxe4 Nxe4, White has achieved an active central knight and open lines for attack. The Bd3 and queen can quickly create threats on the kingside, often with Qe2-h5 or Ng5.',
      },
    ],
  },
];

/**
 * London System Lessons
 */
export const LONDON_LESSONS: Lesson[] = [
  {
    id: 'london-lesson-1',
    title: 'The London Setup',
    description: 'Learn the ultra-solid London System',
    system: 'london-system',
    order: 1,
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        heading: 'The London System',
        text: 'The London System has become one of the most popular openings at all levels. It\'s solid, flexible, and can be played against almost any Black setup.',
      },
      {
        type: 'diagram',
        heading: 'The Basic London',
        text: 'White plays d4, Nf3, Bf4 (the key move), e3, Bd3, Nbd2, and c3. The Bf4 is played early to avoid blocking it with e3.',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/4PN2/PPP2PPP/RN1QKB1R w KQkq - 0 4',
        highlightSquares: ['d4', 'f4', 'e3', 'd3'],
      },
      {
        type: 'text',
        heading: 'Why Bf4?',
        text: 'The early Bf4 is what distinguishes the London from other d4 systems. By developing the bishop outside the pawn chain before playing e3, White avoids the \"bad bishop\" problem that plagues the Stonewall Attack.',
      },
    ],
  },
  {
    id: 'london-lesson-2',
    title: 'The h3 and g4 Plan',
    description: 'Learn the aggressive kingside expansion',
    system: 'london-system',
    order: 2,
    estimatedMinutes: 12,
    content: [
      {
        type: 'text',
        heading: 'Kingside Expansion',
        text: 'One of the London\'s key plans is the h3 and g4 pawn advance. This gains space on the kingside and prepares to support the Bf4 if Black tries to challenge it with ...Nh5.',
      },
      {
        type: 'diagram',
        heading: 'Prepared for g4',
        text: 'After completing the basic setup, White plays h3 and g4. If Black plays ...Nh5 to challenge the bishop, White can play Bg3 and the knight has no good square.',
        fen: 'r1bqkb1r/ppp2ppp/2n2n2/3pp3/3P1BP1/3BPN1P/PPP3P1/RN1QK2R w KQkq - 0 7',
        highlightSquares: ['h3', 'g4', 'f4', 'g3'],
      },
      {
        type: 'text',
        heading: 'Strategic Benefits',
        text: 'The h3-g4 plan serves multiple purposes: it gives the Bf4 a retreat square on g3, gains kingside space, and can support a later f2-f4 advance for central expansion. This makes the London much more dynamic than it appears.',
      },
    ],
  },
  {
    id: 'london-lesson-3',
    title: 'Flexible Piece Placement',
    description: 'Adapt to Black\'s setup',
    system: 'london-system',
    order: 3,
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        heading: 'Adapting to Black',
        text: 'The London\'s strength is its flexibility. The basic structure (d4, Nf3, Bf4, e3, Bd3) stays the same, but you can adjust your piece placement based on Black\'s setup.',
      },
      {
        type: 'diagram',
        heading: 'Against Different Setups',
        text: 'Whether Black plays ...e6 and ...c5 (attacking the center) or ...g6 (King\'s Indian style), the London gives you a solid foundation. Adjust with moves like Ne5, c3, or Qe2 as needed.',
        fen: 'rnbqk2r/ppp1ppbp/5np1/3p4/3P1B2/3BPN2/PPP2PPP/RN1QK2R w KQkq - 0 6',
        highlightSquares: ['e5', 'c3', 'e2'],
      },
      {
        type: 'text',
        heading: 'Universal System',
        text: 'This flexibility is why the London is called a "system" rather than an "opening." You can reach your ideal setup regardless of Black\'s move order, making it perfect for players who want a reliable weapon without memorizing endless variations.',
      },
    ],
  },
];

/**
 * Torre Attack Lessons
 */
export const TORRE_LESSONS: Lesson[] = [
  {
    id: 'torre-lesson-1',
    title: 'Introduction to the Torre',
    description: 'Learn the aggressive Torre Attack',
    system: 'torre-attack',
    order: 1,
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        heading: 'The Torre Attack',
        text: 'The Torre Attack is a dynamic opening that combines solid development with aggressive possibilities, particularly the famous Bg5-h4-g3 maneuver.',
      },
      {
        type: 'diagram',
        heading: 'The Torre Setup',
        text: 'White plays d4, Nf3, Bg5, e3, Nbd2, Bd3, and c3. The Bg5 is the hallmark move, putting immediate pressure on Black\'s position.',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/4PN2/PPP2PPP/RN1QKB1R w KQkq - 0 4',
        highlightSquares: ['d4', 'g5', 'e3', 'd3'],
      },
      {
        type: 'text',
        heading: 'Aggressive Intent',
        text: 'Unlike the solid Colle or London, the Torre Attack immediately creates tactical threats. The Bg5 pins Black\'s knight or bishop, and White can follow up with aggressive plans like Ne5 or the Bg5-h4-g3 maneuver.',
      },
    ],
  },
  {
    id: 'torre-lesson-2',
    title: 'The Bg5-h4-g3 Maneuver',
    description: 'Master the signature Torre bishop retreat',
    system: 'torre-attack',
    order: 2,
    estimatedMinutes: 12,
    content: [
      {
        type: 'text',
        heading: 'The Famous Maneuver',
        text: 'The Bg5-h4-g3 maneuver is the Torre Attack\'s trademark. When Black plays ...h6 to challenge the bishop, White retreats to h4. If Black continues with ...g5, the bishop goes to g3 where it controls key central squares.',
      },
      {
        type: 'diagram',
        heading: 'Bishop on g3',
        text: 'After Bg5-h4-g3, the bishop is beautifully placed. It controls e5, can support Ne5 or f2-f4, and Black\'s kingside has been weakened by ...h6 and ...g5.',
        fen: 'rnbqkb1r/p1p1pp1p/7p/3p2p1/3P4/4PNB1/PPP2PPP/RN1QKB1R w KQkq - 0 6',
        highlightSquares: ['g3', 'e5', 'f4'],
      },
      {
        type: 'text',
        heading: 'Strategic Gains',
        text: 'This maneuver achieves multiple goals: the bishop reaches an excellent square, Black\'s kingside is weakened, and White can build an attack with Ne5, f4, and Qf3. Meanwhile, Black\'s pawns on h6 and g5 become long-term weaknesses.',
      },
    ],
  },
  {
    id: 'torre-lesson-3',
    title: 'Central Outpost on e5',
    description: 'Occupy the key e5 square',
    system: 'torre-attack',
    order: 3,
    estimatedMinutes: 10,
    content: [
      {
        type: 'text',
        heading: 'The e5 Outpost',
        text: 'The Torre Attack often revolves around establishing a knight on e5. Combined with the Bg3, this creates tremendous pressure on Black\'s position.',
      },
      {
        type: 'diagram',
        heading: 'Knight on e5',
        text: 'With the knight securely placed on e5 and the bishop supporting from g3, White has a powerful setup. The knight dominates the center and can\'t easily be challenged.',
        fen: 'rnbqk2r/ppp1ppbp/5np1/3pN1B1/3P4/4P3/PPP2PPP/RN1QKB1R w KQkq - 0 6',
        highlightSquares: ['e5', 'g3', 'd4'],
      },
      {
        type: 'text',
        heading: 'Building the Attack',
        text: 'From e5, the knight can jump to f7 or g6 to create threats, or support a pawn storm with f4-f5. The bishop on g3 adds extra pressure. This central domination is the heart of the Torre Attack\'s aggressive nature.',
      },
    ],
  },
];

/**
 * INTERMEDIATE LESSONS
 * More advanced strategic concepts for each opening system
 */

/**
 * King's Indian Attack - Intermediate
 */
export const KIA_INTERMEDIATE_LESSONS: Lesson[] = [
  {
    id: 'kia-int-1',
    title: 'Handling Central Counterplay',
    description: 'Learn how to respond when Black challenges your center',
    system: 'kings-indian-attack',
    order: 4,
    estimatedMinutes: 15,
    content: [
      {
        type: 'text',
        heading: 'Black\'s Central Counter',
        text: 'Strong opponents won\'t let you execute the kingside attack freely. They\'ll often strike in the center with ...d5 or ...c5 to challenge your e4 pawn and create counterplay.',
      },
      {
        type: 'diagram',
        heading: 'Central Tension',
        text: 'Black has played ...d5 to challenge White\'s e4 pawn. How should White respond? The key is maintaining central control while preparing the attack.',
        fen: 'rnbqkb1r/ppp2ppp/4pn2/3p4/4P3/3P1NP1/PPP2PBP/RNBQK2R w KQkq - 0 6',
        highlightSquares: ['e4', 'd5', 'd3'],
      },
      {
        type: 'text',
        heading: 'Strategic Responses',
        text: 'Against ...d5, White typically maintains the tension or advances e5, gaining space and fixing Black\'s pieces. Against ...c5, White can support d4 with c3 or allow dxc5, gaining the d4 square for a knight. The key principle: don\'t abandon your central presence just to rush the attack.',
      },
      {
        type: 'diagram',
        heading: 'After e5',
        text: 'White has advanced e5, locking the center. Now the f3 knight can reroute via Nfd2-f1-g3 or Ne1-g2 to support the kingside pawn storm, while Black\'s pieces are cramped.',
        fen: 'rnbqkb1r/ppp2ppp/4pn2/3pP3/8/3P1NP1/PPP2PBP/RNBQK2R w KQkq - 0 7',
        highlightSquares: ['e5', 'f3', 'g3'],
      },
    ],
  },
  {
    id: 'kia-int-2',
    title: 'Positional Sacrifices in the KIA',
    description: 'Understand when and how to sacrifice material for attack',
    system: 'kings-indian-attack',
    order: 5,
    estimatedMinutes: 18,
    content: [
      {
        type: 'text',
        heading: 'Sacrificing for Initiative',
        text: 'The KIA often leads to positions where White can sacrifice a pawn or exchange to accelerate the kingside attack. These sacrifices aren\'t tactical tricks but positional decisions based on piece activity and attacking potential.',
      },
      {
        type: 'diagram',
        heading: 'The f5 Pawn Sacrifice',
        text: 'White can sacrifice the f5 pawn to open the f-file and activate the rooks. After Black takes on f5, White recaptures with the g-pawn, opening lines and creating threats.',
        fen: 'r1bq1rk1/ppp2ppp/2n2n2/2bpp1P1/2B1P3/2NP1N2/PPP2P1P/R1BQ1RK1 w - - 0 9',
        highlightSquares: ['f5', 'g4', 'f1'],
      },
      {
        type: 'text',
        heading: 'The Exchange Sacrifice',
        text: 'Sometimes White sacrifices the exchange (rook for knight or bishop) on f5 or h5 to destroy Black\'s kingside pawn structure. If Black\'s king is exposed and White\'s pieces can coordinate for an attack, the exchange sacrifice can be devastating.',
      },
      {
        type: 'diagram',
        heading: 'Rxf6 Exchange Sacrifice',
        text: 'White plays Rxf6!, sacrificing the exchange to eliminate Black\'s key defensive piece. After gxf6, Black\'s king is exposed to a fierce attack from White\'s queen and bishop.',
        fen: 'r1bq1rk1/ppp2p1p/2n2Rp1/2bp4/2B1P3/2NP1N2/PPP2PPP/R1BQ2K1 b - - 0 10',
        highlightSquares: ['f6', 'g7', 'h5'],
      },
    ],
  },
];

/**
 * Stonewall Attack - Intermediate
 */
export const STONEWALL_INTERMEDIATE_LESSONS: Lesson[] = [
  {
    id: 'stonewall-int-1',
    title: 'The Minority Attack Plan',
    description: 'Learn an alternative strategic plan for the Stonewall',
    system: 'stonewall-attack',
    order: 3,
    estimatedMinutes: 14,
    content: [
      {
        type: 'text',
        heading: 'Beyond the Kingside',
        text: 'While the Stonewall is known for kingside attacks, experienced players also use the minority attack on the queenside: b2-b4-b5 to create weaknesses in Black\'s pawn structure.',
      },
      {
        type: 'diagram',
        heading: 'Starting the Minority Attack',
        text: 'White prepares b4-b5 to challenge Black\'s queenside pawns. This plan is especially effective when Black has castled queenside or has a solid kingside defense.',
        fen: 'r1bqk2r/pppnbppp/4pn2/3p4/1P1P1P2/3BPN2/P1P3PP/RNBQK2R w KQkq - 0 8',
        highlightSquares: ['b4', 'b5', 'c6'],
      },
      {
        type: 'text',
        heading: 'Creating Weaknesses',
        text: 'After b5, if Black plays ...cxb5, the c6 pawn becomes backward and weak. If Black doesn\'t take, b5xc6 creates doubled pawns. Either way, White gets long-term pressure on the queenside while maintaining stability in the center.',
      },
    ],
  },
  {
    id: 'stonewall-int-2',
    title: 'Dynamic Piece Regrouping',
    description: 'Master the art of piece maneuvering in fixed structures',
    system: 'stonewall-attack',
    order: 4,
    estimatedMinutes: 16,
    content: [
      {
        type: 'text',
        heading: 'Flexibility in a Rigid Structure',
        text: 'The Stonewall\'s pawn structure is fixed, but your pieces must remain flexible. Learning to regroup pieces to change plans is crucial for intermediate Stonewall players.',
      },
      {
        type: 'diagram',
        heading: 'Knight Maneuvers',
        text: 'The Nbd2 can reroute to e5 via f3, or to f5 via f1-g3. The Nf3 can swing to e5 or to h4 for kingside play. These maneuvers help adapt to Black\'s setup.',
        fen: 'r1bqk2r/ppp1bppp/2n1pn2/3p4/3P1P2/3BPN2/PPPN2PP/R1BQK2R w KQkq - 0 7',
        highlightSquares: ['d2', 'f3', 'e5', 'h4'],
      },
      {
        type: 'text',
        heading: 'The Bd3-e2-g4 Maneuver',
        text: 'Sometimes the Bd3 needs to be redeployed. The maneuver Bd3-e2-g4 puts the bishop on an aggressive diagonal targeting Black\'s king, especially effective after ...g6 or when Black has castled kingside.',
      },
    ],
  },
];

/**
 * Colle System - Intermediate
 */
export const COLLE_INTERMEDIATE_LESSONS: Lesson[] = [
  {
    id: 'colle-int-1',
    title: 'The Colle-Zukertort Variation',
    description: 'Add the kingside fianchetto for extra attacking power',
    system: 'colle-system',
    order: 3,
    estimatedMinutes: 15,
    content: [
      {
        type: 'text',
        heading: 'Enhanced with the Fianchetto',
        text: 'The Colle-Zukertort combines the solid Colle setup with a kingside fianchetto (g3 and Bg2). This creates tremendous pressure on the long diagonal and makes the e4 break even more powerful.',
      },
      {
        type: 'diagram',
        heading: 'The Colle-Zukertort Setup',
        text: 'White develops with d4, Nf3, e3, Bd3, O-O, Nbd2, b3, and Bb2. The bishop on b2 adds pressure to the long diagonal, and g3-Bg2 can follow.',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P4/3BPN2/PPPN1PPP/R1BQK2R w KQkq - 0 6',
        highlightSquares: ['b2', 'g2', 'e4'],
      },
      {
        type: 'text',
        heading: 'Devastating Combinations',
        text: 'With bishops on b2 and g2 both aimed at the kingside, the e4 break becomes devastating. After e4 dxe4 Nxe4, both bishops and the centralized knight create overwhelming pressure. Many games feature quick victories with tactics like Nf6+ or Bxh7+.',
      },
    ],
  },
  {
    id: 'colle-int-2',
    title: 'Playing Against the Slav Defense',
    description: 'Handle Black\'s most solid response',
    system: 'colle-system',
    order: 4,
    estimatedMinutes: 14,
    content: [
      {
        type: 'text',
        heading: 'The Slav Challenge',
        text: 'Black\'s most solid defense to the Colle is the Slav setup with ...c6, ...Bf5, and ...e6. This prevents the typical e4 break and challenges White to find a different plan.',
      },
      {
        type: 'diagram',
        heading: 'Slav Structure',
        text: 'Black has a rock-solid position with ...c6, ...Bf5 outside the pawn chain, and ...e6. The normal e4 break is well-covered. What should White do?',
        fen: 'rn1qkb1r/pp2pppp/2p2n2/3p1b2/3P4/3BPN2/PPPN1PPP/R1BQK2R w KQkq - 0 6',
        highlightSquares: ['f5', 'c6', 'e6'],
      },
      {
        type: 'text',
        heading: 'Alternative Plans',
        text: 'Against the Slav, White can play Ne5 to challenge the Bf5, or prepare c4 to change the pawn structure. Another plan is g4 to gain space and attack the Bf5. The key is recognizing when your standard plan doesn\'t work and adapting.',
      },
    ],
  },
];

/**
 * London System - Intermediate
 */
export const LONDON_INTERMEDIATE_LESSONS: Lesson[] = [
  {
    id: 'london-int-1',
    title: 'The Jobava London',
    description: 'Add aggressive Nc3 and Qd2 for a sharper version',
    system: 'london-system',
    order: 4,
    estimatedMinutes: 16,
    content: [
      {
        type: 'text',
        heading: 'The Aggressive Variation',
        text: 'The Jobava London (named after GM Baadur Jobava) replaces Nbd2 with Nc3, creating a more aggressive setup. Combined with Qd2, this prepares queenside castling and a fierce kingside pawn storm.',
      },
      {
        type: 'diagram',
        heading: 'Jobava Setup',
        text: 'White has played Bf4, e3, Nc3, Qd2, and is ready to castle queenside with O-O-O. This setup prepares h4-h5 and g4 for a powerful attack.',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/2N1P3/PPPQ1PPP/R3KBNR w KQkq - 0 5',
        highlightSquares: ['c3', 'd2', 'e1', 'h4'],
      },
      {
        type: 'text',
        heading: 'Opposite-Side Castling',
        text: 'After O-O-O, White launches a pawn storm with h4-h5 and g4. The Nc3 supports the attack and controls key central squares. This variation is much sharper than the standard London and leads to tactical battles.',
      },
    ],
  },
  {
    id: 'london-int-2',
    title: 'Positional Pawn Breaks',
    description: 'Master c4, e4, and f4 breaks to transform the position',
    system: 'london-system',
    order: 5,
    estimatedMinutes: 15,
    content: [
      {
        type: 'text',
        heading: 'Beyond the Setup',
        text: 'Intermediate London players must know when and how to use pawn breaks to transform the position. The three key breaks are c4 (challenging Black\'s center), e4 (creating central tension), and f4 (preparing kingside expansion).',
      },
      {
        type: 'diagram',
        heading: 'The c4 Break',
        text: 'White plays c4 to challenge Black\'s d5 pawn. If Black takes dxc4, White recaptures with the bishop and gains the d4 square. If Black maintains with ...c6, the position becomes more dynamic.',
        fen: 'r1bqkb1r/ppp1pppp/2n2n2/3p4/2PP1B2/4PN2/PP3PPP/RN1QKB1R w KQkq - 0 6',
        highlightSquares: ['c4', 'd5', 'd4'],
      },
      {
        type: 'text',
        heading: 'Choosing the Right Break',
        text: 'The choice depends on Black\'s setup: c4 is good when Black lacks central control, e4 works when you have full development and Black hasn\'t reinforced d5, and f4 is best when preparing a kingside attack. Mastering these breaks makes the London much more dynamic.',
      },
    ],
  },
];

/**
 * Torre Attack - Intermediate
 */
export const TORRE_INTERMEDIATE_LESSONS: Lesson[] = [
  {
    id: 'torre-int-1',
    title: 'The Bxf6 Exchange',
    description: 'Learn when to trade bishop for knight',
    system: 'torre-attack',
    order: 4,
    estimatedMinutes: 15,
    content: [
      {
        type: 'text',
        heading: 'Strategic Bishop Trade',
        text: 'One of the Torre\'s key decisions is whether to trade Bxf6, damaging Black\'s pawn structure. This exchange can create long-term weaknesses but gives up the bishop pair.',
      },
      {
        type: 'diagram',
        heading: 'After Bxf6',
        text: 'White has played Bxf6, and after ...exf6 or ...gxf6, Black\'s pawn structure is compromised. The doubled f-pawns create weaknesses, especially the e6 and e5 squares.',
        fen: 'rnbqkb1r/ppp1pp1p/5Bp1/3p4/3P4/4PN2/PPP2PPP/RN1QKB1R b KQkq - 0 5',
        highlightSquares: ['f6', 'e5', 'e6'],
      },
      {
        type: 'text',
        heading: 'When to Exchange',
        text: 'Trade Bxf6 when: 1) Black has already committed to ...g6 (weakening the kingside), 2) You can quickly occupy the weakened squares with Ne5, or 3) Black cannot easily redeploy pieces to cover the weaknesses. Don\'t trade if Black gets active piece play that compensates for the structural damage.',
      },
    ],
  },
  {
    id: 'torre-int-2',
    title: 'Handling the King\'s Indian Defense',
    description: 'Adapt the Torre against Black\'s kingside fianchetto',
    system: 'torre-attack',
    order: 5,
    estimatedMinutes: 16,
    content: [
      {
        type: 'text',
        heading: 'Against the Fianchetto',
        text: 'When Black plays ...g6 and ...Bg7 (King\'s Indian setup), the standard Bg5 pin doesn\'t apply. White must adapt the Torre with different piece placement.',
      },
      {
        type: 'diagram',
        heading: 'Modified Torre Setup',
        text: 'Against the King\'s Indian, White can play Bg5 anyway (controlling h6 and e7), or switch to a London-style Bf4 setup. The key is maintaining central control.',
        fen: 'rnbqk2r/ppp1ppbp/5np1/3p2B1/3P4/4PN2/PPP2PPP/RN1QKB1R w KQkq - 0 5',
        highlightSquares: ['g5', 'e7', 'h6'],
      },
      {
        type: 'text',
        heading: 'Strategic Approach',
        text: 'The plan becomes: establish a strong center with c4, secure the d4 outpost, and use the Bg5 to control key light squares. White can also prepare queenside expansion with b4-b5 while Black attacks on the kingside.',
      },
    ],
  },
];

/**
 * ADVANCED LESSONS
 * Master-level concepts and complex strategic themes
 */

/**
 * King's Indian Attack - Advanced
 */
export const KIA_ADVANCED_LESSONS: Lesson[] = [
  {
    id: 'kia-adv-1',
    title: 'The Reversed Lines',
    description: 'Understanding the KIA as reversed King\'s Indian Defense',
    system: 'kings-indian-attack',
    order: 6,
    estimatedMinutes: 20,
    content: [
      {
        type: 'text',
        heading: 'Mirror Image',
        text: 'The KIA is essentially the King\'s Indian Defense with colors reversed and an extra tempo. This connection gives access to a wealth of strategic ideas from the KID, adapted for White.',
      },
      {
        type: 'diagram',
        heading: 'Transposition Awareness',
        text: 'Notice how this KIA position mirrors classic KID structures. Understanding KID plans helps you navigate complex middlegames and find the best squares for your pieces.',
        fen: 'r1bq1rk1/ppp1ppbp/2np1np1/8/2PPP3/2N2N2/PP2BPPP/R1BQ1RK1 w - - 0 9',
        highlightSquares: ['e4', 'f4', 'e5', 'd5'],
      },
      {
        type: 'text',
        heading: 'Advanced Strategic Themes',
        text: 'Study both sides of the KID to master the KIA. Learn when to push d4 (transposing to different structures), how to handle Black\'s queenside expansion, and the famous Mar del Plata pawn structures that arise in sharp lines.',
      },
    ],
  },
  {
    id: 'kia-adv-2',
    title: 'Prophylactic Thinking',
    description: 'Prevent Black\'s counterplay before launching your attack',
    system: 'kings-indian-attack',
    order: 7,
    estimatedMinutes: 18,
    content: [
      {
        type: 'text',
        heading: 'Defending While Attacking',
        text: 'Advanced KIA players don\'t just attack blindly. They use prophylactic moves to prevent Black\'s counterplay on the queenside before the kingside attack arrives.',
      },
      {
        type: 'diagram',
        heading: 'Prophylactic c3',
        text: 'Before launching f4-f5, White plays c3 to prevent ...Nd4 and control the d4 square. This move seems slow but prevents tactical shots that could derail the attack.',
        fen: 'r1bq1rk1/ppp2ppp/2n2n2/2bpp3/2B1P3/2PP1NP1/PP3PBP/RNBQ1RK1 w - - 0 9',
        highlightSquares: ['c3', 'd4', 'b4'],
      },
      {
        type: 'text',
        heading: 'Common Prophylactic Ideas',
        text: 'Key prophylactic moves in the KIA: c3 (preventing ...Nd4), Rb1 (defending b2 before expanding queenside), Kh1 (avoiding back-rank issues), and Re1-e2 (doubling on the e-file while protecting the second rank). Master these before attempting brilliant attacks.',
      },
    ],
  },
];

/**
 * Stonewall Attack - Advanced
 */
export const STONEWALL_ADVANCED_LESSONS: Lesson[] = [
  {
    id: 'stonewall-adv-1',
    title: 'The Stonewall Dutch Connection',
    description: 'Advanced understanding through reversed Dutch structures',
    system: 'stonewall-attack',
    order: 5,
    estimatedMinutes: 20,
    content: [
      {
        type: 'text',
        heading: 'Two Sides of the Coin',
        text: 'The Stonewall Attack is the Dutch Defense with colors reversed. Studying both gives deep strategic insight into the pawn structure\'s strengths and weaknesses.',
      },
      {
        type: 'diagram',
        heading: 'Classic Stonewall Themes',
        text: 'The e5 break, the bad bishop problem, minority attacks, and the kingside assault with Qe1-h4 or Rf3-Rh3 are all shared between Stonewall Attack and Dutch Defense.',
        fen: 'r1bq1rk1/ppp1bppp/2n5/3p4/3P1P2/3BPN2/PPPN2PP/R1BQ1RK1 w - - 0 8',
        highlightSquares: ['e5', 'h4', 'f3'],
      },
      {
        type: 'text',
        heading: 'Learning from Both Sides',
        text: 'When you play the Stonewall Attack, you learn what to do. When you face the Dutch Defense, you learn what your opponent will try against your Stonewall. This dual perspective is invaluable for mastering the system.',
      },
    ],
  },
  {
    id: 'stonewall-adv-2',
    title: 'Complex Endgame Conversion',
    description: 'Win the endgames that arise from your opening',
    system: 'stonewall-attack',
    order: 6,
    estimatedMinutes: 18,
    content: [
      {
        type: 'text',
        heading: 'Endgame Mastery',
        text: 'The Stonewall often leads to endgames with specific characteristics: bad vs. good bishops, weak e4 or e5 squares, and queenside pawn majorities. Knowing these endgames is crucial for success.',
      },
      {
        type: 'diagram',
        heading: 'The Classic Bishop Endgame',
        text: 'White has the better bishop (outside the pawn chain on g2) while Black\'s bishop is locked inside. This advantage can be converted into a win with proper technique.',
        fen: '6k1/pp3ppp/2p5/3p4/3P1P2/5BP1/PP4KP/8 w - - 0 25',
        highlightSquares: ['g2', 'e5', 'c6'],
      },
      {
        type: 'text',
        heading: 'Conversion Techniques',
        text: 'Key endgame ideas: invade with your king on the weakened light squares, use your good bishop to control both sides of the board, create a passed pawn on the queenside, and never allow your opponent to activate their bad bishop with pawn breaks.',
      },
    ],
  },
];

/**
 * Colle System - Advanced
 */
export const COLLE_ADVANCED_LESSONS: Lesson[] = [
  {
    id: 'colle-adv-1',
    title: 'The Colle in Grandmaster Hands',
    description: 'Study how GMs use sophisticated piece play',
    system: 'colle-system',
    order: 5,
    estimatedMinutes: 20,
    content: [
      {
        type: 'text',
        heading: 'Beyond the Basics',
        text: 'While the Colle is simple to learn, grandmasters use sophisticated ideas: timing of the e4 break, piece sacrifices on e6, and deep prophylactic moves that normal players miss.',
      },
      {
        type: 'diagram',
        heading: 'GM-Level Piece Coordination',
        text: 'Notice the perfect coordination: Bd3 and Qe2 both eye h7, Nbd2 supports e4, Rf1 supports f3-f4-f5, and every piece has multiple functions.',
        fen: 'r1bq1rk1/ppp1bppp/2n2n2/3p4/3PP3/3B1N2/PPPNQPPP/R1B2RK1 w - - 0 9',
        highlightSquares: ['d3', 'e2', 'h7', 'e4'],
      },
      {
        type: 'text',
        heading: 'Sacrificial Themes',
        text: 'Advanced players know when to sacrifice: Bxh7+ when the king can\'t escape, Nxe5 when it opens the d3 bishop\'s diagonal, or even Qxe6+! to destroy Black\'s king safety. These aren\'t wild gambles but calculated decisions based on piece coordination.',
      },
    ],
  },
  {
    id: 'colle-adv-2',
    title: 'Transition to Other Openings',
    description: 'Use the Colle as a gateway to a broader repertoire',
    system: 'colle-system',
    order: 6,
    estimatedMinutes: 16,
    content: [
      {
        type: 'text',
        heading: 'Building Your Repertoire',
        text: 'The Colle teaches fundamental chess principles that transfer to many openings. Once you master it, you can expand into the Queen\'s Gambit, Catalan, or even 1.e4 openings with the same strategic understanding.',
      },
      {
        type: 'diagram',
        heading: 'Transposition Possibilities',
        text: 'From the Colle setup, you can transpose into Queen\'s Gambit positions with c4, Semi-Slav structures with e4, or Stonewall formations with f4. This flexibility makes it a great foundation.',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/2PP4/3BPN2/PP3PPP/RNBQK2R b KQkq - 0 5',
        highlightSquares: ['c4', 'f4', 'e4'],
      },
      {
        type: 'text',
        heading: 'Strategic Education',
        text: 'The Colle teaches: central pawn breaks, piece development, king safety, and attacking the king. These principles apply to all openings. Use the Colle as your chess education, then branch out with confidence.',
      },
    ],
  },
];

/**
 * London System - Advanced
 */
export const LONDON_ADVANCED_LESSONS: Lesson[] = [
  {
    id: 'london-adv-1',
    title: 'The Accelerated London',
    description: 'Master the move-order subtleties',
    system: 'london-system',
    order: 6,
    estimatedMinutes: 18,
    content: [
      {
        type: 'text',
        heading: 'Move-Order Precision',
        text: 'Advanced London players use precise move orders to avoid Black\'s most challenging setups. Playing Bf4 on move 2 (before Nf3) gives Black fewer options to counter the system.',
      },
      {
        type: 'diagram',
        heading: 'The 2.Bf4 Move Order',
        text: 'After 1.d4 d5 2.Bf4, White develops the bishop immediately. This prevents ...Nf6 and ...Bf5 (the troublesome symmetrical setup) and forces Black to choose a plan without full information.',
        fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 0 2',
        highlightSquares: ['f4', 'f6', 'f5'],
      },
      {
        type: 'text',
        heading: 'Avoiding Black\'s Best Tries',
        text: 'With precise move orders, you can avoid the ...c5 challenge (play Bf4 before c3), prevent ...Qb6 tactics (play Nf3-Nbd2 before Black develops the queen), and control the narrative of the opening.',
      },
    ],
  },
  {
    id: 'london-adv-2',
    title: 'Dynamic Piece Sacrifices',
    description: 'Learn when the London becomes sacrificial',
    system: 'london-system',
    order: 7,
    estimatedMinutes: 20,
    content: [
      {
        type: 'text',
        heading: 'The London Can Attack!',
        text: 'Despite its solid reputation, the London features powerful sacrificial themes: Bxh7+, Nxe5, Nxg7, and even Qxh7+. These aren\'t desperate tactics but logical consequences of superior piece placement.',
      },
      {
        type: 'diagram',
        heading: 'The Greek Gift',
        text: 'When Black has castled kingside without proper defense, Bxh7+ is often winning. After Kxh7 Ng5+ Kg8 (or Kg6) Qg4 (or Qd3+), White has a devastating attack.',
        fen: 'r1bq1rk1/ppp2ppp/2n2n2/2bp4/3P1B2/2PBPN2/PP1N1PPP/R2QK2R w KQ - 0 9',
        highlightSquares: ['h7', 'g5', 'g4'],
      },
      {
        type: 'text',
        heading: 'Calculating Sacrifices',
        text: 'These sacrifices work when: 1) Black\'s king lacks defenders, 2) Your pieces can quickly join the attack, 3) Black has no counter-threats. Study tactical patterns and learn to recognize when your "boring" London position has transformed into a winning attack.',
      },
    ],
  },
];

/**
 * Torre Attack - Advanced
 */
export const TORRE_ADVANCED_LESSONS: Lesson[] = [
  {
    id: 'torre-adv-1',
    title: 'The Torre-Petrosian Hybrid',
    description: 'Combine Torre ideas with Petrosian System moves',
    system: 'torre-attack',
    order: 6,
    estimatedMinutes: 19,
    content: [
      {
        type: 'text',
        heading: 'Hybrid Opening Systems',
        text: 'Advanced players combine the Torre Attack (Bg5) with Petrosian System ideas (d3 and e4). This hybrid creates a unique setup that confuses opponents and offers rich strategic possibilities.',
      },
      {
        type: 'diagram',
        heading: 'The Hybrid Setup',
        text: 'White has Bg5, d3 (instead of the usual d4), e4, and Nbd2. This setup is incredibly flexible, allowing White to respond to any Black formation with solid central control.',
        fen: 'rnbqkb1r/ppp1pppp/5n2/3p2B1/4P3/3P1N2/PPP2PPP/RN1QKB1R w KQkq - 0 4',
        highlightSquares: ['g5', 'd3', 'e4'],
      },
      {
        type: 'text',
        heading: 'Strategic Flexibility',
        text: 'This hybrid gives you options: attack immediately with Qe2 and Bh4, build slowly with Nbd2-f1-g3, or transition to a KIA structure with g3 and Bg2. The ambiguity makes it hard for Black to find the right plan.',
      },
    ],
  },
  {
    id: 'torre-adv-2',
    title: 'Mastering Complex Tactics',
    description: 'Navigate the sharp tactical lines of the Torre',
    system: 'torre-attack',
    order: 7,
    estimatedMinutes: 22,
    content: [
      {
        type: 'text',
        heading: 'Tactical Sharpness',
        text: 'The Torre leads to sharp tactical positions more often than other d4 systems. Master-level players must calculate forcing sequences involving pin breaks, knight forks, and bishop sacrifices.',
      },
      {
        type: 'diagram',
        heading: 'Complex Tactical Position',
        text: 'Black just played ...h6. Should White trade Bxf6 or retreat Bh4? Each option leads to completely different positions with complex tactical justifications.',
        fen: 'r1bqkb1r/ppp1pp1p/2n2np1/3p2B1/3P4/2N1PN2/PPP2PPP/R2QKB1R w KQkq - 0 6',
        highlightSquares: ['g5', 'f6', 'h4'],
      },
      {
        type: 'text',
        heading: 'Tactical Themes to Master',
        text: 'Key Torre tactics: pins and pin breaks (...dxe4 breaking the pin), removing the defender (Bxf6 to weaken e5), discovered attacks (Ne5 uncovering the Bd3), and knight forks from e5. Study these patterns and you\'ll win many short, brilliant games.',
      },
    ],
  },
];

/**
 * All lessons organized by system
 */
export const LESSONS_BY_SYSTEM: Record<OpeningSystem, Lesson[]> = {
  'kings-indian-attack': [...KIA_LESSONS, ...KIA_INTERMEDIATE_LESSONS, ...KIA_ADVANCED_LESSONS],
  'stonewall-attack': [...STONEWALL_LESSONS, ...STONEWALL_INTERMEDIATE_LESSONS, ...STONEWALL_ADVANCED_LESSONS],
  'colle-system': [...COLLE_LESSONS, ...COLLE_INTERMEDIATE_LESSONS, ...COLLE_ADVANCED_LESSONS],
  'london-system': [...LONDON_LESSONS, ...LONDON_INTERMEDIATE_LESSONS, ...LONDON_ADVANCED_LESSONS],
  'torre-attack': [...TORRE_LESSONS, ...TORRE_INTERMEDIATE_LESSONS, ...TORRE_ADVANCED_LESSONS],
};

/**
 * Get all lessons for a system
 */
export function getLessonsForSystem(system: OpeningSystem): Lesson[] {
  return LESSONS_BY_SYSTEM[system] || [];
}

/**
 * Get lesson by ID
 */
export function getLessonById(id: string): Lesson | undefined {
  const allLessons = Object.values(LESSONS_BY_SYSTEM).flat();
  return allLessons.find(lesson => lesson.id === id);
}

/**
 * Get next incomplete lesson for a system
 */
export function getNextLesson(system: OpeningSystem, completedLessonIds: string[]): Lesson | undefined {
  const lessons = getLessonsForSystem(system);
  return lessons.find(lesson => !completedLessonIds.includes(lesson.id));
}

/**
 * Calculate progress for a system
 */
export function getSystemProgress(system: OpeningSystem, completedLessonIds: string[]): {
  completed: number;
  total: number;
  percentage: number;
} {
  const lessons = getLessonsForSystem(system);
  const completed = lessons.filter(lesson => completedLessonIds.includes(lesson.id)).length;
  const total = lessons.length;
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return { completed, total, percentage };
}

/**
 * Get all systems with their metadata
 */
export interface OpeningSystemMeta {
  id: OpeningSystem;
  name: string;
  description: string;
  icon: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  lessonCount: number;
}

export const OPENING_SYSTEMS: OpeningSystemMeta[] = [
  {
    id: 'kings-indian-attack',
    name: 'King\'s Indian Attack',
    description: 'Aggressive kingside attacking system with flexible piece placement',
    icon: '⚔️',
    difficulty: 'intermediate',
    lessonCount: LESSONS_BY_SYSTEM['kings-indian-attack'].length,
  },
  {
    id: 'stonewall-attack',
    name: 'Stonewall Attack',
    description: 'Solid pawn structure with direct attacking chances',
    icon: '🏰',
    difficulty: 'beginner',
    lessonCount: LESSONS_BY_SYSTEM['stonewall-attack'].length,
  },
  {
    id: 'colle-system',
    name: 'Colle System',
    description: 'Simple and solid with a powerful central break',
    icon: '📚',
    difficulty: 'beginner',
    lessonCount: LESSONS_BY_SYSTEM['colle-system'].length,
  },
  {
    id: 'london-system',
    name: 'London System',
    description: 'Ultra-solid setup playable against any Black response',
    icon: '🏛️',
    difficulty: 'beginner',
    lessonCount: LESSONS_BY_SYSTEM['london-system'].length,
  },
  {
    id: 'torre-attack',
    name: 'Torre Attack',
    description: 'Dynamic play with early piece activity and tactical themes',
    icon: '🗼',
    difficulty: 'intermediate',
    lessonCount: LESSONS_BY_SYSTEM['torre-attack'].length,
  },
];
