/**
 * Enhanced AI Opponent Service
 *
 * Provides stronger AI opponents with deeper evaluation.
 * Features:
 * - Multi-ply minimax with alpha-beta pruning
 * - Piece-square tables for positional play
 * - Move ordering for better pruning efficiency
 * - Position evaluation considering multiple factors
 */

import { Chess } from 'chess.js';
import type { Square } from '../../types';
import { stockfishService, type StockfishDifficulty } from './stockfishService';

export type AIDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'expert' | 'master' | 'grandmaster';

export interface AIMove {
  from: Square;
  to: Square;
  san: string;
  evaluation: number;
}

export interface MoveEvaluation {
  move: string;
  evaluation: number;
  isBlunder: boolean;
  isMistake: boolean;
  isInaccuracy: boolean;
  isBest: boolean;
  comment?: string;
}

// Piece-square tables for positional evaluation
const PIECE_SQUARE_TABLES = {
  p: [ // Pawns
    0,  0,  0,  0,  0,  0,  0,  0,
    50, 50, 50, 50, 50, 50, 50, 50,
    10, 10, 20, 30, 30, 20, 10, 10,
    5,  5, 10, 25, 25, 10,  5,  5,
    0,  0,  0, 20, 20,  0,  0,  0,
    5, -5,-10,  0,  0,-10, -5,  5,
    5, 10, 10,-20,-20, 10, 10,  5,
    0,  0,  0,  0,  0,  0,  0,  0
  ],
  n: [ // Knights
    -50,-40,-30,-30,-30,-30,-40,-50,
    -40,-20,  0,  0,  0,  0,-20,-40,
    -30,  0, 10, 15, 15, 10,  0,-30,
    -30,  5, 15, 20, 20, 15,  5,-30,
    -30,  0, 15, 20, 20, 15,  0,-30,
    -30,  5, 10, 15, 15, 10,  5,-30,
    -40,-20,  0,  5,  5,  0,-20,-40,
    -50,-40,-30,-30,-30,-30,-40,-50,
  ],
  b: [ // Bishops
    -20,-10,-10,-10,-10,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5, 10, 10,  5,  0,-10,
    -10,  5,  5, 10, 10,  5,  5,-10,
    -10,  0, 10, 10, 10, 10,  0,-10,
    -10, 10, 10, 10, 10, 10, 10,-10,
    -10,  5,  0,  0,  0,  0,  5,-10,
    -20,-10,-10,-10,-10,-10,-10,-20,
  ],
  r: [ // Rooks
    0,  0,  0,  0,  0,  0,  0,  0,
    5, 10, 10, 10, 10, 10, 10,  5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    -5,  0,  0,  0,  0,  0,  0, -5,
    0,  0,  0,  5,  5,  0,  0,  0
  ],
  q: [ // Queen
    -20,-10,-10, -5, -5,-10,-10,-20,
    -10,  0,  0,  0,  0,  0,  0,-10,
    -10,  0,  5,  5,  5,  5,  0,-10,
    -5,  0,  5,  5,  5,  5,  0, -5,
    0,  0,  5,  5,  5,  5,  0, -5,
    -10,  5,  5,  5,  5,  5,  0,-10,
    -10,  0,  5,  0,  0,  0,  0,-10,
    -20,-10,-10, -5, -5,-10,-10,-20
  ],
  k: [ // King (middlegame)
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -30,-40,-40,-50,-50,-40,-40,-30,
    -20,-30,-30,-40,-40,-30,-30,-20,
    -10,-20,-20,-20,-20,-20,-20,-10,
    20, 20,  0,  0,  0,  0, 20, 20,
    20, 30, 10,  0,  0, 10, 30, 20
  ]
};

const PIECE_VALUES = {
  p: 100,
  n: 320,
  b: 330,
  r: 500,
  q: 900,
  k: 20000
};

/**
 * Enhanced position evaluation considering multiple factors
 */
export function evaluatePosition(chess: Chess): number {
  if (chess.isCheckmate()) {
    return chess.turn() === 'w' ? -30000 : 30000;
  }

  if (chess.isDraw() || chess.isStalemate()) {
    return 0;
  }

  let score = 0;
  const board = chess.board();

  // Material and position evaluation
  for (let rank = 0; rank < 8; rank++) {
    for (let file = 0; file < 8; file++) {
      const square = board[rank][file];
      if (square) {
        const piece = square.type;
        const isWhite = square.color === 'w';

        // Material value
        let pieceValue = PIECE_VALUES[piece];

        // Piece-square table bonus
        const tableIndex = isWhite ? (7 - rank) * 8 + file : rank * 8 + file;
        const positionBonus = PIECE_SQUARE_TABLES[piece][tableIndex];

        const totalValue = pieceValue + positionBonus;
        score += isWhite ? totalValue : -totalValue;
      }
    }
  }

  // Mobility bonus (number of legal moves)
  const moves = chess.moves().length;
  score += chess.turn() === 'w' ? moves * 10 : -moves * 10;

  // King safety (penalize king exposure in middlegame)
  const moveCount = chess.history().length;
  if (moveCount < 40) { // Middlegame
    // Additional evaluation for king safety could go here
  }

  return score;
}

/**
 * Order moves for better alpha-beta pruning
 */
function orderMoves(chess: Chess, moves: any[]): any[] {
  return moves.sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Prioritize captures
    if (a.captured) scoreA += 1000 + PIECE_VALUES[a.captured];
    if (b.captured) scoreB += 1000 + PIECE_VALUES[b.captured];

    // Prioritize checks
    const testChessA = new Chess(chess.fen());
    testChessA.move(a.san);
    if (testChessA.inCheck()) scoreA += 500;

    const testChessB = new Chess(chess.fen());
    testChessB.move(b.san);
    if (testChessB.inCheck()) scoreB += 500;

    // Prioritize center control
    if (['e4', 'e5', 'd4', 'd5'].includes(a.to)) scoreA += 100;
    if (['e4', 'e5', 'd4', 'd5'].includes(b.to)) scoreB += 100;

    return scoreB - scoreA;
  });
}

/**
 * Minimax with alpha-beta pruning
 */
function minimax(
  chess: Chess,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean
): number {
  if (depth === 0 || chess.isGameOver()) {
    return evaluatePosition(chess);
  }

  const moves = chess.moves({ verbose: true });
  const orderedMoves = orderMoves(chess, moves);

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of orderedMoves) {
      chess.move(move.san);
      const evaluation = minimax(chess, depth - 1, alpha, beta, false);
      chess.undo();

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);

      if (beta <= alpha) {
        break; // Beta cutoff
      }
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    for (const move of orderedMoves) {
      chess.move(move.san);
      const evaluation = minimax(chess, depth - 1, alpha, beta, true);
      chess.undo();

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);

      if (beta <= alpha) {
        break; // Alpha cutoff
      }
    }
    return minEval;
  }
}

/**
 * Get best move using minimax
 */
export function getBestMove(chess: Chess, depth: number = 3): AIMove | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const orderedMoves = orderMoves(chess, moves);
  let bestMove = orderedMoves[0];
  let bestEval = -Infinity;

  const isMaximizing = chess.turn() === 'w';

  for (const move of orderedMoves) {
    chess.move(move.san);
    const evaluation = minimax(
      chess,
      depth - 1,
      -Infinity,
      Infinity,
      !isMaximizing
    );
    chess.undo();

    const finalEval = isMaximizing ? evaluation : -evaluation;

    if (finalEval > bestEval) {
      bestEval = finalEval;
      bestMove = move;
    }
  }

  return {
    from: bestMove.from as Square,
    to: bestMove.to as Square,
    san: bestMove.san,
    evaluation: bestEval,
  };
}

/**
 * Evaluate a specific move
 */
export function evaluateMove(chess: Chess, moveSan: string, depth: number = 3): MoveEvaluation {
  const beforeEval = evaluatePosition(chess);

  chess.move(moveSan);
  const afterEval = -evaluatePosition(chess);
  chess.undo();

  const bestMove = getBestMove(chess, depth);
  const bestEval = bestMove?.evaluation || 0;

  const evalDiff = bestEval - afterEval;

  // Classify move quality
  const isBlunder = evalDiff > 300;
  const isMistake = evalDiff > 150 && evalDiff <= 300;
  const isInaccuracy = evalDiff > 50 && evalDiff <= 150;
  const isBest = evalDiff <= 10;

  let comment = '';
  if (isBlunder) comment = 'Blunder! This loses significant material or position.';
  else if (isMistake) comment = 'Mistake. A better move was available.';
  else if (isInaccuracy) comment = 'Inaccuracy. Not the best move.';
  else if (isBest) comment = 'Best move!';
  else comment = 'Good move.';

  return {
    move: moveSan,
    evaluation: afterEval,
    isBlunder,
    isMistake,
    isInaccuracy,
    isBest,
    comment,
  };
}

/**
 * Analyze all moves in a game
 */
export function analyzeGame(moves: string[], startFen?: string): MoveEvaluation[] {
  const chess = new Chess(startFen);
  const evaluations: MoveEvaluation[] = [];

  for (const move of moves) {
    const evaluation = evaluateMove(chess, move, 2); // Lower depth for speed
    evaluations.push(evaluation);
    chess.move(move);
  }

  return evaluations;
}

/**
 * Get AI move based on difficulty
 */
export async function getAIMove(chess: Chess, difficulty: AIDifficulty = 'intermediate'): Promise<AIMove | null> {
  if (chess.isGameOver()) return null;

  // Use Stockfish for master and grandmaster levels
  if (difficulty === 'master' || difficulty === 'grandmaster') {
    try {
      const stockfishMove = await stockfishService.getBestMove(
        chess.fen(),
        difficulty as StockfishDifficulty
      );

      return {
        from: stockfishMove.from,
        to: stockfishMove.to,
        san: stockfishMove.san,
        evaluation: stockfishMove.evaluation,
      };
    } catch (error) {
      console.warn('Stockfish failed, falling back to minimax:', error);
      // Fall through to minimax as fallback
    }
  }

  let depth = 1;
  let randomChance = 0;

  switch (difficulty) {
    case 'beginner':
      depth = 1;
      randomChance = 0.5; // 50% chance of random move
      break;
    case 'intermediate':
      depth = 2;
      randomChance = 0.2; // 20% chance of random move
      break;
    case 'advanced':
      depth = 3;
      randomChance = 0.05; // 5% chance of random move
      break;
    case 'expert':
      depth = 4;
      randomChance = 0;
      break;
    case 'master':
      depth = 5;
      randomChance = 0;
      break;
    case 'grandmaster':
      depth = 6;
      randomChance = 0;
      break;
  }

  // Occasional random move for realism
  if (Math.random() < randomChance) {
    const moves = chess.moves({ verbose: true });
    const randomMove = moves[Math.floor(Math.random() * moves.length)];
    return {
      from: randomMove.from as Square,
      to: randomMove.to as Square,
      san: randomMove.san,
      evaluation: 0,
    };
  }

  return getBestMove(chess, depth);
}

/**
 * Get AI move with thinking delay
 */
export async function getAIMoveDelayed(
  chess: Chess,
  difficulty: AIDifficulty = 'intermediate',
  minDelay: number = 500,
  maxDelay: number = 2000
): Promise<AIMove | null> {
  const delay = Math.random() * (maxDelay - minDelay) + minDelay;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getAIMove(chess, difficulty));
    }, delay);
  });
}

/**
 * Get difficulty description
 */
export function getDifficultyDescription(difficulty: AIDifficulty): string {
  switch (difficulty) {
    case 'beginner':
      return 'Makes mostly random moves with basic evaluation';
    case 'intermediate':
      return 'Evaluates 2 moves ahead with occasional mistakes';
    case 'advanced':
      return 'Evaluates 3 moves ahead with strong positional play';
    case 'expert':
      return 'Evaluates 4 moves ahead with near-perfect play';
    case 'master':
      return 'Stockfish-powered engine with master-level play';
    case 'grandmaster':
      return 'Stockfish at full strength - grandmaster level';
    default:
      return 'Unknown difficulty';
  }
}

/**
 * Get estimated ELO rating
 */
export function getEstimatedELO(difficulty: AIDifficulty): number {
  switch (difficulty) {
    case 'beginner':
      return 800;
    case 'intermediate':
      return 1400;
    case 'advanced':
      return 1800;
    case 'expert':
      return 2200;
    case 'master':
      return 2600;
    case 'grandmaster':
      return 3200;
    default:
      return 1000;
  }
}

export default {
  getAIMove,
  getAIMoveDelayed,
  getBestMove,
  evaluateMove,
  analyzeGame,
  getDifficultyDescription,
  getEstimatedELO,
};
