/**
 * Leaderboard Service
 *
 * Manages global, friends, and time-based leaderboards.
 * Features:
 * - Global leaderboards (rating, XP, streak)
 * - Friends-only leaderboards
 * - Weekly/Monthly leaderboards
 * - Achievement leaderboards
 * - Regional leaderboards
 */

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  avatar?: string;
  score: number;
  change?: number; // Rank change from previous period (+5, -3, etc)
  badge?: string;
  country?: string;
}

export type LeaderboardType =
  | 'rating' // Chess rating
  | 'xp' // Total XP
  | 'streak' // Current streak
  | 'wins' // Total wins
  | 'accuracy' // Average accuracy
  | 'puzzles' // Puzzles solved
  | 'weekly-xp' // XP gained this week
  | 'monthly-xp' // XP gained this month;

export type LeaderboardScope = 'global' | 'friends' | 'country';

export type LeaderboardTimeframe = 'all-time' | 'weekly' | 'monthly';

export interface LeaderboardQuery {
  type: LeaderboardType;
  scope: LeaderboardScope;
  timeframe: LeaderboardTimeframe;
  limit?: number;
  offset?: number;
  countryCode?: string;
}

/**
 * Leaderboard Service
 */
export class LeaderboardService {
  /**
   * Get leaderboard entries
   */
  async getLeaderboard(query: LeaderboardQuery): Promise<{
    entries: LeaderboardEntry[];
    userRank?: number;
    totalEntries: number;
  }> {
    try {
      const { type, limit = 100 } = query;

      // TODO: Fetch from backend
      // For now, return mock data
      const mockEntries: LeaderboardEntry[] = this.generateMockLeaderboard(type, limit);

      return {
        entries: mockEntries,
        userRank: 42,
        totalEntries: 10000,
      };
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      return {
        entries: [],
        totalEntries: 0,
      };
    }
  }

  /**
   * Get user's rank in a specific leaderboard
   */
  async getUserRank(userId: string, type: LeaderboardType, scope: LeaderboardScope): Promise<number | null> {
    try {
      // TODO: Query backend for user's rank
      return 42;
    } catch (error) {
      console.error('Error fetching user rank:', error);
      return null;
    }
  }

  /**
   * Get user's position in all leaderboards
   */
  async getUserRankings(userId: string): Promise<Record<LeaderboardType, number>> {
    try {
      // TODO: Fetch all rankings
      return {
        rating: 150,
        xp: 200,
        streak: 50,
        wins: 300,
        accuracy: 100,
        puzzles: 250,
        'weekly-xp': 25,
        'monthly-xp': 80,
      };
    } catch (error) {
      console.error('Error fetching user rankings:', error);
      return {} as Record<LeaderboardType, number>;
    }
  }

  /**
   * Get top players (Hall of Fame)
   */
  async getTopPlayers(limit: number = 10): Promise<LeaderboardEntry[]> {
    try {
      // TODO: Fetch from backend
      return this.generateMockLeaderboard('rating', limit);
    } catch (error) {
      console.error('Error fetching top players:', error);
      return [];
    }
  }

  /**
   * Get friends leaderboard
   */
  async getFriendsLeaderboard(type: LeaderboardType, limit: number = 50): Promise<LeaderboardEntry[]> {
    try {
      // TODO: Fetch friends' scores
      return this.generateMockLeaderboard(type, limit);
    } catch (error) {
      console.error('Error fetching friends leaderboard:', error);
      return [];
    }
  }

  /**
   * Get weekly challenge winners
   */
  async getWeeklyWinners(): Promise<LeaderboardEntry[]> {
    try {
      // TODO: Fetch from backend
      return this.generateMockLeaderboard('weekly-xp', 10);
    } catch (error) {
      console.error('Error fetching weekly winners:', error);
      return [];
    }
  }

  /**
   * Update user's leaderboard scores
   */
  async updateScore(userId: string, type: LeaderboardType, score: number): Promise<void> {
    try {
      // TODO: Update in backend
      console.log(`Updating ${type} for user ${userId}: ${score}`);
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  }

  /**
   * Generate mock leaderboard data for testing
   */
  private generateMockLeaderboard(type: LeaderboardType, limit: number): LeaderboardEntry[] {
    const entries: LeaderboardEntry[] = [];
    const usernames = [
      'ChessMaster', 'TacticalGenius', 'PawnStorm', 'EndgameExpert',
      'OpeningGuru', 'BlitzKing', 'StrategicMind', 'QueenGambit',
      'KnightRider', 'BishopBeast', 'RookRevolution', 'PawnPusher',
      'CheckmateChampion', 'CastleDefender', 'ForwardPawn', 'CenterControl',
    ];

    for (let i = 0; i < limit; i++) {
      const baseScore = type === 'rating' ? 2000 : type === 'xp' ? 50000 : 100;
      const scoreVariation = Math.floor(Math.random() * baseScore);

      entries.push({
        rank: i + 1,
        userId: `user-${i}`,
        username: usernames[i % usernames.length] + (i > 15 ? i : ''),
        score: baseScore - scoreVariation,
        change: i % 3 === 0 ? Math.floor(Math.random() * 10) - 5 : undefined,
        badge: i < 3 ? ['🥇', '🥈', '🥉'][i] : undefined,
        country: ['US', 'GB', 'DE', 'FR', 'ES', 'IN', 'RU', 'CN'][i % 8],
      });
    }

    return entries;
  }

  /**
   * Get available leaderboard types with metadata
   */
  getLeaderboardTypes(): {
    type: LeaderboardType;
    name: string;
    description: string;
    icon: string;
  }[] {
    return [
      {
        type: 'rating',
        name: 'Rating',
        description: 'Highest chess rating',
        icon: '♔',
      },
      {
        type: 'xp',
        name: 'Experience',
        description: 'Total XP earned',
        icon: '⭐',
      },
      {
        type: 'streak',
        name: 'Streak',
        description: 'Current training streak',
        icon: '🔥',
      },
      {
        type: 'wins',
        name: 'Wins',
        description: 'Total games won',
        icon: '🏆',
      },
      {
        type: 'accuracy',
        name: 'Accuracy',
        description: 'Average game accuracy',
        icon: '🎯',
      },
      {
        type: 'puzzles',
        name: 'Puzzles',
        description: 'Tactical puzzles solved',
        icon: '🧩',
      },
      {
        type: 'weekly-xp',
        name: 'This Week',
        description: 'XP earned this week',
        icon: '📅',
      },
      {
        type: 'monthly-xp',
        name: 'This Month',
        description: 'XP earned this month',
        icon: '📆',
      },
    ];
  }
}

export const leaderboardService = new LeaderboardService();
