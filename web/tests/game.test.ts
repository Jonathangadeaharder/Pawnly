import { describe, expect, it } from 'vitest';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

describe('createGame', () => {
	it('exports createGame function', async () => {
		const mod = await import('../src/lib/game.svelte');
		expect(typeof mod.createGame).toBe('function');
	});

	it('exports types (Square, ChessMove, etc.)', async () => {
		const mod = await import('../src/lib/game.svelte');
		// Types are compile-time only, but we can check the module has expected exports
		expect(mod.createGame).toBeDefined();
	});
});

describe('Game state initialization', () => {
	it('starts with default FEN', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.fen).toBe(STARTING_FEN);
	});

	it('starts with white to move', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.turn).toBe('w');
	});

	it('starts at move number 1', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.moveNumber).toBe(1);
	});

	it('starts with empty moves array', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.moves).toEqual([]);
	});

	it('starts with no selected square', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.selectedSquare).toBeNull();
	});

	it('starts with empty highlighted squares', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.highlightedSquares).toEqual([]);
	});

	it('starts with legal moves populated', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.legalMoves.length).toBe(20); // 16 pawn + 4 knight moves
	});

	it('starts in play mode', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.gameMode).toBe('play');
	});

	it('starts with game not over', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.isGameOver).toBe(false);
	});

	it('starts not in check', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.isCheck).toBe(false);
		expect(game.isCheckmate).toBe(false);
		expect(game.isStalemate).toBe(false);
	});

	it('starts with no result', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.result).toBeNull();
	});

	it('accepts custom FEN', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
		const game = createGame(fen);
		expect(game.fen).toBe(fen);
		expect(game.turn).toBe('b');
	});
});

describe('makeMove', () => {
	it('makes a valid move and returns true', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const result = game.makeMove('e2', 'e4');
		expect(result).toBe(true);
	});

	it('updates FEN after move', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.makeMove('e2', 'e4');
		expect(game.fen).toContain('4P3'); // pawn on e4
		expect(game.turn).toBe('b');
		expect(game.moveNumber).toBe(1);
	});

	it('appends to moves history', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.makeMove('e2', 'e4');
		expect(game.moves.length).toBe(1);
		expect(game.moves[0].from).toBe('e2');
		expect(game.moves[0].to).toBe('e4');
		expect(game.moves[0].san).toBe('e4');
	});

	it('returns false for illegal move', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const result = game.makeMove('e2', 'e5');
		expect(result).toBe(false);
	});

	it('does not change state on illegal move', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const fenBefore = game.fen;
		game.makeMove('e2', 'e5');
		expect(game.fen).toBe(fenBefore);
		expect(game.moves.length).toBe(0);
	});

	it('allows pawn promotion', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const fen = '8/4P3/8/8/8/8/8/4K2k w - - 0 1';
		const game = createGame(fen);
		const result = game.makeMove('e7', 'e8', 'q');
		expect(result).toBe(true);
		expect(game.fen).toContain('Q');
	});

	it('clears selected square after move', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.selectSquare('e2');
		game.makeMove('e2', 'e4');
		expect(game.selectedSquare).toBeNull();
	});

	it('clears highlighted squares after move', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.selectSquare('e2');
		game.makeMove('e2', 'e4');
		expect(game.highlightedSquares).toEqual([]);
	});

	it('updates legal moves after move', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.makeMove('e2', 'e4');
		// Black's turn - should have black's legal moves
		expect(game.legalMoves.length).toBeGreaterThan(0);
		// Should contain e5 (pawn advance)
		expect(game.legalMoves).toContain('e5');
	});
});

describe('selectSquare', () => {
	it('selects a square with a piece', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.selectSquare('e2');
		expect(game.selectedSquare).toBe('e2');
	});

	it('shows highlighted squares for legal moves', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.selectSquare('e2');
		expect(game.highlightedSquares).toContain('e3');
		expect(game.highlightedSquares).toContain('e4');
	});

	it('deselects when same square tapped again', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.selectSquare('e2');
		game.selectSquare('e2');
		expect(game.selectedSquare).toBeNull();
		expect(game.highlightedSquares).toEqual([]);
	});

	it('executes move when legal destination tapped', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.selectSquare('e2');
		game.selectSquare('e4');
		expect(game.moves.length).toBe(1);
		expect(game.selectedSquare).toBeNull();
	});

	it('selects new piece when different own piece tapped', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.selectSquare('e2');
		game.selectSquare('d2');
		expect(game.selectedSquare).toBe('d2');
		expect(game.highlightedSquares).toContain('d3');
		expect(game.highlightedSquares).toContain('d4');
	});

	it('ignores empty square when no piece selected', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.selectSquare('e4');
		expect(game.selectedSquare).toBeNull();
	});

	it('does not select opponent pieces', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.selectSquare('e7'); // black pawn, white to move
		expect(game.selectedSquare).toBeNull();
	});
});

describe('resetGame', () => {
	it('resets to starting position', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
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
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const fen = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq - 0 1';
		game.loadPosition(fen);
		expect(game.fen).toBe(fen);
		expect(game.turn).toBe('b');
	});

	it('clears move history when loading', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.makeMove('e2', 'e4');
		game.loadPosition(STARTING_FEN);
		expect(game.moves).toEqual([]);
	});

	it('clears selection when loading', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.selectSquare('e2');
		game.loadPosition(STARTING_FEN);
		expect(game.selectedSquare).toBeNull();
		expect(game.highlightedSquares).toEqual([]);
	});
});

describe('undoMove', () => {
	it('undoes the last move', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.makeMove('e2', 'e4');
		game.undoMove();
		expect(game.fen).toBe(STARTING_FEN);
		expect(game.turn).toBe('w');
		expect(game.moves).toEqual([]);
	});

	it('does nothing when no moves to undo', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const fenBefore = game.fen;
		game.undoMove();
		expect(game.fen).toBe(fenBefore);
	});

	it('undoes multiple moves in order', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
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
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const moves = game.getLegalMoves();
		expect(moves.length).toBe(20);
	});

	it('returns legal moves for a specific square', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const moves = game.getLegalMoves('e2');
		expect(moves).toContain('e3');
		expect(moves).toContain('e4');
		expect(moves.length).toBe(2);
	});

	it('returns empty array for empty square', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const moves = game.getLegalMoves('e4');
		expect(moves).toEqual([]);
	});

	it('returns empty array for opponent piece', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const moves = game.getLegalMoves('e7');
		expect(moves).toEqual([]);
	});
});

describe('setGameMode', () => {
	it('sets game mode', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.setGameMode('analysis');
		expect(game.gameMode).toBe('analysis');
	});

	it('supports all modes', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const modes = ['learn', 'train', 'play', 'analysis'] as const;
		for (const mode of modes) {
			game.setGameMode(mode);
			expect(game.gameMode).toBe(mode);
		}
	});
});

describe('getPieces', () => {
	it('returns pieces as square-to-piece map', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const pieces = game.getPieces();
		expect(pieces.e1).toBe('K');
		expect(pieces.e8).toBe('k');
		expect(pieces.e2).toBe('P');
		expect(pieces.e7).toBe('p');
		expect(pieces.a1).toBe('R');
		expect(pieces.h8).toBe('r');
	});

	it('returns 32 pieces at start', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		const pieces = game.getPieces();
		expect(Object.keys(pieces).length).toBe(32);
	});

	it('reflects moves', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		game.makeMove('e2', 'e4');
		const pieces = game.getPieces();
		expect(pieces.e2).toBeUndefined();
		expect(pieces.e4).toBe('P');
	});
});

describe('Game over detection', () => {
	it('detects checkmate', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const fen = 'rnb1kbnr/pppp1ppp/8/4p3/6Pq/5P2/PPPPP2P/RNBQKBNR w KQkq - 0 1';
		const game = createGame(fen);
		expect(game.isCheckmate).toBe(true);
		expect(game.isGameOver).toBe(true);
		expect(game.isCheck).toBe(true);
		expect(game.result).toBe('0-1');
	});

	it('detects stalemate', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const fen = 'k7/2Q5/1K6/8/8/8/8/8 b - - 0 1';
		const game = createGame(fen);
		expect(game.isStalemate).toBe(true);
		expect(game.isGameOver).toBe(true);
		expect(game.result).toBe('1/2-1/2');
	});

	it('detects check', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const fen = '4k3/8/8/8/4Q3/8/8/4K3 b - - 0 1';
		const game = createGame(fen);
		expect(game.isCheck).toBe(true);
	});

	it('returns null result when game ongoing', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game = createGame();
		expect(game.result).toBeNull();
	});
});

describe('Multiple game instances', () => {
	it('instances are independent', async () => {
		const { createGame } = await import('../src/lib/game.svelte');
		const game1 = createGame();
		const game2 = createGame();
		game1.makeMove('e2', 'e4');
		expect(game2.fen).toBe(STARTING_FEN);
		expect(game2.moves).toEqual([]);
	});
});
