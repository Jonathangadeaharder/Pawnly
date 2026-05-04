import { describe, expect, it } from 'vitest';
import { STARTING_FEN } from './helpers';

async function importBoard() {
	return import('../src/lib/board.svelte');
}

describe('fenToPieces', () => {
	it('exports fenToPieces function', async () => {
		const mod = await importBoard();
		expect(typeof mod.fenToPieces).toBe('function');
	});

	it('parses starting position correctly', async () => {
		const { fenToPieces } = await importBoard();
		const pieces = fenToPieces(STARTING_FEN);

		expect(pieces.a1).toBe('R');
		expect(pieces.b1).toBe('N');
		expect(pieces.c1).toBe('B');
		expect(pieces.d1).toBe('Q');
		expect(pieces.e1).toBe('K');
		expect(pieces.f1).toBe('B');
		expect(pieces.g1).toBe('N');
		expect(pieces.h1).toBe('R');

		expect(pieces.a8).toBe('r');
		expect(pieces.b8).toBe('n');
		expect(pieces.c8).toBe('b');
		expect(pieces.d8).toBe('q');
		expect(pieces.e8).toBe('k');
		expect(pieces.f8).toBe('b');
		expect(pieces.g8).toBe('n');
		expect(pieces.h8).toBe('r');
	});

	it('parses pawns correctly', async () => {
		const { fenToPieces } = await importBoard();
		const pieces = fenToPieces(STARTING_FEN);

		for (const file of ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']) {
			expect(pieces[`${file}2`]).toBe('P');
			expect(pieces[`${file}7`]).toBe('p');
		}
	});

	it('returns 32 pieces at start', async () => {
		const { fenToPieces } = await importBoard();
		const pieces = fenToPieces(STARTING_FEN);
		expect(Object.keys(pieces).length).toBe(32);
	});

	it('handles empty squares correctly', async () => {
		const { fenToPieces } = await importBoard();
		const pieces = fenToPieces(STARTING_FEN);

		expect(pieces.e3).toBeUndefined();
		expect(pieces.e4).toBeUndefined();
		expect(pieces.e5).toBeUndefined();
		expect(pieces.e6).toBeUndefined();
	});

	it('parses custom position', async () => {
		const { fenToPieces } = await importBoard();
		const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
		const pieces = fenToPieces(fen);

		expect(pieces.e4).toBe('P');
		expect(pieces.e2).toBeUndefined();
	});

	it('parses empty ranks correctly', async () => {
		const { fenToPieces } = await importBoard();
		const fen = '8/8/8/8/8/8/8/4K2k w - - 0 1';
		const pieces = fenToPieces(fen);

		expect(pieces.e1).toBe('K');
		expect(pieces.h1).toBe('k');
		expect(Object.keys(pieces).length).toBe(2);
	});
});

describe('getSquareFromCoords', () => {
	it('exports getSquareFromCoords function', async () => {
		const mod = await importBoard();
		expect(typeof mod.getSquareFromCoords).toBe('function');
	});

	it('converts top-left to a8 (not flipped)', async () => {
		const { getSquareFromCoords } = await importBoard();
		expect(getSquareFromCoords(0, 0, 50, false)).toBe('a8');
	});

	it('converts bottom-right to h1 (not flipped)', async () => {
		const { getSquareFromCoords } = await importBoard();
		expect(getSquareFromCoords(399, 399, 50, false)).toBe('h1');
	});

	it('converts center of board to d5 (not flipped)', async () => {
		const { getSquareFromCoords } = await importBoard();
		expect(getSquareFromCoords(175, 175, 50, false)).toBe('d5');
	});

	it('flips coordinates correctly', async () => {
		const { getSquareFromCoords } = await importBoard();
		expect(getSquareFromCoords(0, 0, 50, true)).toBe('h1');
		expect(getSquareFromCoords(399, 399, 50, true)).toBe('a8');
	});

	it('handles different square sizes', async () => {
		const { getSquareFromCoords } = await importBoard();
		expect(getSquareFromCoords(0, 0, 100, false)).toBe('a8');
		expect(getSquareFromCoords(700, 700, 100, false)).toBe('h1');
	});
});

describe('getCoordsFromSquare', () => {
	it('exports getCoordsFromSquare function', async () => {
		const mod = await importBoard();
		expect(typeof mod.getCoordsFromSquare).toBe('function');
	});

	it('converts a8 to top-left (not flipped)', async () => {
		const { getCoordsFromSquare } = await importBoard();
		expect(getCoordsFromSquare('a8', 50, false)).toEqual({ x: 0, y: 0 });
	});

	it('converts h1 to bottom-right (not flipped)', async () => {
		const { getCoordsFromSquare } = await importBoard();
		expect(getCoordsFromSquare('h1', 50, false)).toEqual({ x: 350, y: 350 });
	});

	it('converts e4 correctly (not flipped)', async () => {
		const { getCoordsFromSquare } = await importBoard();
		expect(getCoordsFromSquare('e4', 50, false)).toEqual({ x: 200, y: 200 });
	});

	it('flips coordinates correctly', async () => {
		const { getCoordsFromSquare } = await importBoard();
		expect(getCoordsFromSquare('a8', 50, true)).toEqual({ x: 350, y: 0 });
		expect(getCoordsFromSquare('h1', 50, true)).toEqual({ x: 0, y: 350 });
	});

	it('handles different square sizes', async () => {
		const { getCoordsFromSquare } = await importBoard();
		expect(getCoordsFromSquare('a8', 100, false)).toEqual({ x: 0, y: 0 });
		expect(getCoordsFromSquare('h1', 100, false)).toEqual({ x: 700, y: 700 });
	});
});

describe('getPieceSymbol', () => {
	it('exports getPieceSymbol function', async () => {
		const mod = await importBoard();
		expect(typeof mod.getPieceSymbol).toBe('function');
	});

	it('returns correct symbols for all pieces', async () => {
		const { getPieceSymbol } = await importBoard();
		const expected: Record<string, string> = {
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
		for (const [piece, symbol] of Object.entries(expected)) {
			expect(getPieceSymbol(piece)).toBe(symbol);
		}
	});

	it('returns empty string for unknown piece', async () => {
		const { getPieceSymbol } = await importBoard();
		expect(getPieceSymbol('x')).toBe('');
		expect(getPieceSymbol('')).toBe('');
	});
});

describe('ArrowColors and HighlightColors', () => {
	it('exports ArrowColors', async () => {
		const mod = await importBoard();
		expect(mod.ArrowColors).toBeDefined();
		expect(mod.ArrowColors.GREEN).toBe('#15803d');
		expect(mod.ArrowColors.BLUE).toBe('#1e40af');
		expect(mod.ArrowColors.RED).toBe('#b91c1c');
		expect(mod.ArrowColors.YELLOW).toBe('#ca8a04');
		expect(mod.ArrowColors.ORANGE).toBe('#ea580c');
	});

	it('exports HighlightColors', async () => {
		const mod = await importBoard();
		expect(mod.HighlightColors).toBeDefined();
		expect(mod.HighlightColors.GREEN).toBe('#15803d');
		expect(mod.HighlightColors.BLUE).toBe('#1e40af');
		expect(mod.HighlightColors.RED).toBe('#b91c1c');
		expect(mod.HighlightColors.YELLOW).toBe('#ca8a04');
		expect(mod.HighlightColors.PURPLE).toBe('#7c3aed');
	});
});

describe('createArrow', () => {
	it('creates arrow with default color and opacity', async () => {
		const { createArrow, ArrowColors } = await importBoard();
		const arrow = createArrow('e2', 'e4');
		expect(arrow).toEqual({
			from: 'e2',
			to: 'e4',
			color: ArrowColors.GREEN,
			opacity: 0.8,
		});
	});

	it('creates arrow with custom color and opacity', async () => {
		const { createArrow } = await importBoard();
		const arrow = createArrow('e2', 'e4', '#ff0000', 0.5);
		expect(arrow).toEqual({
			from: 'e2',
			to: 'e4',
			color: '#ff0000',
			opacity: 0.5,
		});
	});
});

describe('createHighlight', () => {
	it('creates highlight with default color and opacity', async () => {
		const { createHighlight, HighlightColors } = await importBoard();
		const highlight = createHighlight('e4');
		expect(highlight).toEqual({
			square: 'e4',
			color: HighlightColors.GREEN,
			opacity: 0.4,
		});
	});

	it('creates highlight with custom color and opacity', async () => {
		const { createHighlight } = await importBoard();
		const highlight = createHighlight('e4', '#ff0000', 0.6);
		expect(highlight).toEqual({
			square: 'e4',
			color: '#ff0000',
			opacity: 0.6,
		});
	});
});

describe('createBestMoveArrow', () => {
	it('creates green arrow with 0.8 opacity', async () => {
		const { createBestMoveArrow, ArrowColors } = await importBoard();
		const arrow = createBestMoveArrow('e2', 'e4');
		expect(arrow).toEqual({
			from: 'e2',
			to: 'e4',
			color: ArrowColors.GREEN,
			opacity: 0.8,
		});
	});
});

describe('createAlternativeArrow', () => {
	it('creates blue arrow with 0.7 opacity', async () => {
		const { createAlternativeArrow, ArrowColors } = await importBoard();
		const arrow = createAlternativeArrow('d2', 'd4');
		expect(arrow).toEqual({
			from: 'd2',
			to: 'd4',
			color: ArrowColors.BLUE,
			opacity: 0.7,
		});
	});
});

describe('createBlunderArrow', () => {
	it('creates red arrow with 0.8 opacity', async () => {
		const { createBlunderArrow, ArrowColors } = await importBoard();
		const arrow = createBlunderArrow('f2', 'f3');
		expect(arrow).toEqual({
			from: 'f2',
			to: 'f3',
			color: ArrowColors.RED,
			opacity: 0.8,
		});
	});
});

describe('createThreatArrow', () => {
	it('creates orange arrow with 0.7 opacity', async () => {
		const { createThreatArrow, ArrowColors } = await importBoard();
		const arrow = createThreatArrow('f7', 'f2');
		expect(arrow).toEqual({
			from: 'f7',
			to: 'f2',
			color: ArrowColors.ORANGE,
			opacity: 0.7,
		});
	});
});

describe('createTargetHighlight', () => {
	it('creates green highlight with 0.4 opacity', async () => {
		const { createTargetHighlight, HighlightColors } = await importBoard();
		const highlight = createTargetHighlight('e4');
		expect(highlight).toEqual({
			square: 'e4',
			color: HighlightColors.GREEN,
			opacity: 0.4,
		});
	});
});

describe('createDangerHighlight', () => {
	it('creates red highlight with 0.4 opacity', async () => {
		const { createDangerHighlight, HighlightColors } = await importBoard();
		const highlight = createDangerHighlight('f7');
		expect(highlight).toEqual({
			square: 'f7',
			color: HighlightColors.RED,
			opacity: 0.4,
		});
	});
});

describe('createArrows', () => {
	it('creates multiple arrows', async () => {
		const { createArrows, ArrowColors } = await importBoard();
		const arrows = createArrows([
			{ from: 'e2', to: 'e4' },
			{ from: 'd2', to: 'd4', color: ArrowColors.BLUE },
		]);
		expect(arrows.length).toBe(2);
		expect(arrows[0].from).toBe('e2');
		expect(arrows[0].to).toBe('e4');
		expect(arrows[1].color).toBe(ArrowColors.BLUE);
	});

	it('returns empty array for empty input', async () => {
		const { createArrows } = await importBoard();
		expect(createArrows([])).toEqual([]);
	});
});

describe('createHighlights', () => {
	it('creates multiple highlights with default color', async () => {
		const { createHighlights, HighlightColors } = await importBoard();
		const highlights = createHighlights(['e4', 'd4', 'c4']);
		expect(highlights.length).toBe(3);
		expect(highlights[0]).toEqual({
			square: 'e4',
			color: HighlightColors.GREEN,
			opacity: 0.4,
		});
	});

	it('creates highlights with custom color', async () => {
		const { createHighlights, HighlightColors } = await importBoard();
		const highlights = createHighlights(['e4', 'd4'], HighlightColors.RED);
		expect(highlights[0].color).toBe(HighlightColors.RED);
		expect(highlights[1].color).toBe(HighlightColors.RED);
	});

	it('returns empty array for empty input', async () => {
		const { createHighlights } = await importBoard();
		expect(createHighlights([])).toEqual([]);
	});
});

describe('highlightLegalMoves', () => {
	it('creates green highlights for legal moves', async () => {
		const { highlightLegalMoves, HighlightColors } = await importBoard();
		const highlights = highlightLegalMoves(['e3', 'e4']);
		expect(highlights.length).toBe(2);
		expect(highlights[0].color).toBe(HighlightColors.GREEN);
		expect(highlights[1].color).toBe(HighlightColors.GREEN);
	});
});

describe('showBestMove', () => {
	it('returns array with one green arrow', async () => {
		const { showBestMove, ArrowColors } = await importBoard();
		const arrows = showBestMove('e2', 'e4');
		expect(arrows.length).toBe(1);
		expect(arrows[0].color).toBe(ArrowColors.GREEN);
	});
});

describe('showThreat', () => {
	it('returns threat arrow and danger highlight', async () => {
		const { showThreat, ArrowColors, HighlightColors } = await importBoard();
		const result = showThreat('f7', 'f2');
		expect(result.arrows.length).toBe(1);
		expect(result.arrows[0].color).toBe(ArrowColors.ORANGE);
		expect(result.highlights.length).toBe(1);
		expect(result.highlights[0].color).toBe(HighlightColors.RED);
		expect(result.highlights[0].square).toBe('f2');
	});
});

describe('compareMoves', () => {
	it('returns best move and blunder arrows', async () => {
		const { compareMoves, ArrowColors } = await importBoard();
		const arrows = compareMoves({ from: 'e2', to: 'e4' }, { from: 'f2', to: 'f3' });
		expect(arrows.length).toBe(2);
		expect(arrows[0].color).toBe(ArrowColors.GREEN);
		expect(arrows[0].from).toBe('e2');
		expect(arrows[0].to).toBe('e4');
		expect(arrows[1].color).toBe(ArrowColors.RED);
		expect(arrows[1].from).toBe('f2');
		expect(arrows[1].to).toBe('f3');
	});
});
