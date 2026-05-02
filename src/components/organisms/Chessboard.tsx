/**
 * Chessboard Component (Organism)
 * Interactive chessboard with drag-and-drop and tap-tap modes
 * Integrates with chess.js for move validation and legal move highlighting
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Text,
} from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { useGameStore } from '../../state/gameStore';
import { useUIStore } from '../../state/uiStore';
import { Colors, BoardThemes } from '../../constants/theme';
import { playSound } from '../../services/audio/soundService';
import ChessboardOverlay, { type Arrow, type Highlight } from '../molecules/ChessboardOverlay';
import type { Square } from '../../types';

// Re-export types for convenience
export type { Arrow, Highlight };

// Get square notation from coordinates
const getSquareFromCoords = (x: number, y: number, squareSize: number, isFlipped: boolean): Square => {
  const file = Math.floor(x / squareSize);
  const rank = Math.floor(y / squareSize);

  if (isFlipped) {
    const fileChar = String.fromCharCode(104 - file); // h-a
    const rankNum = rank + 1; // 1-8
    return `${fileChar}${rankNum}` as Square;
  } else {
    const fileChar = String.fromCharCode(97 + file); // a-h
    const rankNum = 8 - rank; // 8-1
    return `${fileChar}${rankNum}` as Square;
  }
};

// Get coordinates from square notation
const getCoordsFromSquare = (square: Square, squareSize: number, isFlipped: boolean) => {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = parseInt(square[1]) - 1; // 1=0, 8=7

  if (isFlipped) {
    return {
      x: (7 - file) * squareSize,
      y: (8 - rank - 1) * squareSize,
    };
  } else {
    return {
      x: file * squareSize,
      y: (7 - rank) * squareSize,
    };
  }
};

interface ChessboardProps {
  size?: number;
  isFlipped?: boolean;
  showCoordinates?: boolean;
  interactionMode?: 'drag-drop' | 'tap-tap' | 'both';
  onMove?: (from: Square, to: Square) => void;
  arrows?: Arrow[];
  highlights?: Highlight[];
}

export default function Chessboard({
  size,
  isFlipped = false,
  showCoordinates = true,
  interactionMode = 'both',
  onMove,
  arrows = [],
  highlights = [],
}: ChessboardProps) {
  const { position, selectedSquare, highlightedSquares, selectSquare, makeMove, getLegalMoves } =
    useGameStore();
  const { boardTheme, hapticsEnabled } = useUIStore();

  const screenWidth = Dimensions.get('window').width;
  const boardSize = size || Math.min(screenWidth - 32, 400);
  const squareSize = boardSize / 8;

  // Drag state
  const [draggedSquare, setDraggedSquare] = useState<Square | null>(null);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Parse the FEN string to get piece positions
  const piecePositions = useMemo(() => {
    const positions: { [key: string]: string } = {};
    const fenParts = position.fen.split(' ');
    const ranks = fenParts[0].split('/');

    ranks.forEach((rank, rankIndex) => {
      let fileIndex = 0;
      for (let char of rank) {
        if (isNaN(parseInt(char))) {
          // It's a piece
          const file = String.fromCharCode(97 + fileIndex);
          const rankNum = 8 - rankIndex;
          positions[`${file}${rankNum}`] = char;
          fileIndex++;
        } else {
          // It's a number (empty squares)
          fileIndex += parseInt(char);
        }
      }
    });

    return positions;
  }, [position.fen]);

  // Get piece symbol for display
  const getPieceSymbol = (piece: string): string => {
    const symbols: { [key: string]: string } = {
      K: '♔',
      Q: '♕',
      R: '♖',
      B: '♗',
      N: '♘',
      P: '♙',
      k: '♚',
      q: '♛',
      r: '♜',
      b: '♝',
      n: '♞',
      p: '♟',
    };
    return symbols[piece] || '';
  };

  // Handle tap on square (tap-tap mode)
  const handleSquareTap = useCallback(
    (square: Square) => {
      // Only allow tap-tap if not in drag-drop-only mode
      if (interactionMode === 'drag-drop') return;

      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      const piece = piecePositions[square];

      // If no square is selected and there's a piece, select it
      if (!selectedSquare && piece) {
        const legalMoves = getLegalMoves(square);
        if (legalMoves.length > 0) {
          selectSquare(square);
        }
      }
      // If a square is selected, try to move
      else if (selectedSquare) {
        const targetPiece = piecePositions[square];
        const isCapture = !!targetPiece;
        const moved = makeMove(selectedSquare, square);

        if (moved) {
          if (hapticsEnabled) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }
          // Play appropriate sound
          playSound(isCapture ? 'capture' : 'move');

          if (onMove) {
            onMove(selectedSquare, square);
          }
        } else {
          // If move failed and clicked on another piece, select it
          if (piece) {
            const legalMoves = getLegalMoves(square);
            if (legalMoves.length > 0) {
              selectSquare(square);
            } else {
              selectSquare(null);
            }
          } else {
            selectSquare(null);
          }
        }
      }
    },
    [selectedSquare, piecePositions, getLegalMoves, selectSquare, makeMove, hapticsEnabled, onMove, interactionMode]
  );

  // Handle drag gesture (drag-drop mode)
  const createDragGesture = (square: Square) => {
    const piece = piecePositions[square];
    if (!piece) return null;

    // Only allow drag-drop if not in tap-tap-only mode
    if (interactionMode === 'tap-tap') return null;

    const legalMoves = getLegalMoves(square);
    if (legalMoves.length === 0) return null;

    return Gesture.Pan()
      .onStart(() => {
        runOnJS(setDraggedSquare)(square);
        runOnJS(selectSquare)(square);

        if (hapticsEnabled) {
          runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        }

        scale.value = withSpring(1.2);
        opacity.value = withTiming(0.8);
      })
      .onUpdate((event) => {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      })
      .onEnd((event) => {
        const coords = getCoordsFromSquare(square, squareSize, isFlipped);
        const dropX = coords.x + event.translationX + squareSize / 2;
        const dropY = coords.y + event.translationY + squareSize / 2;

        // Ensure drop is within board bounds
        if (dropX >= 0 && dropX < boardSize && dropY >= 0 && dropY < boardSize) {
          const targetSquare = getSquareFromCoords(dropX, dropY, squareSize, isFlipped);

          const targetPiece = piecePositions[targetSquare];
          const isCapture = !!targetPiece;
          const moved = makeMove(square, targetSquare);

          if (moved) {
            if (hapticsEnabled) {
              runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Heavy);
            }
            runOnJS(playSound)(isCapture ? 'capture' : 'move');

            if (onMove) {
              runOnJS(onMove)(square, targetSquare);
            }
          } else {
            // Invalid move - spring back
            if (hapticsEnabled) {
              runOnJS(Haptics.notificationAsync)(Haptics.NotificationFeedbackType.Error);
            }
          }
        }

        // Reset animation
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
        scale.value = withSpring(1);
        opacity.value = withTiming(1);
        runOnJS(setDraggedSquare)(null);
      });
  };

  // Animated style for dragged piece
  const getDraggedPieceStyle = (square: Square) => {
    return useAnimatedStyle(() => {
      if (draggedSquare !== square) {
        return {};
      }

      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { scale: scale.value },
        ],
        opacity: opacity.value,
        zIndex: 1000,
      };
    });
  };

  // Get board theme colors
  const theme = BoardThemes[boardTheme];

  // Render square
  const renderSquare = (square: Square, rowIndex: number, colIndex: number) => {
    const isLightSquare = (rowIndex + colIndex) % 2 === 0;
    const isSelected = selectedSquare === square;
    const isHighlighted = highlightedSquares.includes(square);
    const piece = piecePositions[square];
    const isDragged = draggedSquare === square;

    const squareColor = isLightSquare ? theme.light : theme.dark;
    const highlightColor = isSelected ? Colors.primary + '80' : isHighlighted ? Colors.success + '40' : null;

    const dragGesture = createDragGesture(square);

    const squareContent = (
      <View
        style={[
          styles.square,
          {
            width: squareSize,
            height: squareSize,
            backgroundColor: highlightColor || squareColor,
          },
        ]}
      >
        {piece && !isDragged && (
          <Text
            style={[
              styles.piece,
              {
                fontSize: squareSize * 0.7,
              },
            ]}
          >
            {getPieceSymbol(piece)}
          </Text>
        )}

        {/* Show coordinates on edge squares */}
        {showCoordinates && colIndex === 0 && (
          <Text style={[styles.rankLabel, { fontSize: squareSize * 0.15 }]}>
            {isFlipped ? rowIndex + 1 : 8 - rowIndex}
          </Text>
        )}
        {showCoordinates && rowIndex === 7 && (
          <Text style={[styles.fileLabel, { fontSize: squareSize * 0.15 }]}>
            {isFlipped
              ? String.fromCharCode(104 - colIndex)
              : String.fromCharCode(97 + colIndex)}
          </Text>
        )}
      </View>
    );

    // Render draggable piece overlay if this square has the dragged piece
    const draggablePieceOverlay = piece && (
      <Animated.View
        style={[
          styles.draggablePiece,
          {
            width: squareSize,
            height: squareSize,
          },
          getDraggedPieceStyle(square),
        ]}
        pointerEvents={isDragged ? 'none' : 'auto'}
      >
        <Text
          style={[
            styles.piece,
            {
              fontSize: squareSize * 0.7,
            },
          ]}
        >
          {getPieceSymbol(piece)}
        </Text>
      </Animated.View>
    );

    if (dragGesture && piece) {
      return (
        <GestureDetector key={square} gesture={dragGesture}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => handleSquareTap(square)}
          >
            {squareContent}
            {draggablePieceOverlay}
          </TouchableOpacity>
        </GestureDetector>
      );
    } else {
      return (
        <TouchableOpacity
          key={square}
          activeOpacity={0.7}
          onPress={() => handleSquareTap(square)}
        >
          {squareContent}
        </TouchableOpacity>
      );
    }
  };

  // Render all squares
  const renderBoard = () => {
    const squares = [];
    for (let row = 0; row < 8; row++) {
      const rowSquares = [];
      for (let col = 0; col < 8; col++) {
        const file = isFlipped
          ? String.fromCharCode(104 - col)
          : String.fromCharCode(97 + col);
        const rank = isFlipped ? row + 1 : 8 - row;
        const square = `${file}${rank}` as Square;

        rowSquares.push(renderSquare(square, row, col));
      }
      squares.push(
        <View key={row} style={styles.row}>
          {rowSquares}
        </View>
      );
    }
    return squares;
  };

  return (
    <View style={[styles.container, { width: boardSize, height: boardSize }]}>
      {renderBoard()}
      {/* SVG Overlay for arrows and highlights */}
      {(arrows.length > 0 || highlights.length > 0) && (
        <ChessboardOverlay
          size={boardSize}
          isFlipped={isFlipped}
          arrows={arrows}
          highlights={highlights}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  row: {
    flexDirection: 'row',
  },
  square: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  piece: {
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  draggablePiece: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankLabel: {
    position: 'absolute',
    top: 2,
    left: 2,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
  fileLabel: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    color: Colors.textSecondary,
    fontWeight: 'bold',
  },
});
