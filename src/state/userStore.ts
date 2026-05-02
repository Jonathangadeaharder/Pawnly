/**
 * User State Store
 * Manages user profile, progress, and achievements using SQLite
 */

import { create } from 'zustand';
import type { UserState, UserProfile, Achievement, SRSItem, Weakness, SimpleGameHistory } from '../types';
import { ALL_ACHIEVEMENTS } from '../constants/achievements';
import {
  getUserProfile,
  saveUserProfile,
  getSRSItems,
  saveSRSItem,
  deleteSRSItem,
  getDueSRSItems as getSQLiteDueSRSItems,
  getGameHistory,
  saveGame,
  getWeaknesses,
  saveWeakness,
  clearAllData,
  getTacticalProgression,
  saveTacticalProgression,
  getTacticalAnalytics,
  saveTacticalAnalytics,
} from '../services/storage/sqliteService';
import { migrateToSQLite } from '../services/storage/migrationService';
import {
  initializeProgression,
  updateProgressionAfterSession,
} from '../services/tacticalProgressionService';
import {
  initializeTacticalAnalytics,
  updateAnalyticsAfterSession,
  type TacticalAnalytics,
} from '../services/tacticalAnalyticsService';
import type { DrillStats } from '../types';
import type { TacticalDrill } from '../constants/tacticalDrills';

interface UserStore extends UserState {
  // Loading state
  isLoading: boolean;
  error: string | null;

  // Actions
  loadUserProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  incrementStreak: () => Promise<void>;
  addXP: (amount: number) => void;
  unlockAchievement: (achievementId: string) => void;
  completeLesson: (lessonId: string, estimatedMinutes: number) => Promise<void>;
  addSRSItem: (item: SRSItem) => Promise<void>;
  updateSRSItem: (itemId: string, updates: Partial<SRSItem>) => Promise<void>;
  removeSRSItem: (itemId: string) => Promise<void>;
  getDueSRSItems: () => SRSItem[];
  addWeakness: (weakness: Weakness) => Promise<void>;
  addGameToHistory: (session: SimpleGameHistory) => Promise<void>;
  resetProgress: () => Promise<void>;
  updateTacticalProgression: (stats: DrillStats) => Promise<void>;
  updateTacticalAnalytics: (sessionStats: any, drillDetails: TacticalDrill[]) => Promise<void>;
}

// Default user profile
const createDefaultProfile = (): UserProfile => ({
  id: Date.now().toString(),
  username: 'ChessLearner',
  email: '',
  createdAt: new Date(),
  selectedSystem: 'kings-indian-attack',
  playstyle: 'balanced',
  boardTheme: 'modern',
  pieceTheme: 'modern',
  coachPersonality: 'friendly',
  totalXP: 0,
  level: 1,
  currentStreak: 0,
  longestStreak: 0,
  lastPracticeDate: null,
  unlockedThemes: ['modern'],
  unlockedCoaches: ['friendly'],
  unlockedMiniGames: [],
  totalGamesPlayed: 0,
  totalPuzzlesSolved: 0,
  totalStudyTime: 0,
  completedLessons: [],
});

export const useUserStore = create<UserStore>((set, get) => ({
  // Initial state
  profile: null,
  achievements: [],
  srsQueue: [],
  weaknesses: [],
  gameHistory: [],
  tacticalProgression: null,
  tacticalAnalytics: null,
  isLoading: false,
  error: null,

  // Load user profile from SQLite
  loadUserProfile: async () => {
    set({ isLoading: true, error: null });

    try {
      // Run migration if needed
      await migrateToSQLite();

      // Load data from SQLite
      const [profile, srsQueue, gameHistory, weaknesses, tacticalProgression, tacticalAnalytics] = await Promise.all([
        getUserProfile(),
        getSRSItems(),
        getGameHistory(50),
        getWeaknesses(50),
        getTacticalProgression(),
        getTacticalAnalytics(),
      ]);

      set({
        profile: profile || createDefaultProfile(),
        achievements: ALL_ACHIEVEMENTS,
        srsQueue,
        gameHistory,
        weaknesses,
        tacticalProgression: tacticalProgression || initializeProgression(),
        tacticalAnalytics: tacticalAnalytics || initializeTacticalAnalytics(),
        isLoading: false,
      });

      // Save defaults if none exist
      if (!profile) {
        await saveUserProfile(createDefaultProfile());
      }
      if (!tacticalProgression) {
        await saveTacticalProgression(initializeProgression());
      }
      if (!tacticalAnalytics) {
        await saveTacticalAnalytics(initializeTacticalAnalytics());
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      set({ error: 'Failed to load user profile', isLoading: false });
    }
  },

  // Update user profile
  updateProfile: async (updates: Partial<UserProfile>) => {
    const currentProfile = get().profile;
    if (!currentProfile) return;

    const updatedProfile = { ...currentProfile, ...updates };

    try {
      await saveUserProfile(updatedProfile);
      set({ profile: updatedProfile });
    } catch (error) {
      console.error('Error updating profile:', error);
      set({ error: 'Failed to update profile' });
    }
  },

  // Increment daily streak
  incrementStreak: async () => {
    const { profile, updateProfile } = get();
    if (!profile) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastPractice = profile.lastPracticeDate
      ? new Date(profile.lastPracticeDate)
      : null;

    if (lastPractice) {
      lastPractice.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor(
        (today.getTime() - lastPractice.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysDiff === 0) {
        // Already practiced today
        return;
      } else if (daysDiff === 1) {
        // Consecutive day
        const newStreak = profile.currentStreak + 1;
        await updateProfile({
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, profile.longestStreak),
          lastPracticeDate: new Date(),
        });
      } else {
        // Streak broken
        await updateProfile({
          currentStreak: 1,
          lastPracticeDate: new Date(),
        });
      }
    } else {
      // First practice
      await updateProfile({
        currentStreak: 1,
        lastPracticeDate: new Date(),
      });
    }
  },

  // Add XP and level up
  addXP: (amount: number) => {
    const { profile, updateProfile } = get();
    if (!profile) return;

    const newXP = profile.totalXP + amount;
    const newLevel = Math.floor(newXP / 1000) + 1; // Level up every 1000 XP

    updateProfile({
      totalXP: newXP,
      level: newLevel,
    });
  },

  // Unlock achievement
  unlockAchievement: (achievementId: string) => {
    const { achievements } = get();
    const achievement = achievements.find((a) => a.id === achievementId);

    if (achievement && !achievement.unlocked) {
      const updatedAchievements = achievements.map((a) =>
        a.id === achievementId
          ? { ...a, unlocked: true, unlockedAt: new Date() }
          : a
      );

      set({ achievements: updatedAchievements });

      // Award XP
      get().addXP(achievement.xpReward);
    }
  },

  // Complete lesson
  completeLesson: async (lessonId: string, estimatedMinutes: number) => {
    const { profile, updateProfile } = get();
    if (!profile) return;

    // Check if already completed
    if (profile.completedLessons.includes(lessonId)) return;

    // Add to completed lessons
    const updatedCompletedLessons = [...profile.completedLessons, lessonId];

    // Award XP (10 XP per estimated minute)
    get().addXP(estimatedMinutes * 10);

    // Update study time
    await updateProfile({
      completedLessons: updatedCompletedLessons,
      totalStudyTime: profile.totalStudyTime + estimatedMinutes,
    });
  },

  // SRS Management
  addSRSItem: async (item: SRSItem) => {
    const { srsQueue } = get();
    const updatedQueue = [...srsQueue, item];

    set({ srsQueue: updatedQueue });
    await saveSRSItem(item);
  },

  updateSRSItem: async (itemId: string, updates: Partial<SRSItem>) => {
    const { srsQueue } = get();
    const item = srsQueue.find((i) => i.id === itemId);

    if (!item) return;

    const updatedItem = { ...item, ...updates };
    const updatedQueue = srsQueue.map((i) =>
      i.id === itemId ? updatedItem : i
    );

    set({ srsQueue: updatedQueue });
    await saveSRSItem(updatedItem);
  },

  removeSRSItem: async (itemId: string) => {
    const { srsQueue } = get();
    const updatedQueue = srsQueue.filter((item) => item.id !== itemId);

    set({ srsQueue: updatedQueue });
    await deleteSRSItem(itemId);
  },

  getDueSRSItems: () => {
    const { srsQueue } = get();
    const now = new Date();

    return srsQueue.filter(
      (item) => new Date(item.nextReviewDate) <= now
    );
  },

  // Weakness tracking
  addWeakness: async (weakness: Weakness) => {
    const { weaknesses } = get();
    await saveWeakness(weakness);

    // Reload weaknesses from database to get updated frequencies
    const updatedWeaknesses = await getWeaknesses(50);
    set({ weaknesses: updatedWeaknesses });
  },

  // Game history
  addGameToHistory: async (session: SimpleGameHistory) => {
    const { gameHistory, profile, updateProfile } = get();
    const updatedHistory = [session, ...gameHistory].slice(0, 50); // Keep last 50 games

    set({ gameHistory: updatedHistory });
    await saveGame(session);

    // Update statistics
    if (profile) {
      await updateProfile({
        totalGamesPlayed: profile.totalGamesPlayed + 1,
      });
    }
  },

  // Reset all progress
  resetProgress: async () => {
    const defaultProfile = createDefaultProfile();
    set({
      profile: defaultProfile,
      achievements: ALL_ACHIEVEMENTS,
      srsQueue: [],
      weaknesses: [],
      gameHistory: [],
      tacticalProgression: initializeProgression(),
      tacticalAnalytics: initializeTacticalAnalytics(),
    });

    await clearAllData();
    await saveUserProfile(defaultProfile);
    await saveTacticalProgression(initializeProgression());
    await saveTacticalAnalytics(initializeTacticalAnalytics());
  },

  // Update tactical progression after drill session
  updateTacticalProgression: async (stats: DrillStats) => {
    const { tacticalProgression, profile, addXP } = get();

    if (!tacticalProgression) return;

    // Update progression state
    const updatedProgression = updateProgressionAfterSession(tacticalProgression, stats);

    set({ tacticalProgression: updatedProgression });
    await saveTacticalProgression(updatedProgression);

    // Award XP based on performance
    const xpEarned = Math.floor(stats.correct * 5 + stats.flashCount * 3);
    addXP(xpEarned);

    // Update puzzle stats
    if (profile) {
      const { updateProfile } = get();
      await updateProfile({
        totalPuzzlesSolved: profile.totalPuzzlesSolved + stats.totalAttempts,
      });
    }
  },

  // Update tactical analytics after drill session
  updateTacticalAnalytics: async (sessionStats, drillDetails) => {
    const { tacticalAnalytics } = get();

    if (!tacticalAnalytics) return;

    const updatedAnalytics = updateAnalyticsAfterSession(tacticalAnalytics, sessionStats, drillDetails);

    set({ tacticalAnalytics: updatedAnalytics });
    await saveTacticalAnalytics(updatedAnalytics);
  },
}));
