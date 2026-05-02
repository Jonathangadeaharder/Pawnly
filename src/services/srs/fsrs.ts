/**
 * FSRS (Free Spaced Repetition Scheduler) Algorithm Implementation
 * Modern, state-of-the-art SRS algorithm superior to SM-2
 * Separates Difficulty (how hard to learn) from Stability (how long it stays in memory)
 */

import type { SRSItem, FSRSParams, ReviewResult } from '../../types';

/**
 * Default FSRS parameters
 * These can be customized per user after collecting sufficient data
 */
export const DEFAULT_FSRS_PARAMS: FSRSParams = {
  requestRetention: 0.9, // Target 90% retention rate
  maximumInterval: 365, // Maximum days between reviews (1 year)
  w: [
    0.4, 0.6, 2.4, 5.8, // Initial stability weights
    4.93, 0.94, 0.86, 0.01, // Difficulty weights
    1.49, 0.14, 0.94, 2.18, // Retrievability weights
    0.05, 0.34, 1.26, 0.29, 0.62, // Advanced scheduling weights
  ],
};

/**
 * Calculate the initial stability for a new item based on first rating
 */
function calculateInitialStability(rating: number, params: FSRSParams): number {
  const { w } = params;
  return w[rating - 1];
}

/**
 * Calculate the initial difficulty for a new item
 */
function calculateInitialDifficulty(rating: number): number {
  // Difficulty ranges from 1 (easy) to 10 (hard)
  // Rating 4 (Easy) -> low difficulty
  // Rating 1 (Again) -> high difficulty
  return 11 - 2 * rating;
}

/**
 * Calculate retrievability (probability of recall) at current time
 * R = e^(ln(0.9) * t / S)
 * where t = days since last review, S = stability
 */
function calculateRetrievability(
  daysSinceReview: number,
  stability: number,
  requestRetention: number
): number {
  const retrievability = Math.exp((Math.log(requestRetention) * daysSinceReview) / stability);
  return Math.max(0, Math.min(1, retrievability));
}

/**
 * Update difficulty based on performance
 * Difficulty increases when forgotten, decreases when easily recalled
 */
function updateDifficulty(
  currentDifficulty: number,
  rating: number,
  params: FSRSParams
): number {
  const { w } = params;

  // Mean reversion: difficulty gradually moves toward average (5.5)
  const meanReversion = 0.05;
  const difficultyChange = w[4] * (rating - 3);

  let newDifficulty = currentDifficulty + difficultyChange;
  newDifficulty = newDifficulty + meanReversion * (5.5 - newDifficulty);

  // Clamp between 1 and 10
  return Math.max(1, Math.min(10, newDifficulty));
}

/**
 * Calculate new stability based on previous stability, difficulty, rating, and retrievability
 * This is the core of FSRS's power
 */
function calculateNewStability(
  currentStability: number,
  difficulty: number,
  rating: number,
  retrievability: number,
  params: FSRSParams
): number {
  const { w } = params;

  let newStability: number;

  if (rating === 1) {
    // Again: Item was forgotten
    // Stability decreases but doesn't drop below minimum
    newStability = w[11] * Math.pow(difficulty, -w[12]) * (Math.pow(currentStability + 1, w[13]) - 1);
  } else {
    // Item was recalled (Hard, Good, or Easy)
    // Stability increases based on how well it was recalled
    const successFactor = w[8] * Math.exp(w[9] * (1 - retrievability));
    const difficultyFactor = Math.exp(w[10] * (1 - difficulty / 10));
    const stabilityGrowth = successFactor * difficultyFactor * currentStability;

    newStability = currentStability + stabilityGrowth;
  }

  return Math.max(0.1, newStability); // Minimum stability of 0.1 day
}

/**
 * Calculate the next review interval based on stability and target retention
 */
function calculateInterval(stability: number, requestRetention: number, maximumInterval: number): number {
  // Interval = S * (ln(requestRetention) / ln(0.9))
  const interval = stability * (Math.log(requestRetention) / Math.log(0.9));

  // Round to nearest day and clamp
  return Math.max(1, Math.min(maximumInterval, Math.round(interval)));
}

/**
 * Schedule the next review for an SRS item
 * This is the main function used throughout the app
 */
export function scheduleNextReview(
  item: SRSItem,
  result: ReviewResult,
  params: FSRSParams = DEFAULT_FSRS_PARAMS
): SRSItem {
  const now = new Date();
  const { rating } = result;

  let newDifficulty: number;
  let newStability: number;
  let newRetrievability: number;
  let lapses = item.lapses;

  // Check if this is the first review
  if (item.reviewCount === 0) {
    // Initial review
    newDifficulty = calculateInitialDifficulty(rating);
    newStability = calculateInitialStability(rating, params);
    newRetrievability = 1; // Perfect memory initially
  } else {
    // Subsequent review
    const daysSinceReview = item.lastReviewDate
      ? (now.getTime() - new Date(item.lastReviewDate).getTime()) / (1000 * 60 * 60 * 24)
      : 0;

    // Calculate current retrievability
    const currentRetrievability = calculateRetrievability(
      daysSinceReview,
      item.stability,
      params.requestRetention
    );

    // Update difficulty
    newDifficulty = updateDifficulty(item.difficulty, rating, params);

    // Calculate new stability
    newStability = calculateNewStability(
      item.stability,
      item.difficulty,
      rating,
      currentRetrievability,
      params
    );

    newRetrievability = 1; // Reset after review

    // Track lapses (forgotten items)
    if (rating === 1) {
      lapses++;
    }
  }

  // Calculate next review interval
  const interval = calculateInterval(newStability, params.requestRetention, params.maximumInterval);

  // Calculate next review date
  const nextReviewDate = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);

  return {
    ...item,
    difficulty: newDifficulty,
    stability: newStability,
    retrievability: newRetrievability,
    nextReviewDate,
    lastReviewDate: now,
    reviewCount: item.reviewCount + 1,
    lapses,
  };
}

/**
 * Create a new SRS item
 */
export function createSRSItem(
  id: string,
  type: 'move' | 'concept',
  content: any,
  params: FSRSParams = DEFAULT_FSRS_PARAMS
): SRSItem {
  const now = new Date();

  // New items start with default difficulty and stability
  // They are due immediately
  return {
    id,
    type,
    content,
    difficulty: 5.5, // Start at average difficulty
    stability: 0.4, // Initial stability (from w[0] for "Good" first review)
    retrievability: 1,
    nextReviewDate: now,
    lastReviewDate: null,
    reviewCount: 0,
    lapses: 0,
    createdAt: now,
  };
}

/**
 * Get all items due for review
 */
export function getDueItems(items: SRSItem[]): SRSItem[] {
  const now = new Date();
  return items.filter((item) => new Date(item.nextReviewDate) <= now);
}

/**
 * Calculate forecast: how many items will be due on each future day
 */
export function getForecast(items: SRSItem[], days: number = 30): { [day: number]: number } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const forecast: { [day: number]: number } = {};

  for (let i = 0; i < days; i++) {
    forecast[i] = 0;
  }

  items.forEach((item) => {
    const reviewDate = new Date(item.nextReviewDate);
    reviewDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.floor((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff >= 0 && daysDiff < days) {
      forecast[daysDiff]++;
    }
  });

  return forecast;
}

/**
 * Calculate average difficulty across all items
 * Useful for tracking user's overall progress
 */
export function getAverageDifficulty(items: SRSItem[]): number {
  if (items.length === 0) return 5.5;

  const sum = items.reduce((acc, item) => acc + item.difficulty, 0);
  return sum / items.length;
}

/**
 * Calculate average stability across all items
 * Higher average stability = better long-term retention
 */
export function getAverageStability(items: SRSItem[]): number {
  if (items.length === 0) return 0;

  const sum = items.reduce((acc, item) => acc + item.stability, 0);
  return sum / items.length;
}

/**
 * Calculate retention rate (what % of reviews were successful)
 */
export function calculateRetentionRate(items: SRSItem[]): number {
  if (items.length === 0) return 1;

  const reviewedItems = items.filter((item) => item.reviewCount > 0);
  if (reviewedItems.length === 0) return 1;

  const totalReviews = reviewedItems.reduce((acc, item) => acc + item.reviewCount, 0);
  const totalLapses = reviewedItems.reduce((acc, item) => acc + item.lapses, 0);

  return (totalReviews - totalLapses) / totalReviews;
}
