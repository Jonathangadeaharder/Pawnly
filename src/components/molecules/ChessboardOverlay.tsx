/**
 * Chessboard Overlay Component (Molecule)
 * SVG layer for drawing arrows and highlighting squares on the chessboard
 * Used for analysis, teaching, and move suggestions
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Rect, Defs, Marker } from 'react-native-svg';
import type { Square, Arrow, Highlight } from '../../types';

// Re-export types for convenience
export type { Arrow, Highlight };

interface ChessboardOverlayProps {
  size: number;
  isFlipped?: boolean;
  arrows?: Arrow[];
  highlights?: Highlight[];
}

// Get coordinates from square notation
const getCoordsFromSquare = (square: Square, squareSize: number, isFlipped: boolean) => {
  const file = square.charCodeAt(0) - 97; // a=0, h=7
  const rank = parseInt(square[1]) - 1; // 1=0, 8=7

  if (isFlipped) {
    return {
      x: (7 - file) * squareSize + squareSize / 2,
      y: (8 - rank - 1) * squareSize + squareSize / 2,
    };
  } else {
    return {
      x: file * squareSize + squareSize / 2,
      y: (7 - rank) * squareSize + squareSize / 2,
    };
  }
};

// Get square boundaries for highlighting
const getSquareBounds = (square: Square, squareSize: number, isFlipped: boolean) => {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1]) - 1;

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

// Calculate arrow path with proper arrowhead
const createArrowPath = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  squareSize: number
): string => {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Shorten the arrow to account for arrowhead
  const arrowheadLength = squareSize * 0.25;
  const shortenedDistance = distance - arrowheadLength;

  const endX = fromX + Math.cos(angle) * shortenedDistance;
  const endY = fromY + Math.sin(angle) * shortenedDistance;

  return `M ${fromX} ${fromY} L ${endX} ${endY}`;
};

export default function ChessboardOverlay({
  size,
  isFlipped = false,
  arrows = [],
  highlights = [],
}: ChessboardOverlayProps) {
  const squareSize = size / 8;

  return (
    <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
      <Svg width={size} height={size}>
        <Defs>
          {/* Define arrowhead markers for different colors */}
          <Marker
            id="arrowhead-green"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <Path d="M 0 0 L 10 5 L 0 10 z" fill="#15803d" />
          </Marker>
          <Marker
            id="arrowhead-blue"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <Path d="M 0 0 L 10 5 L 0 10 z" fill="#1e40af" />
          </Marker>
          <Marker
            id="arrowhead-red"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <Path d="M 0 0 L 10 5 L 0 10 z" fill="#b91c1c" />
          </Marker>
          <Marker
            id="arrowhead-yellow"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <Path d="M 0 0 L 10 5 L 0 10 z" fill="#ca8a04" />
          </Marker>
          <Marker
            id="arrowhead-orange"
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto"
          >
            <Path d="M 0 0 L 10 5 L 0 10 z" fill="#ea580c" />
          </Marker>
        </Defs>

        {/* Render highlighted squares */}
        {highlights.map((highlight, index) => {
          const { x, y } = getSquareBounds(highlight.square, squareSize, isFlipped);
          const color = highlight.color || '#15803d'; // Default green
          const opacity = highlight.opacity ?? 0.4;

          return (
            <Rect
              key={`highlight-${index}-${highlight.square}`}
              x={x}
              y={y}
              width={squareSize}
              height={squareSize}
              fill={color}
              opacity={opacity}
            />
          );
        })}

        {/* Render arrows */}
        {arrows.map((arrow, index) => {
          const from = getCoordsFromSquare(arrow.from, squareSize, isFlipped);
          const to = getCoordsFromSquare(arrow.to, squareSize, isFlipped);
          const color = arrow.color || '#15803d'; // Default green
          const opacity = arrow.opacity ?? 0.8;

          // Determine marker ID based on color
          let markerId = 'arrowhead-green';
          if (color.includes('1e40af') || color.toLowerCase().includes('blue')) {
            markerId = 'arrowhead-blue';
          } else if (color.includes('b91c1c') || color.toLowerCase().includes('red')) {
            markerId = 'arrowhead-red';
          } else if (color.includes('ca8a04') || color.toLowerCase().includes('yellow')) {
            markerId = 'arrowhead-yellow';
          } else if (color.includes('ea580c') || color.toLowerCase().includes('orange')) {
            markerId = 'arrowhead-orange';
          }

          const pathData = createArrowPath(from.x, from.y, to.x, to.y, squareSize);

          return (
            <Path
              key={`arrow-${index}-${arrow.from}-${arrow.to}`}
              d={pathData}
              stroke={color}
              strokeWidth={squareSize * 0.15}
              strokeLinecap="round"
              opacity={opacity}
              markerEnd={`url(#${markerId})`}
            />
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
