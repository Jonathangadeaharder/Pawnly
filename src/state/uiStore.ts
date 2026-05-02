/**
 * UI State Store
 * Manages UI preferences and settings
 */

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UIState } from '../types';
import type { BoardThemeName, PieceThemeName } from '../constants/theme';

interface UIStore extends UIState {
  // Actions
  setBoardTheme: (theme: BoardThemeName) => Promise<void>;
  setPieceTheme: (theme: PieceThemeName) => Promise<void>;
  setSoundEnabled: (enabled: boolean) => Promise<void>;
  setHapticsEnabled: (enabled: boolean) => Promise<void>;
  toggleSound: () => Promise<void>;
  toggleHaptics: () => Promise<void>;
  toggleAnimations: () => Promise<void>;
  toggleCoachVoice: () => Promise<void>;
  loadSettings: () => Promise<void>;
}

const SETTINGS_KEY = '@chess_learning_ui_settings';

export const useUIStore = create<UIStore>((set, get) => ({
  // Initial state
  boardTheme: 'modern',
  pieceTheme: 'modern',
  soundEnabled: true,
  hapticsEnabled: true,
  animationsEnabled: true,
  coachVoiceEnabled: true,

  // Load settings from storage
  loadSettings: async () => {
    try {
      const settingsData = await AsyncStorage.getItem(SETTINGS_KEY);
      if (settingsData) {
        const settings = JSON.parse(settingsData);
        set(settings);
      }
    } catch (error) {
      console.error('Error loading UI settings:', error);
    }
  },

  // Save settings helper
  saveSettings: async (settings: Partial<UIState>) => {
    const currentSettings = get();
    const updatedSettings = { ...currentSettings, ...settings };

    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updatedSettings));
      set(settings);
    } catch (error) {
      console.error('Error saving UI settings:', error);
    }
  },

  setBoardTheme: async (theme: BoardThemeName) => {
    const { saveSettings } = get() as any;
    await saveSettings({ boardTheme: theme });
  },

  setPieceTheme: async (theme: PieceThemeName) => {
    const { saveSettings } = get() as any;
    await saveSettings({ pieceTheme: theme });
  },

  setSoundEnabled: async (enabled: boolean) => {
    const { saveSettings } = get() as any;
    await saveSettings({ soundEnabled: enabled });
  },

  setHapticsEnabled: async (enabled: boolean) => {
    const { saveSettings } = get() as any;
    await saveSettings({ hapticsEnabled: enabled });
  },

  toggleSound: async () => {
    const { soundEnabled, saveSettings } = get() as any;
    await saveSettings({ soundEnabled: !soundEnabled });
  },

  toggleHaptics: async () => {
    const { hapticsEnabled, saveSettings } = get() as any;
    await saveSettings({ hapticsEnabled: !hapticsEnabled });
  },

  toggleAnimations: async () => {
    const { animationsEnabled, saveSettings } = get() as any;
    await saveSettings({ animationsEnabled: !animationsEnabled });
  },

  toggleCoachVoice: async () => {
    const { coachVoiceEnabled, saveSettings } = get() as any;
    await saveSettings({ coachVoiceEnabled: !coachVoiceEnabled });
  },
}));
