/**
 * Tactical Analytics Service
 * Comprehensive tracking for tactical drill performance, daily goals, pattern weaknesses, and adaptive difficulty
 */

import type { TacticalMotif, ELORating, TacticalDrill } from '../constants/tacticalDrills';
import type { DrillStats } from '../types';

export interface PatternStats {
  motif: TacticalMotif;
  totalAttempts: number;
  correct: number;
  accuracy: number;
  flashCount: number;
  fastCount: number;
  averageTime: number;
  bestTime: number;
  lastPracticed?: Date;
  needsWork: boolean; // True if accuracy < 70% or speed < 50%
}

export interface DailyGoal {
  date: string; // YYYY-MM-DD format
  targetDrills: number;
  completedDrills: number;
  flashCount: number;
  accuracy: number;
  completed: boolean;
}

export interface FailedPuzzle {
  drill: TacticalDrill;
  attemptDate: Date;
  timeUsed: number;
  wrongMoves: number;
  nextReview: Date;
  reviewCount: number;
  stability: number; // FSRS-like stability
}

export interface AdaptiveSettings {
  currentELO: ELORating;
  timeMultiplier: number; // 0.8 to 1.2 - adjusts time limits
  recommendedPatterns: TacticalMotif[]; // Patterns that need work
  shouldIncreaseTime: boolean;
  shouldDecreaseTime: boolean;
}

export interface TacticalAnalytics {
  // Overall stats
  totalDrills: number;
  totalFlashSolves: number;
  totalFastSolves: number;
  overallAccuracy: number;
  averageTime: number;

  // Pattern-specific tracking
  patternStats: Record<TacticalMotif, PatternStats>;

  // Daily goals
  currentDailyGoal: DailyGoal;
  dailyGoalHistory: DailyGoal[];
  dailyGoalStreak: number;

  // Failed puzzle queue (spaced repetition)
  failedPuzzles: FailedPuzzle[];

  // Adaptive difficulty
  adaptiveSettings: AdaptiveSettings;

  // Achievement tracking
  perfectStreakCount: number;
  currentPerfectStreak: number;
  drillsWithHighAccuracy: number; // 95%+ accuracy

  // Last update timestamp
  lastUpdated: Date;
}

/**
 * Initialize tactical analytics
 */
export function initializeTacticalAnalytics(): TacticalAnalytics {
  const today = new Date().toISOString().split('T')[0];

  // Initialize pattern stats for all motifs
  const motifs: TacticalMotif[] = [
    'fork', 'hanging-piece', 'pin', 'discovered-attack', 'skewer',
    'back-rank-mate', 'double-attack', 'deflection', 'x-ray', 'trapped-piece',
    'removing-defender', 'greek-gift', 'zwischenzug', 'desperado',
    'smothered-mate', 'attraction', 'clearance', 'interference',
  ];

  const patternStats: Record<TacticalMotif, PatternStats> = {} as Record<TacticalMotif, PatternStats>;
  motifs.forEach((motif) => {
    patternStats[motif] = {
      motif,
      totalAttempts: 0,
      correct: 0,
      accuracy: 0,
      flashCount: 0,
      fastCount: 0,
      averageTime: 0,
      bestTime: Infinity,
      needsWork: false,
    };
  });

  return {
    totalDrills: 0,
    totalFlashSolves: 0,
    totalFastSolves: 0,
    overallAccuracy: 0,
    averageTime: 0,
    patternStats,
    currentDailyGoal: {
      date: today,
      targetDrills: 20,
      completedDrills: 0,
      flashCount: 0,
      accuracy: 0,
      completed: false,
    },
    dailyGoalHistory: [],
    dailyGoalStreak: 0,
    failedPuzzles: [],
    adaptiveSettings: {
      currentELO: 800,
      timeMultiplier: 1.0,
      recommendedPatterns: ['fork', 'hanging-piece', 'pin', 'discovered-attack'],
      shouldIncreaseTime: false,
      shouldDecreaseTime: false,
    },
    perfectStreakCount: 0,
    currentPerfectStreak: 0,
    drillsWithHighAccuracy: 0,
    lastUpdated: new Date(),
  };
}

/**
 * Update analytics after drill session
 */
export function updateAnalyticsAfterSession(
  analytics: TacticalAnalytics,
  sessionStats: DrillStats,
  drillDetails: Array<{
    drill: TacticalDrill;
    correct: boolean;
    speedRating: string;
    timeUsed: number;
  }>
): TacticalAnalytics {
  const updated = { ...analytics };

  // Update overall stats
  updated.totalDrills += sessionStats.totalAttempts;
  updated.totalFlashSolves += sessionStats.flashCount;
  updated.totalFastSolves += sessionStats.fastCount;
  updated.overallAccuracy =
    ((analytics.overallAccuracy * analytics.totalDrills) +
      (sessionStats.accuracy * sessionStats.totalAttempts)) /
    updated.totalDrills;
  updated.averageTime =
    ((analytics.averageTime * analytics.totalDrills) +
      (sessionStats.averageTime * sessionStats.totalAttempts)) /
    updated.totalDrills;

  // Update pattern stats
  drillDetails.forEach((detail) => {
    const motif = detail.drill.motif;
    const stats = updated.patternStats[motif];

    stats.totalAttempts++;
    if (detail.correct) stats.correct++;
    stats.accuracy = (stats.correct / stats.totalAttempts) * 100;

    if (detail.speedRating === 'flash') stats.flashCount++;
    if (detail.speedRating === 'fast') stats.fastCount++;

    stats.averageTime =
      ((stats.averageTime * (stats.totalAttempts - 1)) + detail.timeUsed) /
      stats.totalAttempts;

    if (detail.timeUsed < stats.bestTime && detail.correct) {
      stats.bestTime = detail.timeUsed;
    }

    stats.lastPracticed = new Date();
    stats.needsWork = stats.accuracy < 70 || ((stats.flashCount + stats.fastCount) / stats.totalAttempts) < 0.5;

    // Add to failed puzzle queue if incorrect or too slow
    if (!detail.correct || detail.speedRating === 'too-slow') {
      addFailedPuzzle(updated, detail.drill, detail.timeUsed);
    }
  });

  // Update daily goal
  updateDailyGoal(updated, sessionStats);

  // Update perfect streak
  if (sessionStats.accuracy === 100) {
    updated.currentPerfectStreak++;
    if (updated.currentPerfectStreak >= 10) {
      updated.perfectStreakCount++;
    }
  } else {
    updated.currentPerfectStreak = 0;
  }

  // Track high-accuracy drills
  if (sessionStats.accuracy >= 95) {
    updated.drillsWithHighAccuracy++;
  }

  // Update adaptive settings
  updateAdaptiveSettings(updated, sessionStats);

  updated.lastUpdated = new Date();

  return updated;
}

/**
 * Update daily goal progress
 */
function updateDailyGoal(analytics: TacticalAnalytics, sessionStats: DrillStats): void {
  const today = new Date().toISOString().split('T')[0];

  // Check if we need a new daily goal
  if (analytics.currentDailyGoal.date !== today) {
    // Archive old goal if it existed
    if (analytics.currentDailyGoal.completedDrills > 0) {
      analytics.dailyGoalHistory.push({ ...analytics.currentDailyGoal });

      // Update streak
      if (analytics.currentDailyGoal.completed) {
        analytics.dailyGoalStreak++;
      } else {
        analytics.dailyGoalStreak = 0;
      }
    }

    // Create new goal
    analytics.currentDailyGoal = {
      date: today,
      targetDrills: 20,
      completedDrills: 0,
      flashCount: 0,
      accuracy: 0,
      completed: false,
    };
  }

  // Update current goal
  const goal = analytics.currentDailyGoal;
  goal.completedDrills += sessionStats.totalAttempts;
  goal.flashCount += sessionStats.flashCount;
  goal.accuracy =
    ((goal.accuracy * (goal.completedDrills - sessionStats.totalAttempts)) +
      (sessionStats.accuracy * sessionStats.totalAttempts)) /
    goal.completedDrills;
  goal.completed = goal.completedDrills >= goal.targetDrills;
}

/**
 * Add failed puzzle to spaced repetition queue
 */
function addFailedPuzzle(
  analytics: TacticalAnalytics,
  drill: TacticalDrill,
  timeUsed: number
): void {
  // Check if puzzle already in queue
  const existingIndex = analytics.failedPuzzles.findIndex((p) => p.drill.id === drill.id);

  if (existingIndex >= 0) {
    // Update existing entry
    const existing = analytics.failedPuzzles[existingIndex];
    existing.reviewCount++;
    existing.attemptDate = new Date();
    existing.timeUsed = timeUsed;

    // Calculate next review using simplified FSRS
    existing.stability = Math.max(1, existing.stability * 0.5); // Decrease stability on fail
    const interval = Math.max(1, existing.stability); // At least 1 day
    existing.nextReview = new Date(Date.now() + interval * 24 * 60 * 60 * 1000);
  } else {
    // Add new failed puzzle
    analytics.failedPuzzles.push({
      drill,
      attemptDate: new Date(),
      timeUsed,
      wrongMoves: 1,
      nextReview: new Date(Date.now() + 24 * 60 * 60 * 1000), // Review tomorrow
      reviewCount: 1,
      stability: 1,
    });
  }

  // Limit queue size to 50 most recent
  if (analytics.failedPuzzles.length > 50) {
    analytics.failedPuzzles.sort((a, b) => b.attemptDate.getTime() - a.attemptDate.getTime());
    analytics.failedPuzzles = analytics.failedPuzzles.slice(0, 50);
  }
}

/**
 * Get failed puzzles due for review
 */
export function getDueFailedPuzzles(analytics: TacticalAnalytics): FailedPuzzle[] {
  const now = new Date();
  return analytics.failedPuzzles.filter((p) => p.nextReview <= now);
}

/**
 * Mark failed puzzle as mastered
 */
export function markPuzzleMastered(
  analytics: TacticalAnalytics,
  drillId: string
): TacticalAnalytics {
  return {
    ...analytics,
    failedPuzzles: analytics.failedPuzzles.filter((p) => p.drill.id !== drillId),
  };
}

/**
 * Update adaptive difficulty settings
 */
function updateAdaptiveSettings(
  analytics: TacticalAnalytics,
  sessionStats: DrillStats
): void {
  const settings = analytics.adaptiveSettings;

  // Adjust time multiplier based on performance
  if (sessionStats.accuracy < 60 || sessionStats.slowCount > sessionStats.totalAttempts / 2) {
    // Struggling - increase time
    settings.timeMultiplier = Math.min(1.2, settings.timeMultiplier + 0.05);
    settings.shouldIncreaseTime = true;
    settings.shouldDecreaseTime = false;
  } else if (
    sessionStats.accuracy >= 90 &&
    (sessionStats.flashCount + sessionStats.fastCount) / sessionStats.totalAttempts >= 0.7
  ) {
    // Crushing it - decrease time
    settings.timeMultiplier = Math.max(0.8, settings.timeMultiplier - 0.05);
    settings.shouldDecreaseTime = true;
    settings.shouldIncreaseTime = false;
  } else {
    settings.shouldIncreaseTime = false;
    settings.shouldDecreaseTime = false;
  }

  // Update recommended patterns
  const weakPatterns = Object.values(analytics.patternStats)
    .filter((p) => p.needsWork && p.totalAttempts >= 5)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 4)
    .map((p) => p.motif);

  if (weakPatterns.length > 0) {
    settings.recommendedPatterns = weakPatterns;
  }

  settings.currentELO = sessionStats.currentELO;
}

/**
 * Get pattern weaknesses report
 */
export function getPatternWeaknessReport(analytics: TacticalAnalytics): {
  critical: PatternStats[];
  needsWork: PatternStats[];
  proficient: PatternStats[];
} {
  const patterns = Object.values(analytics.patternStats).filter((p) => p.totalAttempts >= 3);

  return {
    critical: patterns.filter((p) => p.accuracy < 50).sort((a, b) => a.accuracy - b.accuracy),
    needsWork: patterns.filter((p) => p.accuracy >= 50 && p.accuracy < 80).sort((a, b) => a.accuracy - b.accuracy),
    proficient: patterns.filter((p) => p.accuracy >= 80).sort((a, b) => b.accuracy - a.accuracy),
  };
}

/**
 * Get daily goal progress percentage
 */
export function getDailyGoalProgress(analytics: TacticalAnalytics): number {
  return Math.min(
    100,
    (analytics.currentDailyGoal.completedDrills / analytics.currentDailyGoal.targetDrills) * 100
  );
}

/**
 * Get recommended training focus
 */
export function getRecommendedTraining(analytics: TacticalAnalytics): {
  focusPattern: TacticalMotif | null;
  reason: string;
  priority: 'high' | 'medium' | 'low';
} {
  const weaknesses = getPatternWeaknessReport(analytics);

  if (weaknesses.critical.length > 0) {
    return {
      focusPattern: weaknesses.critical[0].motif,
      reason: `Critical weakness: ${Math.round(weaknesses.critical[0].accuracy)}% accuracy on ${weaknesses.critical[0].motif}`,
      priority: 'high',
    };
  }

  if (weaknesses.needsWork.length > 0) {
    return {
      focusPattern: weaknesses.needsWork[0].motif,
      reason: `Needs improvement: ${Math.round(weaknesses.needsWork[0].accuracy)}% accuracy`,
      priority: 'medium',
    };
  }

  // Check for patterns not practiced recently
  const unpracticed = Object.values(analytics.patternStats)
    .filter((p) => p.totalAttempts === 0)
    .slice(0, 1);

  if (unpracticed.length > 0) {
    return {
      focusPattern: unpracticed[0].motif,
      reason: 'Expand your pattern recognition',
      priority: 'low',
    };
  }

  return {
    focusPattern: null,
    reason: 'All patterns proficient - maintain your skills!',
    priority: 'low',
  };
}

/**
 * Generate achievement stats for checking unlocks
 */
export function generateAchievementStats(
  analytics: TacticalAnalytics
): {
  totalTacticalDrills: number;
  tacticalFlashCount: number;
  tacticalAccuracyHigh: number;
  averageTacticalTime: number;
  unlockedTiers: number[];
  patternMastery: Record<string, number>;
  forkFlashCount: number;
  pinFlashCount: number;
  perfectStreakCount: number;
  drillsToday: number;
} {
  return {
    totalTacticalDrills: analytics.totalDrills,
    tacticalFlashCount: analytics.totalFlashSolves,
    tacticalAccuracyHigh: analytics.drillsWithHighAccuracy,
    averageTacticalTime: analytics.averageTime,
    unlockedTiers: [], // Populated from tactical progression
    patternMastery: Object.fromEntries(
      Object.entries(analytics.patternStats).map(([key, stats]) => [key, stats.correct])
    ),
    forkFlashCount: analytics.patternStats.fork?.flashCount || 0,
    pinFlashCount: analytics.patternStats.pin?.flashCount || 0,
    perfectStreakCount: analytics.perfectStreakCount,
    drillsToday: analytics.currentDailyGoal.completedDrills,
  };
}
