import { Chess } from 'chess.js';
import { describe, expect, it } from 'vitest';
import { dailyPuzzle, puzzles } from '../src/lib/data/puzzles';

describe('puzzles data', () => {
	it('exports 8 puzzles', () => {
		expect(puzzles).toHaveLength(8);
	});

	it('each puzzle has required fields', () => {
		for (const puzzle of puzzles) {
			expect(puzzle.id).toBeTypeOf('string');
			expect(puzzle.title).toBeTypeOf('string');
			expect(puzzle.emoji).toBeTypeOf('string');
			expect([1, 2, 3, 4]).toContain(puzzle.difficulty);
			expect(puzzle.fen).toBeTypeOf('string');
			expect(puzzle.solution).toBeInstanceOf(Array);
			expect(['w', 'b']).toContain(puzzle.playerColor);
		}
	});

	it('puzzle ids are p1 through p8', () => {
		const ids = puzzles.map((p) => p.id);
		expect(ids).toEqual(['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8']);
	});

	it('each puzzle has a non-empty solution', () => {
		for (const puzzle of puzzles) {
			expect(puzzle.solution.length).toBeGreaterThan(0);
		}
	});

	it('each puzzle has a non-empty hint', () => {
		for (const puzzle of puzzles) {
			expect(puzzle.hint).toBeDefined();
			expect(puzzle.hint && puzzle.hint.length).toBeGreaterThan(0);
		}
	});

	it('covers all 8 tactical themes', () => {
		const titles = puzzles.map((p) => p.title);
		expect(titles).toContain('Fork!');
		expect(titles).toContain('Pin & win');
		expect(titles).toContain('Back rank mate');
		expect(titles).toContain('Discovered attack');
		expect(titles).toContain('Queen sacrifice');
		expect(titles).toContain('Knight fork');
		expect(titles).toContain('Skewer');
		expect(titles).toContain('Deflection');
	});

	it('each FEN is a valid chess position', () => {
		for (const puzzle of puzzles) {
			const chess = new Chess(puzzle.fen);
			expect(chess.fen()).toBeTruthy();
		}
	});

	it('each solution contains legal moves from the FEN', () => {
		for (const puzzle of puzzles) {
			const chess = new Chess(puzzle.fen);
			for (const move of puzzle.solution) {
				const result = chess.move(move);
				expect(result).not.toBeNull();
			}
		}
	});

	it('solution move count matches difficulty expectation', () => {
		for (const puzzle of puzzles) {
			if (puzzle.title === 'Back rank mate') {
				expect(puzzle.solution.length).toBeLessThanOrEqual(2);
			}
		}
	});

	it('playerColor matches FEN active color', () => {
		for (const puzzle of puzzles) {
			const turn = puzzle.fen.split(' ')[1];
			expect(turn).toBe(puzzle.playerColor);
		}
	});
});

describe('dailyPuzzle', () => {
	it('has required fields', () => {
		expect(dailyPuzzle.id).toBe('daily');
		expect(dailyPuzzle.title).toBe('Mate in 2');
		expect(dailyPuzzle.difficulty).toBe(3);
		expect(dailyPuzzle.fen).toBeTypeOf('string');
		expect(dailyPuzzle.solution).toBeInstanceOf(Array);
		expect(dailyPuzzle.playerColor).toBe('w');
	});

	it('has a valid FEN position', () => {
		const chess = new Chess(dailyPuzzle.fen);
		expect(chess.fen()).toBeTruthy();
	});

	it('solution contains legal moves', () => {
		const chess = new Chess(dailyPuzzle.fen);
		for (const move of dailyPuzzle.solution) {
			const result = chess.move(move);
			expect(result).not.toBeNull();
		}
	});

	it('solution is 3 moves (mate in 2 for white)', () => {
		expect(dailyPuzzle.solution).toHaveLength(3);
	});

	it('playerColor matches FEN active color', () => {
		const turn = dailyPuzzle.fen.split(' ')[1];
		expect(turn).toBe(dailyPuzzle.playerColor);
	});
});
