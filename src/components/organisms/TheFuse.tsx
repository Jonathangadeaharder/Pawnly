/**
 * The Fuse Mini-Game
 * Timed pattern recognition drill for attacking patterns
 *
 * Concept: Find the winning attacking move before the "fuse" burns out
 * Time limit: 15 seconds per puzzle
 * Trains: Rapid, intuitive pattern recognition for tactical motifs
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Chessboard from './Chessboard';
import DigitalCoachDialog from './DigitalCoachDialog';
import { useGameStore } from '../../state/gameStore';
import { playSound } from '../../services/audio/soundService';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { getFusePuzzles, getPatternDisplayName, type TacticalPuzzle } from '../../constants/tacticalPatterns';
import type { CoachPrompt, Square } from '../../types';

interface TheFuseProps {
  onComplete: (puzzlesSolved: number, averageTime: number) => void;
  onExit: () => void;
}

export default function TheFuse({ onComplete, onExit }: TheFuseProps) {
  const { loadPosition, makeMove, resetGame } = useGameStore();

  // Get 5 random puzzles from the library (mix of easy and medium)
  const [puzzles] = useState<TacticalPuzzle[]>(() => getFusePuzzles(5));
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [coachPrompt, setCoachPrompt] = useState<CoachPrompt | null>(null);
  const [solvedPuzzles, setSolvedPuzzles] = useState(0);
  const [totalTime, setTotalTime] = useState(0);

  const [fuseAnim] = useState(new Animated.Value(1));
  const [explosionAnim] = useState(new Animated.Value(0));

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentPuzzle = puzzles[currentPuzzleIndex];

  // Load puzzle and show intro
  useEffect(() => {
    if (currentPuzzle) {
      loadPosition(currentPuzzle.fen);
      setTimeRemaining(currentPuzzle.timeLimit);
      setSolved(false);
      setFailed(false);
      fuseAnim.setValue(1);
      explosionAnim.setValue(0);

      // Show pattern intro
      const introPrompt: CoachPrompt = {
        id: 'fuse-intro',
        type: 'socratic-question',
        text: `Find the winning move! Pattern: ${getPatternDisplayName(currentPuzzle.pattern)}. The fuse is lit - you have ${currentPuzzle.timeLimit} seconds!`,
      };

      setCoachPrompt(introPrompt);
      setShowCoach(true);

      // Start timer after coach dismissal
      setTimeout(() => {
        setShowCoach(false);
        startTimer();
      }, 2000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentPuzzleIndex]);

  const startTimer = () => {
    setIsActive(true);
    startTimeRef.current = Date.now();

    // Animate fuse burning
    Animated.timing(fuseAnim, {
      toValue: 0,
      duration: currentPuzzle.timeLimit * 1000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
  };

  const handleMoveAttempt = (from: Square, to: Square) => {
    if (!isActive || solved || failed) return;

    // Get the move in SAN format (simplified check)
    const attemptedMove = `${from}${to}`;

    // Check if solution matches (simplified - in production, parse SAN properly)
    if (currentPuzzle.solution.toLowerCase().includes(to.toLowerCase())) {
      handleSuccess();
    } else {
      handleWrongMove();
    }
  };

  const handleSuccess = () => {
    stopTimer();
    setSolved(true);

    const timeUsed = currentPuzzle.timeLimit - timeRemaining;
    setTotalTime(totalTime + timeUsed);
    setSolvedPuzzles(solvedPuzzles + 1);

    playSound('success');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const successPrompt: CoachPrompt = {
      id: 'fuse-success',
      type: 'encouragement',
      text: `Excellent! You found ${currentPuzzle.solution}! ${currentPuzzle.explanation}`,
    };

    setCoachPrompt(successPrompt);
    setShowCoach(true);

    setTimeout(() => {
      setShowCoach(false);
      handleNextPuzzle();
    }, 3000);
  };

  const handleWrongMove = () => {
    playSound('error');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const handleTimeout = () => {
    stopTimer();
    setFailed(true);

    playSound('error');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    // Explosion animation
    Animated.spring(explosionAnim, {
      toValue: 1,
      tension: 20,
      friction: 3,
      useNativeDriver: true,
    }).start();

    const failPrompt: CoachPrompt = {
      id: 'fuse-fail',
      type: 'hint',
      text: `Time's up! The answer was ${currentPuzzle.solution}. ${currentPuzzle.explanation}`,
    };

    setCoachPrompt(failPrompt);
    setShowCoach(true);

    setTimeout(() => {
      setShowCoach(false);
      handleNextPuzzle();
    }, 3000);
  };

  const handleShowHint = () => {
    stopTimer();
    const hintPrompt: CoachPrompt = {
      id: 'fuse-hint',
      type: 'hint',
      text: currentPuzzle.hint,
    };
    setCoachPrompt(hintPrompt);
    setShowCoach(true);
  };

  const handleNextPuzzle = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      // All puzzles complete
      const averageTime = solvedPuzzles > 0 ? totalTime / solvedPuzzles : 0;
      onComplete(solvedPuzzles, averageTime);
    }
  };

  const fuseColor = fuseAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [Colors.error, Colors.warning, Colors.success],
  });

  const fuseWidth = fuseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>The Fuse 🔥</Text>
          <Text style={styles.subtitle}>
            Puzzle {currentPuzzleIndex + 1} of {puzzles.length}
          </Text>
        </View>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Timer - The Fuse */}
      <View style={styles.timerContainer}>
        <View style={styles.fuseTrack}>
          <Animated.View
            style={[
              styles.fuseBar,
              {
                width: fuseWidth,
                backgroundColor: fuseColor,
              },
            ]}
          />
          {failed && (
            <Animated.View
              style={[
                styles.explosion,
                {
                  opacity: explosionAnim,
                  transform: [
                    {
                      scale: explosionAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 3],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.explosionEmoji}>💥</Text>
            </Animated.View>
          )}
        </View>
        <Text style={styles.timerText}>
          {Math.max(0, timeRemaining)}s
        </Text>
      </View>

      {/* Pattern Badge */}
      <View style={styles.patternBadge}>
        <Ionicons name="flash" size={16} color={Colors.textInverse} />
        <Text style={styles.patternText}>{getPatternDisplayName(currentPuzzle.pattern)}</Text>
      </View>

      {/* Chessboard */}
      <View style={styles.boardContainer}>
        <Chessboard
          showCoordinates={true}
          interactionMode="tap-tap"
          onMove={handleMoveAttempt}
        />
      </View>

      {/* Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <Text style={styles.statText}>{solvedPuzzles} Solved</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time" size={20} color={Colors.info} />
          <Text style={styles.statText}>
            Avg: {solvedPuzzles > 0 ? (totalTime / solvedPuzzles).toFixed(1) : '0'}s
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.hintButton]}
          onPress={handleShowHint}
          disabled={!isActive}
        >
          <Ionicons name="bulb-outline" size={20} color={Colors.warning} />
          <Text style={styles.hintButtonText}>Hint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.skipButton]}
          onPress={handleNextPuzzle}
        >
          <Ionicons name="play-forward" size={20} color={Colors.textSecondary} />
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Digital Coach */}
      {coachPrompt && (
        <DigitalCoachDialog
          visible={showCoach}
          prompt={coachPrompt}
          onDismiss={() => setShowCoach(false)}
          personality="tactical"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  exitButton: {
    padding: Spacing.sm,
  },
  timerContainer: {
    padding: Spacing.md,
    alignItems: 'center',
  },
  fuseTrack: {
    width: '100%',
    height: 24,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
    position: 'relative',
  },
  fuseBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  explosion: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  explosionEmoji: {
    fontSize: 20,
  },
  timerText: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  patternBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginBottom: Spacing.md,
  },
  patternText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  hintButton: {
    backgroundColor: Colors.warning + '20',
  },
  hintButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.warning,
  },
  skipButton: {
    backgroundColor: Colors.backgroundTertiary,
  },
  skipButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
});
