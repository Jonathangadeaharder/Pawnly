import { Chess, Square, Move, PieceSymbol, Color } from 'chess.js';

export type SymbolicTag =
  | 'Hanging Piece'
  | 'Fork'
  | 'Pin'
  | 'Skewer'
  | 'Discovered Attack'
  | 'Discovered Check'
  | 'Double Check'
  | 'Back-Rank Weakness'
  | 'Trapped Piece'
  | 'Deflection'
  | 'Removing the Defender'
  | 'Overloaded Piece'
  | 'Missed Mate'
  | 'Exposed King'
  | 'Material Loss'
  | 'Unknown';

export interface SymbolicAnalysis {
  tag: SymbolicTag;
  saliencySquares: string[];
  description: string;
  involvedPieces: { square: string; type: string; color: string }[];
}

const PIECE_VALUES: Record<PieceSymbol, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };

/**
 * Analyzes a move to identify the tactical reason for an evaluation drop.
 */
export function analyzeMove(
  beforeFen: string,
  afterFen: string,
  movePlayed: string
): SymbolicAnalysis {
  const chessBefore = new Chess(beforeFen);
  const chessAfter = new Chess(afterFen);

  // Parse the move played
  let move: Move | null = null;
  try {
    move = chessBefore.move(movePlayed);
    chessBefore.undo(); // Keep it in 'before' state for analysis
  } catch (e) {
    console.error('Invalid move provided to analyzeMove:', movePlayed);
  }

  if (!move) {
    return { tag: 'Unknown', saliencySquares: [], description: '', involvedPieces: [] };
  }

  // Check heuristics in order of specificity/priority

  // 1. Missed Mate
  if (detectMissedMate(beforeFen)) {
    return {
      tag: 'Missed Mate',
      saliencySquares: [findKingSquare(chessBefore, chessBefore.turn() === 'w' ? 'b' : 'w') || ''],
      description: 'A checkmate opportunity was missed.',
      involvedPieces: []
    };
  }

  // 2. Back-Rank Mate/Weakness
  if (detectBackRankWeakness(chessAfter)) {
    const kingSq = findKingSquare(chessAfter, chessAfter.turn());
    return {
      tag: 'Back-Rank Weakness',
      saliencySquares: kingSq ? [kingSq] : [],
      description: 'The king is vulnerable on the back rank.',
      involvedPieces: []
    };
  }

  // 3. Double Check
  if (chessAfter.isCheck() && isDoubleCheck(chessAfter)) {
    return {
      tag: 'Double Check',
      saliencySquares: [findKingSquare(chessAfter, chessAfter.turn()) || ''],
      description: 'The king is attacked by two pieces at once!',
      involvedPieces: []
    };
  }

  // 4. Pin or Skewer (Check if the moved piece created one or moved into one)
  const pinOrSkewer = detectPinOrSkewer(chessAfter);
  if (pinOrSkewer) {
    return pinOrSkewer;
  }

  // 5. Hanging Piece
  if (detectHangingPiece(beforeFen, afterFen, move)) {
    return {
      tag: 'Hanging Piece',
      saliencySquares: [move.to],
      description: 'The piece was moved to a square where it can be captured for free or for a loss.',
      involvedPieces: [{ square: move.to, type: move.piece, color: move.color }]
    };
  }

  // 6. Fork
  const forkSquares = detectFork(chessAfter, move.to);
  if (forkSquares.length >= 2) {
    return {
      tag: 'Fork',
      saliencySquares: [move.to, ...forkSquares],
      description: 'The piece attacks multiple targets simultaneously.',
      involvedPieces: [{ square: move.to, type: move.piece, color: move.color }]
    };
  }

  // 7. Discovered Attack
  if (detectDiscoveredAttack(chessBefore, move)) {
    return {
      tag: 'Discovered Attack',
      saliencySquares: [move.from],
      description: 'Moving the piece revealed an attack from another piece.',
      involvedPieces: []
    };
  }

  // Default to Material Loss if we can't find a specific motif but eval dropped
  return {
    tag: 'Material Loss',
    saliencySquares: [move.to],
    description: 'The move results in a loss of material.',
    involvedPieces: []
  };
}

// --- Helper Functions ---

function findKingSquare(chess: Chess, color: Color): string | null {
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const p = board[r][f];
      if (p && p.type === 'k' && p.color === color) {
        return `${String.fromCharCode(97 + f)}${8 - r}`;
      }
    }
  }
  return null;
}

function isSquareDefended(chess: Chess, square: string): boolean {
  const piece = chess.get(square as Square);
  if (!piece) return false;
  const color = piece.color;
  
  // To check defenders, we check attackers of the same color
  return chess.attackers(square as Square, color).length > 0;
}

function detectMissedMate(fen: string): boolean {
  const chess = new Chess(fen);
  const moves = chess.moves();
  for (const m of moves) {
    chess.move(m);
    if (chess.isCheckmate()) {
      chess.undo();
      return true;
    }
    chess.undo();
  }
  return false;
}

function detectHangingPiece(beforeFen: string, afterFen: string, move: Move): boolean {
  const chessAfter = new Chess(afterFen);
  const opponentColor = move.color === 'w' ? 'b' : 'w';
  
  const attackers = chessAfter.attackers(move.to as Square, opponentColor);
  if (attackers.length > 0) {
    const isDefended = isSquareDefended(chessAfter, move.to);
    if (!isDefended) return true;
    
    // Even if defended, if attacker is less valuable than moved piece
    const movedPieceValue = PIECE_VALUES[move.piece];
    for (const attackerSq of attackers) {
      const attackerPiece = chessAfter.get(attackerSq as Square);
      if (attackerPiece && PIECE_VALUES[attackerPiece.type] < movedPieceValue) {
        return true;
      }
    }
  }
  
  return false;
}

function detectFork(chess: Chess, square: string): string[] {
  const attackedSquares: string[] = [];
  const piece = chess.get(square as Square);
  if (!piece) return [];

  const moves = chess.moves({ square: square as Square, verbose: true });
  for (const m of moves) {
    if (m.captured) {
      // Check if the captured piece is valuable (not just a pawn if we are a heavy piece)
      const targetPiece = chess.get(m.to as Square);
      if (targetPiece && (PIECE_VALUES[targetPiece.type] >= PIECE_VALUES[piece.type] || targetPiece.type !== 'p')) {
        attackedSquares.push(m.to);
      }
    } else {
      // Also check for threats (not just immediate captures)
      // This is harder with chess.js moves() as it only returns legal moves
      // But we can check if it attacks the king (check)
    }
  }
  
  // Special check for king and queen forks
  const opponentKingSq = findKingSquare(chess, piece.color === 'w' ? 'b' : 'w');
  if (opponentKingSq && chess.attackers(opponentKingSq as Square, piece.color).includes(square as Square)) {
    attackedSquares.push(opponentKingSq);
  }

  return attackedSquares;
}

function detectPinOrSkewer(chess: Chess): SymbolicAnalysis | null {
  const board = chess.board();
  const color = chess.turn() === 'w' ? 'b' : 'w'; // Side that just moved

  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece || piece.color !== color) continue;

      if (piece.type === 'r' || piece.type === 'b' || piece.type === 'q') {
        const square = `${String.fromCharCode(97 + f)}${8 - r}` as Square;
        const result = checkRayForPinOrSkewer(chess, square);
        if (result) return result;
      }
    }
  }
  return null;
}

function checkRayForPinOrSkewer(chess: Chess, square: Square): SymbolicAnalysis | null {
  const piece = chess.get(square);
  const color = piece.color;
  const opponentColor = color === 'w' ? 'b' : 'w';
  
  const directions: [number, number][] = [];
  if (piece.type === 'r' || piece.type === 'q') {
    directions.push([0, 1], [0, -1], [1, 0], [-1, 0]);
  }
  if (piece.type === 'b' || piece.type === 'q') {
    directions.push([1, 1], [1, -1], [-1, 1], [-1, -1]);
  }

  const squareToIndices = (sq: string) => [8 - parseInt(sq[1]), sq.charCodeAt(0) - 97];
  const [startR, startF] = squareToIndices(square);

  for (const [dr, df] of directions) {
    let r = startR + dr;
    let f = startF + df;
    const path: { sq: string; piece: { type: PieceSymbol; color: Color } }[] = [];

    while (r >= 0 && r < 8 && f >= 0 && f < 8) {
      const sq = `${String.fromCharCode(97 + f)}${8 - r}`;
      const p = chess.get(sq as Square);
      if (p) {
        path.push({ sq, piece: p });
      }
      if (path.length >= 2) break;
      r += dr;
      f += df;
    }

    if (path.length >= 2) {
      const [first, second] = path;
      if (first.piece.color === opponentColor && second.piece.color === opponentColor) {
        const val1 = PIECE_VALUES[first.piece.type];
        const val2 = PIECE_VALUES[second.piece.type];

        if (val1 < val2 || second.piece.type === 'k') {
          return {
            tag: 'Pin',
            saliencySquares: [square, first.sq, second.sq],
            description: `The ${first.piece.type} is pinned to the ${second.piece.type}.`,
            involvedPieces: []
          };
        } else if (val1 > val2) {
          return {
            tag: 'Skewer',
            saliencySquares: [square, first.sq, second.sq],
            description: `The ${first.piece.type} is skewered, exposing the ${second.piece.type}.`,
            involvedPieces: []
          };
        }
      }
    }
  }
  return null;
}

function detectDiscoveredAttack(chessBefore: Chess, move: Move): boolean {
  // Discovered attack happens when moving a piece reveals an attack from another piece.
  // We check if any new squares are attacked that weren't attacked before, 
  // excluding squares attacked by the moved piece itself.
  
  const chessAfter = new Chess(chessBefore.fen());
  chessAfter.move(move.san);

  const myColor = move.color;
  const opponentKingSq = findKingSquare(chessAfter, myColor === 'w' ? 'b' : 'w');
  
  if (!opponentKingSq) return false;

  // Check if opponent king is now attacked by someone OTHER than the moved piece
  const attackers = chessAfter.attackers(opponentKingSq as Square, myColor);
  const filteredAttackers = attackers.filter(sq => sq !== move.to);
  
  if (filteredAttackers.length > 0) {
    // Was this attacker already attacking the king square before?
    const previousAttackers = chessBefore.attackers(opponentKingSq as Square, myColor);
    if (!previousAttackers.includes(filteredAttackers[0])) {
      return true;
    }
  }

  return false;
}

function isDoubleCheck(chess: Chess): boolean {
  const kingSq = findKingSquare(chess, chess.turn());
  if (!kingSq) return false;
  const attackers = chess.attackers(kingSq as Square, chess.turn() === 'w' ? 'b' : 'w');
  return attackers.length >= 2;
}

function detectBackRankWeakness(chess: Chess): boolean {
  // Simplified back rank check: 
  // King on back rank, blocked by own pawns, and an enemy rook/queen attacking the rank
  const turn = chess.turn();
  const backRank = turn === 'w' ? '1' : '8';
  const pawnRank = turn === 'w' ? '2' : '7';
  
  const kingSq = findKingSquare(chess, turn);
  if (!kingSq || kingSq[1] !== backRank) return false;

  // Check if blocked by pawns
  const file = kingSq.charCodeAt(0) - 97;
  const blockingFiles = [file - 1, file, file + 1].filter(f => f >= 0 && f < 8);
  let blocked = true;
  for (const f of blockingFiles) {
    const sq = `${String.fromCharCode(97 + f)}${pawnRank}`;
    const p = chess.get(sq as Square);
    if (!p || p.type !== 'p' || p.color !== turn) {
      blocked = false;
      break;
    }
  }

  if (blocked) {
    // Check if an enemy heavy piece is attacking the back rank
    const opponentColor = turn === 'w' ? 'b' : 'w';
    const attackers = chess.attackers(kingSq as Square, opponentColor);
    for (const attackerSq of attackers) {
      const attacker = chess.get(attackerSq as Square);
      if (attacker.type === 'r' || attacker.type === 'q') return true;
    }
  }

  return false;
}

