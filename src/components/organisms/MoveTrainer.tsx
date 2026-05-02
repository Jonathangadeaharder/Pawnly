/**
 * MoveTrainer Component
 * SRS-based drill for learning opening move sequences (Procedural Memory)
 * Part of the Bifurcated SRS System
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Chess } from 'chess.js';

import Chessboard from './Chessboard';
import { useUserStore } from '../../state/userStore';
import { useUIStore } from '../../state/uiStore';
import { useGameStore } from '../../state/gameStore';
import { scheduleNextReview } from '../../services/srs/fsrs';
import { playSound } from '../../services/audio/soundService';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import type { SRSItem, OpeningLine, Square, ReviewResult } from '../../types';

interface MoveTrainerProps {
  srsItem: SRSItem;
  onComplete: (result: ReviewResult) => void;
  onSkip?: () => void;
}

export default function MoveTrainer({ srsItem, onComplete, onSkip }: MoveTrainerProps) {
  const { hapticsEnabled } = useUIStore();
  const { loadPosition, resetGame } = useGameStore();

  const openingLine = srsItem.content as OpeningLine;

  // Track progress through the line
  const [moveIndex, setMoveIndex] = useState(0);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [startTime] = useState(Date.now());
  const [showFeedback, setShowFeedback] = useState(false);

  // Animation
  const [feedbackAnim] = useState(new Animated.Value(0));

  // Load the position for the current move
  useEffect(() => {
    const chess = new Chess();

    // Play all moves up to current index
    for (let i = 0; i < moveIndex; i++) {
      try {
        chess.move(openingLine.moves[i]);
      } catch (error) {
        console.error('Error playing move:', error);
      }
    }

    loadPosition(chess.fen());
  }, [moveIndex, openingLine, loadPosition]);

  // Handle move attempt
  const handleMoveAttempt = useCallback(
    (from: Square, to: Square) => {
      const expectedMove = openingLine.moves[moveIndex];
      const chess = new Chess();

      // Replay line up to current position
      for (let i = 0; i < moveIndex; i++) {
        chess.move(openingLine.moves[i]);
      }

      // Try the user's move
      try {
        const userMove = chess.move({ from, to });

        if (userMove.san === expectedMove) {
          // Correct move!
          handleCorrectMove();
        } else {
          // Wrong move
          handleIncorrectMove();
        }
      } catch (error) {
        // Invalid move
        handleIncorrectMove();
      }
    },
    [moveIndex, openingLine]
  );

  const handleCorrectMove = () => {
    setIsCorrect(true);
    setAttempts(attempts + 1);
    playSound('success');

    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }

    // Check if this was the last move
    if (moveIndex === openingLine.moves.length - 1) {
      // Line complete!
      showCompletionFeedback();
    } else {
      // Move to next move in sequence
      setTimeout(() => {
        setMoveIndex(moveIndex + 1);
        setIsCorrect(null);
      }, 800);
    }
  };

  const handleIncorrectMove = () => {
    setIsCorrect(false);
    setAttempts(attempts + 1);
    playSound('error');

    if (hapticsEnabled) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    // Show feedback briefly
    setShowFeedback(true);
    Animated.sequence([
      Animated.timing(feedbackAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(feedbackAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowFeedback(false);
      setIsCorrect(null);
    });
  };

  const showCompletionFeedback = () => {
    setShowFeedback(true);

    // Calculate rating based on attempts
    // 1 = Again (>3 mistakes)
    // 2 = Hard (2-3 mistakes)
    // 3 = Good (1 mistake)
    // 4 = Easy (no mistakes)
    let rating: 1 | 2 | 3 | 4;
    const mistakes = attempts - openingLine.moves.length;

    if (mistakes === 0) {
      rating = 4; // Easy
    } else if (mistakes === 1) {
      rating = 3; // Good
    } else if (mistakes <= 3) {
      rating = 2; // Hard
    } else {
      rating = 1; // Again
    }

    const timeSpent = Date.now() - startTime;

    // Complete after a delay
    setTimeout(() => {
      onComplete({ rating, timeSpent });
    }, 2000);
  };

  const handleGiveUp = () => {
    // Mark as "Again" (forgotten)
    const timeSpent = Date.now() - startTime;
    onComplete({ rating: 1, timeSpent });
  };

  const handleShowHint = () => {
    // Show the expected move briefly
    const expectedMove = openingLine.moves[moveIndex];
    // TODO: Highlight the correct move on the board
    playSound('notification');
  };

  // Reset when complete
  const isComplete = moveIndex === openingLine.moves.length - 1 && isCorrect === true;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{openingLine.name}</Text>
          <Text style={styles.subtitle}>
            Move {moveIndex + 1} of {openingLine.moves.length}
          </Text>
        </View>
        {onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${((moveIndex + 1) / openingLine.moves.length) * 100}%`,
            },
          ]}
        />
      </View>

      {/* Chessboard */}
      <View style={styles.boardContainer}>
        <Chessboard
          interactionMode="tap-tap"
          showCoordinates={true}
          onMove={handleMoveAttempt}
        />
      </View>

      {/* Feedback */}
      {showFeedback && (
        <Animated.View
          style={[
            styles.feedbackContainer,
            {
              opacity: feedbackAnim,
              transform: [
                {
                  translateY: feedbackAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          {isComplete ? (
            <View style={[styles.feedbackBox, styles.completeBox]}>
              <Ionicons name="trophy" size={32} color={Colors.milestone} />
              <Text style={styles.feedbackTitle}>Line Complete!</Text>
              <Text style={styles.feedbackText}>
                Great work! This line will be reviewed again later.
              </Text>
            </View>
          ) : isCorrect === false ? (
            <View style={[styles.feedbackBox, styles.errorBox]}>
              <Ionicons name="close-circle" size={32} color={Colors.error} />
              <Text style={styles.feedbackTitle}>Not quite!</Text>
              <Text style={styles.feedbackText}>
                Expected: {openingLine.moves[moveIndex]}
              </Text>
            </View>
          ) : null}
        </Animated.View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.hintButton]}
          onPress={handleShowHint}
        >
          <Ionicons name="bulb-outline" size={20} color={Colors.info} />
          <Text style={styles.hintButtonText}>Hint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.giveUpButton]}
          onPress={handleGiveUp}
        >
          <Ionicons name="flag-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.giveUpButtonText}>Give Up</Text>
        </TouchableOpacity>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        <Text style={styles.instructionText}>
          Play the correct next move for this opening line
        </Text>
      </View>
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
  skipButton: {
    padding: Spacing.sm,
  },
  progressContainer: {
    height: 4,
    backgroundColor: Colors.backgroundTertiary,
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  feedbackContainer: {
    position: 'absolute',
    top: '40%',
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 100,
  },
  feedbackBox: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    ...StyleSheet.flatten({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    }),
  },
  completeBox: {
    borderWidth: 2,
    borderColor: Colors.success,
  },
  errorBox: {
    borderWidth: 2,
    borderColor: Colors.error,
  },
  feedbackTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  feedbackText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  hintButton: {
    backgroundColor: Colors.info + '20',
  },
  hintButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.info,
  },
  giveUpButton: {
    backgroundColor: Colors.backgroundSecondary,
  },
  giveUpButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
  },
  instructions: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  instructionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
