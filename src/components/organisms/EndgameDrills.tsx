/**
 * Endgame Drills Mini-Game
 *
 * Teaches fundamental endgame techniques through practical puzzles.
 * Covers: basic checkmates, pawn endgames, rook endgames, and key principles.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useGameStore } from '../../state/gameStore';
import { useUserStore } from '../../state/userStore';
import type { Square } from '../../types';
import * as Haptics from 'expo-haptics';

interface EndgameDrill {
  id: string;
  name: string;
  description: string;
  category: 'basic-checkmate' | 'pawn-endgame' | 'rook-endgame' | 'piece-endgame';
  difficulty: 'easy' | 'medium' | 'hard';
  fen: string;
  solution: string[]; // Array of moves in SAN notation
  hint: string;
  principle: string; // The endgame principle being taught
  timeLimit: number; // Seconds
}

const ENDGAME_DRILLS: EndgameDrill[] = [
  // Basic Checkmates
  {
    id: 'eg-1',
    name: 'King and Queen vs King',
    description: 'Deliver checkmate with queen and king against lone king',
    category: 'basic-checkmate',
    difficulty: 'easy',
    fen: '8/8/8/4k3/8/8/4K3/4Q3 w - - 0 1',
    solution: ['Qe3', 'Kf5', 'Kd3', 'Kg5', 'Ke4', 'Kg4', 'Qg3#'],
    hint: 'Use your king to restrict the enemy king, then deliver mate on the edge',
    principle: 'Coordinate king and queen to drive enemy king to the edge',
    timeLimit: 60,
  },
  {
    id: 'eg-2',
    name: 'King and Rook vs King',
    description: 'Deliver checkmate with rook and king',
    category: 'basic-checkmate',
    difficulty: 'easy',
    fen: '8/8/8/4k3/8/8/4K3/4R3 w - - 0 1',
    solution: ['Re3+', 'Kd5', 'Kd2', 'Kd4', 'Re4+', 'Kd5', 'Kd3', 'Kc5', 'Rc4+', 'Kb5', 'Kd4', 'Kb6', 'Kd5', 'Kb7', 'Kd6', 'Kb6', 'Rc6+', 'Kb7', 'Kd7', 'Kb8', 'Rc8#'],
    hint: 'Cut off the king with your rook, then walk it to the edge',
    principle: 'Use the rook to cut the board in half, driving the king to the edge',
    timeLimit: 90,
  },
  {
    id: 'eg-3',
    name: 'Two Rooks Checkmate',
    description: 'Fastest checkmate with two rooks',
    category: 'basic-checkmate',
    difficulty: 'easy',
    fen: '8/8/8/4k3/8/8/R7/R3K3 w - - 0 1',
    solution: ['Ra5+', 'Kd6', 'Rb6+', 'Kd7', 'Ra7+', 'Kd8', 'Rb8#'],
    hint: 'Alternate rooks to push the king to the edge',
    principle: 'Ladder mate: alternate rooks to drive king to the edge',
    timeLimit: 45,
  },

  // Pawn Endgames
  {
    id: 'eg-4',
    name: 'The Square Rule',
    description: 'Can the king catch the passed pawn?',
    category: 'pawn-endgame',
    difficulty: 'medium',
    fen: '8/8/8/8/4p3/8/4K3/8 b - - 0 1',
    solution: ['e3', 'Kd3', 'e2', 'Kxe2'],
    hint: 'Draw a square from the pawn to the promotion square',
    principle: 'If the king can enter the square, it catches the pawn',
    timeLimit: 30,
  },
  {
    id: 'eg-5',
    name: 'Opposition',
    description: 'Use opposition to win the pawn endgame',
    category: 'pawn-endgame',
    difficulty: 'medium',
    fen: '8/4k3/4p3/4K3/8/8/8/8 w - - 0 1',
    solution: ['Kf5', 'Kd6', 'Kf6', 'Kd5', 'Kf7', 'Kd6', 'Kf6'],
    hint: 'Take the opposition to push Black\'s king back',
    principle: 'Opposition: face your king opposite the enemy king with one square between',
    timeLimit: 60,
  },
  {
    id: 'eg-6',
    name: 'Triangulation',
    description: 'Use triangulation to gain the opposition',
    category: 'pawn-endgame',
    difficulty: 'hard',
    fen: '8/8/8/3k4/3P4/3K4/8/8 w - - 0 1',
    solution: ['Kc3', 'Kc6', 'Kc4', 'Kd6', 'Kd4'],
    hint: 'Move your king in a triangle to waste a tempo',
    principle: 'Triangulation: maneuver to put opponent in zugzwang',
    timeLimit: 90,
  },

  // Rook Endgames
  {
    id: 'eg-7',
    name: 'Lucena Position',
    description: 'Win with rook and pawn vs rook',
    category: 'rook-endgame',
    difficulty: 'hard',
    fen: '5K2/3R4/5P2/8/8/8/5r2/6k1 w - - 0 1',
    solution: ['Rd4', 'Rf1+', 'Kg7', 'Rg1+', 'Kf7'],
    hint: 'Build a bridge with your rook to shield checks',
    principle: 'Lucena: use rook to shield checks and promote',
    timeLimit: 120,
  },
  {
    id: 'eg-8',
    name: 'Philidor Position',
    description: 'Draw with rook vs rook and pawn',
    category: 'rook-endgame',
    difficulty: 'hard',
    fen: '8/8/8/5k2/5p2/5K2/8/2R3r1 b - - 0 1',
    solution: ['Rg6', 'Rc8', 'Ra6'],
    hint: 'Keep your rook on the third rank to give checks from the side',
    principle: 'Philidor: rook on third rank, check from behind when pawn advances',
    timeLimit: 120,
  },

  // Piece Endgames
  {
    id: 'eg-9',
    name: 'Bishop and Knight Mate',
    description: 'Checkmate with bishop and knight',
    category: 'piece-endgame',
    difficulty: 'hard',
    fen: '8/8/8/4k3/8/3N4/4B3/4K3 w - - 0 1',
    solution: ['Bc4', 'Kd6', 'Kd2', 'Kc5', 'Ke3', 'Kb4', 'Kd4', 'Kb3', 'Nb2', 'Ka2', 'Kc3', 'Ka1', 'Kb3', 'Kb1', 'Bd3+', 'Ka1', 'Nc4', 'Kb1', 'Na3+', 'Ka1', 'Bc2', 'Ka2', 'Nc4', 'Ka1', 'Nb2#'],
    hint: 'Drive the king to a corner that matches your bishop color',
    principle: 'Force king to corner matching bishop\'s color for checkmate',
    timeLimit: 180,
  },
  {
    id: 'eg-10',
    name: 'Queen vs Rook',
    description: 'Win with queen against rook',
    category: 'piece-endgame',
    difficulty: 'medium',
    fen: '8/8/8/4k3/8/8/4K3/Q3r3 w - - 0 1',
    solution: ['Qa5+', 'Kd6', 'Qd8+', 'Kc6', 'Qxe1'],
    hint: 'Use checks to win the rook or force a favorable exchange',
    principle: 'Queen dominates rook through superior mobility and checks',
    timeLimit: 60,
  },
];

export default function EndgameDrills({ onComplete }: { onComplete?: () => void }) {
  const { loadPosition } = useGameStore();
  const { addXP } = useUserStore();

  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);
  const [chess] = useState(() => new Chess());
  const [movesMade, setMovesMade] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(60);
  const [drillStarted, setDrillStarted] = useState(false);
  const [drillCompleted, setDrillCompleted] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [drillsCompleted, setDrillsCompleted] = useState(0);

  const currentDrill = ENDGAME_DRILLS[currentDrillIndex];

  useEffect(() => {
    if (currentDrill) {
      chess.load(currentDrill.fen);
      loadPosition(currentDrill.fen);
      setMovesMade([]);
      setDrillCompleted(false);
      setShowHint(false);
      setTimeRemaining(currentDrill.timeLimit);
      setDrillStarted(false);
    }
  }, [currentDrillIndex]);

  // Timer
  useEffect(() => {
    if (!drillStarted || drillCompleted) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          handleDrillFailed();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [drillStarted, drillCompleted]);

  const handleMove = (from: Square, to: Square) => {
    if (!drillStarted) {
      setDrillStarted(true);
    }

    if (drillCompleted) return;

    try {
      const move = chess.move({ from, to });
      if (!move) return;

      const newMoves = [...movesMade, move.san];
      setMovesMade(newMoves);
      loadPosition(chess.fen());

      // Check if move matches solution
      const expectedMoveIndex = newMoves.length - 1;
      if (newMoves[expectedMoveIndex] !== currentDrill.solution[expectedMoveIndex]) {
        handleDrillFailed();
        return;
      }

      // Check if drill is completed
      if (newMoves.length === currentDrill.solution.length) {
        handleDrillCompleted();
      }

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      console.error('Invalid move:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleDrillCompleted = () => {
    setDrillCompleted(true);
    setDrillsCompleted(prev => prev + 1);

    // Calculate points based on time remaining and difficulty
    const difficultyMultiplier = {
      easy: 1,
      medium: 1.5,
      hard: 2,
    }[currentDrill.difficulty];

    const timeBonus = Math.floor((timeRemaining / currentDrill.timeLimit) * 50);
    const points = Math.floor((100 + timeBonus) * difficultyMultiplier);
    setScore(prev => prev + points);

    addXP(points);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    Alert.alert(
      'Drill Complete!',
      `${currentDrill.name} solved!\n+${points} XP\n\nPrinciple: ${currentDrill.principle}`,
      [
        {
          text: 'Next Drill',
          onPress: handleNextDrill,
        },
      ]
    );
  };

  const handleDrillFailed = () => {
    setDrillCompleted(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    Alert.alert(
      'Incorrect Solution',
      `Review the position and try again.\n\nPrinciple: ${currentDrill.principle}`,
      [
        {
          text: 'Retry',
          onPress: handleRetry,
        },
        {
          text: 'Next Drill',
          onPress: handleNextDrill,
        },
      ]
    );
  };

  const handleRetry = () => {
    chess.load(currentDrill.fen);
    loadPosition(currentDrill.fen);
    setMovesMade([]);
    setDrillCompleted(false);
    setDrillStarted(false);
    setTimeRemaining(currentDrill.timeLimit);
  };

  const handleNextDrill = () => {
    if (currentDrillIndex < ENDGAME_DRILLS.length - 1) {
      setCurrentDrillIndex(prev => prev + 1);
    } else {
      // All drills completed
      onComplete?.();
      Alert.alert(
        'All Drills Complete!',
        `Total Score: ${score}\nDrills Completed: ${drillsCompleted}/${ENDGAME_DRILLS.length}`,
        [
          {
            text: 'Restart',
            onPress: () => setCurrentDrillIndex(0),
          },
          {
            text: 'Exit',
            onPress: onComplete,
          },
        ]
      );
    }
  };

  const getCategoryIcon = (category: EndgameDrill['category']) => {
    switch (category) {
      case 'basic-checkmate': return '♔';
      case 'pawn-endgame': return '♟';
      case 'rook-endgame': return '♜';
      case 'piece-endgame': return '♞';
    }
  };

  const getDifficultyColor = (difficulty: EndgameDrill['difficulty']) => {
    switch (difficulty) {
      case 'easy': return Colors.success;
      case 'medium': return Colors.warning;
      case 'hard': return Colors.error;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Endgame Drills</Text>
        <Text style={styles.progress}>
          {currentDrillIndex + 1} / {ENDGAME_DRILLS.length}
        </Text>
      </View>

      {/* Score */}
      <View style={styles.scoreCard}>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreValue}>{score}</Text>
          <Text style={styles.scoreLabel}>Total Score</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={styles.scoreValue}>{drillsCompleted}</Text>
          <Text style={styles.scoreLabel}>Completed</Text>
        </View>
        <View style={styles.scoreItem}>
          <Text style={[styles.scoreValue, { color: timeRemaining < 10 ? Colors.error : Colors.primary }]}>
            {timeRemaining}s
          </Text>
          <Text style={styles.scoreLabel}>Time Left</Text>
        </View>
      </View>

      {/* Drill Info */}
      <View style={styles.drillCard}>
        <View style={styles.drillHeader}>
          <Text style={styles.drillCategory}>
            {getCategoryIcon(currentDrill.category)} {currentDrill.category.replace('-', ' ').toUpperCase()}
          </Text>
          <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(currentDrill.difficulty) + '20' }]}>
            <Text style={[styles.difficultyText, { color: getDifficultyColor(currentDrill.difficulty) }]}>
              {currentDrill.difficulty.toUpperCase()}
            </Text>
          </View>
        </View>

        <Text style={styles.drillName}>{currentDrill.name}</Text>
        <Text style={styles.drillDescription}>{currentDrill.description}</Text>

        {showHint && (
          <View style={styles.hintBox}>
            <Ionicons name="bulb" size={20} color={Colors.warning} />
            <Text style={styles.hintText}>{currentDrill.hint}</Text>
          </View>
        )}

        {!showHint && (
          <TouchableOpacity style={styles.hintButton} onPress={() => setShowHint(true)}>
            <Ionicons name="bulb-outline" size={20} color={Colors.primary} />
            <Text style={styles.hintButtonText}>Show Hint</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Chessboard */}
      <View style={styles.boardSection}>
        <Chessboard
          showCoordinates={true}
          onMove={handleMove}
          interactionMode="both"
        />
      </View>

      {/* Moves Made */}
      {movesMade.length > 0 && (
        <View style={styles.movesCard}>
          <Text style={styles.movesTitle}>Your Moves:</Text>
          <Text style={styles.movesText}>{movesMade.join(', ')}</Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryButton} onPress={handleRetry}>
          <Ionicons name="refresh" size={20} color={Colors.text} />
          <Text style={styles.secondaryButtonText}>Retry</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton} onPress={handleNextDrill}>
          <Text style={styles.primaryButtonText}>Skip</Text>
          <Ionicons name="chevron-forward" size={20} color={Colors.textInverse} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  progress: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
  },
  scoreCard: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    justifyContent: 'space-around',
  },
  scoreItem: {
    alignItems: 'center',
  },
  scoreValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  scoreLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  drillCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  drillHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  drillCategory: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  difficultyText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  drillName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  drillDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  hintBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '15',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  hintText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
  },
  hintButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  boardSection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  movesCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  movesTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  movesText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  secondaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
});
