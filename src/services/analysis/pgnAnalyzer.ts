/**
 * PGN Analyzer & Weakness Finder
 *
 * Analyzes PGN games to identify patterns, weaknesses, and improvement areas.
 * Features:
 * - Parse PGN format games
 * - Identify tactical mistakes and missed opportunities
 * - Detect opening weaknesses
 * - Analyze endgame performance
 * - Generate personalized improvement recommendations
 */

import { Chess } from 'chess.js';
import { stockfishService } from '../ai/stockfishService';
import type { Weakness } from '../../types';

export interface PGNGame {
  white: string;
  black: string;
  result: string;
  date?: string;
  event?: string;
  site?: string;
  round?: string;
  whiteElo?: number;
  blackElo?: number;
  eco?: string;
  opening?: string;
  moves: string[];
  pgn: string;
}

export interface WeaknessPattern {
  type: 'tactical' | 'positional' | 'opening' | 'endgame' | 'time-management';
  category: string;
  description: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high';
  examples: {
    gameIndex: number;
    moveNumber: number;
    position: string;
    mistake: string;
    correction: string;
  }[];
  recommendation: string;
}

export interface WeaknessReport {
  gamesAnalyzed: number;
  playerColor: 'white' | 'black' | 'both';
  patterns: WeaknessPattern[];
  overallAccuracy: number;
  strengths: string[];
  priorityAreas: string[];
  estimatedRating: number;
}

/**
 * Parse PGN string into structured game data
 */
export function parsePGN(pgn: string): PGNGame | null {
  try {
    const chess = new Chess();

    // Extract headers
    const headers: any = {};
    const headerRegex = /\[(\w+)\s+"([^"]+)"\]/g;
    let match;

    while ((match = headerRegex.exec(pgn)) !== null) {
      headers[match[1]] = match[2];
    }

    // Load the game
    const loaded = chess.loadPgn(pgn);
    if (!loaded) {
      console.error('Failed to load PGN');
      return null;
    }

    const moves = chess.history();

    return {
      white: headers.White || 'Unknown',
      black: headers.Black || 'Unknown',
      result: headers.Result || '*',
      date: headers.Date,
      event: headers.Event,
      site: headers.Site,
      round: headers.Round,
      whiteElo: headers.WhiteElo ? parseInt(headers.WhiteElo) : undefined,
      blackElo: headers.BlackElo ? parseInt(headers.BlackElo) : undefined,
      eco: headers.ECO,
      opening: headers.Opening,
      moves,
      pgn,
    };
  } catch (error) {
    console.error('Error parsing PGN:', error);
    return null;
  }
}

/**
 * Analyze multiple PGN games for a player
 */
export async function analyzePlayerGames(
  pgnGames: string[],
  playerName: string,
  playerColor: 'white' | 'black' | 'both' = 'both'
): Promise<WeaknessReport> {
  const games: PGNGame[] = [];
  const weaknessMap = new Map<string, WeaknessPattern>();

  let totalAccuracy = 0;
  let gamesWithAccuracy = 0;

  // Parse all games
  for (const pgn of pgnGames) {
    const game = parsePGN(pgn);
    if (game) {
      // Filter by player color
      const isPlayerWhite = game.white.toLowerCase().includes(playerName.toLowerCase());
      const isPlayerBlack = game.black.toLowerCase().includes(playerName.toLowerCase());

      if (playerColor === 'white' && !isPlayerWhite) continue;
      if (playerColor === 'black' && !isPlayerBlack) continue;
      if (playerColor === 'both' && !isPlayerWhite && !isPlayerBlack) continue;

      games.push(game);
    }
  }

  // Analyze each game
  for (let gameIndex = 0; gameIndex < games.length; gameIndex++) {
    const game = games[gameIndex];
    const analysis = await stockfishService.analyzeGame(game.moves);

    // Track accuracy
    const isPlayerWhite = game.white.toLowerCase().includes(playerName.toLowerCase());
    const playerAccuracy = isPlayerWhite ? analysis.accuracy.white : analysis.accuracy.black;

    totalAccuracy += playerAccuracy;
    gamesWithAccuracy++;

    // Identify weaknesses
    for (let i = 0; i < analysis.moves.length; i++) {
      const move = analysis.moves[i];
      const isPlayerMove = (i % 2 === 0 && isPlayerWhite) || (i % 2 === 1 && !isPlayerWhite);

      if (!isPlayerMove) continue;

      // Detect tactical mistakes
      if (move.classification === 'blunder' || move.classification === 'mistake') {
        const pattern = detectWeaknessPattern(move, game, i);
        if (pattern) {
          const key = `${pattern.type}-${pattern.category}`;
          const existing = weaknessMap.get(key);

          if (existing) {
            existing.frequency++;
            existing.examples.push({
              gameIndex,
              moveNumber: Math.floor(i / 2) + 1,
              position: '', // Will be filled by detectWeaknessPattern
              mistake: move.move,
              correction: move.bestMove || '',
            });
          } else {
            weaknessMap.set(key, pattern);
          }
        }
      }

      // Detect opening weaknesses
      if (i < 15) {
        const openingWeakness = detectOpeningWeakness(move, game, i);
        if (openingWeakness) {
          const key = `opening-${openingWeakness.category}`;
          const existing = weaknessMap.get(key);

          if (existing) {
            existing.frequency++;
          } else {
            weaknessMap.set(key, openingWeakness);
          }
        }
      }

      // Detect endgame weaknesses (when few pieces remain)
      const chess = new Chess();
      for (let j = 0; j <= i; j++) {
        chess.move(game.moves[j]);
      }

      const board = chess.board();
      const pieceCount = board.flat().filter(p => p !== null).length;

      if (pieceCount <= 10) {
        const endgameWeakness = detectEndgameWeakness(move, game, i);
        if (endgameWeakness) {
          const key = `endgame-${endgameWeakness.category}`;
          const existing = weaknessMap.get(key);

          if (existing) {
            existing.frequency++;
          } else {
            weaknessMap.set(key, endgameWeakness);
          }
        }
      }
    }
  }

  // Convert to array and sort by frequency
  const patterns = Array.from(weaknessMap.values())
    .sort((a, b) => b.frequency - a.frequency);

  // Identify strengths (areas with few mistakes)
  const strengths = identifyStrengths(patterns, games);

  // Priority areas (top 3 most frequent weaknesses)
  const priorityAreas = patterns
    .slice(0, 3)
    .map(p => p.description);

  return {
    gamesAnalyzed: games.length,
    playerColor,
    patterns,
    overallAccuracy: gamesWithAccuracy > 0 ? totalAccuracy / gamesWithAccuracy : 0,
    strengths,
    priorityAreas,
    estimatedRating: estimateRating(totalAccuracy / gamesWithAccuracy, patterns),
  };
}

/**
 * Detect the type of weakness from a move
 */
function detectWeaknessPattern(
  move: any,
  game: PGNGame,
  moveIndex: number
): WeaknessPattern | null {
  const loss = move.loss;

  // Hanging pieces
  if (loss > 300 && move.move.includes('x')) {
    return {
      type: 'tactical',
      category: 'hanging-pieces',
      description: 'Leaving pieces undefended',
      frequency: 1,
      severity: 'high',
      examples: [{
        gameIndex: 0,
        moveNumber: Math.floor(moveIndex / 2) + 1,
        position: '',
        mistake: move.move,
        correction: move.bestMove || '',
      }],
      recommendation: 'Before moving, check that all your pieces are defended. Count attackers vs defenders.',
    };
  }

  // Missing tactical opportunities
  if (move.classification === 'mistake' && loss > 150) {
    return {
      type: 'tactical',
      category: 'missed-tactics',
      description: 'Missing tactical opportunities',
      frequency: 1,
      severity: 'medium',
      examples: [{
        gameIndex: 0,
        moveNumber: Math.floor(moveIndex / 2) + 1,
        position: '',
        mistake: move.move,
        correction: move.bestMove || '',
      }],
      recommendation: 'Practice tactical puzzles daily to improve pattern recognition.',
    };
  }

  // Positional mistakes
  if (move.classification === 'inaccuracy' && loss < 100) {
    return {
      type: 'positional',
      category: 'poor-piece-placement',
      description: 'Poor piece placement and planning',
      frequency: 1,
      severity: 'low',
      examples: [{
        gameIndex: 0,
        moveNumber: Math.floor(moveIndex / 2) + 1,
        position: '',
        mistake: move.move,
        correction: move.bestMove || '',
      }],
      recommendation: 'Study strategic concepts like piece activity, pawn structure, and king safety.',
    };
  }

  return null;
}

/**
 * Detect opening-specific weaknesses
 */
function detectOpeningWeakness(
  move: any,
  game: PGNGame,
  moveIndex: number
): WeaknessPattern | null {
  if (move.loss > 100) {
    return {
      type: 'opening',
      category: 'opening-preparation',
      description: 'Weak opening preparation',
      frequency: 1,
      severity: 'medium',
      examples: [{
        gameIndex: 0,
        moveNumber: Math.floor(moveIndex / 2) + 1,
        position: '',
        mistake: move.move,
        correction: move.bestMove || '',
      }],
      recommendation: 'Study and memorize your opening repertoire more thoroughly.',
    };
  }
  return null;
}

/**
 * Detect endgame weaknesses
 */
function detectEndgameWeakness(
  move: any,
  game: PGNGame,
  moveIndex: number
): WeaknessPattern | null {
  if (move.classification === 'mistake' || move.classification === 'blunder') {
    return {
      type: 'endgame',
      category: 'endgame-technique',
      description: 'Poor endgame technique',
      frequency: 1,
      severity: 'high',
      examples: [{
        gameIndex: 0,
        moveNumber: Math.floor(moveIndex / 2) + 1,
        position: '',
        mistake: move.move,
        correction: move.bestMove || '',
      }],
      recommendation: 'Practice fundamental endgames: king and pawn, rook endgames, opposition.',
    };
  }
  return null;
}

/**
 * Identify player's strengths based on low error rates
 */
function identifyStrengths(
  patterns: WeaknessPattern[],
  games: PGNGame[]
): string[] {
  const strengths: string[] = [];

  // Check opening strength
  const openingMistakes = patterns.filter(p => p.type === 'opening').length;
  if (openingMistakes === 0 && games.length > 5) {
    strengths.push('Strong opening preparation');
  }

  // Check tactical strength
  const tacticalMistakes = patterns.filter(p => p.type === 'tactical').reduce((sum, p) => sum + p.frequency, 0);
  if (tacticalMistakes < games.length * 2) {
    strengths.push('Good tactical awareness');
  }

  // Check endgame strength
  const endgameMistakes = patterns.filter(p => p.type === 'endgame').length;
  if (endgameMistakes === 0 && games.length > 3) {
    strengths.push('Solid endgame technique');
  }

  return strengths.length > 0 ? strengths : ['Consistent play'];
}

/**
 * Estimate player rating based on accuracy and mistake patterns
 */
function estimateRating(accuracy: number, patterns: WeaknessPattern[]): number {
  let baseRating = 1200;

  // Accuracy contribution (40-100% accuracy maps to 800-2400 rating)
  baseRating += (accuracy - 40) * 26.67;

  // Penalty for blunders
  const blunders = patterns.filter(p => p.severity === 'high').reduce((sum, p) => sum + p.frequency, 0);
  baseRating -= blunders * 50;

  // Penalty for missed tactics
  const missedTactics = patterns.filter(p => p.category === 'missed-tactics').reduce((sum, p) => sum + p.frequency, 0);
  baseRating -= missedTactics * 30;

  return Math.max(800, Math.min(2800, Math.round(baseRating)));
}

/**
 * Import PGN games from Lichess account
 */
export async function importLichessGames(username: string, count: number = 50): Promise<string[]> {
  try {
    const response = await fetch(
      `https://lichess.org/api/games/user/${username}?max=${count}&moves=true&tags=true`,
      {
        headers: {
          'Accept': 'application/x-chess-pgn',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Lichess API error: ${response.status}`);
    }

    const pgnText = await response.text();
    // Split by double newline to separate games
    const games = pgnText.split('\n\n\n').filter(g => g.trim().length > 0);

    return games;
  } catch (error) {
    console.error('Error importing Lichess games:', error);
    throw error;
  }
}

/**
 * Import PGN games from Chess.com account
 */
export async function importChessComGames(username: string, year?: number, month?: number): Promise<string[]> {
  try {
    // Default to current month if not specified
    const now = new Date();
    const targetYear = year || now.getFullYear();
    const targetMonth = month || now.getMonth() + 1;

    const response = await fetch(
      `https://api.chess.com/pub/player/${username}/games/${targetYear}/${String(targetMonth).padStart(2, '0')}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Chess.com API error: ${response.status}`);
    }

    const data = await response.json();
    const games = data.games || [];

    return games.map((g: any) => g.pgn).filter((pgn: string) => pgn && pgn.length > 0);
  } catch (error) {
    console.error('Error importing Chess.com games:', error);
    throw error;
  }
}

/**
 * Generate personalized training plan based on weaknesses
 */
export function generateTrainingPlan(report: WeaknessReport): {
  priority: string;
  exercises: string[];
  estimatedWeeks: number;
}[] {
  const plan: any[] = [];

  for (const pattern of report.patterns.slice(0, 3)) {
    let exercises: string[] = [];
    let estimatedWeeks;

    switch (pattern.category) {
      case 'hanging-pieces':
        exercises = [
          'Practice 20 tactical puzzles daily focusing on hanging pieces',
          'Before each move, count defenders for all your pieces',
          'Review games and mark every hanging piece you missed',
        ];
        estimatedWeeks = 2;
        break;

      case 'missed-tactics':
        exercises = [
          'Solve 30 tactical puzzles daily at your rating level',
          'Study tactical motifs: forks, pins, skewers, discovered attacks',
          'Analyze master games focusing on tactical combinations',
        ];
        estimatedWeeks = 4;
        break;

      case 'opening-preparation':
        exercises = [
          'Study 2-3 opening lines deeply (10-15 moves)',
          'Use spaced repetition to memorize key positions',
          'Analyze your opening mistakes and learn the correct continuations',
        ];
        estimatedWeeks = 3;
        break;

      case 'endgame-technique':
        exercises = [
          'Practice fundamental endgames: K+Q vs K, K+R vs K, pawn endgames',
          'Learn the square rule, opposition, and triangulation',
          'Study Lucena and Philidor positions',
        ];
        estimatedWeeks = 4;
        break;

      default:
        exercises = [
          'Focus on this area during game analysis',
          'Find relevant training materials',
          'Practice positions similar to your mistakes',
        ];
        estimatedWeeks = 3;
    }

    plan.push({
      priority: pattern.description,
      exercises,
      estimatedWeeks,
    });
  }

  return plan;
}
