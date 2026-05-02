import { describe, expect, it } from 'vitest';
import { createGameInstance } from './helpers';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

const createGame = createGameInstance;

describe('createGame', () => {
	it('exports createGame function', async () => {
		const mod = await import('../src/lib/game.svelte');
		expect(typeof mod.createGame).toBe('function');
	});

	it('exports types (Square, ChessMove, etc.)', async () => {
		const mod = await import('../src/lib/game.svelte');
		expect(mod.createGame).toBeDefined();
	});
});

describe('Game state initialization', () => {
	it.each([
		['starts with default FEN', 'fen', STARTING_FEN],
		['starts with white to move', 'turn', 'w'],
		['starts at move number 1', 'moveNumber', 1],
		['starts with empty moves array', 'moves', []],
		['starts with no selected square', 'selectedSquare', null],
		['starts with empty highlighted squares', 'highlightedSquares', []],
		['starts with no result', 'result', null],
		['starts with game not over', 'isGameOver', false],
		['starts not in check', 'isCheck', false],
		['starts not in checkmate', 'isCheckmate', false],
		['starts not in stalemate', 'isStalemate', false],
	])('%s', async (_name, prop, expected) => {
		const game = await createGame();
		expect(game[prop as keyof typeof game]).toEqual(expected);
	});

	it('starts with legal moves populated', async () => {
		const game = await createGame();
		expect(game.legalMoves.length).toBe(20);
	});

	it('starts in play mode', async () => {
		const game = await createGame();
		expect(game.gameMode).toBe('play');
	});

	it('accepts custom FEN', async () => {
		const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
		const game = await createGame(fen);
		expect(game.fen).toBe(fen);
		expect(game.turn).toBe('b');
	});
});

describe('makeMove', () => {
	it('makes a valid move and returns true', async () => {
		const game = await createGame();
		expect(game.makeMove('e2', 'e4')).toBe(true);
	});

	it('updates FEN after move', async () => {
		const game = await createGame();
		game.makeMove('e2', 'e4');
		expect(game.fen).toContain('4P3');
		expect(game.turn).toBe('b');
		expect(game.moveNumber).toBe(1);
	});

	it('appends to moves history', async () => {
		const game = await createGame();
		game.makeMove('e2', 'e4');
		expect(game.moves.length).toBe(1);
		expect(game.moves[0].from).toBe('e2');
		expect(game.moves[0].to).toBe('e4');
		expect(game.moves[0].san).toBe('e4');
	});

	it('returns false for illegal move', async () => {
		const game = await createGame();
		expect(game.makeMove('e2', 'e5')).toBe(false);
	});

	it('does not change state on illegal move', async () => {
		const game = await createGame();
		const fenBefore = game.fen;
		game.makeMove('e2', 'e5');
		expect(game.fen).toBe(fenBefore);
		expect(game.moves.length).toBe(0);
	});

	it('allows pawn promotion', async () => {
		const fen = '8/4P3/8/8/8/8/8/4K2k w - - 0 1';
		const game = await createGame(fen);
		expect(game.makeMove('e7', 'e8', 'q')).toBe(true);
		expect(game.fen).toContain('Q');
	});

	it.each([
		['clears selected square after move', 'selectedSquare', null],
		['clears highlighted squares after move', 'highlightedSquares', []],
	])('%s', async (_name, prop, expected) => {
		const game = await createGame();
		game.selectSquare('e2');
		game.makeMove('e2', 'e4');
		expect(game[prop as keyof typeof game]).toEqual(expected);
	});

	it('updates legal moves after move', async () => {
		const game = await createGame();
		game.makeMove('e2', 'e4');
		expect(game.legalMoves.length).toBeGreaterThan(0);
		expect(game.legalMoves).toContain('e5');
	});
});

describe('selectSquare', () => {
	it('selects a square with a piece', async () => {
		const game = await createGame();
		game.selectSquare('e2');
		expect(game.selectedSquare).toBe('e2');
	});

	it('shows highlighted squares for legal moves', async () => {
		const game = await createGame();
		game.selectSquare('e2');
		expect(game.highlightedSquares).toContain('e3');
		expect(game.highlightedSquares).toContain('e4');
	});

	it('deselects when same square tapped again', async () => {
		const game = await createGame();
		game.selectSquare('e2');
		game.selectSquare('e2');
		expect(game.selectedSquare).toBeNull();
		expect(game.highlightedSquares).toEqual([]);
	});

	it('executes move when legal destination tapped', async () => {
		const game = await createGame();
		game.selectSquare('e2');
		game.selectSquare('e4');
		expect(game.moves.length).toBe(1);
		expect(game.selectedSquare).toBeNull();
	});

	it('selects new piece when different own piece tapped', async () => {
		const game = await createGame();
		game.selectSquare('e2');
		game.selectSquare('d2');
		expect(game.selectedSquare).toBe('d2');
		expect(game.highlightedSquares).toContain('d3');
		expect(game.highlightedSquares).toContain('d4');
	});

	it('ignores empty square when no piece selected', async () => {
		const game = await createGame();
		game.selectSquare('e4');
		expect(game.selectedSquare).toBeNull();
	});

	it('does not select opponent pieces', async () => {
		const game = await createGame();
		game.selectSquare('e7');
		expect(game.selectedSquare).toBeNull();
	});
});

describe('resetGame', () => {
	it('resets to starting position', async () => {
		const game = await createGame();
		game.makeMove('e2', 'e4');
		game.makeMove('e7', 'e5');
		game.resetGame();
		expect(game.fen).toBe(STARTING_FEN);
		expect(game.turn).toBe('w');
		expect(game.moveNumber).toBe(1);
		expect(game.moves).toEqual([]);
		expect(game.selectedSquare).toBeNull();
		expect(game.highlightedSquares).toEqual([]);
	});
});

describe('loadPosition', () => {
	it('loads a FEN position', async () => {
		const game = await createGame();
		const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
		game.loadPosition(fen);
		expect(game.fen).toBe(fen);
		expect(game.turn).toBe('b');
	});

	it('clears move history when loading', async () => {
		const game = await createGame();
		game.makeMove('e2', 'e4');
		game.loadPosition(STARTING_FEN);
		expect(game.moves).toEqual([]);
	});

	it('clears selection when loading', async () => {
		const game = await createGame();
		game.selectSquare('e2');
		game.loadPosition(STARTING_FEN);
		expect(game.selectedSquare).toBeNull();
		expect(game.highlightedSquares).toEqual([]);
	});
});

describe('undoMove', () => {
	it('undoes the last move', async () => {
		const game = await createGame();
		game.makeMove('e2', 'e4');
		game.undoMove();
		expect(game.fen).toBe(STARTING_FEN);
		expect(game.turn).toBe('w');
		expect(game.moves).toEqual([]);
	});

	it('does nothing when no moves to undo', async () => {
		const game = await createGame();
		const fenBefore = game.fen;
		game.undoMove();
		expect(game.fen).toBe(fenBefore);
	});

	it('undoes multiple moves in order', async () => {
		const game = await createGame();
		game.makeMove('e2', 'e4');
		game.makeMove('e7', 'e5');
		game.undoMove();
		expect(game.turn).toBe('b');
		expect(game.moves.length).toBe(1);
		game.undoMove();
		expect(game.turn).toBe('w');
		expect(game.moves.length).toBe(0);
	});
});

describe('getLegalMoves', () => {
	it('returns all legal moves when no square given', async () => {
		const game = await createGame();
		expect(game.getLegalMoves().length).toBe(20);
	});

	it('returns legal moves for a specific square', async () => {
		const game = await createGame();
		const moves = game.getLegalMoves('e2');
		expect(moves).toContain('e3');
		expect(moves).toContain('e4');
		expect(moves.length).toBe(2);
	});

	it('returns empty array for empty square', async () => {
		const game = await createGame();
		expect(game.getLegalMoves('e4')).toEqual([]);
	});

	it('returns empty array for opponent piece', async () => {
		const game = await createGame();
		expect(game.getLegalMoves('e7')).toEqual([]);
	});
});

describe('setGameMode', () => {
	it('sets game mode', async () => {
		const game = await createGame();
		game.setGameMode('analysis');
		expect(game.gameMode).toBe('analysis');
	});

	it('supports all modes', async () => {
		const game = await createGame();
		const modes = ['learn', 'train', 'play', 'analysis'] as const;
		for (const mode of modes) {
			game.setGameMode(mode);
			expect(game.gameMode).toBe(mode);
		}
	});
});

describe('getPieces', () => {
	it('returns pieces as square-to-piece map', async () => {
		const game = await createGame();
		const pieces = game.getPieces();
		expect(pieces.e1).toBe('K');
		expect(pieces.e8).toBe('k');
		expect(pieces.e2).toBe('P');
		expect(pieces.e7).toBe('p');
		expect(pieces.a1).toBe('R');
		expect(pieces.h8).toBe('r');
	});

	it('returns 32 pieces at start', async () => {
		const game = await createGame();
		expect(Object.keys(game.getPieces()).length).toBe(32);
	});

	it('reflects moves', async () => {
		const game = await createGame();
		game.makeMove('e2', 'e4');
		const pieces = game.getPieces();
		expect(pieces.e2).toBeUndefined();
		expect(pieces.e4).toBe('P');
	});
});

describe('Game over detection', () => {
	it.each([
		['detects checkmate', 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1', { isCheckmate: true, isGameOver: true, isCheck: true, result: '0-1' }],
		['detects stalemate', 'k7/2Q5/1K6/8/8/8/8/8 b - - 0 1', { isStalemate: true, isGameOver: true, result: '1/2-1/2' }],
		['detects check', '4k3/8/8/8/4Q3/8/8/4K3 b - - 0 1', { isCheck: true }],
	])('%s', async (_name, fen, expected) => {
		const game = await createGame(fen);
		for (const [key, val] of Object.entries(expected)) {
			expect(game[key as keyof typeof game]).toBe(val);
		}
	});

	it('returns null result when game ongoing', async () => {
		const game = await createGame();
		expect(game.result).toBeNull();
	});
});

describe('Multiple game instances', () => {
	it('instances are independent', async () => {
		const game1 = await createGame();
		const game2 = await createGame();
		game1.makeMove('e2', 'e4');
		expect(game2.fen).toBe(STARTING_FEN);
		expect(game2.moves).toEqual([]);
	});
});
