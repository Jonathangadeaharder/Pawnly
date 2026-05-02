/**
 * Tactical Drill Component
 * Flash-speed pattern recognition training based on ELO tiers
 *
 * Key Features:
 * - Strict time limits (3-8 seconds depending on ELO)
 * - Speed grading: Flash > Fast > Good > Slow > Too Slow
 * - Progressive unlocking (must master current tier before advancing)
 * - Tracks accuracy + speed metrics
 * - Level gating: 80% accuracy + 70% fast solves required
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Chessboard from './Chessboard';
import DigitalCoachDialog from './DigitalCoachDialog';
import { useGameStore } from '../../state/gameStore';
import { useUserStore } from '../../state/userStore';
import { playSound } from '../../services/audio/soundService';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import {
  getDrillsByELO,
  calculateSpeedRating,
  canAdvanceToNextTier,
  getNextELOTier,
  getMotifDisplayName,
  type TacticalDrill,
  type ELORating,
} from '../../constants/tacticalDrills';
import { getDueFailedPuzzles } from '../../services/tacticalAnalyticsService';
import type { CoachPrompt, Square, DrillStats } from '../../types';

interface TacticalDrillProps {
  initialELO?: ELORating;
  drillCount?: number;
  onComplete: (stats: DrillStats) => void;
  onExit: () => void;
}

export default function TacticalDrill({
  initialELO = 800,
  drillCount = 10,
  onComplete,
  onExit,
}: TacticalDrillProps) {
  const { loadPosition, makeMove, resetGame, game } = useGameStore();
  const { tacticalAnalytics, updateTacticalAnalytics } = useUserStore();

  // Current drill set - mix in failed puzzles if available
  const [currentELO, setCurrentELO] = useState<ELORating>(initialELO);
  const [drills] = useState<TacticalDrill[]>(() => {
    const dueFailedPuzzles = tacticalAnalytics ? getDueFailedPuzzles(tacticalAnalytics) : [];
    if (dueFailedPuzzles.length >= drillCount) {
      // Use only failed puzzles for review
      return dueFailedPuzzles.slice(0, drillCount).map(p => p.drill);
    } else if (dueFailedPuzzles.length > 0) {
      // Mix failed puzzles with new drills
      const newDrills = getDrillsByELO(currentELO).slice(0, drillCount - dueFailedPuzzles.length);
      return [...dueFailedPuzzles.map(p => p.drill), ...newDrills];
    } else {
      // Use only new drills
      return getDrillsByELO(currentELO).slice(0, drillCount);
    }
  });
  const [currentDrillIndex, setCurrentDrillIndex] = useState(0);

  // Track drill details for analytics
  const [drillDetails, setDrillDetails] = useState<Array<{
    drill: TacticalDrill;
    correct: boolean;
    speedRating: string;
    timeUsed: number;
  }>>([]);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(8);
  const [isActive, setIsActive] = useState(false);
  const [timeUsed, setTimeUsed] = useState(0);

  // Drill state
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [speedRating, setSpeedRating] = useState<string>('');

  // Stats tracking
  const [stats, setStats] = useState<DrillStats>({
    totalAttempts: 0,
    correct: 0,
    accuracy: 0,
    flashCount: 0,
    fastCount: 0,
    goodCount: 0,
    slowCount: 0,
    failedCount: 0,
    averageTime: 0,
    currentELO: currentELO,
    canAdvance: false,
  });

  // Coach dialog
  const [showCoach, setShowCoach] = useState(false);
  const [coachPrompt, setCoachPrompt] = useState<CoachPrompt | null>(null);

  // Animations
  const [urgencyAnim] = useState(new Animated.Value(0));
  const [timerBarAnim] = useState(new Animated.Value(1));
  const [pulseAnim] = useState(new Animated.Value(1));

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentDrill = drills[currentDrillIndex];

  // Load drill
  useEffect(() => {
    if (currentDrill) {
      loadPosition(currentDrill.fen);

      // Apply adaptive time multiplier if analytics available
      const adaptiveTimeLimit = tacticalAnalytics
        ? currentDrill.timeLimit * tacticalAnalytics.adaptiveSettings.timeMultiplier
        : currentDrill.timeLimit;

      setTimeRemaining(adaptiveTimeLimit);
      setSolved(false);
      setFailed(false);
      setSpeedRating('');
      urgencyAnim.setValue(0);
      timerBarAnim.setValue(1);
      pulseAnim.setValue(1);

      // Show drill intro
      const introPrompt: CoachPrompt = {
        id: 'drill-intro',
        type: 'socratic-question',
        text: `Find it FAST! Motif: ${getMotifDisplayName(currentDrill.motif)}. You have ${Math.round(adaptiveTimeLimit)} seconds!`,
      };

      setCoachPrompt(introPrompt);
      setShowCoach(true);

      // Auto-start timer after 1.5s
      setTimeout(() => {
        setShowCoach(false);
        startTimer();
      }, 1500);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentDrillIndex]);

  // Urgency animation when time < 30%
  useEffect(() => {
    const percentRemaining = (timeRemaining / currentDrill.timeLimit) * 100;

    if (percentRemaining <= 30 && isActive) {
      // Red pulsing urgency
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 300,
            useNativeDriver: true,
          }),
        ])
      ).start();

      urgencyAnim.setValue(1);
    } else {
      pulseAnim.setValue(1);
      urgencyAnim.setValue(0);
    }
  }, [timeRemaining, isActive]);

  const startTimer = () => {
    setIsActive(true);
    startTimeRef.current = Date.now();

    // Animate timer bar
    Animated.timing(timerBarAnim, {
      toValue: 0,
      duration: currentDrill.timeLimit * 1000,
      useNativeDriver: false,
    }).start();

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0.1) {
          handleTimeout();
          return 0;
        }
        return prev - 0.1;
      });
    }, 100);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsActive(false);
    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    setTimeUsed(elapsed);
    return elapsed;
  };

  const handleMoveAttempt = (from: Square, to: Square) => {
    if (!isActive || solved || failed) return;

    const move = game.move({ from, to, promotion: 'q' });

    if (!move) {
      // Invalid move
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playSound('error');
      return;
    }

    // Check if this matches the solution
    if (to.toLowerCase() === currentDrill.solutionSquare.toLowerCase()) {
      handleSuccess();
    } else {
      handleWrongMove();
      game.undo(); // Undo the wrong move
    }
  };

  const handleSuccess = () => {
    const elapsed = stopTimer();
    setSolved(true);

    // Calculate speed rating
    const rating = calculateSpeedRating(currentDrill.timeLimit, elapsed);
    setSpeedRating(rating);

    // Track drill details for analytics
    setDrillDetails(prev => [...prev, {
      drill: currentDrill,
      correct: true,
      speedRating: rating,
      timeUsed: elapsed,
    }]);

    // Update stats
    setStats((prev) => {
      const newStats = {
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        correct: prev.correct + 1,
        flashCount: prev.flashCount + (rating === 'flash' ? 1 : 0),
        fastCount: prev.fastCount + (rating === 'fast' ? 1 : 0),
        goodCount: prev.goodCount + (rating === 'good' ? 1 : 0),
        slowCount: prev.slowCount + (rating === 'slow' ? 1 : 0),
      };

      newStats.accuracy = (newStats.correct / newStats.totalAttempts) * 100;
      newStats.averageTime =
        ((prev.averageTime * prev.totalAttempts) + elapsed) / newStats.totalAttempts;
      newStats.canAdvance = canAdvanceToNextTier(
        newStats.accuracy,
        newStats.flashCount,
        newStats.fastCount,
        newStats.totalAttempts
      );

      return newStats;
    });

    // Play feedback
    if (rating === 'flash') {
      playSound('achievement-unlock');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else if (rating === 'fast') {
      playSound('success');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } else {
      playSound('move');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    // Show coach feedback
    const feedbackText = getSpeedFeedback(rating, elapsed);
    const successPrompt: CoachPrompt = {
      id: 'drill-success',
      type: 'encouragement',
      text: `${feedbackText} ${currentDrill.explanation}`,
    };

    setCoachPrompt(successPrompt);
    setShowCoach(true);

    setTimeout(() => {
      setShowCoach(false);
      handleNextDrill();
    }, 2500);
  };

  const handleWrongMove = () => {
    playSound('error');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const handleTimeout = () => {
    stopTimer();
    setFailed(true);
    setSpeedRating('too-slow');

    // Track drill details for analytics
    setDrillDetails(prev => [...prev, {
      drill: currentDrill,
      correct: false,
      speedRating: 'too-slow',
      timeUsed: currentDrill.timeLimit,
    }]);

    // Update stats
    setStats((prev) => {
      const newStats = {
        ...prev,
        totalAttempts: prev.totalAttempts + 1,
        failedCount: prev.failedCount + 1,
      };
      newStats.accuracy = (newStats.correct / newStats.totalAttempts) * 100;
      return newStats;
    });

    playSound('error');
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

    const failPrompt: CoachPrompt = {
      id: 'drill-fail',
      type: 'hint',
      text: `Too slow! The answer was ${currentDrill.solution}. ${currentDrill.explanation}`,
    };

    setCoachPrompt(failPrompt);
    setShowCoach(true);

    setTimeout(() => {
      setShowCoach(false);
      handleNextDrill();
    }, 2500);
  };

  const handleShowHint = () => {
    stopTimer();
    const hintPrompt: CoachPrompt = {
      id: 'drill-hint',
      type: 'hint',
      text: currentDrill.hint,
    };
    setCoachPrompt(hintPrompt);
    setShowCoach(true);

    // Mark as failed if hint used
    setStats((prev) => ({
      ...prev,
      totalAttempts: prev.totalAttempts + 1,
      failedCount: prev.failedCount + 1,
    }));
  };

  const handleNextDrill = async () => {
    if (currentDrillIndex < drills.length - 1) {
      setCurrentDrillIndex(currentDrillIndex + 1);
    } else {
      // All drills complete - update analytics
      if (tacticalAnalytics && drillDetails.length > 0) {
        await updateTacticalAnalytics(stats, drillDetails);
      }
      onComplete(stats);
    }
  };

  const getSpeedFeedback = (rating: string, time: number): string => {
    switch (rating) {
      case 'flash':
        return `⚡ FLASH! (${time.toFixed(1)}s) - You saw it instantly!`;
      case 'fast':
        return `🔥 Fast! (${time.toFixed(1)}s) - Great pattern recognition!`;
      case 'good':
        return `✅ Good (${time.toFixed(1)}s) - You found it.`;
      case 'slow':
        return `⏱️ Slow (${time.toFixed(1)}s) - Try to see it faster next time.`;
      default:
        return 'Keep practicing!';
    }
  };

  const getSpeedColor = (rating: string): string => {
    switch (rating) {
      case 'flash':
        return Colors.warning; // Gold/yellow
      case 'fast':
        return Colors.success;
      case 'good':
        return Colors.info;
      case 'slow':
        return Colors.textSecondary;
      default:
        return Colors.error;
    }
  };

  const timerBarColor = timerBarAnim.interpolate({
    inputRange: [0, 0.3, 0.6, 1],
    outputRange: [Colors.error, Colors.warning, Colors.info, Colors.success],
  });

  const timerBarWidth = timerBarAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Tactical Drill ⚡</Text>
          <Text style={styles.subtitle}>
            ELO {currentELO} • Drill {currentDrillIndex + 1}/{drills.length}
          </Text>
        </View>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Timer Bar */}
      <View style={styles.timerContainer}>
        <View style={styles.timerTrack}>
          <Animated.View
            style={[
              styles.timerBar,
              {
                width: timerBarWidth,
                backgroundColor: timerBarColor,
              },
            ]}
          />
        </View>
        <Animated.Text
          style={[
            styles.timerText,
            {
              color: urgencyAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [Colors.text, Colors.error],
              }),
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          {timeRemaining.toFixed(1)}s
        </Animated.Text>
      </View>

      {/* Speed Rating Badge (shown after solve) */}
      {speedRating && (
        <View style={[styles.speedBadge, { backgroundColor: getSpeedColor(speedRating) }]}>
          <Text style={styles.speedText}>{speedRating.toUpperCase()}</Text>
        </View>
      )}

      {/* Motif Badge */}
      <View style={styles.motifBadge}>
        <Ionicons name="flash" size={16} color={Colors.textInverse} />
        <Text style={styles.motifText}>{getMotifDisplayName(currentDrill.motif)}</Text>
        <Text style={styles.frequencyBadge}>
          {currentDrill.frequency === 'very-high' ? '★★★★' :
           currentDrill.frequency === 'high' ? '★★★' :
           currentDrill.frequency === 'medium' ? '★★' : '★'}
        </Text>
      </View>

      {/* Chessboard */}
      <View style={styles.boardContainer}>
        <Chessboard
          showCoordinates={true}
          interactionMode="both"
          onMove={handleMoveAttempt}
        />
      </View>

      {/* Live Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
          <Text style={styles.statText}>
            {stats.accuracy.toFixed(0)}% ({stats.correct}/{stats.totalAttempts})
          </Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="flash" size={18} color={Colors.warning} />
          <Text style={styles.statText}>{stats.flashCount} Flash</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="time" size={18} color={Colors.info} />
          <Text style={styles.statText}>{stats.averageTime.toFixed(1)}s avg</Text>
        </View>
      </View>

      {/* Progress to Next Tier */}
      {stats.totalAttempts > 0 && (
        <View style={styles.progressContainer}>
          <Text style={styles.progressTitle}>
            {stats.canAdvance ? '✅ Ready to Advance!' : 'Progress to Next Tier'}
          </Text>
          <View style={styles.progressBars}>
            <View style={styles.progressBarContainer}>
              <Text style={styles.progressLabel}>
                Accuracy: {stats.accuracy.toFixed(0)}% / 80%
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(stats.accuracy, 100)}%`,
                      backgroundColor: stats.accuracy >= 80 ? Colors.success : Colors.info,
                    },
                  ]}
                />
              </View>
            </View>
            <View style={styles.progressBarContainer}>
              <Text style={styles.progressLabel}>
                Speed: {(((stats.flashCount + stats.fastCount) / stats.totalAttempts) * 100).toFixed(0)}% / 70%
              </Text>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${Math.min(((stats.flashCount + stats.fastCount) / stats.totalAttempts) * 100, 100)}%`,
                      backgroundColor:
                        ((stats.flashCount + stats.fastCount) / stats.totalAttempts) * 100 >= 70
                          ? Colors.success
                          : Colors.warning,
                    },
                  ]}
                />
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.hintButton]}
          onPress={handleShowHint}
          disabled={!isActive}
        >
          <Ionicons name="bulb-outline" size={20} color={Colors.warning} />
          <Text style={styles.hintButtonText}>Hint (-1)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.skipButton]}
          onPress={handleNextDrill}
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
  timerTrack: {
    width: '100%',
    height: 20,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  timerBar: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  timerText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  speedBadge: {
    alignSelf: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
  },
  speedText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  motifBadge: {
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
  motifText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  frequencyBadge: {
    fontSize: Typography.fontSize.xs,
    color: Colors.warning,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  progressContainer: {
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  progressTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  progressBars: {
    gap: Spacing.sm,
  },
  progressBarContainer: {
    gap: Spacing.xs,
  },
  progressLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
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
