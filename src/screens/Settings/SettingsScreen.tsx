/**
 * Settings Screen
 * User preferences and app configuration
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import { useUIStore } from '../../state/uiStore';
import { Colors, Typography, Spacing, BorderRadius, BoardThemes } from '../../constants/theme';
import type { BoardThemeName } from '../../constants/theme';
import type { InteractionMode } from '../../types';

export default function SettingsScreen() {
  const {
    boardTheme,
    hapticsEnabled,
    soundEnabled,
    setBoardTheme,
    setHapticsEnabled,
    setSoundEnabled,
  } = useUIStore();

  const [selectedInteractionMode, setSelectedInteractionMode] = useState<InteractionMode>('both');

  const boardThemes: Array<{ id: BoardThemeName; name: string }> = [
    { id: 'modern', name: 'Modern' },
    { id: 'wood', name: 'Wooden' },
    { id: 'neo', name: 'Neo' },
    { id: 'green', name: 'Classic Green' },
    { id: 'blue', name: 'Ocean Blue' },
  ];

  const interactionModes: Array<{ id: InteractionMode; name: string; description: string }> = [
    { id: 'tap-tap', name: 'Tap-Tap', description: 'Classic two-tap mode' },
    { id: 'drag-drop', name: 'Drag & Drop', description: 'Drag pieces to move' },
    { id: 'both', name: 'Both', description: 'Use either method' },
  ];

  const handleThemeChange = (theme: BoardThemeName) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setBoardTheme(theme);
  };

  const handleInteractionModeChange = (mode: InteractionMode) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setSelectedInteractionMode(mode);
    // This would be saved to user preferences
  };

  const handleHapticsToggle = (value: boolean) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setHapticsEnabled(value);
  };

  const handleSoundToggle = (value: boolean) => {
    if (hapticsEnabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    setSoundEnabled(value);
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Settings</Text>
          <Text style={styles.headerSubtitle}>Customize your chess experience</Text>
        </View>

        {/* Board Theme Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Board Theme</Text>
          <View style={styles.themeGrid}>
            {boardThemes.map(theme => (
              <TouchableOpacity
                key={theme.id}
                style={[
                  styles.themeCard,
                  boardTheme === theme.id && styles.themeCardSelected,
                ]}
                onPress={() => handleThemeChange(theme.id)}
              >
                <View
                  style={[
                    styles.themePreview,
                    { backgroundColor: getThemePreviewColor(theme.id) },
                  ]}
                />
                <Text
                  style={[
                    styles.themeName,
                    boardTheme === theme.id && styles.themeNameSelected,
                  ]}
                >
                  {theme.name}
                </Text>
                {boardTheme === theme.id && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.success}
                    style={styles.themeCheck}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Interaction Mode Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Interaction Mode</Text>
          <Text style={styles.sectionDescription}>
            Choose how you prefer to move pieces on the board
          </Text>
          {interactionModes.map(mode => (
            <TouchableOpacity
              key={mode.id}
              style={[
                styles.optionCard,
                selectedInteractionMode === mode.id && styles.optionCardSelected,
              ]}
              onPress={() => handleInteractionModeChange(mode.id)}
            >
              <View style={styles.optionContent}>
                <Text
                  style={[
                    styles.optionTitle,
                    selectedInteractionMode === mode.id && styles.optionTitleSelected,
                  ]}
                >
                  {mode.name}
                </Text>
                <Text style={styles.optionDescription}>{mode.description}</Text>
              </View>
              {selectedInteractionMode === mode.id && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Audio & Feedback Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Audio & Feedback</Text>

          {/* Haptics Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Haptic Feedback</Text>
              <Text style={styles.toggleDescription}>
                Feel vibrations when making moves
              </Text>
            </View>
            <Switch
              value={hapticsEnabled}
              onValueChange={handleHapticsToggle}
              trackColor={{ false: Colors.border, true: Colors.success }}
              thumbColor={Colors.textInverse}
            />
          </View>

          {/* Sound Toggle */}
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleTitle}>Sound Effects</Text>
              <Text style={styles.toggleDescription}>
                Play sounds for moves and events
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              trackColor={{ false: Colors.border, true: Colors.success }}
              thumbColor={Colors.textInverse}
            />
          </View>
        </View>

        {/* App Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>0.9.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>Phase 9 Complete</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.infoValue}>React Native + Expo</Text>
            </View>
          </View>
        </View>

        {/* Stats Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Content Library</Text>
          <View style={styles.statsCard}>
            <View style={styles.statRow}>
              <Ionicons name="book" size={20} color={Colors.primary} />
              <Text style={styles.statText}>15 Lessons across 5 opening systems</Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="school" size={20} color={Colors.primary} />
              <Text style={styles.statText}>20 Concept cards for strategic learning</Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="flash" size={20} color={Colors.primary} />
              <Text style={styles.statText}>15 Tactical puzzles (3 difficulty levels)</Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="game-controller" size={20} color={Colors.primary} />
              <Text style={styles.statText}>4 Mini-games for skill training</Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="trophy" size={20} color={Colors.primary} />
              <Text style={styles.statText}>17 Achievements to unlock</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

// Helper function to get preview color for themes
function getThemePreviewColor(theme: BoardThemeName): string {
  const themeObj = BoardThemes[theme];
  return themeObj?.light || '#F0D9B5';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
  },
  header: {
    paddingVertical: Spacing.lg,
  },
  headerTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  sectionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  themeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  themeCard: {
    width: '30%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardSelected: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '20',
  },
  themePreview: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  themeName: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  themeNameSelected: {
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  themeCheck: {
    position: 'absolute',
    top: Spacing.xs,
    right: Spacing.xs,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionCardSelected: {
    borderColor: Colors.success,
    backgroundColor: Colors.success + '20',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  optionTitleSelected: {
    color: Colors.text,
  },
  optionDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  toggleInfo: {
    flex: 1,
    marginRight: Spacing.md,
  },
  toggleTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  toggleDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  infoCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  statsCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
  },
  statText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    marginLeft: Spacing.md,
  },
});
