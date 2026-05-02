/**
 * Stockfish AI Service
 *
 * Provides advanced chess analysis using Stockfish engine.
 * Features:
 * - Position evaluation
 * - Best move calculation
 * - Multi-PV analysis
 * - Game analysis with blunder detection
 * - Adjustable strength levels (ELO 1000-3200)
 */

import { Chess } from 'chess.js';
import type { Square } from '../../types';

// Note: For React Native, we use a bridge approach
// The stockfish package requires a worker environment
// We'll implement a compatible interface that can work with:
// 1. WebView-based engine (for production)
// 2. Cloud API (for fallback)
// 3. Mock implementation (for development)

export type StockfishDifficulty =
  | 'beginner'      // ELO ~1000
  | 'intermediate'  // ELO ~1400
  | 'advanced'      // ELO ~1800
  | 'expert'        // ELO ~2200
  | 'master'        // ELO ~2600
  | 'grandmaster';  // ELO ~3200

export interface StockfishMove {
  from: Square;
  to: Square;
  san: string;
  evaluation: number;  // In centipawns
  mate?: number;       // Moves to mate (if applicable)
  depth: number;
  pv?: string[];       // Principal variation
}

export interface MoveAnalysis {
  move: string;
  evaluation: number;
  previousEval: number;
  loss: number;        // Centipawn loss
  classification: 'brilliant' | 'great' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' | 'missed-win';
  comment: string;
  bestMove?: string;
  depth: number;
}

export interface PositionAnalysis {
  evaluation: number;
  mate?: number;
  bestMove: string;
  pv: string[];
  depth: number;
}

export interface GameAnalysis {
  moves: MoveAnalysis[];
  accuracy: {
    white: number;
    black: number;
  };
  blunders: {
    white: number;
    black: number;
  };
  mistakes: {
    white: number;
    black: number;
  };
  inaccuracies: {
    white: number;
    black: number;
  };
  averageCentipawnLoss: {
    white: number;
    black: number;
  };
}

class StockfishService {
  private engine: any = null;
  private initialized: boolean = false;
  private pendingCommands: string[] = [];
  private currentPosition: string = '';
  private isThinking: boolean = false;

  /**
   * Initialize Stockfish engine
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      // For React Native, we need a special initialization
      // This will be implemented with a WebView or native module
      console.log('[Stockfish] Initializing engine...');

      // TODO: Implement actual engine initialization
      // For now, we'll use a mock implementation
      this.engine = await this.createMockEngine();

      this.initialized = true;
      console.log('[Stockfish] Engine initialized successfully');
    } catch (error) {
      console.error('[Stockfish] Failed to initialize:', error);
      throw error;
    }
  }

  /**
   * Create a mock engine for development
   * This will be replaced with actual Stockfish integration
   */
  private async createMockEngine(): Promise<any> {
    return {
      postMessage: (command: string) => {
        console.log('[Stockfish Mock] Command:', command);
      },
      onMessage: (handler: (event: any) => void) => {
        // Mock handler
      }
    };
  }

  /**
   * Send command to engine
   */
  private sendCommand(command: string): void {
    if (!this.initialized || !this.engine) {
      this.pendingCommands.push(command);
      return;
    }
    console.log('[Stockfish] →', command);
    this.engine.postMessage(command);
  }

  /**
   * Set position from FEN
   */
  setPosition(fen: string): void {
    this.currentPosition = fen;
    this.sendCommand(`position fen ${fen}`);
  }

  /**
   * Set position with moves
   */
  setPositionWithMoves(startFen: string, moves: string[]): void {
    const movesStr = moves.join(' ');
    this.sendCommand(`position fen ${startFen} moves ${movesStr}`);
  }

  /**
   * Get best move at specific difficulty level
   */
  async getBestMove(
    fen: string,
    difficulty: StockfishDifficulty,
    timeMs?: number
  ): Promise<StockfishMove> {
    await this.initialize();

    const settings = this.getDifficultySettings(difficulty);
    this.setPosition(fen);

    // For now, use a simplified evaluation
    // TODO: Replace with actual Stockfish analysis
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });

    if (moves.length === 0) {
      throw new Error('No legal moves available');
    }

    // Mock evaluation - will be replaced with actual engine
    const bestMove = moves[Math.floor(Math.random() * Math.min(3, moves.length))];

    return {
      from: bestMove.from as Square,
      to: bestMove.to as Square,
      san: bestMove.san,
      evaluation: 0,
      depth: settings.depth,
      pv: [bestMove.san]
    };
  }

  /**
   * Analyze position
   */
  async analyzePosition(
    fen: string,
    depth: number = 20,
    multiPv: number = 1
  ): Promise<PositionAnalysis> {
    await this.initialize();

    this.setPosition(fen);
    this.sendCommand(`setoption name MultiPV value ${multiPv}`);
    this.sendCommand(`go depth ${depth}`);

    // TODO: Wait for engine response and parse
    // For now, return mock data
    const chess = new Chess(fen);
    const moves = chess.moves({ verbose: true });

    return {
      evaluation: 0,
      bestMove: moves[0]?.san || '',
      pv: [moves[0]?.san || ''],
      depth
    };
  }

  /**
   * Analyze entire game
   */
  async analyzeGame(
    moves: string[],
    startFen: string = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    depth: number = 18
  ): Promise<GameAnalysis> {
    await this.initialize();

    const analysis: MoveAnalysis[] = [];
    const chess = new Chess(startFen);
    let previousEval = 0;

    const stats = {
      white: { blunders: 0, mistakes: 0, inaccuracies: 0, totalLoss: 0, moves: 0 },
      black: { blunders: 0, mistakes: 0, inaccuracies: 0, totalLoss: 0, moves: 0 }
    };

    for (let i = 0; i < moves.length; i++) {
      const move = moves[i];
      const isWhite = chess.turn() === 'w';

      // Make move
      chess.move(move);

      // Get evaluation after move
      const afterFen = chess.fen();
      const afterEval = await this.quickEval(afterFen);

      // Flip evaluation for black's perspective
      const normalizedEval = isWhite ? -afterEval : afterEval;
      const loss = previousEval - normalizedEval;

      // Classify move
      const classification = this.classifyMove(loss);
      const comment = this.getMoveComment(classification, loss);

      // Update stats
      const player = isWhite ? stats.white : stats.black;
      player.moves++;
      player.totalLoss += Math.max(0, loss);

      if (classification === 'blunder') player.blunders++;
      else if (classification === 'mistake') player.mistakes++;
      else if (classification === 'inaccuracy') player.inaccuracies++;

      analysis.push({
        move,
        evaluation: afterEval,
        previousEval,
        loss,
        classification,
        comment,
        depth
      });

      previousEval = normalizedEval;
    }

    // Calculate accuracy scores (0-100)
    const whiteAccuracy = this.calculateAccuracy(
      stats.white.totalLoss,
      stats.white.moves
    );
    const blackAccuracy = this.calculateAccuracy(
      stats.black.totalLoss,
      stats.black.moves
    );

    return {
      moves: analysis,
      accuracy: {
        white: whiteAccuracy,
        black: blackAccuracy
      },
      blunders: {
        white: stats.white.blunders,
        black: stats.black.blunders
      },
      mistakes: {
        white: stats.white.mistakes,
        black: stats.black.mistakes
      },
      inaccuracies: {
        white: stats.white.inaccuracies,
        black: stats.black.inaccuracies
      },
      averageCentipawnLoss: {
        white: stats.white.moves > 0 ? stats.white.totalLoss / stats.white.moves : 0,
        black: stats.black.moves > 0 ? stats.black.totalLoss / stats.black.moves : 0
      }
    };
  }

  /**
   * Quick position evaluation (simplified)
   */
  private async quickEval(fen: string): Promise<number> {
    // Simple material count for now
    // TODO: Replace with actual Stockfish evaluation
    const chess = new Chess(fen);

    const pieceValues: { [key: string]: number } = {
      'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 0
    };

    let score = 0;
    const board = chess.board();

    for (let row of board) {
      for (let square of row) {
        if (square) {
          const value = pieceValues[square.type] || 0;
          score += square.color === 'w' ? value : -value;
        }
      }
    }

    return score;
  }

  /**
   * Classify move based on centipawn loss
   */
  private classifyMove(loss: number): MoveAnalysis['classification'] {
    if (loss < -50) return 'brilliant';
    if (loss < -20) return 'great';
    if (loss < 10) return 'best';
    if (loss < 40) return 'good';
    if (loss < 100) return 'inaccuracy';
    if (loss < 300) return 'mistake';
    return 'blunder';
  }

  /**
   * Get comment for move classification
   */
  private getMoveComment(
    classification: MoveAnalysis['classification'],
    loss: number
  ): string {
    const comments: { [key in MoveAnalysis['classification']]: string } = {
      'brilliant': 'Brilliant move! A stunning tactical blow.',
      'great': 'Excellent move! This significantly improves your position.',
      'best': 'Best move. Maintains or improves your advantage.',
      'good': 'Good move. Keeps the position balanced.',
      'inaccuracy': `Inaccuracy. You lost ${Math.round(loss / 10) / 10} pawns of advantage.`,
      'mistake': `Mistake! This loses ${Math.round(loss / 10) / 10} pawns.`,
      'blunder': `Blunder!! This is a serious error, losing ${Math.round(loss / 10) / 10} pawns.`,
      'missed-win': 'You missed a winning move!'
    };

    return comments[classification];
  }

  /**
   * Calculate accuracy score (0-100)
   * Based on average centipawn loss
   */
  private calculateAccuracy(totalLoss: number, moveCount: number): number {
    if (moveCount === 0) return 100;

    const avgLoss = totalLoss / moveCount;

    // Formula: 100 - (avgLoss / 10)
    // Perfect play (0 loss) = 100%
    // Average loss of 100cp = 90%
    // Average loss of 500cp = 50%
    const accuracy = Math.max(0, Math.min(100, 100 - (avgLoss / 10)));

    return Math.round(accuracy * 10) / 10;
  }

  /**
   * Get difficulty settings
   */
  private getDifficultySettings(difficulty: StockfishDifficulty) {
    const settings = {
      beginner: { depth: 1, skillLevel: 0, elo: 1000 },
      intermediate: { depth: 5, skillLevel: 5, elo: 1400 },
      advanced: { depth: 10, skillLevel: 10, elo: 1800 },
      expert: { depth: 15, skillLevel: 15, elo: 2200 },
      master: { depth: 18, skillLevel: 18, elo: 2600 },
      grandmaster: { depth: 20, skillLevel: 20, elo: 3200 }
    };

    return settings[difficulty];
  }

  /**
   * Set engine skill level
   */
  setSkillLevel(level: number): void {
    // Stockfish skill level: 0-20
    this.sendCommand(`setoption name Skill Level value ${level}`);
  }

  /**
   * Set engine ELO strength
   */
  setELO(elo: number): void {
    // Limit ELO: 1000-3200
    this.sendCommand(`setoption name UCI_LimitStrength value true`);
    this.sendCommand(`setoption name UCI_Elo value ${elo}`);
  }

  /**
   * Stop current analysis
   */
  stop(): void {
    this.sendCommand('stop');
    this.isThinking = false;
  }

  /**
   * Quit engine
   */
  quit(): void {
    this.sendCommand('quit');
    this.initialized = false;
    this.engine = null;
  }
}

// Singleton instance
export const stockfishService = new StockfishService();
