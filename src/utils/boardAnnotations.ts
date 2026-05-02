/**
 * Board Annotations Utilities
 * Helper functions and constants for arrows and highlights on the chessboard
 */

import type { Arrow, Highlight, Square } from '../types';

/**
 * Predefined arrow colors
 */
export const ArrowColors = {
  GREEN: '#15803d',    // Primary suggestion
  BLUE: '#1e40af',     // Alternative move
  RED: '#b91c1c',      // Mistake/Blunder
  YELLOW: '#ca8a04',   // Warning/Caution
  ORANGE: '#ea580c',   // Interesting move
} as const;

/**
 * Predefined highlight colors
 */
export const HighlightColors = {
  GREEN: '#15803d',    // Good square
  BLUE: '#1e40af',     // Alternative square
  RED: '#b91c1c',      // Danger square
  YELLOW: '#ca8a04',   // Warning square
  PURPLE: '#7c3aed',   // Special square
} as const;

/**
 * Create an arrow annotation
 */
export function createArrow(
  from: Square,
  to: Square,
  color: string = ArrowColors.GREEN,
  opacity: number = 0.8
): Arrow {
  return { from, to, color, opacity };
}

/**
 * Create a highlight annotation
 */
export function createHighlight(
  square: Square,
  color: string = HighlightColors.GREEN,
  opacity: number = 0.4
): Highlight {
  return { square, color, opacity };
}

/**
 * Create best move arrow (green)
 */
export function createBestMoveArrow(from: Square, to: Square): Arrow {
  return createArrow(from, to, ArrowColors.GREEN, 0.8);
}

/**
 * Create alternative move arrow (blue)
 */
export function createAlternativeArrow(from: Square, to: Square): Arrow {
  return createArrow(from, to, ArrowColors.BLUE, 0.7);
}

/**
 * Create blunder arrow (red)
 */
export function createBlunderArrow(from: Square, to: Square): Arrow {
  return createArrow(from, to, ArrowColors.RED, 0.8);
}

/**
 * Create threat arrow (orange)
 */
export function createThreatArrow(from: Square, to: Square): Arrow {
  return createArrow(from, to, ArrowColors.ORANGE, 0.7);
}

/**
 * Create target square highlight (green)
 */
export function createTargetHighlight(square: Square): Highlight {
  return createHighlight(square, HighlightColors.GREEN, 0.4);
}

/**
 * Create danger square highlight (red)
 */
export function createDangerHighlight(square: Square): Highlight {
  return createHighlight(square, HighlightColors.RED, 0.4);
}

/**
 * Create multiple arrows at once
 */
export function createArrows(moves: Array<{ from: Square; to: Square; color?: string }>): Arrow[] {
  return moves.map(move => createArrow(move.from, move.to, move.color));
}

/**
 * Create multiple highlights at once
 */
export function createHighlights(
  squares: Square[],
  color: string = HighlightColors.GREEN
): Highlight[] {
  return squares.map(square => createHighlight(square, color));
}

/**
 * Example: Highlight all squares a piece can move to
 */
export function highlightLegalMoves(legalMoves: Square[]): Highlight[] {
  return createHighlights(legalMoves, HighlightColors.GREEN);
}

/**
 * Example: Show best move with arrow
 */
export function showBestMove(from: Square, to: Square): Arrow[] {
  return [createBestMoveArrow(from, to)];
}

/**
 * Example: Show threat (attacking piece arrow + target highlight)
 */
export function showThreat(from: Square, to: Square): { arrows: Arrow[]; highlights: Highlight[] } {
  return {
    arrows: [createThreatArrow(from, to)],
    highlights: [createDangerHighlight(to)],
  };
}

/**
 * Example: Compare moves (best vs played)
 */
export function compareMoves(
  bestMove: { from: Square; to: Square },
  playedMove: { from: Square; to: Square }
): Arrow[] {
  return [
    createBestMoveArrow(bestMove.from, bestMove.to),
    createBlunderArrow(playedMove.from, playedMove.to),
  ];
}
