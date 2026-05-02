/**
 * Social Profile Screen
 *
 * Displays a user's social profile with stats, badges, and friend actions.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { socialProfileService, type SocialProfile } from '../../services/social/socialProfileService';
import { shareService } from '../../services/social/shareService';

interface Props {
  route: {
    params: {
      userId: string;
    };
  };
}

export default function SocialProfileScreen({ route }: Props) {
  const { userId } = route.params;
  const [profile, setProfile] = useState<SocialProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const profileData = await socialProfileService.getProfile(userId);
      setProfile(profileData);

      // Check if already friends
      await socialProfileService.getFriends(userId);
      // TODO: Check if current user is in friends list
      setIsFriend(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    try {
      await socialProfileService.sendFriendRequest(userId, 'Let\'s play chess together!');
      alert('Friend request sent!');
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('Failed to send friend request');
    }
  };

  const handleShare = async () => {
    if (!profile) return;

    await shareService.shareRating(profile.rating, 0);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a9eff" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Profile not found</Text>
      </View>
    );
  }

  const winRate = profile.totalGames > 0
    ? ((profile.wins / profile.totalGames) * 100).toFixed(1)
    : 0;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.avatarPlaceholder]}>
              <Ionicons name="person" size={48} color="#666666" />
            </View>
          )}
        </View>
        <Text style={styles.displayName}>{profile.displayName}</Text>
        <Text style={styles.username}>@{profile.username}</Text>

        {profile.bio && (
          <Text style={styles.bio}>{profile.bio}</Text>
        )}

        <View style={styles.actionButtons}>
          {!isFriend && (
            <TouchableOpacity style={styles.primaryButton} onPress={handleSendFriendRequest}>
              <Ionicons name="person-add" size={20} color="#ffffff" />
              <Text style={styles.buttonText}>Add Friend</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.secondaryButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={20} color="#4a9eff" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Statistics</Text>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.totalGames}</Text>
            <Text style={styles.statLabel}>Games</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{winRate}%</Text>
            <Text style={styles.statLabel}>Win Rate</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{profile.currentStreak}</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        <View style={styles.detailedStats}>
          <View style={styles.detailedStatRow}>
            <Text style={styles.detailedStatLabel}>Wins</Text>
            <Text style={styles.detailedStatValue}>{profile.wins}</Text>
          </View>
          <View style={styles.detailedStatRow}>
            <Text style={styles.detailedStatLabel}>Losses</Text>
            <Text style={styles.detailedStatValue}>{profile.losses}</Text>
          </View>
          <View style={styles.detailedStatRow}>
            <Text style={styles.detailedStatLabel}>Draws</Text>
            <Text style={styles.detailedStatValue}>{profile.draws}</Text>
          </View>
          <View style={styles.detailedStatRow}>
            <Text style={styles.detailedStatLabel}>Friends</Text>
            <Text style={styles.detailedStatValue}>{profile.friendCount}</Text>
          </View>
        </View>
      </View>

      {profile.badges.length > 0 && (
        <View style={styles.badgesSection}>
          <Text style={styles.sectionTitle}>Badges</Text>
          <View style={styles.badgesGrid}>
            {profile.badges.map((badge, index) => (
              <View key={index} style={styles.badge}>
                <Text style={styles.badgeIcon}>{badge}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  emptyText: {
    fontSize: 16,
    color: '#999999',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#2a2a2a',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  username: {
    fontSize: 16,
    color: '#999999',
    marginBottom: 12,
  },
  bio: {
    fontSize: 14,
    color: '#b3b3b3',
    textAlign: 'center',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4a9eff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  secondaryButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4a9eff',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  statsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4a9eff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#999999',
  },
  detailedStats: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  detailedStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  detailedStatLabel: {
    fontSize: 14,
    color: '#999999',
  },
  detailedStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  badgesSection: {
    padding: 20,
    paddingTop: 0,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  badge: {
    width: 60,
    height: 60,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeIcon: {
    fontSize: 32,
  },
});
