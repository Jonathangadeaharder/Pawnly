/**
 * ConceptTrainer Component
 * SRS-based drill for learning strategic concepts (Declarative Memory)
 * Part of the Bifurcated SRS System - complements MoveTrainer
 *
 * Uses Socratic flashcards to teach the "why" behind moves
 */

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Chessboard from './Chessboard';
import { useGameStore } from '../../state/gameStore';
import { useUIStore } from '../../state/uiStore';
import { scheduleNextReview } from '../../services/srs/fsrs';
import { playSound } from '../../services/audio/soundService';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import type { SRSItem, ConceptCard, ReviewResult } from '../../types';

interface ConceptTrainerProps {
  srsItem: SRSItem;
  onComplete: (result: ReviewResult) => void;
  onSkip?: () => void;
}

export default function ConceptTrainer({ srsItem, onComplete, onSkip }: ConceptTrainerProps) {
  const { hapticsEnabled } = useUIStore();
  const { loadPosition } = useGameStore();

  const conceptCard = srsItem.content as ConceptCard;

  const [isRevealed, setIsRevealed] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [startTime] = useState(Date.now());

  // Animation values
  const [flipAnim] = useState(new Animated.Value(0));
  const [revealAnim] = useState(new Animated.Value(0));

  // Load the position on mount
  React.useEffect(() => {
    loadPosition(conceptCard.position.fen);
  }, [conceptCard]);

  const handleShowHint = () => {
    if (currentHintIndex < conceptCard.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
      playSound('notification');

      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleRevealAnswer = () => {
    setIsRevealed(true);
    playSound('click');

    // Flip animation
    Animated.sequence([
      Animated.timing(flipAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(revealAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRating = (rating: 1 | 2 | 3 | 4) => {
    const timeSpent = Date.now() - startTime;

    // Play appropriate sound based on rating
    if (rating === 4) {
      playSound('success');
    } else if (rating === 1) {
      playSound('error');
    } else {
      playSound('click');
    }

    if (hapticsEnabled) {
      const intensity = rating === 4
        ? Haptics.NotificationFeedbackType.Success
        : rating === 1
        ? Haptics.NotificationFeedbackType.Warning
        : Haptics.NotificationFeedbackType.Success;

      Haptics.notificationAsync(intensity);
    }

    // Penalty for using hints
    const hintsUsed = currentHintIndex + 1;
    let adjustedRating = rating;

    // If user used multiple hints, downgrade the rating
    if (hintsUsed >= conceptCard.hints.length) {
      adjustedRating = Math.max(1, rating - 1) as 1 | 2 | 3 | 4;
    }

    onComplete({ rating: adjustedRating, timeSpent });
  };

  const flipInterpolate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.conceptBadge}>
            <Ionicons name="bulb" size={16} color={Colors.textInverse} />
            <Text style={styles.conceptBadgeText}>CONCEPT</Text>
          </View>
          <Text style={styles.concept}>{conceptCard.concept}</Text>
        </View>
        {onSkip && (
          <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Position */}
      <View style={styles.boardContainer}>
        <Chessboard
          showCoordinates={true}
          interactionMode="tap-tap"
        />
      </View>

      {/* Card - Question/Answer */}
      <Animated.View
        style={[
          styles.cardContainer,
          {
            transform: [{ rotateY: flipInterpolate }],
          },
        ]}
      >
        {!isRevealed ? (
          // Question side
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Ionicons name="help-circle" size={24} color={Colors.info} />
              <Text style={styles.cardTitle}>Strategic Question</Text>
            </View>

            <Text style={styles.question}>{conceptCard.question}</Text>

            {/* Hints */}
            {currentHintIndex >= 0 && (
              <View style={styles.hintsContainer}>
                {conceptCard.hints.slice(0, currentHintIndex + 1).map((hint, index) => (
                  <View key={index} style={styles.hintBox}>
                    <Ionicons name="bulb-outline" size={16} color={Colors.warning} />
                    <Text style={styles.hintText}>{hint}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* User answer input */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Your answer:</Text>
              <TextInput
                style={styles.input}
                value={userAnswer}
                onChangeText={setUserAnswer}
                placeholder="Type your answer here..."
                placeholderTextColor={Colors.textLight}
                multiline
                numberOfLines={3}
              />
            </View>

            {/* Actions */}
            <View style={styles.actions}>
              {currentHintIndex < conceptCard.hints.length - 1 && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.hintButton]}
                  onPress={handleShowHint}
                >
                  <Ionicons name="bulb-outline" size={20} color={Colors.warning} />
                  <Text style={styles.hintButtonText}>
                    Show Hint ({currentHintIndex + 1}/{conceptCard.hints.length})
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, styles.revealButton]}
                onPress={handleRevealAnswer}
              >
                <Ionicons name="eye" size={20} color={Colors.textInverse} />
                <Text style={styles.revealButtonText}>Reveal Answer</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // Answer side
          <Animated.View
            style={[
              styles.card,
              {
                opacity: revealAnim,
                transform: [{ rotateY: '180deg' }],
              },
            ]}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              <Text style={styles.cardTitle}>Correct Answer</Text>
            </View>

            <Text style={styles.answer}>{conceptCard.correctAnswer}</Text>

            {/* Explanation */}
            <View style={styles.explanationBox}>
              <Text style={styles.explanationTitle}>Why?</Text>
              <Text style={styles.explanationText}>{conceptCard.explanation}</Text>
            </View>

            {/* Self-rating */}
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingTitle}>How well did you know this?</Text>

              <View style={styles.ratingButtons}>
                <TouchableOpacity
                  style={[styles.ratingButton, styles.againButton]}
                  onPress={() => handleRating(1)}
                >
                  <Text style={styles.ratingButtonText}>Again</Text>
                  <Text style={styles.ratingSubtext}>{'<1d'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.ratingButton, styles.hardButton]}
                  onPress={() => handleRating(2)}
                >
                  <Text style={styles.ratingButtonText}>Hard</Text>
                  <Text style={styles.ratingSubtext}>{'<3d'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.ratingButton, styles.goodButton]}
                  onPress={() => handleRating(3)}
                >
                  <Text style={styles.ratingButtonText}>Good</Text>
                  <Text style={styles.ratingSubtext}>{'~1w'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.ratingButton, styles.easyButton]}
                  onPress={() => handleRating(4)}
                >
                  <Text style={styles.ratingButtonText}>Easy</Text>
                  <Text style={styles.ratingSubtext}>{'~2w'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      </Animated.View>
    </KeyboardAvoidingView>
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
    alignItems: 'flex-start',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    flex: 1,
  },
  conceptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: Colors.info,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  conceptBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  concept: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  skipButton: {
    padding: Spacing.sm,
  },
  boardContainer: {
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  cardContainer: {
    flex: 1,
    margin: Spacing.md,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  question: {
    fontSize: Typography.fontSize.xl,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.xl,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  hintsContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.warning + '20',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    gap: Spacing.sm,
  },
  hintText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  inputContainer: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.warning,
  },
  revealButton: {
    backgroundColor: Colors.primary,
  },
  revealButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  answer: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success,
    marginBottom: Spacing.lg,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.xl,
  },
  explanationBox: {
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  explanationTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  explanationText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  ratingContainer: {
    marginTop: 'auto',
  },
  ratingTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  ratingButtons: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  ratingButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  againButton: {
    backgroundColor: Colors.error,
  },
  hardButton: {
    backgroundColor: Colors.warning,
  },
  goodButton: {
    backgroundColor: Colors.success,
  },
  easyButton: {
    backgroundColor: Colors.info,
  },
  ratingButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  ratingSubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textInverse,
    marginTop: Spacing.xs,
    opacity: 0.8,
  },
});
