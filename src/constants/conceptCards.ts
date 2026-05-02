/**
 * Sample Concept Cards
 * Strategic flashcards for the ConceptTrainer (Declarative Memory)
 * Teaches the "why" behind chess moves and positions
 */

import type { ConceptCard, OpeningSystem } from '../types';

/**
 * King's Indian Attack Concepts
 */
export const KIA_CONCEPTS: ConceptCard[] = [
  {
    id: 'kia-concept-1',
    concept: 'Kingside Attack Strategy',
    question: 'In the King\'s Indian Attack, what is White\'s main strategic plan once the setup is complete?',
    position: {
      fen: 'r1bq1rk1/ppp2ppp/2np1n2/2b1p3/2B1P3/2NP1NP1/PPP2PBP/R1BQ1RK1 w - - 0 8',
      turn: 'w',
      moveNumber: 8,
    },
    correctAnswer: 'Launch a kingside attack with pawn advances (f4, g4, h4) supported by pieces, targeting the opponent\'s castled king.',
    hints: [
      'Look at where White\'s pieces are pointing - particularly the fianchettoed bishop on g2.',
      'White has already castled. What side of the board is White\'s king on vs where the attacking potential lies?',
      'The pawn moves f4, g4, and h4 create attacking chances. Which side of the board are those pawns on?',
    ],
    explanation: 'The KIA is fundamentally a kingside attacking system. Once development is complete, White launches a pawn storm on the kingside (f4-f5, g4-g5, h4-h5) to open lines and create threats against Black\'s king. The g2 bishop, f3 knight, and queen coordinate to exploit the weaknesses created by the pawn advances.',
    relatedOpeningLine: 'kia-main-1',
  },
  {
    id: 'kia-concept-2',
    concept: 'Central Control with e4',
    question: 'Why is the move e4 so critical in the King\'s Indian Attack, and when is the right time to play it?',
    position: {
      fen: 'rnbqkb1r/pppp1ppp/4pn2/8/8/3P1NP1/PPPN1PBP/R1BQK2R w KQkq - 0 5',
      turn: 'w',
      moveNumber: 5,
    },
    correctAnswer: 'The move e4 establishes a strong central pawn duo (d3+e4), gains space, and opens the long diagonal for the g2 bishop. It should be played after completing development (Nf3, g3, Bg2, O-O, Nbd2).',
    hints: [
      'What does the e4 pawn control in the center?',
      'How does e4 affect the dark-squared bishop on g2?',
      'Would e4 be stronger before or after castling? Why?',
    ],
    explanation: 'The e4 advance is the thematic central break in the KIA. It gives White a space advantage, controls the d5 and f5 squares, and activates the g2 bishop\'s diagonal. Playing it after full development (especially after castling and Nbd2) ensures White is ready to handle the resulting central tension.',
    relatedOpeningLine: 'kia-main-1',
  },
  {
    id: 'kia-concept-3',
    concept: 'Transposition Flexibility',
    question: 'Why is the King\'s Indian Attack considered a "universal" opening system, and how does move order flexibility benefit White?',
    position: {
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: 'w',
      moveNumber: 1,
    },
    correctAnswer: 'The KIA is universal because White can reach the same setup (Nf3, g3, Bg2, d3, O-O, e4, Nbd2) regardless of Black\'s moves. The flexible move order prevents Black from dictating the opening and allows White to transpose into favorable positions.',
    hints: [
      'Can White play the KIA setup against 1...e5, 1...d5, 1...c5, and other moves?',
      'Does the order of Nf3, g3, Bg2 matter much?',
      'What advantage does having a fixed plan give you?',
    ],
    explanation: 'The KIA is a true universal system. White can start with 1.Nf3, 1.e4, or even 1.d3, and reach the same basic setup regardless of Black\'s response. The moves Nf3, g3, Bg2, d3, O-O, e4, and Nbd2 can be played in various orders, making it hard for Black to prepare specific counter-strategies. This flexibility is powerful: White gets a familiar position every game while Black must adapt to different move orders.',
    relatedOpeningLine: 'kia-main-1',
  },
];

/**
 * Stonewall Attack Concepts
 */
export const STONEWALL_CONCEPTS: ConceptCard[] = [
  {
    id: 'stonewall-concept-1',
    concept: 'Bad Light-Squared Bishop',
    question: 'In the Stonewall formation, why is White\'s light-squared bishop considered "bad," and how should White handle this piece?',
    position: {
      fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P1P2/8/PPP1P1PP/RNBQKBNR w KQkq - 0 3',
      turn: 'w',
      moveNumber: 3,
    },
    correctAnswer: 'The light-squared bishop is "bad" because White\'s pawns on d4, e3, and f4 are all on light squares, blocking the bishop. White should either develop it actively to d3 before completing the pawn chain, or trade it off for Black\'s pieces.',
    hints: [
      'Look at the Stonewall pawn chain: d4, e3, f4. What color are these squares?',
      'If the bishop goes to c1-h6 diagonal, what squares can it actually control?',
      'How does a bishop move? Can it jump over pawns?',
    ],
    explanation: 'A "bad bishop" is blocked by its own pawns on the same color. In the Stonewall, White\'s d4-e3-f4 chain is all on light squares. If White plays Bd3 early (before f4), the bishop is developed actively. Otherwise, it becomes trapped and White should look to exchange it (e.g., via b2-c1-g5) to avoid long-term positional problems.',
    relatedOpeningLine: 'stonewall-main-1',
  },
  {
    id: 'stonewall-concept-2',
    concept: 'Kingside Pawn Storm',
    question: 'How does White create attacking chances in the Stonewall Attack despite having a passive light-squared bishop?',
    position: {
      fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1P2/3BPN2/PPP3PP/RNBQK2R w KQkq - 0 5',
      turn: 'w',
      moveNumber: 5,
    },
    correctAnswer: 'White launches a kingside pawn storm with moves like g4-g5, h4-h5, creating threats and opening lines for the major pieces to attack Black\'s king.',
    hints: [
      'Which side of the board is White\'s attacking potential?',
      'What pawn advances can create threats on the kingside?',
      'How can pawns open files for rooks and queens?',
    ],
    explanation: 'Despite the structural weakness of the bad bishop, the Stonewall Attack is dynamic because White can launch a direct kingside assault. The moves g4-g5 and h4-h5 create threats, and when pawns are exchanged, files open for White\'s rooks and queen to penetrate toward Black\'s king.',
    relatedOpeningLine: 'stonewall-main-1',
  },
  {
    id: 'stonewall-concept-3',
    concept: 'The e5 Break',
    question: 'In certain Stonewall positions, White can play e4-e5. What does this pawn break accomplish, and when is it appropriate?',
    position: {
      fen: 'rnbqkb1r/ppp2ppp/4pn2/3p4/3PPP2/3B1N2/PPP3PP/RNBQK2R w KQkq - 0 6',
      turn: 'w',
      moveNumber: 6,
    },
    correctAnswer: 'The e4-e5 break attacks Black\'s Nf6, gains space, opens lines for White\'s pieces, and transforms the position from static to dynamic. It\'s appropriate when White\'s pieces are well-placed to support the attack and Black\'s pieces are not ready to counter.',
    hints: [
      'What piece does e5 attack?',
      'Does e5 open any lines for White\'s pieces?',
      'What happens to the Stonewall structure after e5?',
    ],
    explanation: 'While the Stonewall is typically a slow, positional system, the e4-e5 break can transform it into a sharp attacking position. This advance attacks the Nf6, opens the f-file for the rook, activates the Bd3, and gives White concrete threats. However, timing is critical - play it too early and Black can counter-attack effectively. The e5 break works best when White has castled, connected the rooks, and Black\'s pieces are poorly coordinated.',
    relatedOpeningLine: 'stonewall-main-1',
  },
];

/**
 * Colle System Concepts
 */
export const COLLE_CONCEPTS: ConceptCard[] = [
  {
    id: 'colle-concept-1',
    concept: 'The e4 Break',
    question: 'What is the purpose of the thematic e4 pawn break in the Colle System, and what conditions must be met before playing it?',
    position: {
      fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P4/3BPN2/PPP2PPP/RNBQK2R w KQkq - 0 5',
      turn: 'w',
      moveNumber: 5,
    },
    correctAnswer: 'The e4 break opens the position, activates White\'s pieces (especially the Bd3 and Qd1-h5 battery), and creates central tension. It should be played after Nbd2, when the e4 pawn is supported and White is ready to recapture with the knight.',
    hints: [
      'What happens to the bishop on d3 when e4 is played?',
      'If you play e3-e4 and Black takes with ...dxe4, which piece recaptures?',
      'Does playing e4 open or close the position?',
    ],
    explanation: 'The Colle System builds slowly with d4, Nf3, e3, Bd3, but the key moment is e3-e4! This pawn break transforms the position by opening lines and activating White\'s pieces. The Nbd2 is crucial because after ...dxe4 Nxe4, White has a strong central knight. The Bd3 and queen can then combine for kingside threats.',
    relatedOpeningLine: 'colle-main-1',
  },
  {
    id: 'colle-concept-2',
    concept: 'Knight Maneuver to e5',
    question: 'In the Colle System, how does the knight reach the powerful e5 square, and why is this square so important?',
    position: {
      fen: 'r1bqkb1r/ppp1pppp/2n2n2/3pN3/3P4/3B1N2/PPP2PPP/R1BQK2R w KQkq - 0 7',
      turn: 'w',
      moveNumber: 7,
    },
    correctAnswer: 'The knight reaches e5 via Nbd2-f3-e5 or after e3-e4 dxe4, Nxe4-e5. The e5 square is powerful because it\'s a central outpost, controls key squares (c6, d7, f7, g6), and supports kingside attacks.',
    hints: [
      'Can Black easily remove a knight on e5?',
      'What important squares does a knight on e5 control?',
      'How does the Ne5 support an attack on the kingside?',
    ],
    explanation: 'The e5 square is a classic knight outpost in the Colle. A knight there cannot be easily driven away by pawns (Black\'s f-pawn is usually on f6). It controls critical squares like c6, d7, f7, and g6, supports kingside attacks, and can hop to g4 or d7 for tactical blows. The maneuver Nbd2-f3-e5 or e4-dxe4-Nxe4-e5 is a key strategic pattern.',
    relatedOpeningLine: 'colle-main-1',
  },
];

/**
 * London System Concepts
 */
export const LONDON_CONCEPTS: ConceptCard[] = [
  {
    id: 'london-concept-1',
    concept: 'Early Bf4 Development',
    question: 'Why is the move Bf4 played so early in the London System (often on move 2), and what does this accomplish?',
    position: {
      fen: 'rnbqkbnr/ppp1pppp/8/3p4/3P1B2/8/PPP1PPPP/RN1QKBNR b KQkq - 0 2',
      turn: 'b',
      moveNumber: 2,
    },
    correctAnswer: 'Bf4 is played before e3 to avoid "imprisoning" the bishop behind the e3 pawn. This move develops the bishop to an active square, controls e5, and prepares a solid pawn structure with e3, Nf3, and Bd3.',
    hints: [
      'What happens if White plays e3 first, then tries to develop the light-squared bishop?',
      'What important central square does the Bf4 control?',
      'Does the bishop on f4 have good mobility?',
    ],
    explanation: 'The London System is characterized by Bf4 before e3. If White plays 1.d4 d5 2.e3, the light-squared bishop is stuck behind its own pawn and must go to d2 (passive). By playing 2.Bf4, White develops actively, controls the e5 square, and maintains flexibility. The bishop on f4 supports a kingside attack and is harder to challenge than a bishop on g5.',
    relatedOpeningLine: 'london-main-1',
  },
  {
    id: 'london-concept-2',
    concept: 'The h3 and g4 Plan',
    question: 'In the London System, when should White play h3 and g4, and what is the strategic purpose of this pawn advance?',
    position: {
      fen: 'r1bqkb1r/ppp2ppp/2n2n2/3pp3/3P1BP1/3BPN1P/PPP3P1/RN1QK2R w KQkq - 0 7',
      turn: 'w',
      moveNumber: 7,
    },
    correctAnswer: 'The h3-g4-g5 plan is played when White wants to launch a kingside attack, gain space, and chase away Black\'s Nf6. It should be played after completing development and when the center is stable.',
    hints: [
      'What piece is attacked by the g4-g5 advance?',
      'Is it safe to weaken the kingside with h3 and g4 if your king is still in the center?',
      'How does gaining space on the kingside help White\'s attack?',
    ],
    explanation: 'The h3 and g4 plan is a key attacking idea in the London. After solid development, White plays h3 (preventing ...Ng4), then g4-g5, forcing Black\'s knight to retreat. This gains space, opens lines, and gives White attacking chances. However, it weakens the kingside, so White must castle first and ensure the center is secure before launching this plan.',
    relatedOpeningLine: 'london-main-1',
  },
  {
    id: 'london-concept-3',
    concept: 'Solid Pawn Triangle',
    question: 'How does the London System\'s pawn structure (d4, e3, c3) provide both solid defense and flexibility?',
    position: {
      fen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/2P1PN2/PP3PPP/RN1QKB1R b KQkq - 0 5',
      turn: 'b',
      moveNumber: 5,
    },
    correctAnswer: 'The d4-e3-c3 pawn triangle controls key central squares, provides a solid base for pieces, prevents Black\'s pieces from infiltrating (especially on b4 and e4), and prepares potential pawn breaks like e4 or c4.',
    hints: [
      'What squares does this pawn structure control?',
      'Can Black easily place pieces on e4 or c4?',
      'What pawn breaks become available to White later?',
    ],
    explanation: 'The d4-e3-c3 triangle is the London\'s foundation. It controls the center (d4, e4 squares), prevents Black\'s pieces from jumping to b4 or e4, and provides flexibility for later pawn breaks (e3-e4 or c3-c4). This structure is incredibly solid and hard to break down, giving White a stable position from which to launch plans on either flank.',
    relatedOpeningLine: 'london-main-1',
  },
];

/**
 * Torre Attack Concepts
 */
export const TORRE_CONCEPTS: ConceptCard[] = [
  {
    id: 'torre-concept-1',
    concept: 'The Bg5-h4-g3 Maneuver',
    question: 'What is the purpose of the famous Bg5-h4-g3 bishop maneuver in the Torre Attack, and when should it be played?',
    position: {
      fen: 'rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/5N2/PPP1PPPP/RN1QKB1R b KQkq - 0 3',
      turn: 'b',
      moveNumber: 3,
    },
    correctAnswer: 'The Bg5-h4-g3 maneuver retreats the bishop when Black plays ...h6, repositioning it to g3 where it eyes the c7 pawn and supports a kingside attack. It\'s played after Black challenges the bishop with ...h6.',
    hints: [
      'What happens if Black plays ...h6, attacking the Bg5?',
      'Where can the bishop retreat to that keeps it active?',
      'What does the bishop attack from g3?',
    ],
    explanation: 'The Torre Attack starts with Bg5, pinning Black\'s knight. When Black plays ...h6 to challenge it, White has prepared Bh4! If Black continues with ...g5, White retreats Bg3, where the bishop is still active, eyes the c7 pawn, supports a kingside attack, and is hard to challenge. This maneuver is the signature move of the Torre Attack.',
    relatedOpeningLine: 'torre-main-1',
  },
  {
    id: 'torre-concept-2',
    concept: 'The Ne5 Outpost',
    question: 'In the Torre Attack, why is establishing a knight on e5 so important, and how does White achieve this?',
    position: {
      fen: 'r1bqkb1r/ppp1pppp/2n5/3pN1B1/3P4/5N2/PPP1PPPP/R2QKB1R w KQkq - 0 6',
      turn: 'w',
      moveNumber: 6,
    },
    correctAnswer: 'A knight on e5 is a powerful central outpost that controls key squares, supports attacks, and is difficult to remove. White achieves this by controlling e5 with pawns and pieces, then maneuvering a knight there via Nfd2-f3-e5.',
    hints: [
      'What squares does a knight on e5 control?',
      'Can Black easily drive away a knight on e5 with pawns?',
      'How does the Ne5 coordinate with the Bg5?',
    ],
    explanation: 'The e5 square is the heart of the Torre Attack. A knight there controls c6, d7, f7, g6, and g4, supports kingside attacks, and cannot easily be challenged (Black\'s f-pawn is on f6). White achieves this by maintaining the d4 pawn, preventing ...e5, and then maneuvering Nf3-e5 or Nbd2-f3-e5. The Ne5 works beautifully with Bg5, creating threats against Black\'s kingside.',
    relatedOpeningLine: 'torre-main-1',
  },
  {
    id: 'torre-concept-3',
    concept: 'Central Control with e3-d4',
    question: 'How does the Torre Attack balance piece activity (Bg5) with solid pawn structure (e3, d4)?',
    position: {
      fen: 'rnbqkb1r/ppp1pppp/5n2/3p2B1/3P4/4PN2/PPP2PPP/RN1QKB1R b KQkq - 0 4',
      turn: 'b',
      moveNumber: 4,
    },
    correctAnswer: 'The Torre uses e3 for solid central control while Bg5 provides active piece play. The e3-d4 structure is stable, supports the center, and prepares c2-c4 or e3-e4 breaks while the Bg5 creates immediate tactical threats.',
    hints: [
      'Is the pawn structure e3-d4 solid or overextended?',
      'What pawn breaks does e3 prepare?',
      'How does Bg5 create immediate threats?',
    ],
    explanation: 'The Torre Attack balances solidity with activity. The e3-d4 pawn center is rock-solid, controls key squares, and prepares flexible pawn breaks (c4 or e4). Meanwhile, Bg5 creates immediate pressure by pinning the knight, threatening tactics, and forcing Black to respond. This combination of solid structure and active pieces makes the Torre both safe and aggressive.',
    relatedOpeningLine: 'torre-main-1',
  },
];

/**
 * General Strategic Concepts
 */
export const GENERAL_CONCEPTS: ConceptCard[] = [
  {
    id: 'general-concept-1',
    concept: 'Good vs Bad Bishop',
    question: 'What makes a bishop "good" or "bad," and why does this matter in the endgame?',
    position: {
      fen: '8/5k2/3p1p2/2pPpP2/2P1P3/8/3B1K2/3b4 w - - 0 1',
      turn: 'w',
      moveNumber: 1,
    },
    correctAnswer: 'A "good" bishop has its pawns on the opposite color, giving it mobility. A "bad" bishop is blocked by its own pawns on the same color. This matters in endgames because the bad bishop cannot defend its pawns or control key squares.',
    hints: [
      'Look at White\'s bishop on d2. What color are White\'s pawns on?',
      'Now look at Black\'s bishop on d1. What color are Black\'s pawns on?',
      'Can a bishop attack squares of the opposite color from where it sits?',
    ],
    explanation: 'A bishop can only control squares of one color. When your pawns are fixed on the same color as your bishop, they block it from being useful. White\'s bishop on d2 is "good" because White\'s pawns are on dark squares (c4, d5, e4, f5), leaving the light squares free for the bishop. Black\'s bishop is "bad" because Black\'s pawns (c5, d6, e5, f6) are on light squares, blocking it. In the endgame, this often means the bad bishop cannot defend its own pawns.',
    relatedOpeningLine: 'stonewall-main-1',
  },
  {
    id: 'general-concept-2',
    concept: 'Fianchetto Development',
    question: 'What are the advantages and potential drawbacks of fianchettoing a bishop (developing it to g2 or b2)?',
    position: {
      fen: 'rnbqkb1r/pppppppp/5n2/8/8/5NP1/PPPPPPBP/RNBQK2R w KQkq - 0 3',
      turn: 'w',
      moveNumber: 3,
    },
    correctAnswer: 'Advantages: Controls the long diagonal, adds pressure to the center, provides flexible piece placement. Drawbacks: Weakens the kingside dark squares (h3, g2, f3), takes time (two moves), and the bishop can be blocked by central pawns.',
    hints: [
      'What diagonal does the g2 bishop control?',
      'If you castle kingside, what squares around your king are now weaker?',
      'How many moves did it take to fianchetto (g3 + Bg2)?',
    ],
    explanation: 'The fianchetto (g3/Bg2 or b3/Bb2) is powerful because the bishop exerts long-range pressure on key central squares and supports both attack and defense. However, it requires two moves, weakens squares around the king (like h3 and f3), and the bishop can become passive if Black blocks the diagonal with pawns. It\'s a trade-off between flexibility and speed.',
    relatedOpeningLine: 'kia-main-1',
  },
  {
    id: 'general-concept-3',
    concept: 'Pawn Chains',
    question: 'In a locked pawn chain (e.g., White pawns on d4-e5, Black pawns on e6-d5), where should each side typically attack?',
    position: {
      fen: 'rnbqkb1r/ppp2ppp/4pn2/3pP3/3P4/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 5',
      turn: 'w',
      moveNumber: 5,
    },
    correctAnswer: 'Each side should attack the base of the opponent\'s pawn chain. White should attack Black\'s e6 pawn (the base), while Black should attack White\'s d4 pawn (the base). The side of the board you attack on depends on where the pawn chain points.',
    hints: [
      'A pawn chain has a "base" (the backmost pawn). Which pawn is White\'s base?',
      'Which way is White\'s chain pointing - toward the kingside or queenside?',
      'What happens if you successfully break the base of a pawn chain?',
    ],
    explanation: 'Pawn chains are structures where pawns support each other diagonally. The "base" is the most important - if you break it, the entire chain collapses. In this position, White\'s chain (d4-e5) points toward the kingside, so White should attack there (with f4-f5). Black\'s chain (e6-d5) points toward the queenside, so Black should attack with ...c5, targeting White\'s d4 base. This is a fundamental principle of pawn structure play.',
    relatedOpeningLine: 'kia-main-1',
  },
  {
    id: 'general-concept-4',
    concept: 'Outpost Squares',
    question: 'What makes a square an ideal "outpost" for a knight, and why are outposts so valuable?',
    position: {
      fen: 'r1bqkb1r/ppp2ppp/2n2n2/3pp3/3PP3/2N2N2/PPP2PPP/R1BQKB1R w KQkq - 0 6',
      turn: 'w',
      moveNumber: 6,
    },
    correctAnswer: 'An ideal outpost is a square in the opponent\'s territory that cannot be attacked by enemy pawns, is defended by your pawns, and is centrally located. Outposts are valuable because pieces placed there control key squares, support attacks, and are difficult to remove.',
    hints: [
      'Can Black\'s pawns attack a knight on d5 or e5?',
      'What squares would a knight on e5 control?',
      'Why is a piece that can\'t be driven away by pawns so strong?',
    ],
    explanation: 'Outposts are advanced squares that enemy pawns cannot attack. In this position, e5 and d5 are potential outposts because Black\'s e and d pawns have advanced. A knight on e5 would be incredibly strong: it controls c6, d7, f7, g6, and g4, cannot be driven away by pawns, and supports both attack and defense. Knights especially love outposts because, unlike bishops, they don\'t need open diagonals - just a secure square.',
    relatedOpeningLine: 'torre-main-1',
  },
  {
    id: 'general-concept-5',
    concept: 'Space Advantage',
    question: 'What does it mean to have a "space advantage" in chess, and how can you use it to your benefit?',
    position: {
      fen: 'rnbqkb1r/ppp2ppp/4pn2/3pP3/2PP4/5N2/PP3PPP/RNBQKB1R b KQkq - 0 5',
      turn: 'b',
      moveNumber: 5,
    },
    correctAnswer: 'A space advantage means your pawns control more territory, giving your pieces more room to maneuver while restricting your opponent\'s pieces. You can use it by maneuvering pieces to better squares, preparing attacks, and making it hard for your opponent to develop.',
    hints: [
      'Count the squares White\'s pawns control vs Black\'s pawns.',
      'Which side has more room to move their pieces?',
      'How easy will it be for Black to develop the c8 bishop?',
    ],
    explanation: 'Space advantage is about controlling more territory with your pawns. In this position, White\'s pawns on c4, d4, and e5 control many squares in Black\'s half of the board. This gives White more room to maneuver pieces and restricts Black\'s options (e.g., the c8 bishop has no good squares). To use a space advantage: maneuver pieces to optimal squares, restrict opponent\'s piece activity, and avoid too many exchanges (you want to keep the position cramped for your opponent).',
    relatedOpeningLine: 'colle-main-1',
  },
  {
    id: 'general-concept-6',
    concept: 'Piece Coordination',
    question: 'What does "piece coordination" mean, and how can you tell if your pieces are working together effectively?',
    position: {
      fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 5',
      turn: 'w',
      moveNumber: 5,
    },
    correctAnswer: 'Piece coordination means your pieces support each other and work toward common goals (controlling key squares, attacking targets, defending weaknesses). Well-coordinated pieces attack the same targets, control overlapping squares, and defend each other.',
    hints: [
      'Do White\'s pieces (Bc4, Nf3) attack any common squares?',
      'Are there pieces that support each other?',
      'If one piece moves, does it help or hinder other pieces?',
    ],
    explanation: 'Coordination is about teamwork. In this position, White\'s Bc4 and Nf3 both eye the f7 square (a classic weak point). The d3 pawn supports both the e4 pawn and the c4 bishop. Well-coordinated pieces create threats your opponent must address - if multiple pieces attack the same target, it\'s hard to defend. Poor coordination means pieces get in each other\'s way, don\'t support common goals, or leave weaknesses undefended. Always ask: are my pieces helping each other?',
    relatedOpeningLine: 'colle-main-1',
  },
];

/**
 * All concept cards organized by system
 */
export const CONCEPT_CARDS_BY_SYSTEM: Record<OpeningSystem | 'general', ConceptCard[]> = {
  'kings-indian-attack': KIA_CONCEPTS,
  'colle-system': COLLE_CONCEPTS,
  'stonewall-attack': STONEWALL_CONCEPTS,
  'london-system': LONDON_CONCEPTS,
  'torre-attack': TORRE_CONCEPTS,
  'general': GENERAL_CONCEPTS,
};

/**
 * Get all concept cards for a specific system
 */
export function getConceptCardsForSystem(system: OpeningSystem | 'general'): ConceptCard[] {
  return CONCEPT_CARDS_BY_SYSTEM[system] || [];
}

/**
 * Get a random concept card
 */
export function getRandomConceptCard(system?: OpeningSystem | 'general'): ConceptCard {
  if (system) {
    const cards = getConceptCardsForSystem(system);
    return cards[Math.floor(Math.random() * cards.length)];
  }

  // Get from all systems
  const allCards = Object.values(CONCEPT_CARDS_BY_SYSTEM).flat();
  return allCards[Math.floor(Math.random() * allCards.length)];
}

/**
 * Get concept card by ID
 */
export function getConceptCardById(id: string): ConceptCard | undefined {
  const allCards = Object.values(CONCEPT_CARDS_BY_SYSTEM).flat();
  return allCards.find(card => card.id === id);
}

/**
 * Get all concept cards
 */
export function getAllConceptCards(): ConceptCard[] {
  return Object.values(CONCEPT_CARDS_BY_SYSTEM).flat();
}
