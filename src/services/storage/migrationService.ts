/**
 * Migration Service
 * Handles migrating data from AsyncStorage to SQLite
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  initDatabase,
  saveUserProfile,
  saveSRSItem,
  saveGame,
  saveWeakness,
} from './sqliteService';
import type { UserProfile, SRSItem, SimpleGameHistory, Weakness } from '../../types';

const MIGRATION_KEY = '@migration_completed';

/**
 * Check if migration has been completed
 */
export async function isMigrationCompleted(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(MIGRATION_KEY);
    return value === 'true';
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Mark migration as completed
 */
async function markMigrationComplete(): Promise<void> {
  await AsyncStorage.setItem(MIGRATION_KEY, 'true');
}

/**
 * Migrate all data from AsyncStorage to SQLite
 */
export async function migrateToSQLite(): Promise<void> {
  try {
    console.log('Starting migration from AsyncStorage to SQLite...');

    // Initialize SQLite database
    await initDatabase();

    // Check if migration already completed
    const migrationDone = await isMigrationCompleted();
    if (migrationDone) {
      console.log('Migration already completed');
      return;
    }

    // Migrate user profile
    await migrateUserProfile();

    // Migrate SRS items
    await migrateSRSItems();

    // Migrate game history
    await migrateGameHistory();

    // Migrate weaknesses
    await migrateWeaknesses();

    // Mark migration as complete
    await markMigrationComplete();

    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

/**
 * Migrate user profile data
 */
async function migrateUserProfile(): Promise<void> {
  try {
    const profileData = await AsyncStorage.getItem('@user_profile');
    if (profileData) {
      const profile: UserProfile = JSON.parse(profileData);

      // Convert date strings to Date objects if needed
      if (typeof profile.createdAt === 'string') {
        profile.createdAt = new Date(profile.createdAt);
      }
      if (profile.lastPracticeDate && typeof profile.lastPracticeDate === 'string') {
        profile.lastPracticeDate = new Date(profile.lastPracticeDate);
      }

      await saveUserProfile(profile);
      console.log('User profile migrated successfully');
    }
  } catch (error) {
    console.error('Error migrating user profile:', error);
  }
}

/**
 * Migrate SRS items
 */
async function migrateSRSItems(): Promise<void> {
  try {
    const srsData = await AsyncStorage.getItem('@srs_queue');
    if (srsData) {
      const srsItems: SRSItem[] = JSON.parse(srsData);

      for (const item of srsItems) {
        // Convert date strings to Date objects if needed
        if (typeof item.nextReviewDate === 'string') {
          item.nextReviewDate = new Date(item.nextReviewDate);
        }
        if (item.lastReviewDate && typeof item.lastReviewDate === 'string') {
          item.lastReviewDate = new Date(item.lastReviewDate);
        }
        if (typeof item.createdAt === 'string') {
          item.createdAt = new Date(item.createdAt);
        }

        await saveSRSItem(item);
      }

      console.log(`Migrated ${srsItems.length} SRS items`);
    }
  } catch (error) {
    console.error('Error migrating SRS items:', error);
  }
}

/**
 * Migrate game history
 */
async function migrateGameHistory(): Promise<void> {
  try {
    const gamesData = await AsyncStorage.getItem('@game_history');
    if (gamesData) {
      const games: SimpleGameHistory[] = JSON.parse(gamesData);

      for (const game of games) {
        // Convert date strings to Date objects if needed
        if (typeof game.date === 'string') {
          game.date = new Date(game.date);
        }

        await saveGame(game);
      }

      console.log(`Migrated ${games.length} games`);
    }
  } catch (error) {
    console.error('Error migrating game history:', error);
  }
}

/**
 * Migrate weaknesses
 */
async function migrateWeaknesses(): Promise<void> {
  try {
    const weaknessesData = await AsyncStorage.getItem('@weaknesses');
    if (weaknessesData) {
      const weaknesses: Weakness[] = JSON.parse(weaknessesData);

      for (const weakness of weaknesses) {
        await saveWeakness(weakness);
      }

      console.log(`Migrated ${weaknesses.length} weaknesses`);
    }
  } catch (error) {
    console.error('Error migrating weaknesses:', error);
  }
}

/**
 * Reset migration (for testing purposes)
 */
export async function resetMigration(): Promise<void> {
  await AsyncStorage.removeItem(MIGRATION_KEY);
  console.log('Migration reset');
}
