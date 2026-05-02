/**
 * Achievement Service
 * Handles achievement unlock logic and tracking
 */

import { useUserStore } from '../../state/userStore';
import { ALL_ACHIEVEMENTS, checkAchievementUnlock } from '../../constants/achievements';
import type { Achievement, OpeningSystem } from '../../types';

/**
 * Check all achievements and unlock any that are newly earned
 * Returns array of newly unlocked achievements
 */
export async function checkAndUnlockAchievements(): Promise<Achievement[]> {
  const { profile, achievements, unlockAchievement } = useUserStore.getState();

  if (!profile) return [];

  // Get current unlocked achievement IDs
  const unlockedIds = achievements.filter(a => a.unlocked).map(a => a.id);

  // Build stats object from user profile
  const stats = {
    currentStreak: profile.currentStreak,
    totalSessions: profile.totalGamesPlayed + profile.totalPuzzlesSolved, // Approximation
    totalSRSReviews: 0, // TODO: Track this separately
    gamesWon: Math.floor(profile.totalGamesPlayed * 0.5), // Approximation
    bishopsPrisonPerfect: 0, // TODO: Track this
    transpositionsComplete: 0, // TODO: Track this
    fuseSolvedFast: 0, // TODO: Track this
    conceptsCorrectFirstTry: 0, // TODO: Track this
    perfectLineStreaks: 0, // TODO: Track this
    completedSystems: [], // TODO: Track this
  };

  // Check each locked achievement
  const newlyUnlocked: Achievement[] = [];

  for (const achievement of ALL_ACHIEVEMENTS) {
    if (!unlockedIds.includes(achievement.id)) {
      const shouldUnlock = checkAchievementUnlock(achievement.id, stats);

      if (shouldUnlock) {
        unlockAchievement(achievement.id);
        newlyUnlocked.push(achievement);
      }
    }
  }

  return newlyUnlocked;
}

/**
 * Check achievements after a specific event
 */
export async function checkAchievementsAfterEvent(
  event: 'streak' | 'srs-review' | 'game-won' | 'minigame-complete' | 'concept-correct' | 'system-complete',
  data?: any
): Promise<Achievement[]> {
  // This would be called after specific events
  // For now, we just check all achievements
  return checkAndUnlockAchievements();
}

/**
 * Get progress toward an achievement
 */
export function getAchievementProgress(achievementId: string): {
  current: number;
  target: number;
  percentage: number;
} {
  const { profile } = useUserStore.getState();

  if (!profile) {
    return { current: 0, target: 1, percentage: 0 };
  }

  // Map achievement IDs to their progress
  const progressMap: Record<string, { current: number; target: number }> = {
    'achievement-first-flame': {
      current: profile.currentStreak >= 1 ? 1 : 0,
      target: 1,
    },
    'achievement-week-warrior': {
      current: Math.min(profile.currentStreak, 7),
      target: 7,
    },
    'achievement-monthly-dedication': {
      current: Math.min(profile.currentStreak, 30),
      target: 30,
    },
    'achievement-eternal-flame': {
      current: Math.min(profile.currentStreak, 100),
      target: 100,
    },
    'achievement-daily-devotee': {
      current: Math.min(profile.totalGamesPlayed + profile.totalPuzzlesSolved, 100),
      target: 100,
    },
    // Add more as needed
  };

  const progress = progressMap[achievementId] || { current: 0, target: 1 };
  const percentage = Math.min(100, (progress.current / progress.target) * 100);

  return { ...progress, percentage };
}

/**
 * Get recommended next achievement
 */
export function getRecommendedAchievement(): Achievement | null {
  const { achievements } = useUserStore.getState();

  const unlockedIds = achievements.filter(a => a.unlocked).map(a => a.id);
  const locked = ALL_ACHIEVEMENTS.filter(a => !unlockedIds.includes(a.id));

  // Find the achievement with the highest progress
  let bestAchievement: Achievement | null = null;
  let bestProgress = 0;

  for (const achievement of locked) {
    const progress = getAchievementProgress(achievement.id);
    if (progress.percentage > bestProgress) {
      bestProgress = progress.percentage;
      bestAchievement = achievement;
    }
  }

  return bestAchievement;
}
