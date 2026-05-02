/**
 * Digital Coach Dialog Component
 * Modal interface for Socratic prompts, hints, and guidance
 * Implements the "Dr. Wolf" style pedagogical approach
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useUIStore } from '../../state/uiStore';
import { playSound } from '../../services/audio/soundService';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import type { CoachPrompt, CoachPersonalityName } from '../../types';

interface DigitalCoachDialogProps {
  visible: boolean;
  prompt: CoachPrompt;
  onResponse?: (response: any) => void;
  onDismiss: () => void;
  personality?: CoachPersonalityName;
}

export default function DigitalCoachDialog({
  visible,
  prompt,
  onResponse,
  onDismiss,
  personality = 'friendly',
}: DigitalCoachDialogProps) {
  const { hapticsEnabled, coachVoiceEnabled } = useUIStore();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);

  // Animate in when visible
  useEffect(() => {
    if (visible) {
      // Play notification sound
      playSound('notification');

      if (hapticsEnabled) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }

      // Animate
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
    }
  }, [visible]);

  // Get coach avatar based on personality
  const getCoachAvatar = (): string => {
    const avatars: Record<CoachPersonalityName, string> = {
      friendly: '😊',
      attacker: '⚔️',
      positional: '♟️',
      tactical: '🎯',
    };
    return avatars[personality];
  };

  // Get coach tone based on type
  const getPromptStyle = () => {
    switch (prompt.type) {
      case 'socratic-question':
        return styles.socraticPrompt;
      case 'hint':
        return styles.hintPrompt;
      case 'explanation':
        return styles.explanationPrompt;
      case 'encouragement':
        return styles.encouragementPrompt;
      default:
        return {};
    }
  };

  const handleContinue = () => {
    if (prompt.followUpPrompts && currentPromptIndex < prompt.followUpPrompts.length) {
      // Show next follow-up prompt
      setCurrentPromptIndex(currentPromptIndex + 1);
      playSound('click');
    } else {
      // Dismiss
      handleDismiss();
    }
  };

  const handleDismiss = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 50,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setCurrentPromptIndex(0);
      onDismiss();
    });
  };

  const currentPrompt = prompt.followUpPrompts?.[currentPromptIndex] || prompt;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleDismiss}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={handleDismiss}
        />

        <Animated.View
          style={[
            styles.dialogContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Coach Avatar */}
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarEmoji}>{getCoachAvatar()}</Text>
            </View>
            <View style={styles.coachBadge}>
              <Text style={styles.coachBadgeText}>Coach</Text>
            </View>
          </View>

          {/* Dialog Content */}
          <View style={styles.dialogContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Prompt Type Badge */}
              <View style={styles.typeBadgeContainer}>
                <View style={[styles.typeBadge, getPromptStyle()]}>
                  <Ionicons
                    name={
                      currentPrompt.type === 'socratic-question'
                        ? 'help-circle'
                        : currentPrompt.type === 'hint'
                        ? 'bulb'
                        : currentPrompt.type === 'encouragement'
                        ? 'thumbs-up'
                        : 'information-circle'
                    }
                    size={16}
                    color={Colors.textInverse}
                  />
                  <Text style={styles.typeBadgeText}>
                    {currentPrompt.type.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Prompt Text */}
              <Text style={styles.promptText}>{currentPrompt.text}</Text>

              {/* Visual Highlights Info */}
              {currentPrompt.visualHighlights && currentPrompt.visualHighlights.length > 0 && (
                <View style={styles.highlightInfo}>
                  <Ionicons name="eye" size={16} color={Colors.info} />
                  <Text style={styles.highlightInfoText}>
                    Check the highlighted squares on the board
                  </Text>
                </View>
              )}

              {/* Progress Indicator for Follow-ups */}
              {prompt.followUpPrompts && prompt.followUpPrompts.length > 0 && (
                <View style={styles.progressDots}>
                  {[prompt, ...prompt.followUpPrompts].map((_, index) => (
                    <View
                      key={index}
                      style={[
                        styles.dot,
                        index === currentPromptIndex && styles.activeDot,
                      ]}
                    />
                  ))}
                </View>
              )}
            </ScrollView>

            {/* Actions */}
            <View style={styles.actions}>
              {currentPrompt.expectedResponse && onResponse ? (
                <TouchableOpacity
                  style={[styles.button, styles.primaryButton]}
                  onPress={() => {
                    // TODO: Show interactive response UI
                    playSound('click');
                    if (onResponse) onResponse(null);
                  }}
                >
                  <Text style={styles.primaryButtonText}>
                    Show Me
                  </Text>
                </TouchableOpacity>
              ) : null}

              <TouchableOpacity
                style={[styles.button, styles.continueButton]}
                onPress={handleContinue}
              >
                <Text style={styles.continueButtonText}>
                  {prompt.followUpPrompts && currentPromptIndex < prompt.followUpPrompts.length
                    ? 'Continue'
                    : 'Got it!'}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={Colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  overlayTouchable: {
    ...StyleSheet.absoluteFillObject,
  },
  dialogContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...StyleSheet.flatten({
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 16,
    }),
  },
  avatarContainer: {
    alignItems: 'center',
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  avatarEmoji: {
    fontSize: 40,
  },
  coachBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  coachBadgeText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  dialogContent: {
    padding: Spacing.lg,
  },
  typeBadgeContainer: {
    marginBottom: Spacing.md,
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
    gap: Spacing.xs,
  },
  socraticPrompt: {
    backgroundColor: Colors.info,
  },
  hintPrompt: {
    backgroundColor: Colors.warning,
  },
  explanationPrompt: {
    backgroundColor: Colors.success,
  },
  encouragementPrompt: {
    backgroundColor: Colors.milestone,
  },
  typeBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  promptText: {
    fontSize: Typography.fontSize.lg,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.lg,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  highlightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.info + '20',
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  highlightInfoText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.info,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs,
    marginTop: Spacing.md,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.disabled,
  },
  activeDot: {
    backgroundColor: Colors.primary,
    width: 24,
  },
  actions: {
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  continueButton: {
    backgroundColor: Colors.backgroundTertiary,
  },
  continueButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
});
