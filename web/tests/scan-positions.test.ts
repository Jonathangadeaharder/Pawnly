import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import {
	SCAN_COLORS,
	SCAN_MODE_ICONS,
	SCAN_MODE_LABELS,
	scanPositions,
	getActiveModes,
	getTargetTime,
	type ScanMode,
} from '../src/lib/data/scan-positions';

const ALL_MODES: ScanMode[] = ['check', 'capture', 'threat', 'loose', 'doubleAttack'];
const SQUARE_RE = /^[a-h][1-8]$/;

describe('scanPositions array', () => {
	it('should have 20 positions', () => {
		expect(scanPositions).toHaveLength(20);
	});

	it('should have unique IDs', () => {
		const ids = scanPositions.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('should have valid FEN for every position', () => {
		for (const pos of scanPositions) {
			expect(() => new Chess(pos.fen)).not.toThrow();
		}
	});

	it('should have levels between 1 and 20', () => {
		for (const pos of scanPositions) {
			expect(pos.level).toBeGreaterThanOrEqual(1);
			expect(pos.level).toBeLessThanOrEqual(20);
		}
	});

	it('should have valid square format in all answer key arrays', () => {
		for (const pos of scanPositions) {
			const ak = pos.answerKey;
			for (const sq of [...ak.checks, ...ak.captures, ...ak.threats]) {
				expect(sq).toMatch(SQUARE_RE);
			}
			if (ak.loose) {
				for (const sq of ak.loose) {
					expect(sq).toMatch(SQUARE_RE);
				}
			}
			if (ak.doubleAttack) {
				for (const sq of ak.doubleAttack) {
					expect(sq).toMatch(SQUARE_RE);
				}
			}
		}
	});

	it('should have captures with opponent pieces that can capture', () => {
		for (const pos of scanPositions) {
			const chess = new Chess(pos.fen);
			const opponentColor = pos.playerColor === 'w' ? 'b' : 'w';

			for (const sq of pos.answerKey.captures) {
const piece = chess.get(sq as any);
expect(piece).not.toBeNull();
if (piece) {
	expect(piece.color).toBe(opponentColor);
}
			}
		}
	});

	it('should have threats with opponent pieces', () => {
		for (const pos of scanPositions) {
			if (!pos.answerKey.threats || pos.answerKey.threats.length === 0) continue;
			const chess = new Chess(pos.fen);
			const opponentColor = pos.playerColor === 'w' ? 'b' : 'w';

			for (const sq of pos.answerKey.threats) {
				const piece = chess.get(sq as any);
				expect(piece).toBeDefined();
				if (piece) {
					expect(piece.color).toBe(opponentColor);
				}
			}
		}
	});

	it('should only have loose for level >= 8', () => {
		for (const pos of scanPositions) {
			if (pos.level < 8) {
				expect(pos.answerKey.loose).toBeUndefined();
			}
		}
	});

	it('should have all answer key squares with pieces on them', () => {
		for (const pos of scanPositions) {
			const chess = new Chess(pos.fen);
			const allSquares = [
				...pos.answerKey.checks,
				...pos.answerKey.captures,
				...pos.answerKey.threats,
				...(pos.answerKey.loose ?? []),
				...(pos.answerKey.doubleAttack ?? []),
			];
			for (const sq of allSquares) {
				const piece = chess.get(sq as any);
				expect(piece).not.toBeUndefined();
			}
		}
	});

	it('should have checks and captures squares with opponent pieces', () => {
		for (const pos of scanPositions) {
			const chess = new Chess(pos.fen);
			const opponentColor = pos.playerColor === 'w' ? 'b' : 'w';

			for (const sq of pos.answerKey.checks) {
				const piece = chess.get(sq as any);
				expect(piece).toBeDefined();
				if (piece) {
					expect(piece.color).toBe(opponentColor);
				}
			}

			for (const sq of pos.answerKey.captures) {
				const piece = chess.get(sq as any);
				expect(piece).toBeDefined();
				if (piece) {
					expect(piece.color).toBe(opponentColor);
				}
			}
		}
	});

	it('should have loose squares with opponent pieces', () => {
		for (const pos of scanPositions) {
			if (!pos.answerKey.loose) continue;
			const chess = new Chess(pos.fen);
			const opponentColor = pos.playerColor === 'w' ? 'b' : 'w';

			for (const sq of pos.answerKey.loose) {
				const piece = chess.get(sq as any);
				expect(piece).toBeDefined();
				if (piece) {
					expect(piece.color).toBe(opponentColor);
				}
			}
		}
	});
});

describe('getActiveModes', () => {
	it('should return check and capture for levels 1-4', () => {
		for (let level = 1; level <= 4; level++) {
			expect(getActiveModes(level)).toEqual(['check', 'capture']);
		}
	});

	it('should add threat at level 5', () => {
		expect(getActiveModes(5)).toEqual(['check', 'capture', 'threat']);
	});

	it('should add loose at level 8', () => {
		expect(getActiveModes(8)).toEqual(['check', 'capture', 'threat', 'loose']);
	});

	it('should add doubleAttack at level 12', () => {
		expect(getActiveModes(12)).toEqual([
			'check',
			'capture',
			'threat',
			'loose',
			'doubleAttack',
		]);
	});
});

describe('getTargetTime', () => {
	it('should return 20 for levels 1-2', () => {
		expect(getTargetTime(1)).toBe(20);
		expect(getTargetTime(2)).toBe(20);
	});

	it('should return 15 for levels 3-6', () => {
		for (let level = 3; level <= 6; level++) {
			expect(getTargetTime(level)).toBe(15);
		}
	});

	it('should return 12 for levels 7-10', () => {
		for (let level = 7; level <= 10; level++) {
			expect(getTargetTime(level)).toBe(12);
		}
	});

	it('should return 10 for levels 11-12', () => {
		expect(getTargetTime(11)).toBe(10);
		expect(getTargetTime(12)).toBe(10);
	});

	it('should return 8 for levels 13+', () => {
		for (const level of [13, 15, 20]) {
			expect(getTargetTime(level)).toBe(8);
		}
	});
});

describe('SCAN_COLORS', () => {
	it('should have a hex color for every mode', () => {
		for (const mode of ALL_MODES) {
			expect(SCAN_COLORS[mode]).toMatch(/^#[0-9A-Fa-f]{6}$/);
		}
	});
});

describe('SCAN_MODE_LABELS', () => {
	it('should have a label for every mode', () => {
		for (const mode of ALL_MODES) {
			expect(SCAN_MODE_LABELS[mode]).toBeTypeOf('string');
			expect(SCAN_MODE_LABELS[mode].length).toBeGreaterThan(0);
		}
	});
});

describe('SCAN_MODE_ICONS', () => {
	it('should have an icon for every mode', () => {
		for (const mode of ALL_MODES) {
			expect(SCAN_MODE_ICONS[mode]).toBeTypeOf('string');
			expect(SCAN_MODE_ICONS[mode].length).toBeGreaterThan(0);
		}
	});
});
