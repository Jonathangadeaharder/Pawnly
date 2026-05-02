import type { Color, PieceSymbol, Square } from 'chess.js';
import { Chess } from 'chess.js';

export type { Square };

export interface ChessMove {
	from: Square;
	to: Square;
	promotion?: PieceSymbol;
	san?: string;
	captured?: PieceSymbol;
	flags?: string;
}

export interface ChessPosition {
	fen: string;
	turn: Color;
	moveNumber: number;
}

export type GameMode = 'learn' | 'train' | 'play' | 'analysis';

export interface Arrow {
	from: Square;
	to: Square;
	color?: string;
	opacity?: number;
}

export interface Highlight {
	square: Square;
	color?: string;
	opacity?: number;
}

const DEFAULT_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

export function createGame(initialFen: string = DEFAULT_FEN) {
	let chess = new Chess(initialFen);
	let _version = $state(0);
	let selectedSquare = $state<Square | null>(null);
	let highlightedSquares = $state<Square[]>([]);
	let legalMoves = $state<string[]>(chess.moves());
	let gameMode = $state<GameMode>('play');

	const fen = $derived.by(() => {
		_version;
		return chess.fen();
	});

	const turn = $derived.by(() => {
		_version;
		return chess.turn();
	});

	const moveNumber = $derived.by(() => {
		_version;
		return chess.moveNumber();
	});

	const moves = $derived.by<ChessMove[]>(() => {
		_version;
		return chess.history({ verbose: true }).map((m) => ({
			from: m.from,
			to: m.to,
			promotion: m.promotion,
			san: m.san,
			captured: m.captured,
			flags: m.flags,
		}));
	});

	const isGameOver = $derived.by(() => {
		_version;
		return chess.isGameOver();
	});

	const isCheck = $derived.by(() => {
		_version;
		return chess.isCheck();
	});

	const isCheckmate = $derived.by(() => {
		_version;
		return chess.isCheckmate();
	});

	const isStalemate = $derived.by(() => {
		_version;
		return chess.isStalemate();
	});

	const result = $derived.by(() => {
		_version;
		if (!chess.isGameOver()) return null;
		if (chess.isCheckmate()) {
			return chess.turn() === 'w' ? '0-1' : '1-0';
		}
		return '1/2-1/2';
	});

	function makeMove(from: Square, to: Square, promotion?: PieceSymbol): boolean {
		try {
			const move = chess.move({ from, to, promotion });
			if (!move) return false;
			_version++;
			legalMoves = chess.moves();
			selectedSquare = null;
			highlightedSquares = [];
			return true;
		} catch {
			return false;
		}
	}

	function trySelectPiece(square: Square): boolean {
		const piece = chess.get(square);
		if (piece && piece.color === chess.turn()) {
			selectedSquare = square;
			highlightedSquares = chess.moves({ square, verbose: true }).map((m) => m.to);
			return true;
		}
		return false;
	}

	function selectSquare(square: Square): void {
		if (selectedSquare === null) {
			trySelectPiece(square);
		} else if (selectedSquare === square) {
			selectedSquare = null;
			highlightedSquares = [];
		} else if (highlightedSquares.includes(square)) {
			makeMove(selectedSquare, square);
		} else {
			if (!trySelectPiece(square)) {
				selectedSquare = null;
				highlightedSquares = [];
			}
		}
	}

	function resetGame(): void {
		chess = new Chess();
		_version++;
		selectedSquare = null;
		highlightedSquares = [];
		legalMoves = chess.moves();
	}

	function loadPosition(fenStr: string): void {
		chess = new Chess(fenStr);
		_version++;
		selectedSquare = null;
		highlightedSquares = [];
		legalMoves = chess.moves();
	}

	function undoMove(): void {
		const undone = chess.undo();
		if (undone) {
			_version++;
			legalMoves = chess.moves();
		}
	}

	function getLegalMoves(square?: Square): string[] {
		if (square) {
			return chess.moves({ square });
		}
		return chess.moves();
	}

	function setGameMode(mode: GameMode): void {
		gameMode = mode;
	}

	function getPieces(): Record<string, string> {
		const pieces: Record<string, string> = {};
		const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
		const ranks = ['8', '7', '6', '5', '4', '3', '2', '1'];
		for (const rank of ranks) {
			for (const file of files) {
				const sq = `${file}${rank}` as Square;
				const piece = chess.get(sq);
				if (piece) {
					pieces[sq] = piece.color === 'w' ? piece.type.toUpperCase() : piece.type.toLowerCase();
				}
			}
		}
		return pieces;
	}

	return {
		get fen() {
			return fen;
		},
		get turn() {
			return turn;
		},
		get moveNumber() {
			return moveNumber;
		},
		get moves() {
			return moves;
		},
		get selectedSquare() {
			return selectedSquare;
		},
		set selectedSquare(value: Square | null) {
			selectedSquare = value;
		},
		get highlightedSquares() {
			return highlightedSquares;
		},
		set highlightedSquares(value: Square[]) {
			highlightedSquares = value;
		},
		get legalMoves() {
			return legalMoves;
		},
		set legalMoves(value: string[]) {
			legalMoves = value;
		},
		get gameMode() {
			return gameMode;
		},
		set gameMode(value: GameMode) {
			gameMode = value;
		},
		get isGameOver() {
			return isGameOver;
		},
		get isCheck() {
			return isCheck;
		},
		get isCheckmate() {
			return isCheckmate;
		},
		get isStalemate() {
			return isStalemate;
		},
		get result() {
			return result;
		},
		makeMove,
		selectSquare,
		resetGame,
		loadPosition,
		undoMove,
		getLegalMoves,
		setGameMode,
		getPieces,
	};
}
