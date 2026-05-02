/**
 * Friends Screen
 *
 * Displays friends list and friend requests.
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  socialProfileService,
  type SocialProfile,
  type FriendRequest,
} from '../../services/social/socialProfileService';

type TabType = 'friends' | 'requests';

export default function FriendsScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('friends');
  const [friends, setFriends] = useState<SocialProfile[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Load friends
      const friendsList = await socialProfileService.getFriends('current-user-id'); // TODO: Get actual user ID
      setFriends(friendsList);

      // Load friend requests
      const requests = await socialProfileService.getFriendRequests();
      setFriendRequests(requests);
    } catch (error) {
      console.error('Failed to load friends data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await socialProfileService.acceptFriendRequest(requestId);
      await loadData();
    } catch (error) {
      console.error('Failed to accept friend request:', error);
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    try {
      await socialProfileService.rejectFriendRequest(requestId);
      await loadData();
    } catch (error) {
      console.error('Failed to reject friend request:', error);
    }
  };

  const renderFriend = ({ item }: { item: SocialProfile }) => (
    <TouchableOpacity style={styles.friendCard}>
      <View style={styles.friendInfo}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Ionicons name="person" size={24} color="#666666" />
          </View>
        )}
        <View style={styles.friendDetails}>
          <Text style={styles.friendName}>{item.displayName}</Text>
          <Text style={styles.friendUsername}>@{item.username}</Text>
          <View style={styles.friendStats}>
            <Text style={styles.friendStat}>⭐ {item.rating}</Text>
            <Text style={styles.friendStat}>🔥 {item.currentStreak}</Text>
          </View>
        </View>
      </View>
      <TouchableOpacity style={styles.iconButton}>
        <Ionicons name="chatbubble-outline" size={20} color="#4a9eff" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFriendRequest = ({ item }: { item: FriendRequest }) => (
    <View style={styles.requestCard}>
      <View style={styles.requestInfo}>
        <View style={[styles.avatar, styles.avatarPlaceholder]}>
          <Ionicons name="person" size={24} color="#666666" />
        </View>
        <View style={styles.requestDetails}>
          <Text style={styles.requestName}>Friend Request</Text>
          <Text style={styles.requestMessage}>
            {item.message || 'Wants to be your friend'}
          </Text>
          <Text style={styles.requestDate}>
            {new Date(item.sentAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.requestActions}>
        <TouchableOpacity
          style={styles.acceptButton}
          onPress={() => handleAcceptRequest(item.id)}
        >
          <Ionicons name="checkmark" size={20} color="#ffffff" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.rejectButton}
          onPress={() => handleRejectRequest(item.id)}
        >
          <Ionicons name="close" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4a9eff" />
        </View>
      );
    }

    if (activeTab === 'friends') {
      if (friends.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#666666" />
            <Text style={styles.emptyText}>No friends yet</Text>
            <Text style={styles.emptySubtext}>
              Add friends to play together and compare progress
            </Text>
          </View>
        );
      }

      return (
        <FlatList
          data={friends}
          renderItem={renderFriend}
          keyExtractor={item => item.uid}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      );
    } else {
      if (friendRequests.length === 0) {
        return (
          <View style={styles.emptyContainer}>
            <Ionicons name="mail-outline" size={64} color="#666666" />
            <Text style={styles.emptyText}>No friend requests</Text>
          </View>
        );
      }

      return (
        <FlatList
          data={friendRequests}
          renderItem={renderFriendRequest}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            Friends ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'requests' && styles.tabActive]}
          onPress={() => setActiveTab('requests')}
        >
          <Text style={[styles.tabText, activeTab === 'requests' && styles.tabTextActive]}>
            Requests ({friendRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4a9eff',
  },
  tabText: {
    fontSize: 16,
    color: '#999999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4a9eff',
  },
  listContent: {
    padding: 16,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  friendInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 12,
  },
  avatarPlaceholder: {
    backgroundColor: '#3a3a3a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  friendDetails: {
    flex: 1,
  },
  friendName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 2,
  },
  friendUsername: {
    fontSize: 14,
    color: '#999999',
    marginBottom: 4,
  },
  friendStats: {
    flexDirection: 'row',
    gap: 12,
  },
  friendStat: {
    fontSize: 12,
    color: '#b3b3b3',
  },
  iconButton: {
    padding: 8,
  },
  requestCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  requestInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  requestDetails: {
    flex: 1,
  },
  requestName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  requestMessage: {
    fontSize: 14,
    color: '#b3b3b3',
    marginBottom: 2,
  },
  requestDate: {
    fontSize: 12,
    color: '#666666',
  },
  requestActions: {
    flexDirection: 'row',
    gap: 12,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#4caf50',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#f44336',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999999',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
});
