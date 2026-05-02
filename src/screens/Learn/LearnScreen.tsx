/**
 * Learn Screen (The Academy)
 * Main curriculum and learning path
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useUserStore } from '../../state/userStore';
import {
  OPENING_SYSTEMS,
  getLessonsForSystem,
  getSystemProgress,
  getLessonById,
  type OpeningSystemMeta,
  type Lesson,
} from '../../constants/lessons';
import LessonViewer from '../../components/organisms/LessonViewer';

type ViewMode = 'systems' | 'lessons' | 'lesson-viewer';

export default function LearnScreen() {
  const { profile, completeLesson } = useUserStore();
  const [viewMode, setViewMode] = useState<ViewMode>('systems');
  const [selectedSystem, setSelectedSystem] = useState<OpeningSystemMeta | null>(null);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  const completedLessons = profile?.completedLessons || [];

  const handleSystemSelect = (system: OpeningSystemMeta) => {
    setSelectedSystem(system);
    setViewMode('lessons');
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    setViewMode('lesson-viewer');
  };

  const handleLessonComplete = async () => {
    if (selectedLesson) {
      await completeLesson(selectedLesson.id, selectedLesson.estimatedMinutes);
      setViewMode('lessons');
      setSelectedLesson(null);
    }
  };

  const handleBackToSystems = () => {
    setViewMode('systems');
    setSelectedSystem(null);
  };

  const handleExitLesson = () => {
    setViewMode('lessons');
    setSelectedLesson(null);
  };

  // Systems view
  if (viewMode === 'systems') {
    return (
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>The Academy</Text>
          <Text style={styles.subtitle}>
            Master Universal Chess Opening Systems
          </Text>

          {/* Overall Progress */}
          <View style={styles.overallProgressCard}>
            <View style={styles.progressHeader}>
              <Ionicons name="trophy" size={24} color={Colors.milestone} />
              <Text style={styles.progressTitle}>Your Progress</Text>
            </View>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{completedLessons.length}</Text>
                <Text style={styles.statLabel}>Lessons Completed</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{profile?.totalStudyTime || 0}</Text>
                <Text style={styles.statLabel}>Minutes Studied</Text>
              </View>
            </View>
          </View>

          {/* Opening Systems */}
          <Text style={styles.sectionTitle}>Opening Systems</Text>
          {OPENING_SYSTEMS.map((system) => {
            const progress = getSystemProgress(system.id, completedLessons);
            const difficultyColor =
              system.difficulty === 'beginner'
                ? Colors.success
                : system.difficulty === 'intermediate'
                ? Colors.warning
                : Colors.error;

            return (
              <TouchableOpacity
                key={system.id}
                style={styles.systemCard}
                onPress={() => handleSystemSelect(system)}
              >
                <View style={styles.systemIcon}>
                  <Text style={styles.systemEmoji}>{system.icon}</Text>
                </View>
                <View style={styles.systemContent}>
                  <View style={styles.systemHeader}>
                    <Text style={styles.systemName}>{system.name}</Text>
                    <View
                      style={[
                        styles.difficultyBadge,
                        { backgroundColor: difficultyColor + '20' },
                      ]}
                    >
                      <Text
                        style={[styles.difficultyText, { color: difficultyColor }]}
                      >
                        {system.difficulty.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.systemDescription}>{system.description}</Text>
                  <View style={styles.systemFooter}>
                    <View style={styles.progressBar}>
                      <View
                        style={[
                          styles.progressFill,
                          { width: `${progress.percentage}%` },
                        ]}
                      />
                    </View>
                    <Text style={styles.progressText}>
                      {progress.completed} / {progress.total} lessons
                    </Text>
                  </View>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={24}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Lessons view
  if (viewMode === 'lessons' && selectedSystem) {
    const lessons = getLessonsForSystem(selectedSystem.id);
    const progress = getSystemProgress(selectedSystem.id, completedLessons);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackToSystems} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.text} />
            <Text style={styles.backText}>Systems</Text>
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.systemDetailHeader}>
            <Text style={styles.systemDetailIcon}>{selectedSystem.icon}</Text>
            <Text style={styles.systemDetailName}>{selectedSystem.name}</Text>
            <Text style={styles.systemDetailDescription}>
              {selectedSystem.description}
            </Text>
            <View style={styles.systemDetailProgress}>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${progress.percentage}%` },
                  ]}
                />
              </View>
              <Text style={styles.progressPercentage}>
                {Math.round(progress.percentage)}% Complete
              </Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Lessons</Text>
          {lessons.map((lesson, index) => {
            const isCompleted = completedLessons.includes(lesson.id);
            const isLocked = index > 0 && !completedLessons.includes(lessons[index - 1].id);

            return (
              <TouchableOpacity
                key={lesson.id}
                style={[
                  styles.lessonCard,
                  isLocked && styles.lessonCardLocked,
                ]}
                onPress={() => !isLocked && handleLessonSelect(lesson)}
                disabled={isLocked}
              >
                <View style={styles.lessonNumber}>
                  {isCompleted ? (
                    <Ionicons name="checkmark-circle" size={28} color={Colors.success} />
                  ) : isLocked ? (
                    <Ionicons name="lock-closed" size={28} color={Colors.textSecondary} />
                  ) : (
                    <Text style={styles.lessonNumberText}>{index + 1}</Text>
                  )}
                </View>
                <View style={styles.lessonContent}>
                  <Text
                    style={[
                      styles.lessonTitle,
                      isLocked && styles.lessonTitleLocked,
                    ]}
                  >
                    {lesson.title}
                  </Text>
                  <Text
                    style={[
                      styles.lessonDescription,
                      isLocked && styles.lessonDescriptionLocked,
                    ]}
                  >
                    {lesson.description}
                  </Text>
                  <View style={styles.lessonMeta}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color={isLocked ? Colors.textSecondary : Colors.text}
                    />
                    <Text
                      style={[
                        styles.lessonMetaText,
                        isLocked && styles.lessonMetaTextLocked,
                      ]}
                    >
                      {lesson.estimatedMinutes} min
                    </Text>
                  </View>
                </View>
                {!isLocked && !isCompleted && (
                  <Ionicons
                    name="chevron-forward"
                    size={24}
                    color={Colors.textSecondary}
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    );
  }

  // Lesson viewer
  if (viewMode === 'lesson-viewer' && selectedLesson) {
    return (
      <Modal visible={true} animationType="slide">
        <LessonViewer
          lesson={selectedLesson}
          onComplete={handleLessonComplete}
          onExit={handleExitLesson}
        />
      </Modal>
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
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  backText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
  },
  overallProgressCard: {
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  progressTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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
    fontSize: Typography.fontSize.sm,
    color: Colors.textInverse,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    marginTop: Spacing.lg,
  },
  systemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  systemIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  systemEmoji: {
    fontSize: 32,
  },
  systemContent: {
    flex: 1,
  },
  systemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.xs,
  },
  systemName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    flex: 1,
  },
  difficultyBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  difficultyText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
  },
  systemDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  systemFooter: {
    gap: Spacing.xs,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  systemDetailHeader: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  systemDetailIcon: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  systemDetailName: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  systemDetailDescription: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  systemDetailProgress: {
    width: '100%',
    gap: Spacing.sm,
  },
  progressPercentage: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
  },
  lessonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  lessonCardLocked: {
    opacity: 0.6,
  },
  lessonNumber: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  lessonNumberText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  lessonContent: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  lessonTitleLocked: {
    color: Colors.textSecondary,
  },
  lessonDescription: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  lessonDescriptionLocked: {
    color: Colors.textSecondary,
    opacity: 0.7,
  },
  lessonMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  lessonMetaText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.text,
  },
  lessonMetaTextLocked: {
    color: Colors.textSecondary,
  },
});
