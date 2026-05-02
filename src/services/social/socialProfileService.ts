/**
 * Social Profile Service
 *
 * Manages user social profiles, friends, and community features.
 * Features:
 * - Public profile management
 * - Friend requests and connections
 * - Activity feed
 * - Profile statistics
 * - Privacy settings
 */

import { getBackendManager } from '../backend/backendService';
import type { UserProfile } from '../../types';

export interface SocialProfile {
  uid: string;
  username: string;
  displayName: string;
  avatar?: string;
  bio?: string;
  country?: string;
  rating: number;

  // Statistics
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  longestStreak: number;
  totalXP: number;
  level: number;

  // Social
  friendCount: number;
  followerCount: number;
  followingCount: number;

  // Achievements (public)
  badges: string[];
  recentAchievements: {
    id: string;
    name: string;
    unlockedAt: Date;
  }[];

  // Activity
  lastActive: Date;
  joinedDate: Date;

  // Privacy
  isPrivate: boolean;
  showRating: boolean;
  showStats: boolean;
  allowFriendRequests: boolean;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromAvatar?: string;
  toUserId: string;
  status: 'pending' | 'accepted' | 'rejected';
  sentAt: Date;
  respondedAt?: Date;
  message?: string;
}

export interface Friendship {
  id: string;
  user1Id: string;
  user2Id: string;
  createdAt: Date;

  // Friend details (cached for performance)
  friendId: string;
  friendUsername: string;
  friendAvatar?: string;
  friendRating: number;
  friendLastActive: Date;
}

export interface ActivityFeedItem {
  id: string;
  userId: string;
  username: string;
  avatar?: string;
  type: 'achievement' | 'game-won' | 'streak' | 'level-up' | 'new-friend';
  title: string;
  description: string;
  timestamp: Date;
  metadata?: any;
}

/**
 * Social Profile Service
 */
export class SocialProfileService {
  /**
   * Get public profile by user ID
   */
  async getProfile(userId: string): Promise<SocialProfile | null> {
    try {
      // TODO: Fetch from backend
      // For now, return mock data
      return {
        uid: userId,
        username: 'ChessPlayer123',
        displayName: 'Chess Player',
        rating: 1500,
        totalGames: 150,
        wins: 75,
        losses: 50,
        draws: 25,
        currentStreak: 5,
        longestStreak: 15,
        totalXP: 5000,
        level: 12,
        friendCount: 10,
        followerCount: 25,
        followingCount: 15,
        badges: ['first-win', 'streak-7', 'master-tactician'],
        recentAchievements: [],
        lastActive: new Date(),
        joinedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        isPrivate: false,
        showRating: true,
        showStats: true,
        allowFriendRequests: true,
      };
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }

  /**
   * Update own profile
   */
  async updateProfile(updates: Partial<SocialProfile>): Promise<void> {
    try {
      // TODO: Update in backend
      console.log('Updating profile:', updates);
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }

  /**
   * Search users by username
   */
  async searchUsers(query: string, limit: number = 20): Promise<SocialProfile[]> {
    try {
      // TODO: Search in backend
      return [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  /**
   * Send friend request
   */
  async sendFriendRequest(toUserId: string, message?: string): Promise<void> {
    try {
      const backend = getBackendManager().getBackend();
      const currentUser = await backend.getCurrentUser();

      if (!currentUser) throw new Error('Not authenticated');

      const request: FriendRequest = {
        id: `${currentUser.uid}-${toUserId}-${Date.now()}`,
        fromUserId: currentUser.uid,
        fromUsername: currentUser.displayName || 'User',
        toUserId,
        status: 'pending',
        sentAt: new Date(),
        message,
      };

      // TODO: Save to backend
      console.log('Sending friend request:', request);
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  /**
   * Get pending friend requests (received)
   */
  async getPendingRequests(): Promise<FriendRequest[]> {
    try {
      // TODO: Fetch from backend
      return [];
    } catch (error) {
      console.error('Error fetching requests:', error);
      return [];
    }
  }

  /**
   * Accept friend request
   */
  async acceptFriendRequest(requestId: string): Promise<void> {
    try {
      // TODO: Update request status and create friendship
      console.log('Accepting friend request:', requestId);
    } catch (error) {
      console.error('Error accepting request:', error);
      throw error;
    }
  }

  /**
   * Reject friend request
   */
  async rejectFriendRequest(requestId: string): Promise<void> {
    try {
      // TODO: Update request status
      console.log('Rejecting friend request:', requestId);
    } catch (error) {
      console.error('Error rejecting request:', error);
      throw error;
    }
  }

  /**
   * Get friends list
   */
  async getFriends(): Promise<Friendship[]> {
    try {
      // TODO: Fetch from backend
      return [];
    } catch (error) {
      console.error('Error fetching friends:', error);
      return [];
    }
  }

  /**
   * Remove friend
   */
  async removeFriend(friendshipId: string): Promise<void> {
    try {
      // TODO: Delete friendship
      console.log('Removing friend:', friendshipId);
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  /**
   * Get activity feed (friends + own activities)
   */
  async getActivityFeed(limit: number = 50): Promise<ActivityFeedItem[]> {
    try {
      // TODO: Fetch from backend
      // For now, return mock data
      return [
        {
          id: '1',
          userId: 'user1',
          username: 'ChessMaster',
          type: 'achievement',
          title: 'New Achievement!',
          description: 'Unlocked "Tactical Genius" badge',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
        },
        {
          id: '2',
          userId: 'user2',
          username: 'PawnStorm',
          type: 'game-won',
          title: 'Won against 1800 rated player',
          description: 'Victory in 35 moves with the King\'s Indian Attack',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
        },
        {
          id: '3',
          userId: 'user3',
          username: 'EndgameExpert',
          type: 'streak',
          title: '10-day streak!',
          description: 'Completed training 10 days in a row',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
      ];
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      return [];
    }
  }

  /**
   * Post activity to feed
   */
  async postActivity(activity: Omit<ActivityFeedItem, 'id' | 'timestamp'>): Promise<void> {
    try {
      // TODO: Save to backend
      console.log('Posting activity:', activity);
    } catch (error) {
      console.error('Error posting activity:', error);
      throw error;
    }
  }
}

export const socialProfileService = new SocialProfileService();
