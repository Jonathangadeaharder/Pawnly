/**
 * Train Screen (The Gym)
 * Daily SRS review queue and mini-games
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useUserStore } from '../../state/userStore';
import { createSRSItem, scheduleNextReview } from '../../services/srs/fsrs';
import MoveTrainer from '../../components/organisms/MoveTrainer';
import ConceptTrainer from '../../components/organisms/ConceptTrainer';
import BishopsPrison from '../../components/organisms/BishopsPrison';
import TheFuse from '../../components/organisms/TheFuse';
import TranspositionMaze from '../../components/organisms/TranspositionMaze';
import CheckmateMaster from '../../components/organisms/CheckmateMaster';
import TacticalDrill from '../../components/organisms/TacticalDrill';
import TacticalStatsDashboard from '../../components/organisms/TacticalStatsDashboard';
import AchievementCelebration from '../../components/organisms/AchievementCelebration';
import { getRandomOpeningLine } from '../../constants/openingLines';
import { getRandomConceptCard } from '../../constants/conceptCards';
import { checkAndUnlockAchievements } from '../../services/achievements/achievementService';
import type { SRSItem, ReviewResult, Achievement } from '../../types';

type TrainingMode = 'overview' | 'move-review' | 'concept-review' | 'minigame';

export default function TrainScreen() {
  const { getDueSRSItems, updateSRSItem, addSRSItem, incrementStreak, profile, tacticalProgression, updateTacticalProgression } = useUserStore();

  const [mode, setMode] = useState<TrainingMode>('overview');
  const [currentSRSItem, setCurrentSRSItem] = useState<SRSItem | null>(null);
  const [reviewQueue, setReviewQueue] = useState<SRSItem[]>([]);
  const [showBishopsPrison, setShowBishopsPrison] = useState(false);
  const [showTheFuse, setShowTheFuse] = useState(false);
  const [showTranspositionMaze, setShowTranspositionMaze] = useState(false);
  const [showCheckmateMaster, setShowCheckmateMaster] = useState(false);
  const [showTacticalDrill, setShowTacticalDrill] = useState(false);
  const [showTacticalStats, setShowTacticalStats] = useState(false);
  const [celebratedAchievement, setCelebratedAchievement] = useState<Achievement | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Load due items on mount
  useEffect(() => {
    loadDueItems();
  }, []);

  const loadDueItems = () => {
    const dueItems = getDueSRSItems();
    setReviewQueue(dueItems);

    // If no items, create some demo items
    if (dueItems.length === 0) {
      createDemoItems();
    }
  };

  const createDemoItems = () => {
    // Create 3 demo move items
    const demoMoveItems: SRSItem[] = [];
    for (let i = 0; i < 3; i++) {
      const line = getRandomOpeningLine();
      const item = createSRSItem(`demo-move-${i}`, 'move', line);
      demoMoveItems.push(item);
      addSRSItem(item);
    }

    // Create 3 demo concept items
    const demoConceptItems: SRSItem[] = [];
    for (let i = 0; i < 3; i++) {
      const card = getRandomConceptCard();
      const item = createSRSItem(`demo-concept-${i}`, 'concept', card);
      demoConceptItems.push(item);
      addSRSItem(item);
    }

    setReviewQueue([...demoMoveItems, ...demoConceptItems]);
  };

  const dueItems = getDueSRSItems();
  const movesToReview = dueItems.filter((item) => item.type === 'move').length;
  const conceptsToReview = dueItems.filter((item) => item.type === 'concept').length;

  const handleStartMoveReview = () => {
    const moveItems = reviewQueue.filter(item => item.type === 'move');
    if (moveItems.length > 0) {
      setCurrentSRSItem(moveItems[0]);
      setMode('move-review');
    }
  };

  const handleStartConceptReview = () => {
    const conceptItems = reviewQueue.filter(item => item.type === 'concept');
    if (conceptItems.length > 0) {
      setCurrentSRSItem(conceptItems[0]);
      setMode('concept-review');
    }
  };

  const handleReviewComplete = async (result: ReviewResult) => {
    if (!currentSRSItem) return;

    // Update the SRS item with new schedule
    const updatedItem = scheduleNextReview(currentSRSItem, result);
    updateSRSItem(updatedItem.id, updatedItem);

    // Remove from queue
    const newQueue = reviewQueue.filter(item => item.id !== currentSRSItem.id);
    setReviewQueue(newQueue);

    // Check if all reviews are complete
    if (newQueue.length === 0) {
      // Increment streak
      await incrementStreak();

      // Check for new achievements
      const newAchievements = await checkAndUnlockAchievements();
      if (newAchievements.length > 0) {
        setCelebratedAchievement(newAchievements[0]);
        setShowCelebration(true);
      }

      // Return to overview
      setMode('overview');
      setCurrentSRSItem(null);
    } else {
      // Move to next item of same type or return to overview
      const sameTypeItems = newQueue.filter(item => item.type === currentSRSItem.type);
      if (sameTypeItems.length > 0) {
        setCurrentSRSItem(sameTypeItems[0]);
      } else {
        setMode('overview');
        setCurrentSRSItem(null);
      }
    }
  };

  const handleSkipReview = () => {
    setMode('overview');
    setCurrentSRSItem(null);
  };

  const handleMiniGameComplete = async (success: boolean, moves: number, timeSpent: number) => {
    setShowBishopsPrison(false);

    // Award XP for completion
    // Check for achievements
    const newAchievements = await checkAndUnlockAchievements();
    if (newAchievements.length > 0) {
      setCelebratedAchievement(newAchievements[0]);
      setShowCelebration(true);
    }
  };

  const handleFuseComplete = async (solvedCount: number, averageTime: number) => {
    setShowTheFuse(false);

    // Award XP for completion
    // Check for achievements (pattern master achievement)
    const newAchievements = await checkAndUnlockAchievements();
    if (newAchievements.length > 0) {
      setCelebratedAchievement(newAchievements[0]);
      setShowCelebration(true);
    }
  };

  const handleMazeComplete = async (pathsFound: number, attempts: number) => {
    setShowTranspositionMaze(false);

    // Award XP for completion
    // Check for achievements (transposition ninja achievement)
    const newAchievements = await checkAndUnlockAchievements();
    if (newAchievements.length > 0) {
      setCelebratedAchievement(newAchievements[0]);
      setShowCelebration(true);
    }
  };

  const handleCheckmateMasterComplete = async (score: number, accuracy: number) => {
    setShowCheckmateMaster(false);

    // Award XP for completion
    // Check for achievements (checkmate master achievement)
    const newAchievements = await checkAndUnlockAchievements();
    if (newAchievements.length > 0) {
      setCelebratedAchievement(newAchievements[0]);
      setShowCelebration(true);
    }
  };

  const handleTacticalDrillComplete = async (stats: any) => {
    setShowTacticalDrill(false);

    // Update tactical progression
    await updateTacticalProgression(stats);

    // Check for achievements (flash master, etc.)
    const newAchievements = await checkAndUnlockAchievements();
    if (newAchievements.length > 0) {
      setCelebratedAchievement(newAchievements[0]);
      setShowCelebration(true);
    }
  };

  // Overview mode
  if (mode === 'overview') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>The Gym</Text>
          <Text style={styles.subtitle}>
            Your daily training and review
          </Text>

          {/* Daily Review Stats */}
          <View style={styles.reviewCard}>
            <Text style={styles.cardTitle}>Today's Reviews</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{movesToReview}</Text>
                <Text style={styles.statLabel}>Moves</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{conceptsToReview}</Text>
                <Text style={styles.statLabel}>Concepts</Text>
              </View>
            </View>

            {/* Start Review Buttons */}
            <View style={styles.reviewActions}>
              <TouchableOpacity
                style={[styles.reviewButton, movesToReview === 0 && styles.reviewButtonDisabled]}
                onPress={handleStartMoveReview}
                disabled={movesToReview === 0}
              >
                <Ionicons name="play-circle" size={24} color={Colors.textInverse} />
                <Text style={styles.reviewButtonText}>Review Moves</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.reviewButton, conceptsToReview === 0 && styles.reviewButtonDisabled]}
                onPress={handleStartConceptReview}
                disabled={conceptsToReview === 0}
              >
                <Ionicons name="play-circle" size={24} color={Colors.textInverse} />
                <Text style={styles.reviewButtonText}>Review Concepts</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Mini-games section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Strategic Mini-Games</Text>

            <TouchableOpacity
              style={styles.miniGameCard}
              onPress={() => setShowBishopsPrison(true)}
            >
              <View style={styles.miniGameIcon}>
                <Text style={styles.miniGameEmoji}>♗</Text>
              </View>
              <View style={styles.miniGameContent}>
                <Text style={styles.miniGameTitle}>Bishop's Prison</Text>
                <Text style={styles.miniGameDescription}>
                  Master the good vs. bad bishop endgame
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miniGameCard}
              onPress={() => setShowTheFuse(true)}
            >
              <View style={styles.miniGameIcon}>
                <Text style={styles.miniGameEmoji}>🔥</Text>
              </View>
              <View style={styles.miniGameContent}>
                <Text style={styles.miniGameTitle}>The Fuse</Text>
                <Text style={styles.miniGameDescription}>
                  Timed pattern recognition - solve before the fuse burns!
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miniGameCard}
              onPress={() => setShowTranspositionMaze(true)}
            >
              <View style={styles.miniGameIcon}>
                <Text style={styles.miniGameEmoji}>🥷</Text>
              </View>
              <View style={styles.miniGameContent}>
                <Text style={styles.miniGameTitle}>Transposition Maze</Text>
                <Text style={styles.miniGameDescription}>
                  Navigate different move orders to reach target positions
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miniGameCard}
              onPress={() => setShowCheckmateMaster(true)}
            >
              <View style={styles.miniGameIcon}>
                <Text style={styles.miniGameEmoji}>🏆</Text>
              </View>
              <View style={styles.miniGameContent}>
                <Text style={styles.miniGameTitle}>Checkmate Master</Text>
                <Text style={styles.miniGameDescription}>
                  Recognize and deliver classic checkmate patterns
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miniGameCard}
              onPress={() => setShowTacticalDrill(true)}
            >
              <View style={styles.miniGameIcon}>
                <Text style={styles.miniGameEmoji}>⚡</Text>
              </View>
              <View style={styles.miniGameContent}>
                <Text style={styles.miniGameTitle}>Tactical Drill</Text>
                <Text style={styles.miniGameDescription}>
                  Flash-speed pattern recognition • {tacticalProgression?.currentTier || 800} ELO
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.miniGameCard}
              onPress={() => setShowTacticalStats(true)}
            >
              <View style={styles.miniGameIcon}>
                <Text style={styles.miniGameEmoji}>📊</Text>
              </View>
              <View style={styles.miniGameContent}>
                <Text style={styles.miniGameTitle}>Tactical Analytics</Text>
                <Text style={styles.miniGameDescription}>
                  View your performance stats and pattern weaknesses
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Progress Info */}
          {reviewQueue.length === 0 && (
            <View style={styles.completedCard}>
              <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
              <Text style={styles.completedTitle}>All Done!</Text>
              <Text style={styles.completedText}>
                Great work! You've completed all reviews for today. Come back tomorrow to keep your streak alive!
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Bishop's Prison Modal */}
        {showBishopsPrison && (
          <Modal visible={showBishopsPrison} animationType="slide">
            <BishopsPrison
              onComplete={handleMiniGameComplete}
              onExit={() => setShowBishopsPrison(false)}
            />
          </Modal>
        )}

        {/* The Fuse Modal */}
        {showTheFuse && (
          <Modal visible={showTheFuse} animationType="slide">
            <TheFuse
              onComplete={handleFuseComplete}
              onExit={() => setShowTheFuse(false)}
            />
          </Modal>
        )}

        {/* Transposition Maze Modal */}
        {showTranspositionMaze && (
          <Modal visible={showTranspositionMaze} animationType="slide">
            <TranspositionMaze
              onComplete={handleMazeComplete}
              onExit={() => setShowTranspositionMaze(false)}
            />
          </Modal>
        )}

        {/* Checkmate Master Modal */}
        {showCheckmateMaster && (
          <Modal visible={showCheckmateMaster} animationType="slide">
            <CheckmateMaster
              onComplete={handleCheckmateMasterComplete}
              onExit={() => setShowCheckmateMaster(false)}
            />
          </Modal>
        )}

        {/* Tactical Drill Modal */}
        {showTacticalDrill && (
          <Modal visible={showTacticalDrill} animationType="slide">
            <TacticalDrill
              initialELO={tacticalProgression?.currentTier || 800}
              drillCount={10}
              onComplete={handleTacticalDrillComplete}
              onExit={() => setShowTacticalDrill(false)}
            />
          </Modal>
        )}

        {/* Tactical Stats Dashboard Modal */}
        {showTacticalStats && (
          <Modal visible={showTacticalStats} animationType="slide">
            <TacticalStatsDashboard
              onStartDrills={() => {
                setShowTacticalStats(false);
                setShowTacticalDrill(true);
              }}
              onClose={() => setShowTacticalStats(false)}
            />
          </Modal>
        )}

        {/* Achievement Celebration */}
        <AchievementCelebration
          achievement={celebratedAchievement}
          visible={showCelebration}
          onDismiss={() => setShowCelebration(false)}
        />
      </View>
    );
  }

  // Move Review mode
  if (mode === 'move-review' && currentSRSItem) {
    return (
      <MoveTrainer
        srsItem={currentSRSItem}
        onComplete={handleReviewComplete}
        onSkip={handleSkipReview}
      />
    );
  }

  // Concept Review mode
  if (mode === 'concept-review' && currentSRSItem) {
    return (
      <ConceptTrainer
        srsItem={currentSRSItem}
        onComplete={handleReviewComplete}
        onSkip={handleSkipReview}
      />
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
  },
  title: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.lg,
    color: Colors.textSecondary,
    marginBottom: Spacing.xl,
  },
  reviewCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  cardTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
    marginBottom: Spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: Typography.fontSize['4xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  statLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textInverse,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  reviewActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  reviewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  reviewButtonDisabled: {
    opacity: 0.5,
  },
  reviewButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  miniGameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  miniGameIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  miniGameEmoji: {
    fontSize: 28,
  },
  miniGameContent: {
    flex: 1,
  },
  miniGameTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  miniGameDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  comingSoonBadge: {
    backgroundColor: Colors.warning + '40',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  comingSoonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.warning,
  },
  completedCard: {
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginTop: Spacing.lg,
  },
  completedTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  completedText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    textAlign: 'center',
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
});
