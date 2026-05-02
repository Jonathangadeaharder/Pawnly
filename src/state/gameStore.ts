/**
 * Game State Store
 * Manages the current chess game state using Zustand
 */

import { create } from 'zustand';
import { Chess } from 'chess.js';
import type { GameState, ChessMove, Square } from '../types';

interface GameStore extends GameState {
  chess: Chess;

  // Actions
  makeMove: (from: Square, to: Square, promotion?: string) => boolean;
  selectSquare: (square: Square | null) => void;
  resetGame: () => void;
  loadPosition: (fen: string) => void;
  undoMove: () => void;
  getLegalMoves: (square?: Square) => string[];
  isSquareHighlighted: (square: Square) => boolean;
  setGameMode: (mode: GameState['gameMode']) => void;
}

const initialChess = new Chess();

export const useGameStore = create<GameStore>((set, get) => ({
  // Initial state
  chess: initialChess,
  position: {
    fen: initialChess.fen(),
    turn: 'w',
    moveNumber: 1,
  },
  moves: [],
  legalMoves: [],
  selectedSquare: null,
  highlightedSquares: [],
  gameMode: 'learn',

  // Make a move
  makeMove: (from: Square, to: Square, promotion?: string) => {
    const { chess } = get();

    try {
      const move = chess.move({
        from,
        to,
        promotion: promotion as any,
      });

      if (move) {
        set({
          position: {
            fen: chess.fen(),
            turn: chess.turn(),
            moveNumber: chess.moveNumber(),
          },
          moves: [...get().moves, move as ChessMove],
          selectedSquare: null,
          highlightedSquares: [],
          legalMoves: [],
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Invalid move:', error);
      return false;
    }
  },

  // Select a square (for tap-tap interaction)
  selectSquare: (square: Square | null) => {
    const { chess, selectedSquare } = get();

    if (square === null) {
      set({
        selectedSquare: null,
        highlightedSquares: [],
        legalMoves: [],
      });
      return;
    }

    // If a square is already selected, try to make a move
    if (selectedSquare) {
      const moved = get().makeMove(selectedSquare, square);
      if (!moved) {
        // If move failed, select the new square instead
        const moves = chess.moves({ square, verbose: true });
        set({
          selectedSquare: square,
          highlightedSquares: moves.map((m: any) => m.to),
          legalMoves: moves.map((m: any) => m.san),
        });
      }
    } else {
      // Select the square and highlight legal moves
      const moves = chess.moves({ square, verbose: true });
      if (moves.length > 0) {
        set({
          selectedSquare: square,
          highlightedSquares: moves.map((m: any) => m.to),
          legalMoves: moves.map((m: any) => m.san),
        });
      }
    }
  },

  // Reset game to starting position
  resetGame: () => {
    const chess = new Chess();
    set({
      chess,
      position: {
        fen: chess.fen(),
        turn: 'w',
        moveNumber: 1,
      },
      moves: [],
      legalMoves: [],
      selectedSquare: null,
      highlightedSquares: [],
    });
  },

  // Load a specific position
  loadPosition: (fen: string) => {
    const chess = new Chess(fen);
    set({
      chess,
      position: {
        fen: chess.fen(),
        turn: chess.turn(),
        moveNumber: chess.moveNumber(),
      },
      selectedSquare: null,
      highlightedSquares: [],
      legalMoves: [],
    });
  },

  // Undo the last move
  undoMove: () => {
    const { chess, moves } = get();
    const undone = chess.undo();

    if (undone) {
      set({
        position: {
          fen: chess.fen(),
          turn: chess.turn(),
          moveNumber: chess.moveNumber(),
        },
        moves: moves.slice(0, -1),
        selectedSquare: null,
        highlightedSquares: [],
        legalMoves: [],
      });
    }
  },

  // Get legal moves for a square
  getLegalMoves: (square?: Square) => {
    const { chess } = get();
    if (square) {
      return chess.moves({ square, verbose: false });
    }
    return chess.moves();
  },

  // Check if a square should be highlighted
  isSquareHighlighted: (square: Square) => {
    return get().highlightedSquares.includes(square);
  },

  // Set game mode
  setGameMode: (mode: GameState['gameMode']) => {
    set({ gameMode: mode });
  },
}));
