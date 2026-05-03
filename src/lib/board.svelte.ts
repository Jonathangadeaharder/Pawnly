/**
 * Board Rendering Logic
 * FEN parsing, coordinate conversions, and board annotations (arrows/highlights)
 */

import type { Square, Arrow, Highlight } from './game.svelte';

export type { Arrow, Highlight, Square };

/**
 * Predefined arrow colors
 */
export const ArrowColors = {
	GREEN: '#15803d',
	BLUE: '#1e40af',
	RED: '#b91c1c',
	YELLOW: '#ca8a04',
	ORANGE: '#ea580c',
} as const;

/**
 * Predefined highlight colors
 */
export const HighlightColors = {
	GREEN: '#15803d',
	BLUE: '#1e40af',
	RED: '#b91c1c',
	YELLOW: '#ca8a04',
	PURPLE: '#7c3aed',
} as const;

/**
 * Convert FEN string to piece position map
 */
export function fenToPieces(fen: string): Record<string, string> {
	const positions: Record<string, string> = {};
	const fenParts = fen.split(' ');
	const ranks = fenParts[0].split('/');

	ranks.forEach((rank, rankIndex) => {
		let fileIndex = 0;
		for (const char of rank) {
			if (Number.isNaN(Number.parseInt(char, 10))) {
				const file = String.fromCharCode(97 + fileIndex);
				const rankNum = 8 - rankIndex;
				positions[`${file}${rankNum}`] = char;
				fileIndex++;
			} else {
				fileIndex += Number.parseInt(char, 10);
			}
		}
	});

	return positions;
}

/**
 * Get square notation from pixel coordinates
 */
export function getSquareFromCoords(
	x: number,
	y: number,
	squareSize: number,
	isFlipped: boolean,
): Square {
	const file = Math.floor(x / squareSize);
	const rank = Math.floor(y / squareSize);

	if (isFlipped) {
		const fileChar = String.fromCharCode(104 - file);
		const rankNum = rank + 1;
		return `${fileChar}${rankNum}` as Square;
	} else {
		const fileChar = String.fromCharCode(97 + file);
		const rankNum = 8 - rank;
		return `${fileChar}${rankNum}` as Square;
	}
}

/**
 * Get pixel coordinates from square notation
 */
export function getCoordsFromSquare(
	square: Square,
	squareSize: number,
	isFlipped: boolean,
): { x: number; y: number } {
	const file = square.charCodeAt(0) - 97;
	const rank = Number.parseInt(square[1], 10) - 1;

	if (isFlipped) {
		return {
			x: (7 - file) * squareSize,
			y: (8 - rank - 1) * squareSize,
		};
	} else {
		return {
			x: file * squareSize,
			y: (7 - rank) * squareSize,
		};
	}
}

/**
 * Get unicode piece symbol for display
 */
export function getPieceSymbol(piece: string): string {
	const symbols: Record<string, string> = {
		K: '\u2654',
		Q: '\u2655',
		R: '\u2656',
		B: '\u2657',
		N: '\u2658',
		P: '\u2659',
		k: '\u265A',
		q: '\u265B',
		r: '\u265C',
		b: '\u265D',
		n: '\u265E',
		p: '\u265F',
	};
	return symbols[piece] || '';
}

/**
 * Create an arrow annotation
 */
export function createArrow(
	from: Square,
	to: Square,
	color: string = ArrowColors.GREEN,
	opacity: number = 0.8,
): Arrow {
	return { from, to, color, opacity };
}

/**
 * Create a highlight annotation
 */
export function createHighlight(
	square: Square,
	color: string = HighlightColors.GREEN,
	opacity: number = 0.4,
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
	return moves.map((move) => createArrow(move.from, move.to, move.color));
}

/**
 * Create multiple highlights at once
 */
export function createHighlights(
	squares: Square[],
	color: string = HighlightColors.GREEN,
): Highlight[] {
	return squares.map((square) => createHighlight(square, color));
}

/**
 * Highlight all squares a piece can move to
 */
export function highlightLegalMoves(legalMoves: Square[]): Highlight[] {
	return createHighlights(legalMoves, HighlightColors.GREEN);
}

/**
 * Show best move with arrow
 */
export function showBestMove(from: Square, to: Square): Arrow[] {
	return [createBestMoveArrow(from, to)];
}

/**
 * Show threat (attacking piece arrow + target highlight)
 */
export function showThreat(from: Square, to: Square): { arrows: Arrow[]; highlights: Highlight[] } {
	return {
		arrows: [createThreatArrow(from, to)],
		highlights: [createDangerHighlight(to)],
	};
}

/**
 * Compare moves (best vs played)
 */
export function compareMoves(
	bestMove: { from: Square; to: Square },
	playedMove: { from: Square; to: Square },
): Arrow[] {
	return [
		createBestMoveArrow(bestMove.from, bestMove.to),
		createBlunderArrow(playedMove.from, playedMove.to),
	];
}
