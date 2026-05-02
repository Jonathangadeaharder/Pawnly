/**
 * Lesson Viewer Component
 * Displays structured lesson content with text, diagrams, and interactive elements
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import Chessboard from './Chessboard';
import type { Lesson, LessonContent } from '../../constants/lessons';

interface LessonViewerProps {
  lesson: Lesson;
  onComplete: () => void;
  onExit: () => void;
}

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - Spacing.md * 2, 400);

export default function LessonViewer({ lesson, onComplete, onExit }: LessonViewerProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const totalPages = lesson.content.length;

  const handleNext = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  const renderContent = (content: LessonContent) => {
    switch (content.type) {
      case 'text':
        return (
          <View style={styles.textContent}>
            {content.heading && (
              <Text style={styles.contentHeading}>{content.heading}</Text>
            )}
            {content.text && (
              <Text style={styles.contentText}>{content.text}</Text>
            )}
          </View>
        );

      case 'diagram':
        return (
          <View style={styles.diagramContent}>
            {content.heading && (
              <Text style={styles.contentHeading}>{content.heading}</Text>
            )}
            {content.fen && (
              <View style={styles.boardContainer}>
                <Chessboard
                  size={BOARD_SIZE}
                  position={content.fen}
                  interactive={false}
                />
              </View>
            )}
            {content.text && (
              <Text style={styles.contentText}>{content.text}</Text>
            )}
          </View>
        );

      case 'interactive':
        return (
          <View style={styles.interactiveContent}>
            {content.heading && (
              <Text style={styles.contentHeading}>{content.heading}</Text>
            )}
            {content.text && (
              <Text style={styles.contentText}>{content.text}</Text>
            )}
            {content.fen && (
              <View style={styles.boardContainer}>
                <Chessboard
                  size={BOARD_SIZE}
                  position={content.fen}
                  interactive={true}
                />
              </View>
            )}
            <View style={styles.interactiveHint}>
              <Ionicons name="hand-left" size={20} color={Colors.primary} />
              <Text style={styles.interactiveHintText}>
                Try it yourself on the board above
              </Text>
            </View>
          </View>
        );

      case 'concept':
        return (
          <View style={styles.conceptContent}>
            <View style={styles.conceptBadge}>
              <Ionicons name="bulb" size={24} color={Colors.milestone} />
              <Text style={styles.conceptBadgeText}>Key Concept</Text>
            </View>
            <Text style={styles.conceptText}>
              This concept will be added to your SRS review queue for long-term retention
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  const currentContent = lesson.content[currentPage];
  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalPages - 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{lesson.title}</Text>
          <Text style={styles.subtitle}>{lesson.description}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentPage + 1) / totalPages) * 100}%` }
            ]}
          />
        </View>
        <Text style={styles.progressText}>
          {currentPage + 1} / {totalPages}
        </Text>
      </View>

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
      >
        {renderContent(currentContent)}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, isFirstPage && styles.navButtonDisabled]}
          onPress={handlePrevious}
          disabled={isFirstPage}
        >
          <Ionicons
            name="chevron-back"
            size={24}
            color={isFirstPage ? Colors.textSecondary : Colors.textInverse}
          />
          <Text style={[styles.navButtonText, isFirstPage && styles.navButtonTextDisabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        {!isLastPage ? (
          <TouchableOpacity
            style={styles.navButton}
            onPress={handleNext}
          >
            <Text style={styles.navButtonText}>Next</Text>
            <Ionicons name="chevron-forward" size={24} color={Colors.textInverse} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.navButton, styles.completeButton]}
            onPress={handleComplete}
          >
            <Ionicons name="checkmark-circle" size={24} color={Colors.textInverse} />
            <Text style={styles.navButtonText}>Complete Lesson</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  exitButton: {
    padding: Spacing.xs,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
  },
  headerSpacer: {
    width: 44,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  progressText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    minWidth: 50,
    textAlign: 'right',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
  },
  textContent: {
    marginBottom: Spacing.lg,
  },
  diagramContent: {
    marginBottom: Spacing.lg,
  },
  interactiveContent: {
    marginBottom: Spacing.lg,
  },
  conceptContent: {
    backgroundColor: Colors.milestone + '20',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  contentHeading: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  contentText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.base,
  },
  boardContainer: {
    alignItems: 'center',
    marginVertical: Spacing.lg,
  },
  interactiveHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginTop: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.primary + '20',
    borderRadius: BorderRadius.md,
  },
  interactiveHintText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  conceptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  conceptBadgeText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.milestone,
  },
  conceptText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    textAlign: 'center',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.md,
  },
  navButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  navButtonDisabled: {
    backgroundColor: Colors.backgroundSecondary,
  },
  navButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },
  navButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  completeButton: {
    backgroundColor: Colors.success,
  },
});
