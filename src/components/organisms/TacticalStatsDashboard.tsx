/**
 * Tactical Stats Dashboard
 * Comprehensive analytics display for tactical drill performance
 *
 * Features:
 * - Daily goal progress
 * - Pattern weakness reports
 * - Failed puzzle review queue
 * - Recommended training focus
 * - Overall performance stats
 */

import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useUserStore } from '../../state/userStore';
import {
  getPatternWeaknessReport,
  getDailyGoalProgress,
  getRecommendedTraining,
  getDueFailedPuzzles,
} from '../../services/tacticalAnalyticsService';
import { getMotifDisplayName } from '../../constants/tacticalDrills';

interface TacticalStatsDashboardProps {
  onStartDrills?: () => void;
  onClose?: () => void;
}

export default function TacticalStatsDashboard({ onStartDrills, onClose }: TacticalStatsDashboardProps) {
  const { tacticalAnalytics } = useUserStore();

  if (!tacticalAnalytics) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="stats-chart-outline" size={64} color={Colors.textSecondary} />
        <Text style={styles.emptyText}>No tactical data yet</Text>
        <Text style={styles.emptySubtext}>Complete some drills to see your stats!</Text>
      </View>
    );
  }

  const dailyProgress = getDailyGoalProgress(tacticalAnalytics);
  const weaknesses = getPatternWeaknessReport(tacticalAnalytics);
  const recommendation = getRecommendedTraining(tacticalAnalytics);
  const dueReviews = getDueFailedPuzzles(tacticalAnalytics);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      {onClose && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Tactical Analytics</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Daily Goal Card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="today-outline" size={24} color={Colors.primary} />
          <Text style={styles.cardTitle}>Today's Goal</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            {tacticalAnalytics.currentDailyGoal.completedDrills} / {tacticalAnalytics.currentDailyGoal.targetDrills}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${Math.min(dailyProgress, 100)}%`,
                  backgroundColor: dailyProgress >= 100 ? Colors.success : Colors.primary,
                },
              ]}
            />
          </View>
          {dailyProgress >= 100 && (
            <Text style={styles.completedText}>✅ Goal Complete!</Text>
          )}
        </View>
        {tacticalAnalytics.dailyGoalStreak > 0 && (
          <Text style={styles.streakText}>
            🔥 {tacticalAnalytics.dailyGoalStreak} day streak
          </Text>
        )}
      </View>

      {/* Recommendation Card */}
      {recommendation.focusPattern && (
        <View style={[styles.card, styles.recommendationCard, {
          borderColor: recommendation.priority === 'high' ? Colors.error : Colors.warning,
        }]}>
          <Ionicons
            name="bulb-outline"
            size={32}
            color={recommendation.priority === 'high' ? Colors.error : Colors.warning}
          />
          <Text style={styles.recommendationTitle}>Recommended Focus</Text>
          <Text style={styles.recommendationPattern}>
            {getMotifDisplayName(recommendation.focusPattern)}
          </Text>
          <Text style={styles.recommendationReason}>{recommendation.reason}</Text>
          {onStartDrills && (
            <TouchableOpacity style={styles.startButton} onPress={onStartDrills}>
              <Text style={styles.startButtonText}>Start Training</Text>
              <Ionicons name="arrow-forward" size={16} color={Colors.textInverse} />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Failed Puzzle Review Queue */}
      {dueReviews.length > 0 && (
        <View style={[styles.card, styles.reviewCard]}>
          <View style={styles.cardHeader}>
            <Ionicons name="refresh-circle-outline" size={24} color={Colors.info} />
            <Text style={styles.cardTitle}>Review Queue</Text>
          </View>
          <Text style={styles.reviewCount}>
            {dueReviews.length} puzzle{dueReviews.length !== 1 ? 's' : ''} due for review
          </Text>
          <Text style={styles.reviewSubtext}>
            These puzzles will be prioritized in your next session
          </Text>
        </View>
      )}

      {/* Pattern Weaknesses */}
      {weaknesses.critical.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="alert-circle-outline" size={24} color={Colors.error} />
            <Text style={styles.cardTitle}>Critical Weaknesses</Text>
          </View>
          {weaknesses.critical.slice(0, 5).map((pattern) => (
            <View key={pattern.motif} style={styles.patternRow}>
              <Text style={styles.patternName}>
                {getMotifDisplayName(pattern.motif)}
              </Text>
              <View style={styles.patternStats}>
                <Text style={styles.patternAccuracy}>
                  {Math.round(pattern.accuracy)}%
                </Text>
                <Text style={styles.patternAttempts}>
                  ({pattern.correct}/{pattern.totalAttempts})
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Needs Work Patterns */}
      {weaknesses.needsWork.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="construct-outline" size={24} color={Colors.warning} />
            <Text style={styles.cardTitle}>Needs Work</Text>
          </View>
          {weaknesses.needsWork.slice(0, 5).map((pattern) => (
            <View key={pattern.motif} style={styles.patternRow}>
              <Text style={styles.patternName}>
                {getMotifDisplayName(pattern.motif)}
              </Text>
              <View style={styles.patternStats}>
                <Text style={[styles.patternAccuracy, { color: Colors.warning }]}>
                  {Math.round(pattern.accuracy)}%
                </Text>
                <Text style={styles.patternAttempts}>
                  ({pattern.correct}/{pattern.totalAttempts})
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Proficient Patterns */}
      {weaknesses.proficient.length > 0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="checkmark-circle-outline" size={24} color={Colors.success} />
            <Text style={styles.cardTitle}>Proficient Patterns</Text>
          </View>
          {weaknesses.proficient.slice(0, 5).map((pattern) => (
            <View key={pattern.motif} style={styles.patternRow}>
              <Text style={styles.patternName}>
                {getMotifDisplayName(pattern.motif)}
              </Text>
              <View style={styles.patternStats}>
                <Text style={[styles.patternAccuracy, { color: Colors.success }]}>
                  {Math.round(pattern.accuracy)}%
                </Text>
                <Text style={styles.patternAttempts}>
                  ({pattern.correct}/{pattern.totalAttempts})
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Overall Stats */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Ionicons name="stats-chart" size={24} color={Colors.primary} />
          <Text style={styles.cardTitle}>Overall Performance</Text>
        </View>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{tacticalAnalytics.totalDrills}</Text>
            <Text style={styles.statLabel}>Total Drills</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: getAccuracyColor(tacticalAnalytics.overallAccuracy) }]}>
              {Math.round(tacticalAnalytics.overallAccuracy)}%
            </Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Colors.warning }]}>
              {tacticalAnalytics.totalFlashSolves}
            </Text>
            <Text style={styles.statLabel}>Flash Solves</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {tacticalAnalytics.averageTime.toFixed(1)}s
            </Text>
            <Text style={styles.statLabel}>Avg Time</Text>
          </View>
        </View>
      </View>

      {/* Adaptive Settings Info */}
      {tacticalAnalytics.adaptiveSettings.timeMultiplier !== 1.0 && (
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="speedometer-outline" size={24} color={Colors.info} />
            <Text style={styles.cardTitle}>Adaptive Difficulty</Text>
          </View>
          <Text style={styles.adaptiveText}>
            Time limits: {Math.round((tacticalAnalytics.adaptiveSettings.timeMultiplier - 1) * 100)}%{' '}
            {tacticalAnalytics.adaptiveSettings.timeMultiplier > 1 ? 'longer' : 'shorter'}
          </Text>
          <Text style={styles.adaptiveSubtext}>
            {tacticalAnalytics.adaptiveSettings.shouldIncreaseTime
              ? '⏱️ More time given due to recent performance'
              : '⚡ Less time - you\'re crushing it!'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

function getAccuracyColor(accuracy: number): string {
  if (accuracy >= 90) return Colors.success;
  if (accuracy >= 70) return Colors.info;
  if (accuracy >= 50) return Colors.warning;
  return Colors.error;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    padding: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.md,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  closeButton: {
    padding: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  progressContainer: {
    marginVertical: Spacing.sm,
  },
  progressText: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  progressBar: {
    height: 12,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: BorderRadius.full,
  },
  completedText: {
    fontSize: Typography.fontSize.base,
    color: Colors.success,
    fontWeight: Typography.fontWeight.semibold,
    marginTop: Spacing.xs,
  },
  streakText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  recommendationCard: {
    alignItems: 'center',
    borderWidth: 2,
    paddingVertical: Spacing.lg,
  },
  recommendationTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  recommendationPattern: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginVertical: Spacing.xs,
    textAlign: 'center',
  },
  recommendationReason: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  startButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  reviewCard: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.info,
  },
  reviewCount: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  reviewSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  patternRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  patternName: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    flex: 1,
  },
  patternStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  patternAccuracy: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.error,
  },
  patternAttempts: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  statItem: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Spacing.sm,
    backgroundColor: Colors.backgroundTertiary,
    borderRadius: BorderRadius.md,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  adaptiveText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  adaptiveSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
});
