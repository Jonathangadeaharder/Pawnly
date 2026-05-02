/**
 * Profile Screen (The Trophy Room)
 * User stats, achievements, and settings
 */

import React, { useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useUserStore } from '../../state/userStore';
import { OPENING_SYSTEMS } from '../../constants/lessons';

export default function ProfileScreen() {
  const { profile, loadUserProfile, achievements } = useUserStore();

  useEffect(() => {
    loadUserProfile();
  }, []);

  // Calculate enhanced statistics
  const stats = useMemo(() => {
    if (!profile) return null;

    // SRS Statistics
    const totalReviews = profile.srsQueue.reduce((sum, item) => sum + item.reviewCount, 0);
    const masteredItems = profile.srsQueue.filter(item => item.stability > 100).length;
    const dueToday = profile.srsQueue.filter(item => new Date(item.nextReview) <= new Date()).length;

    // Learning Progress
    const completedLessons = profile.completedLessons.length;
    const lessonsBySystem: Record<string, number> = {};
    OPENING_SYSTEMS.forEach(system => {
      lessonsBySystem[system.id] = profile.completedLessons.filter(
        lessonId => lessonId.startsWith(system.id.split('-')[0])
      ).length;
    });

    // Level Progress
    const xpForNextLevel = profile.level * 100;
    const xpInCurrentLevel = profile.totalXP % 100;
    const levelProgress = (xpInCurrentLevel / xpForNextLevel) * 100;

    // Game Statistics
    const wins = profile.gameHistory.filter(game => game.result === 'win').length;
    const losses = profile.gameHistory.filter(game => game.result === 'loss').length;
    const draws = profile.gameHistory.filter(game => game.result === 'draw').length;
    const winRate = profile.totalGamesPlayed > 0
      ? Math.round((wins / profile.totalGamesPlayed) * 100)
      : 0;

    return {
      totalReviews,
      masteredItems,
      dueToday,
      completedLessons,
      lessonsBySystem,
      levelProgress,
      xpForNextLevel,
      xpInCurrentLevel,
      wins,
      losses,
      draws,
      winRate,
    };
  }, [profile]);

  if (!profile || !stats) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const isStreakActive = profile.lastPracticeDate &&
    new Date().toDateString() === new Date(profile.lastPracticeDate).toDateString();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Ionicons name="person" size={48} color={Colors.textInverse} />
          </View>
          <Text style={styles.username}>{profile.username}</Text>
          <Text style={styles.level}>Level {profile.level}</Text>

          {/* Level Progress Bar */}
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelProgressBar}>
              <View
                style={[
                  styles.levelProgressFill,
                  { width: `${stats.levelProgress}%` }
                ]}
              />
            </View>
            <Text style={styles.levelProgressText}>
              {stats.xpInCurrentLevel} / {stats.xpForNextLevel} XP
            </Text>
          </View>
        </View>

        {/* Daily Streak Card */}
        <View style={styles.streakCard}>
          <View style={styles.streakHeader}>
            <Ionicons
              name="flame"
              size={32}
              color={isStreakActive ? Colors.streak : Colors.disabled}
            />
            <Text style={styles.streakTitle}>Daily Streak</Text>
          </View>
          <Text style={styles.streakNumber}>{profile.currentStreak}</Text>
          <Text style={styles.streakLabel}>
            {profile.currentStreak === 1 ? 'day' : 'days'}
          </Text>
          <Text style={styles.streakSubtext}>
            Longest streak: {profile.longestStreak} days
          </Text>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Ionicons name="trophy" size={24} color={Colors.milestone} />
            <Text style={styles.statNumber}>{profile.totalXP}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="game-controller" size={24} color={Colors.primary} />
            <Text style={styles.statNumber}>{profile.totalGamesPlayed}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="puzzle" size={24} color={Colors.info} />
            <Text style={styles.statNumber}>{profile.totalPuzzlesSolved}</Text>
            <Text style={styles.statLabel}>Puzzles</Text>
          </View>

          <View style={styles.statCard}>
            <Ionicons name="time" size={24} color={Colors.success} />
            <Text style={styles.statNumber}>{profile.totalStudyTime}</Text>
            <Text style={styles.statLabel}>Minutes</Text>
          </View>
        </View>

        {/* Opening System */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Opening System</Text>
          <View style={styles.systemCard}>
            <Text style={styles.systemName}>
              {profile.selectedSystem.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Text>
            <Text style={styles.systemStyle}>
              Playstyle: {profile.playstyle.charAt(0).toUpperCase() + profile.playstyle.slice(1)}
            </Text>
          </View>
        </View>

        {/* SRS Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Spaced Repetition Progress</Text>
          <View style={styles.srsStatsContainer}>
            <View style={styles.srsStatCard}>
              <Ionicons name="sync" size={24} color={Colors.primary} />
              <Text style={styles.srsStatNumber}>{stats.totalReviews}</Text>
              <Text style={styles.srsStatLabel}>Total Reviews</Text>
            </View>
            <View style={styles.srsStatCard}>
              <Ionicons name="star" size={24} color={Colors.milestone} />
              <Text style={styles.srsStatNumber}>{stats.masteredItems}</Text>
              <Text style={styles.srsStatLabel}>Mastered</Text>
            </View>
            <View style={styles.srsStatCard}>
              <Ionicons name="today" size={24} color={Colors.info} />
              <Text style={styles.srsStatNumber}>{stats.dueToday}</Text>
              <Text style={styles.srsStatLabel}>Due Today</Text>
            </View>
          </View>
          {profile.averageReviewAccuracy > 0 && (
            <View style={styles.accuracyCard}>
              <View style={styles.accuracyHeader}>
                <Text style={styles.accuracyLabel}>Average Accuracy</Text>
                <Text style={styles.accuracyValue}>
                  {Math.round(profile.averageReviewAccuracy * 100)}%
                </Text>
              </View>
              <View style={styles.accuracyBar}>
                <View
                  style={[
                    styles.accuracyFill,
                    { width: `${profile.averageReviewAccuracy * 100}%` }
                  ]}
                />
              </View>
            </View>
          )}
        </View>

        {/* Learning Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Learning Progress</Text>
          <View style={styles.progressCard}>
            <View style={styles.progressRow}>
              <Text style={styles.progressLabel}>Lessons Completed</Text>
              <Text style={styles.progressValue}>{stats.completedLessons}</Text>
            </View>

            {/* Lessons by System */}
            {OPENING_SYSTEMS.map(system => {
              const count = stats.lessonsBySystem[system.id] || 0;
              if (count === 0) return null;
              return (
                <View key={system.id} style={styles.systemProgressRow}>
                  <Text style={styles.systemProgressEmoji}>{system.icon}</Text>
                  <Text style={styles.systemProgressName}>{system.name}</Text>
                  <Text style={styles.systemProgressCount}>{count}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Game Statistics */}
        {profile.totalGamesPlayed > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Game Performance</Text>
            <View style={styles.gameStatsContainer}>
              <View style={styles.winRateCard}>
                <Text style={styles.winRateLabel}>Win Rate</Text>
                <Text style={styles.winRateValue}>{stats.winRate}%</Text>
              </View>
              <View style={styles.recordContainer}>
                <View style={styles.recordItem}>
                  <Text style={[styles.recordNumber, { color: Colors.success }]}>
                    {stats.wins}
                  </Text>
                  <Text style={styles.recordLabel}>Wins</Text>
                </View>
                <View style={styles.recordDivider} />
                <View style={styles.recordItem}>
                  <Text style={[styles.recordNumber, { color: Colors.textSecondary }]}>
                    {stats.draws}
                  </Text>
                  <Text style={styles.recordLabel}>Draws</Text>
                </View>
                <View style={styles.recordDivider} />
                <View style={styles.recordItem}>
                  <Text style={[styles.recordNumber, { color: Colors.error }]}>
                    {stats.losses}
                  </Text>
                  <Text style={styles.recordLabel}>Losses</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Achievements section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Achievements</Text>

          {/* Achievement Stats */}
          <View style={styles.achievementStats}>
            <View style={styles.achievementStatItem}>
              <Text style={styles.achievementStatNumber}>
                {achievements.filter(a => a.unlocked).length}
              </Text>
              <Text style={styles.achievementStatLabel}>Unlocked</Text>
            </View>
            <View style={styles.achievementStatDivider} />
            <View style={styles.achievementStatItem}>
              <Text style={styles.achievementStatNumber}>
                {achievements.length}
              </Text>
              <Text style={styles.achievementStatLabel}>Total</Text>
            </View>
          </View>

          {/* Recent Achievements */}
          {achievements.filter(a => a.unlocked).length > 0 ? (
            <View style={styles.achievementsGrid}>
              {achievements
                .filter(a => a.unlocked)
                .slice(0, 6)
                .map(achievement => (
                  <View key={achievement.id} style={styles.achievementBadge}>
                    <Text style={styles.achievementIcon}>{achievement.icon}</Text>
                    <Text style={styles.achievementName} numberOfLines={2}>
                      {achievement.name}
                    </Text>
                  </View>
                ))}
            </View>
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>
                Complete reviews and reach milestones to unlock achievements!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
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
  loadingText: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  avatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  username: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  level: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  streakCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 16,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  streakHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  streakTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginLeft: Spacing.sm,
  },
  streakNumber: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.streak,
  },
  streakLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  streakSubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textLight,
    marginTop: Spacing.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  statCard: {
    width: '48%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  statNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  systemCard: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: Spacing.lg,
  },
  systemName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
  },
  systemStyle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textInverse,
  },
  placeholder: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: Spacing.xl,
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  achievementStats: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  achievementStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  achievementStatNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  achievementStatLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  achievementStatDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  achievementBadge: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 12,
    padding: Spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  achievementIcon: {
    fontSize: 32,
    marginBottom: Spacing.xs,
  },
  achievementName: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  // Level Progress Styles
  levelProgressContainer: {
    width: '80%',
    marginTop: Spacing.lg,
  },
  levelProgressBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  levelProgressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  levelProgressText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  // SRS Statistics Styles
  srsStatsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  srsStatCard: {
    flex: 1,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    marginHorizontal: Spacing.xs,
  },
  srsStatNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginTop: Spacing.sm,
  },
  srsStatLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  accuracyCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  accuracyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  accuracyLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  accuracyValue: {
    fontSize: Typography.fontSize.xl,
    color: Colors.success,
    fontWeight: Typography.fontWeight.bold,
  },
  accuracyBar: {
    height: 8,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  accuracyFill: {
    height: '100%',
    backgroundColor: Colors.success,
  },
  // Learning Progress Styles
  progressCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: Spacing.md,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  progressLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  progressValue: {
    fontSize: Typography.fontSize.xl,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  systemProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  systemProgressEmoji: {
    fontSize: 24,
    marginRight: Spacing.sm,
  },
  systemProgressName: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
  },
  systemProgressCount: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  // Game Statistics Styles
  gameStatsContainer: {
    gap: Spacing.md,
  },
  winRateCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
  },
  winRateLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textInverse,
    marginBottom: Spacing.xs,
  },
  winRateValue: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  recordContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  recordItem: {
    flex: 1,
    alignItems: 'center',
  },
  recordNumber: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
  },
  recordLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  recordDivider: {
    width: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.md,
  },
});
