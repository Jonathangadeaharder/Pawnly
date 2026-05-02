/**
 * Coach Commentary Service
 * Generates Socratic prompts and teaching moments for critical positions
 */

import { Chess } from 'chess.js';
import type { CoachPrompt, VisualHighlight, Square } from '../../types';
import { evaluatePosition, getBestMove } from '../ai/enhancedAI';
import { getCoachIntervention } from './coachService';

export interface CriticalPosition {
  moveIndex: number;
  type: 'blunder' | 'missed-tactic' | 'checkmate-threat' | 'critical-decision';
  severity: 'low' | 'medium' | 'high';
  coachPrompt: CoachPrompt;
}

/**
 * Identifies critical positions in a game that warrant coach intervention
 */
export function identifyCriticalPositions(
  moves: string[],
  startFen?: string
): CriticalPosition[] {
  const chess = new Chess(startFen);
  const criticalPositions: CriticalPosition[] = [];

  // TODO: Get real user level and personality from stores
  const userLevel = 'beginner'; 
  const personality = 'friendly';

  for (let i = 0; i < moves.length; i++) {
    const beforeFen = chess.fen();
    const movePlayed = moves[i];

    // Get best move before playing the actual move
    const bestMoveInfo = getBestMove(chess, 2);
    const bestEval = bestMoveInfo?.evaluation || 0;

    // Play the actual move
    chess.move(movePlayed);
    const afterFen = chess.fen();
    const actualEval = -evaluatePosition(chess);

    const evalDiff = bestEval - actualEval;

    // Check for blunders (major learning opportunity)
    if (evalDiff > 300) {
      criticalPositions.push({
        moveIndex: i,
        type: 'blunder',
        severity: evalDiff > 500 ? 'high' : 'medium',
        coachPrompt: getCoachIntervention({
          beforeFen,
          afterFen,
          movePlayed,
          evaluationDrop: evalDiff,
          userLevel,
          personality,
        }),
      });
    }
    // ... rest of the logic

    // Check for missed tactics
    if (evalDiff > 150 && evalDiff <= 300) {
      const hasTacticalShot = detectTacticalOpportunity(beforeFen);
      if (hasTacticalShot) {
        criticalPositions.push({
          moveIndex: i,
          type: 'missed-tactic',
          severity: 'medium',
          coachPrompt: generateMissedTacticPrompt(beforeFen, movePlayed, bestMoveInfo?.san || '', i),
        });
      }
    }

    // Check for checkmate threats (defensive)
    if (chess.isCheck()) {
      const isCheckmate = chess.isCheckmate();
      if (isCheckmate) {
        criticalPositions.push({
          moveIndex: i,
          type: 'checkmate-threat',
          severity: 'high',
          coachPrompt: generateCheckmatePrompt(afterFen, movePlayed, i, 'delivered'),
        });
      }
    }

    // Check if player could have delivered checkmate
    const couldCheckmate = canDeliverCheckmate(beforeFen);
    if (couldCheckmate && !chess.isCheckmate()) {
      criticalPositions.push({
        moveIndex: i,
        type: 'missed-tactic',
        severity: 'high',
        coachPrompt: generateCheckmatePrompt(beforeFen, movePlayed, i, 'missed'),
      });
    }
  }

  return criticalPositions;
}

/**
 * Generates a Socratic prompt for a blunder
 */
function generateBlunderPrompt(
  fen: string,
  movePlayed: string,
  bestMove: string,
  moveIndex: number
): CoachPrompt {
  const chess = new Chess(fen);
  const turn = chess.turn() === 'w' ? 'White' : 'Black';

  const questions = [
    `Before playing ${movePlayed}, what threats should ${turn} be aware of?`,
    `What piece or square is left undefended after ${movePlayed}?`,
    `How could ${turn} have better protected their position?`,
    `What was the opponent threatening that ${movePlayed} didn't address?`,
  ];

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  return {
    id: `blunder-${moveIndex}`,
    type: 'socratic-question',
    text: randomQuestion,
    expectedResponse: bestMove,
    followUpPrompts: [
      {
        id: `blunder-${moveIndex}-hint`,
        type: 'hint',
        text: `Consider what happens after ${movePlayed}. Is anything left hanging?`,
      },
      {
        id: `blunder-${moveIndex}-explanation`,
        type: 'explanation',
        text: `Instead of ${movePlayed}, ${bestMove} would have been much stronger, maintaining material balance and position.`,
      },
    ],
    visualHighlights: generateBlunderHighlights(fen, movePlayed, bestMove),
  };
}

/**
 * Generates a Socratic prompt for a missed tactic
 */
function generateMissedTacticPrompt(
  fen: string,
  movePlayed: string,
  bestMove: string,
  moveIndex: number
): CoachPrompt {
  const chess = new Chess(fen);
  const turn = chess.turn() === 'w' ? 'White' : 'Black';

  const questions = [
    `What tactical opportunity exists in this position for ${turn}?`,
    `Can you spot a forcing move that improves ${turn}'s position?`,
    `Is there a piece that could be attacked or a square that could be occupied with tempo?`,
    `What's the most active move ${turn} can make here?`,
  ];

  const randomQuestion = questions[Math.floor(Math.random() * questions.length)];

  return {
    id: `tactic-${moveIndex}`,
    type: 'socratic-question',
    text: randomQuestion,
    expectedResponse: bestMove,
    followUpPrompts: [
      {
        id: `tactic-${moveIndex}-hint`,
        type: 'hint',
        text: `Look for moves that create multiple threats or win material.`,
      },
      {
        id: `tactic-${moveIndex}-explanation`,
        type: 'explanation',
        text: `${bestMove} was a strong tactical move that would have improved the position significantly.`,
      },
    ],
    visualHighlights: generateTacticalHighlights(fen, bestMove),
  };
}

/**
 * Generates a Socratic prompt for checkmate situations
 */
function generateCheckmatePrompt(
  fen: string,
  movePlayed: string,
  moveIndex: number,
  situation: 'delivered' | 'missed'
): CoachPrompt {
  if (situation === 'delivered') {
    return {
      id: `checkmate-${moveIndex}`,
      type: 'encouragement',
      text: `Checkmate! ${movePlayed} delivered the final blow. Well played!`,
    };
  } else {
    return {
      id: `checkmate-missed-${moveIndex}`,
      type: 'socratic-question',
      text: `In this position, can you find a checkmate in one move?`,
      followUpPrompts: [
        {
          id: `checkmate-missed-${moveIndex}-hint`,
          type: 'hint',
          text: `Look for forcing moves that attack the king and eliminate all escape squares.`,
        },
        {
          id: `checkmate-missed-${moveIndex}-explanation`,
          type: 'explanation',
          text: `There was a checkmate available in this position! Always look for forcing moves when the enemy king is exposed.`,
        },
      ],
      visualHighlights: generateCheckmateHighlights(fen),
    };
  }
}

/**
 * Detects if there's a tactical opportunity in the position
 */
function detectTacticalOpportunity(fen: string): boolean {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });

  // Check for pieces under attack (non-pawn)
  for (const move of moves) {
    if (move.captured && move.captured !== 'p') {
      return true;
    }
  }

  // Check for forks
  if (detectFork(chess, moves)) return true;

  // Check for pins and skewers
  if (detectPinOrSkewer(chess)) return true;

  // Check for discovered attacks
  if (detectDiscoveredAttack(chess, moves)) return true;

  // Check for double attacks
  if (detectDoubleAttack(chess, moves)) return true;

  // Forcing move with check and capture
  const hasCheck = moves.some(m => m.san.includes('+'));
  const hasCapture = moves.some(m => m.captured);
  return hasCheck && hasCapture;
}

/**
 * Detects fork patterns (one piece attacking two or more pieces)
 */
function detectFork(chess: Chess, moves: any[]): boolean {
  for (const move of moves) {
    chess.move(move.san);

    // Check if the moved piece attacks multiple valuable pieces
    const attacks = getAttackedSquares(chess, move.to);
    const valuablePiecesAttacked = attacks.filter(sq => {
      const piece = chess.get(sq);
      return piece && piece.type !== 'p' && piece.color !== chess.turn();
    });

    chess.undo();

    if (valuablePiecesAttacked.length >= 2) {
      return true;
    }
  }
  return false;
}

/**
 * Detects pin or skewer patterns
 */
function detectPinOrSkewer(chess: Chess): boolean {
  // Check for pieces aligned on ranks, files, and diagonals
  // that could be pinned or skewered
  const board = chess.board();

  // Simplified detection: check if any rook/queen on rank/file
  // or bishop/queen on diagonal has two enemy pieces in line
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (!piece || piece.color !== chess.turn()) continue;

      if (piece.type === 'r' || piece.type === 'q') {
        // Check rank and file
        if (hasAlignedEnemyPieces(board, rank, file, 'horizontal') ||
            hasAlignedEnemyPieces(board, rank, file, 'vertical')) {
          return true;
        }
      }

      if (piece.type === 'b' || piece.type === 'q') {
        // Check diagonals
        if (hasAlignedEnemyPieces(board, rank, file, 'diagonal-up') ||
            hasAlignedEnemyPieces(board, rank, file, 'diagonal-down')) {
          return true;
        }
      }
    }
  }
  return false;
}

/**
 * Detects discovered attack patterns
 */
function detectDiscoveredAttack(chess: Chess, moves: any[]): boolean {
  for (const move of moves) {
    // Check if moving this piece reveals an attack from a piece behind it
    chess.move(move.san);

    // Check if any enemy pieces are now under attack from pieces
    // that were behind the moved piece
    const opponentKing = findKingSquare(chess, chess.turn() === 'w' ? 'b' : 'w');
    if (opponentKing && isSquareAttacked(chess, opponentKing)) {
      chess.undo();
      return true;
    }

    chess.undo();
  }
  return false;
}

/**
 * Detects double attack (attacking two pieces simultaneously)
 */
function detectDoubleAttack(chess: Chess, moves: any[]): boolean {
  for (const move of moves) {
    chess.move(move.san);

    const attackedSquares = getAttackedSquares(chess, move.to);
    const threatenedPieces = attackedSquares.filter(sq => {
      const piece = chess.get(sq);
      return piece && piece.color !== chess.turn() && piece.type !== 'p';
    });

    chess.undo();

    if (threatenedPieces.length >= 2) {
      return true;
    }
  }
  return false;
}

/**
 * Helper: Get all squares attacked by a piece at given square
 */
function getAttackedSquares(chess: Chess, square: string): string[] {
  const attacked: string[] = [];
  const piece = chess.get(square);
  if (!piece) return attacked;

  // Get all legal moves from this square
  const moves = chess.moves({ square, verbose: true });
  for (const move of moves) {
    attacked.push(move.to);
  }

  return attacked;
}

/**
 * Helper: Check if square is under attack
 */
function isSquareAttacked(chess: Chess, square: string): boolean {
  const attacks = chess.moves({ verbose: true });
  return attacks.some(move => move.to === square);
}

/**
 * Helper: Check if there are aligned enemy pieces in a direction
 */
function hasAlignedEnemyPieces(
  board: any[][],
  rank: number,
  file: number,
  direction: 'horizontal' | 'vertical' | 'diagonal-up' | 'diagonal-down'
): boolean {
  const piece = board[rank][file];
  if (!piece) return false;

  let enemyCount = 0;
  const deltas = {
    'horizontal': [[0, 1], [0, -1]],
    'vertical': [[1, 0], [-1, 0]],
    'diagonal-up': [[1, 1], [-1, -1]],
    'diagonal-down': [[1, -1], [-1, 1]]
  };

  for (const [dr, df] of deltas[direction]) {
    let r = rank + dr;
    let f = file + df;

    while (r >= 0 && r < 8 && f >= 0 && f < 8) {
      const targetPiece = board[r][f];
      if (targetPiece) {
        if (targetPiece.color !== piece.color) {
          enemyCount++;
          if (enemyCount >= 2) return true;
        }
        break; // Stop at first piece in this direction
      }
      r += dr;
      f += df;
    }
  }

  return false;
}

/**
 * Checks if checkmate can be delivered in one move
 */
function canDeliverCheckmate(fen: string): boolean {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true });

  for (const move of moves) {
    chess.move(move.san);
    if (chess.isCheckmate()) {
      chess.undo();
      return true;
    }
    chess.undo();
  }

  return false;
}

/**
 * Generates visual highlights for blunders
 */
function generateBlunderHighlights(fen: string, movePlayed: string, bestMove: string): VisualHighlight[] {
  const highlights: VisualHighlight[] = [];

  try {
    const chess = new Chess(fen);

    // Highlight the move that was played (red)
    const playedMove = chess.move(movePlayed);
    if (playedMove) {
      highlights.push({
        type: 'arrow',
        squares: [playedMove.from as Square, playedMove.to as Square],
        color: 'red',
        from: playedMove.from as Square,
        to: playedMove.to as Square,
      });
    }

    chess.undo();

    // Highlight the best move (green)
    const bestMoveObj = chess.move(bestMove);
    if (bestMoveObj) {
      highlights.push({
        type: 'arrow',
        squares: [bestMoveObj.from as Square, bestMoveObj.to as Square],
        color: 'green',
        from: bestMoveObj.from as Square,
        to: bestMoveObj.to as Square,
      });
    }
  } catch (error) {
    console.error('Error generating blunder highlights:', error);
  }

  return highlights;
}

/**
 * Generates visual highlights for tactical opportunities
 */
function generateTacticalHighlights(fen: string, bestMove: string): VisualHighlight[] {
  const highlights: VisualHighlight[] = [];

  try {
    const chess = new Chess(fen);
    const moveObj = chess.move(bestMove);

    if (moveObj) {
      highlights.push({
        type: 'arrow',
        squares: [moveObj.from as Square, moveObj.to as Square],
        color: 'blue',
        from: moveObj.from as Square,
        to: moveObj.to as Square,
      });

      // Highlight the target square
      highlights.push({
        type: 'circle',
        squares: [moveObj.to as Square],
        color: 'blue',
      });
    }
  } catch (error) {
    console.error('Error generating tactical highlights:', error);
  }

  return highlights;
}

/**
 * Generates visual highlights for checkmate threats
 */
function generateCheckmateHighlights(fen: string): VisualHighlight[] {
  const highlights: VisualHighlight[] = [];

  try {
    const chess = new Chess(fen);
    const kingSquare = findKingSquare(chess, chess.turn() === 'w' ? 'b' : 'w');

    if (kingSquare) {
      highlights.push({
        type: 'circle',
        squares: [kingSquare],
        color: 'yellow',
      });
    }
  } catch (error) {
    console.error('Error generating checkmate highlights:', error);
  }

  return highlights;
}

/**
 * Finds the king's square for a given color
 */
function findKingSquare(chess: Chess, color: 'w' | 'b'): Square | null {
  const board = chess.board();

  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const piece = board[rank][file];
      if (piece && piece.type === 'k' && piece.color === color) {
        const files = 'abcdefgh';
        const ranks = '87654321';
        return `${files[file]}${ranks[rank]}` as Square;
      }
    }
  }

  return null;
}

/**
 * Gets a coach prompt for a specific move in the analysis
 */
export function getCoachPromptForMove(
  criticalPositions: CriticalPosition[],
  moveIndex: number
): CoachPrompt | null {
  const critical = criticalPositions.find(cp => cp.moveIndex === moveIndex);
  return critical ? critical.coachPrompt : null;
}

/**
 * Determines if a move index is critical
 */
export function isCriticalMove(
  criticalPositions: CriticalPosition[],
  moveIndex: number
): boolean {
  return criticalPositions.some(cp => cp.moveIndex === moveIndex);
}
