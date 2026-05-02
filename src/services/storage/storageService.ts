/**
 * Storage Service
 *
 * Provides a type-safe wrapper around AsyncStorage for persisting app data.
 * Handles serialization, error handling, and provides utilities for
 * managing user profile, game history, and UI preferences.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
export const STORAGE_KEYS = {
  USER_PROFILE: '@chess_app:user_profile',
  UI_PREFERENCES: '@chess_app:ui_preferences',
  GAME_HISTORY: '@chess_app:game_history',
  SRS_QUEUE: '@chess_app:srs_queue',
  ACHIEVEMENTS: '@chess_app:achievements',
} as const;

/**
 * Generic function to save data to AsyncStorage
 */
export async function saveData<T>(key: string, data: T): Promise<boolean> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
    return true;
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    return false;
  }
}

/**
 * Generic function to load data from AsyncStorage
 */
export async function loadData<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error loading data for key ${key}:`, error);
    return null;
  }
}

/**
 * Remove data for a specific key
 */
export async function removeData(key: string): Promise<boolean> {
  try {
    await AsyncStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    return false;
  }
}

/**
 * Clear all app data (useful for debugging or reset)
 */
export async function clearAllData(): Promise<boolean> {
  try {
    await AsyncStorage.clear();
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
}

/**
 * Get all keys currently stored
 */
export async function getAllKeys(): Promise<string[]> {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
}

/**
 * Export all data (for backup/migration)
 */
export async function exportAllData(): Promise<Record<string, any> | null> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const pairs = await AsyncStorage.multiGet(keys);

    const data: Record<string, any> = {};
    pairs.forEach(([key, value]) => {
      if (value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = value;
        }
      }
    });

    return data;
  } catch (error) {
    console.error('Error exporting data:', error);
    return null;
  }
}

/**
 * Import data (for restore/migration)
 */
export async function importData(data: Record<string, any>): Promise<boolean> {
  try {
    const pairs = Object.entries(data).map(([key, value]) => [
      key,
      typeof value === 'string' ? value : JSON.stringify(value),
    ]);

    await AsyncStorage.multiSet(pairs);
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

/**
 * Check if data exists for a key
 */
export async function hasData(key: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Error checking data for key ${key}:`, error);
    return false;
  }
}

/**
 * Storage service object for easy access
 */
export const StorageService = {
  save: saveData,
  load: loadData,
  remove: removeData,
  clear: clearAllData,
  getAllKeys,
  export: exportAllData,
  import: importData,
  has: hasData,
  KEYS: STORAGE_KEYS,
};

export default StorageService;
