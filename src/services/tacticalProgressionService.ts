/**
 * Tactical Progression Service
 * Tracks player progress through ELO-tiered tactical training
 *
 * Progression Model:
 * - Start at ELO 800 (unlocked by default)
 * - Must achieve 80% accuracy + 70% fast solves to unlock next tier
 * - Tier unlock is permanent (can't be lost)
 * - Historical stats tracked per tier
 */

import { type ELORating } from '../constants/tacticalDrills';
import type { DrillStats } from '../types';

export interface TierProgress {
  eloRating: ELORating;
  unlocked: boolean;
  totalAttempts: number;
  correct: number;
  accuracy: number;
  flashCount: number;
  fastCount: number;
  goodCount: number;
  slowCount: number;
  failedCount: number;
  averageTime: number;
  bestTime: number;
  sessionsCompleted: number;
  lastSessionDate?: string;
}

export interface TacticalProgressionState {
  currentTier: ELORating;
  highestUnlockedTier: ELORating;
  tierProgress: Record<ELORating, TierProgress>;
  totalDrillsCompleted: number;
  totalFlashSolves: number;
  overallAccuracy: number;
}

const ELO_TIERS: ELORating[] = [800, 1000, 1200, 1400, 1600, 1800, 2000];

/**
 * Initialize progression state
 */
export function initializeProgression(): TacticalProgressionState {
  const tierProgress: Record<ELORating, TierProgress> = {} as Record<ELORating, TierProgress>;

  ELO_TIERS.forEach((elo) => {
    tierProgress[elo] = {
      eloRating: elo,
      unlocked: elo === 800, // Only 800 unlocked by default
      totalAttempts: 0,
      correct: 0,
      accuracy: 0,
      flashCount: 0,
      fastCount: 0,
      goodCount: 0,
      slowCount: 0,
      failedCount: 0,
      averageTime: 0,
      bestTime: Infinity,
      sessionsCompleted: 0,
    };
  });

  return {
    currentTier: 800,
    highestUnlockedTier: 800,
    tierProgress,
    totalDrillsCompleted: 0,
    totalFlashSolves: 0,
    overallAccuracy: 0,
  };
}

/**
 * Update progression after completing a drill session
 */
export function updateProgressionAfterSession(
  currentState: TacticalProgressionState,
  sessionStats: DrillStats
): TacticalProgressionState {
  const tierELO = sessionStats.currentELO;
  const tierData = currentState.tierProgress[tierELO];

  // Update tier-specific stats
  const updatedTierData: TierProgress = {
    ...tierData,
    totalAttempts: tierData.totalAttempts + sessionStats.totalAttempts,
    correct: tierData.correct + sessionStats.correct,
    flashCount: tierData.flashCount + sessionStats.flashCount,
    fastCount: tierData.fastCount + sessionStats.fastCount,
    goodCount: tierData.goodCount + sessionStats.goodCount,
    slowCount: tierData.slowCount + sessionStats.slowCount,
    failedCount: tierData.failedCount + sessionStats.failedCount,
    sessionsCompleted: tierData.sessionsCompleted + 1,
    lastSessionDate: new Date().toISOString(),
  };

  // Recalculate accuracy
  updatedTierData.accuracy =
    updatedTierData.totalAttempts > 0
      ? (updatedTierData.correct / updatedTierData.totalAttempts) * 100
      : 0;

  // Recalculate average time
  updatedTierData.averageTime =
    ((tierData.averageTime * tierData.totalAttempts) +
      (sessionStats.averageTime * sessionStats.totalAttempts)) /
    updatedTierData.totalAttempts;

  // Update best time
  if (sessionStats.averageTime < updatedTierData.bestTime && sessionStats.correct > 0) {
    updatedTierData.bestTime = sessionStats.averageTime;
  }

  // Create updated tier progress
  const updatedTierProgress = {
    ...currentState.tierProgress,
    [tierELO]: updatedTierData,
  };

  // Check if next tier should be unlocked
  let highestUnlocked = currentState.highestUnlockedTier;
  if (sessionStats.canAdvance) {
    const currentIndex = ELO_TIERS.indexOf(tierELO);
    if (currentIndex < ELO_TIERS.length - 1) {
      const nextTier = ELO_TIERS[currentIndex + 1];
      updatedTierProgress[nextTier].unlocked = true;
      highestUnlocked = Math.max(highestUnlocked, nextTier) as ELORating;
    }
  }

  // Calculate overall stats
  const totalDrills = currentState.totalDrillsCompleted + sessionStats.totalAttempts;
  const totalFlash = currentState.totalFlashSolves + sessionStats.flashCount;

  const allCorrect = Object.values(updatedTierProgress).reduce(
    (sum, tier) => sum + tier.correct,
    0
  );
  const allAttempts = Object.values(updatedTierProgress).reduce(
    (sum, tier) => sum + tier.totalAttempts,
    0
  );
  const overallAccuracy = allAttempts > 0 ? (allCorrect / allAttempts) * 100 : 0;

  return {
    ...currentState,
    currentTier: tierELO,
    highestUnlockedTier: highestUnlocked,
    tierProgress: updatedTierProgress,
    totalDrillsCompleted: totalDrills,
    totalFlashSolves: totalFlash,
    overallAccuracy,
  };
}

/**
 * Get available tiers for selection
 */
export function getAvailableTiers(state: TacticalProgressionState): ELORating[] {
  return ELO_TIERS.filter((elo) => state.tierProgress[elo].unlocked);
}

/**
 * Get next tier to unlock
 */
export function getNextTierToUnlock(state: TacticalProgressionState): ELORating | null {
  const currentIndex = ELO_TIERS.indexOf(state.highestUnlockedTier);
  return currentIndex < ELO_TIERS.length - 1 ? ELO_TIERS[currentIndex + 1] : null;
}

/**
 * Get progress toward next tier unlock
 */
export function getUnlockProgress(
  state: TacticalProgressionState,
  tier: ELORating
): {
  accuracyProgress: number;
  speedProgress: number;
  isUnlocked: boolean;
  canUnlock: boolean;
} {
  const tierData = state.tierProgress[tier];

  if (tierData.totalAttempts === 0) {
    return {
      accuracyProgress: 0,
      speedProgress: 0,
      isUnlocked: tierData.unlocked,
      canUnlock: false,
    };
  }

  const accuracyProgress = Math.min((tierData.accuracy / 80) * 100, 100);
  const speedPercentage =
    ((tierData.flashCount + tierData.fastCount) / tierData.totalAttempts) * 100;
  const speedProgress = Math.min((speedPercentage / 70) * 100, 100);

  const canUnlock = tierData.accuracy >= 80 && speedPercentage >= 70;

  return {
    accuracyProgress,
    speedProgress,
    isUnlocked: tierData.unlocked,
    canUnlock,
  };
}

/**
 * Get tier mastery level
 */
export function getTierMasteryLevel(tierData: TierProgress): 'beginner' | 'competent' | 'proficient' | 'master' {
  if (tierData.totalAttempts === 0) return 'beginner';

  const speedPercentage =
    ((tierData.flashCount + tierData.fastCount) / tierData.totalAttempts) * 100;

  if (tierData.accuracy >= 95 && speedPercentage >= 90) return 'master';
  if (tierData.accuracy >= 90 && speedPercentage >= 80) return 'proficient';
  if (tierData.accuracy >= 80 && speedPercentage >= 70) return 'competent';
  return 'beginner';
}

/**
 * Get formatted tier stats for display
 */
export function getFormattedTierStats(tierData: TierProgress): {
  title: string;
  accuracy: string;
  speedRating: string;
  sessions: string;
  bestTime: string;
  masteryLevel: string;
  masteryColor: string;
} {
  const mastery = getTierMasteryLevel(tierData);
  const speedPercentage =
    tierData.totalAttempts > 0
      ? ((tierData.flashCount + tierData.fastCount) / tierData.totalAttempts) * 100
      : 0;

  const masteryColors = {
    beginner: '#94a3b8',
    competent: '#3b82f6',
    proficient: '#8b5cf6',
    master: '#eab308',
  };

  return {
    title: `ELO ${tierData.eloRating}`,
    accuracy: `${tierData.accuracy.toFixed(1)}%`,
    speedRating: `${speedPercentage.toFixed(0)}% Fast`,
    sessions: `${tierData.sessionsCompleted} sessions`,
    bestTime: tierData.bestTime === Infinity ? 'N/A' : `${tierData.bestTime.toFixed(1)}s avg`,
    masteryLevel: mastery.charAt(0).toUpperCase() + mastery.slice(1),
    masteryColor: masteryColors[mastery],
  };
}

/**
 * Generate recommendation for next training focus
 */
export function getTrainingRecommendation(state: TacticalProgressionState): {
  tier: ELORating;
  reason: string;
  focus: string;
} {
  const currentTierData = state.tierProgress[state.currentTier];
  const unlockProgress = getUnlockProgress(state, state.currentTier);

  // If current tier is not yet unlocked for next tier, recommend continuing
  if (!unlockProgress.canUnlock) {
    let focus = '';
    if (currentTierData.accuracy < 80) {
      focus = 'Improve accuracy - you\'re making too many mistakes. Slow down and visualize.';
    } else {
      focus = 'Increase speed - you need to see patterns FASTER. Do more drills.';
    }

    return {
      tier: state.currentTier,
      reason: `Continue mastering ELO ${state.currentTier}`,
      focus,
    };
  }

  // If next tier available, recommend it
  const nextTier = getNextTierToUnlock(state);
  if (nextTier && state.tierProgress[nextTier].unlocked) {
    return {
      tier: nextTier,
      reason: `You've unlocked ELO ${nextTier}!`,
      focus: 'Time to tackle harder patterns. The time limits are stricter!',
    };
  }

  // If at highest tier, recommend mastery
  return {
    tier: state.highestUnlockedTier,
    reason: 'Master the highest tier',
    focus: 'Aim for 95%+ accuracy and 90%+ flash solves!',
  };
}
