/**
 * Leaderboard Screen
 *
 * Display global, friends, and time-based leaderboards.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import {
  leaderboardService,
  type LeaderboardEntry,
  type LeaderboardType,
  type LeaderboardScope,
  type LeaderboardTimeframe,
} from '../../services/social/leaderboardService';
import * as Haptics from 'expo-haptics';

export default function LeaderboardScreen() {
  const [selectedType, setSelectedType] = useState<LeaderboardType>('rating');
  const [selectedScope, setSelectedScope] = useState<LeaderboardScope>('global');
  const [selectedTimeframe, setSelectedTimeframe] = useState<LeaderboardTimeframe>('all-time');
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | undefined>(undefined);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const leaderboardTypes = leaderboardService.getLeaderboardTypes();

  useEffect(() => {
    loadLeaderboard();
  }, [selectedType, selectedScope, selectedTimeframe]);

  const loadLeaderboard = async () => {
    try {
      const result = await leaderboardService.getLeaderboard({
        type: selectedType,
        scope: selectedScope,
        timeframe: selectedTimeframe,
        limit: 100,
      });

      setEntries(result.entries);
      setUserRank(result.userRank);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadLeaderboard();
    setIsRefreshing(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleTypeChange = (type: LeaderboardType) => {
    setSelectedType(type);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return '#FFD700'; // Gold
    if (rank === 2) return '#C0C0C0'; // Silver
    if (rank === 3) return '#CD7F32'; // Bronze
    return Colors.textSecondary;
  };



  const formatScore = (score: number, type: LeaderboardType) => {
    if (type === 'accuracy') {
      return `${score.toFixed(1)}%`;
    }
    return score.toLocaleString();
  };

  const renderLeaderboardEntry = ({ item, index }: { item: LeaderboardEntry; index: number }) => {
    const isTopThree = item.rank <= 3;
    const isUserEntry = index === userRank;

    return (
      <View style={[styles.entryCard, isUserEntry && styles.userEntryCard]}>
        {/* Rank */}
        <View style={[styles.rankBadge, isTopThree && styles.topRankBadge]}>
          {item.badge ? (
            <Text style={styles.rankBadgeText}>{item.badge}</Text>
          ) : (
            <Text style={[styles.rankNumber, { color: getRankColor(item.rank) }]}>
              {item.rank}
            </Text>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <View style={styles.userAvatar}>
            <Ionicons name="person" size={24} color={Colors.primary} />
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userNameRow}>
              <Text style={[styles.username, isUserEntry && styles.userEntryText]}>
                {item.username}
              </Text>
              {item.country && (
                <Text style={styles.countryFlag}>{item.country}</Text>
              )}
            </View>
            {item.change !== undefined && (
              <View style={styles.changeIndicator}>
                <Ionicons
                  name={item.change > 0 ? 'trending-up' : item.change < 0 ? 'trending-down' : 'remove'}
                  size={14}
                  color={item.change > 0 ? Colors.success : item.change < 0 ? Colors.error : Colors.textSecondary}
                />
                <Text style={[
                  styles.changeText,
                  { color: item.change > 0 ? Colors.success : item.change < 0 ? Colors.error : Colors.textSecondary }
                ]}>
                  {item.change > 0 ? '+' : ''}{item.change}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={[styles.score, isUserEntry && styles.userEntryText]}>
            {formatScore(item.score, selectedType)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Leaderboards</Text>
        <TouchableOpacity onPress={handleRefresh}>
          <Ionicons name="refresh" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Type Selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.typeSelector}
        contentContainerStyle={styles.typeSelectorContent}
      >
        {leaderboardTypes.map((type) => (
          <TouchableOpacity
            key={type.type}
            style={[
              styles.typeChip,
              selectedType === type.type && styles.typeChipActive,
            ]}
            onPress={() => handleTypeChange(type.type)}
          >
            <Text style={styles.typeIcon}>{type.icon}</Text>
            <Text
              style={[
                styles.typeText,
                selectedType === type.type && styles.typeTextActive,
              ]}
            >
              {type.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Scope & Timeframe Tabs */}
      <View style={styles.filterTabs}>
        <View style={styles.tabGroup}>
          {(['global', 'friends', 'country'] as LeaderboardScope[]).map((scope) => (
            <TouchableOpacity
              key={scope}
              style={[styles.tab, selectedScope === scope && styles.tabActive]}
              onPress={() => {
                setSelectedScope(scope);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.tabText, selectedScope === scope && styles.tabTextActive]}>
                {scope.charAt(0).toUpperCase() + scope.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.tabGroup}>
          {(['all-time', 'weekly', 'monthly'] as LeaderboardTimeframe[]).map((timeframe) => (
            <TouchableOpacity
              key={timeframe}
              style={[styles.tab, selectedTimeframe === timeframe && styles.tabActive]}
              onPress={() => {
                setSelectedTimeframe(timeframe);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <Text style={[styles.tabText, selectedTimeframe === timeframe && styles.tabTextActive]}>
                {timeframe === 'all-time' ? 'All' : timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* User Rank Card */}
      {userRank && (
        <View style={styles.userRankCard}>
          <View style={styles.userRankInfo}>
            <Text style={styles.userRankLabel}>Your Rank</Text>
            <Text style={styles.userRankValue}>#{userRank}</Text>
          </View>
          <TouchableOpacity style={styles.viewProfileButton}>
            <Text style={styles.viewProfileButtonText}>View My Profile</Text>
            <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Leaderboard List */}
      <FlatList
        data={entries}
        renderItem={renderLeaderboardEntry}
        keyExtractor={(item) => item.userId}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="trophy-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>No entries yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Be the first to climb the leaderboard!
            </Text>
          </View>
        }
      />
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  typeSelector: {
    maxHeight: 80,
  },
  typeSelectorContent: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.full,
    borderWidth: 2,
    borderColor: 'transparent',
    marginRight: Spacing.sm,
  },
  typeChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  typeIcon: {
    fontSize: 20,
  },
  typeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
  },
  typeTextActive: {
    color: Colors.primary,
  },
  filterTabs: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    gap: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tabGroup: {
    flexDirection: 'row',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: 2,
  },
  tab: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  tabActive: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    fontWeight: Typography.fontWeight.semibold,
  },
  tabTextActive: {
    color: Colors.textInverse,
  },
  userRankCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.primary + '15',
    margin: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  userRankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  userRankLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  userRankValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  viewProfileButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  listContent: {
    padding: Spacing.md,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
  },
  userEntryCard: {
    borderWidth: 2,
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  topRankBadge: {
    backgroundColor: Colors.backgroundSecondary,
  },
  rankNumber: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
  },
  rankBadgeText: {
    fontSize: 24,
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  username: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  userEntryText: {
    color: Colors.primary,
  },
  countryFlag: {
    fontSize: Typography.fontSize.base,
  },
  changeIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginTop: 2,
  },
  changeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  score: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
