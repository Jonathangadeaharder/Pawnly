/**
 * Simple AI Opponent Service
 *
 * Provides basic AI opponents of varying difficulty levels.
 * Uses random legal move selection with some strategic weighting.
 * This is a placeholder for future Stockfish.js or Maia integration.
 */

import { Chess } from 'chess.js';
import type { Square } from '../../types';

export type AIDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface AIMove {
  from: Square;
  to: Square;
  san: string;
  evaluation?: number;
}

/**
 * Simple evaluation function (very basic)
 * Returns a score from the AI's perspective
 */
function evaluatePosition(chess: Chess): number {
  const pieceValues: { [key: string]: number } = {
    p: 1,
    n: 3,
    b: 3,
    r: 5,
    q: 9,
    k: 0,
  };

  let score = 0;
  const board = chess.board();

  for (let row of board) {
    for (let square of row) {
      if (square) {
        const value = pieceValues[square.type];
        score += square.color === chess.turn() ? value : -value;
      }
    }
  }

  return score;
}

/**
 * Get a random legal move
 */
function getRandomMove(chess: Chess): AIMove | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  return {
    from: randomMove.from as Square,
    to: randomMove.to as Square,
    san: randomMove.san,
  };
}

/**
 * Get a move with basic tactics awareness
 * Prioritizes captures and checks
 */
function getTacticalMove(chess: Chess): AIMove | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  // Prioritize captures
  const captures = moves.filter((m) => m.captured);
  if (captures.length > 0 && Math.random() > 0.3) {
    const move = captures[Math.floor(Math.random() * captures.length)];
    return {
      from: move.from as Square,
      to: move.to as Square,
      san: move.san,
    };
  }

  // Prioritize checks
  const checks = moves.filter((m) => {
    const testChess = new Chess(chess.fen());
    testChess.move(m.san);
    return testChess.inCheck();
  });

  if (checks.length > 0 && Math.random() > 0.5) {
    const move = checks[Math.floor(Math.random() * checks.length)];
    return {
      from: move.from as Square,
      to: move.to as Square,
      san: move.san,
    };
  }

  // Otherwise random move
  const randomMove = moves[Math.floor(Math.random() * moves.length)];
  return {
    from: randomMove.from as Square,
    to: randomMove.to as Square,
    san: randomMove.san,
  };
}

/**
 * Get best move using minimax (1-ply lookahead)
 */
function getStrategicMove(chess: Chess): AIMove | null {
  const moves = chess.moves({ verbose: true });
  if (moves.length === 0) return null;

  let bestMove = moves[0];
  let bestScore = -Infinity;

  for (const move of moves) {
    const testChess = new Chess(chess.fen());
    testChess.move(move.san);

    // Simple 1-ply evaluation
    const score = -evaluatePosition(testChess);

    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  return {
    from: bestMove.from as Square,
    to: bestMove.to as Square,
    san: bestMove.san,
    evaluation: bestScore,
  };
}

/**
 * Get AI move based on difficulty level
 */
export function getAIMove(chess: Chess, difficulty: AIDifficulty = 'intermediate'): AIMove | null {
  if (chess.isGameOver()) return null;

  switch (difficulty) {
    case 'beginner':
      // 80% random, 20% tactical
      return Math.random() > 0.8 ? getTacticalMove(chess) : getRandomMove(chess);

    case 'intermediate':
      // 60% tactical, 40% strategic
      return Math.random() > 0.6 ? getStrategicMove(chess) : getTacticalMove(chess);

    case 'advanced':
      // 90% strategic, 10% tactical variety
      return Math.random() > 0.9 ? getTacticalMove(chess) : getStrategicMove(chess);

    default:
      return getRandomMove(chess);
  }
}

/**
 * Get AI move with thinking delay (more realistic)
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
 * Check if AI should offer a draw
 */
export function shouldOfferDraw(chess: Chess): boolean {
  // Simple heuristic: offer draw if position is roughly equal and enough moves played
  const moveCount = chess.history().length;
  const evaluation = Math.abs(evaluatePosition(chess));

  return moveCount > 40 && evaluation < 2 && Math.random() > 0.9;
}

/**
 * Check if AI should resign
 */
export function shouldResign(chess: Chess): boolean {
  // Resign if losing badly
  const evaluation = evaluatePosition(chess);
  return evaluation < -15 && Math.random() > 0.7;
}

/**
 * Get difficulty description
 */
export function getDifficultyDescription(difficulty: AIDifficulty): string {
  switch (difficulty) {
    case 'beginner':
      return 'Makes mostly random moves with occasional tactics';
    case 'intermediate':
      return 'Plays tactically and looks for good captures';
    case 'advanced':
      return 'Evaluates positions and plays strategically';
    default:
      return 'Unknown difficulty';
  }
}

/**
 * Get estimated ELO rating for difficulty
 */
export function getEstimatedELO(difficulty: AIDifficulty): number {
  switch (difficulty) {
    case 'beginner':
      return 800;
    case 'intermediate':
      return 1200;
    case 'advanced':
      return 1600;
    default:
      return 1000;
  }
}

export default {
  getAIMove,
  getAIMoveDelayed,
  shouldOfferDraw,
  shouldResign,
  getDifficultyDescription,
  getEstimatedELO,
};
