/**
 * Opening Repertoire Builder
 *
 * Allows users to build, manage, and study their personal opening repertoire.
 * Features:
 * - Browse opening lines from all 5 systems
 * - Add lines to personal repertoire
 * - Practice repertoire with spaced repetition
 * - Track mastery level per line
 * - Visual repertoire tree
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chess } from 'chess.js';
import Chessboard from './Chessboard';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { useGameStore } from '../../state/gameStore';
import { useUserStore } from '../../state/userStore';
import { OPENING_LINES } from '../../constants/openingLines';
import type { OpeningLine, OpeningSystem, Square } from '../../types';
import * as Haptics from 'expo-haptics';

interface RepertoireEntry {
  id: string;
  openingLineId: string;
  system: OpeningSystem;
  name: string;
  moves: string[];
  color: 'white' | 'black';
  mastery: number; // 0-100
  lastPracticed?: Date;
  timesPlayed: number;
  successRate: number;
  notes?: string;
  tags: string[];
}

type ViewMode = 'browse' | 'repertoire' | 'practice';

export default function OpeningRepertoireBuilder({ onClose }: { onClose?: () => void }) {
  const { loadPosition } = useGameStore();
  const { addXP } = useUserStore();

  const [viewMode, setViewMode] = useState<ViewMode>('browse');
  const [selectedSystem, setSelectedSystem] = useState<OpeningSystem | 'all'>('all');
  const [selectedLine, setSelectedLine] = useState<OpeningLine | null>(null);
  const [repertoire, setRepertoire] = useState<RepertoireEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chess] = useState(() => new Chess());
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);

  // Load repertoire from storage
  useEffect(() => {
    loadRepertoire();
  }, []);

  // Update board when line/move changes
  useEffect(() => {
    if (selectedLine) {
      chess.reset();
      for (let i = 0; i <= currentMoveIndex && i < selectedLine.moves.length; i++) {
        chess.move(selectedLine.moves[i]);
      }
      loadPosition(chess.fen());
    }
  }, [selectedLine, currentMoveIndex]);

  const loadRepertoire = async () => {
    // TODO: Load from SQLite/AsyncStorage
    // For now, use mock data
    const mockRepertoire: RepertoireEntry[] = [];
    setRepertoire(mockRepertoire);
  };

  const saveRepertoire = async () => {
    // TODO: Save to SQLite/AsyncStorage
  };

  const getFilteredLines = () => {
    let lines = OPENING_LINES;

    if (selectedSystem !== 'all') {
      lines = lines.filter(line => typeof line.system !== 'undefined' && line.system === selectedSystem);
    }

    if (searchQuery) {
      lines = lines.filter(line =>
        line.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        line.moves.join(' ').toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return lines;
  };

  const addToRepertoire = (line: OpeningLine, color: 'white' | 'black') => {
    const entry: RepertoireEntry = {
      id: `${line.id}-${color}-${Date.now()}`,
      openingLineId: line.id,
      system: line.system,
      name: line.name,
      moves: line.moves,
      color,
      mastery: 0,
      timesPlayed: 0,
      successRate: 0,
      notes: '',
      tags: [],
    };

    setRepertoire(prev => [...prev, entry]);
    saveRepertoire();
    addXP(50);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Added to Repertoire', `${line.name} added as ${color}`);
  };

  const removeFromRepertoire = (id: string) => {
    Alert.alert(
      'Remove from Repertoire',
      'Are you sure you want to remove this line?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setRepertoire(prev => prev.filter(entry => entry.id !== id));
            saveRepertoire();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };



  const handlePreviousMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  const handleNextMove = () => {
    if (selectedLine && currentMoveIndex < selectedLine.moves.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };

  const renderBrowseView = () => {
    const filteredLines = getFilteredLines();

    return (
      <>
        {/* Search and Filters */}
        <View style={styles.searchSection}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search openings..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor={Colors.textSecondary}
            />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow}>
            {(['all', 'kings-indian-attack', 'stonewall-attack', 'colle-system', 'london-system', 'torre-attack'] as const).map(system => (
              <TouchableOpacity
                key={system}
                style={[styles.filterChip, selectedSystem === system && styles.filterChipActive]}
                onPress={() => setSelectedSystem(system)}
              >
                <Text style={[styles.filterChipText, selectedSystem === system && styles.filterChipTextActive]}>
                  {system === 'all' ? 'All' : system.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Opening Lines List */}
        <ScrollView style={styles.linesList}>
          {filteredLines.map(line => {
            const inRepertoire = repertoire.some(entry => entry.openingLineId === line.id);

            return (
              <TouchableOpacity
                key={line.id}
                style={styles.lineCard}
                onPress={() => {
                  setSelectedLine(line);
                  setCurrentMoveIndex(0);
                }}
              >
                <View style={styles.lineHeader}>
                  <View style={styles.lineInfo}>
                    <Text style={styles.lineName}>{line.name}</Text>
                    <Text style={styles.lineSystem}>
                      {line.system.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </Text>
                  </View>
                  {inRepertoire && (
                    <Ionicons name="bookmark" size={24} color={Colors.primary} />
                  )}
                </View>

                <Text style={styles.lineMoves} numberOfLines={2}>
                  {line.moves.join(', ')}
                </Text>

                {!inRepertoire && (
                  <View style={styles.lineActions}>
                    <TouchableOpacity
                      style={[styles.addButton, styles.whiteButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        addToRepertoire(line, 'white');
                      }}
                    >
                      <Ionicons name="add" size={16} color={Colors.text} />
                      <Text style={styles.addButtonText}>As White</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.addButton, styles.blackButton]}
                      onPress={(e) => {
                        e.stopPropagation();
                        addToRepertoire(line, 'black');
                      }}
                    >
                      <Ionicons name="add" size={16} color={Colors.textInverse} />
                      <Text style={[styles.addButtonText, { color: Colors.textInverse }]}>As Black</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {filteredLines.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={64} color={Colors.textSecondary} />
              <Text style={styles.emptyStateText}>No openings found</Text>
            </View>
          )}
        </ScrollView>
      </>
    );
  };

  const renderRepertoireView = () => {
    return (
      <ScrollView style={styles.linesList}>
        {repertoire.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="bookmark-outline" size={64} color={Colors.textSecondary} />
            <Text style={styles.emptyStateText}>Your repertoire is empty</Text>
            <Text style={styles.emptyStateSubtext}>
              Browse openings and add them to your repertoire
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setViewMode('browse')}
            >
              <Text style={styles.primaryButtonText}>Browse Openings</Text>
            </TouchableOpacity>
          </View>
        ) : (
          repertoire.map(entry => (
            <View key={entry.id} style={styles.repertoireCard}>
              <View style={styles.repertoireHeader}>
                <View style={styles.lineInfo}>
                  <Text style={styles.lineName}>{entry.name}</Text>
                  <View style={styles.repertoireMeta}>
                    <View style={[styles.colorBadge, entry.color === 'white' ? styles.whiteBadge : styles.blackBadge]}>
                      <Text style={[styles.colorBadgeText, entry.color === 'black' && { color: Colors.textInverse }]}>
                        {entry.color}
                      </Text>
                    </View>
                    <Text style={styles.masteryText}>
                      {entry.mastery}% mastered
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={() => removeFromRepertoire(entry.id)}
                  style={styles.removeButton}
                >
                  <Ionicons name="trash-outline" size={20} color={Colors.error} />
                </TouchableOpacity>
              </View>

              {/* Mastery Progress Bar */}
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${entry.mastery}%` }]} />
                </View>
              </View>

              <View style={styles.repertoireStats}>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{entry.timesPlayed}</Text>
                  <Text style={styles.statLabel}>Played</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>{entry.successRate}%</Text>
                  <Text style={styles.statLabel}>Success</Text>
                </View>
                <View style={styles.stat}>
                  <Text style={styles.statValue}>
                    {entry.lastPracticed ? new Date(entry.lastPracticed).toLocaleDateString() : 'Never'}
                  </Text>
                  <Text style={styles.statLabel}>Last Practiced</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Opening Repertoire</Text>
        <View style={styles.placeholder} />
      </View>

      {/* View Mode Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, viewMode === 'browse' && styles.tabActive]}
          onPress={() => setViewMode('browse')}
        >
          <Ionicons name="library" size={20} color={viewMode === 'browse' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, viewMode === 'browse' && styles.tabTextActive]}>Browse</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, viewMode === 'repertoire' && styles.tabActive]}
          onPress={() => setViewMode('repertoire')}
        >
          <Ionicons name="bookmark" size={20} color={viewMode === 'repertoire' ? Colors.primary : Colors.textSecondary} />
          <Text style={[styles.tabText, viewMode === 'repertoire' && styles.tabTextActive]}>
            My Repertoire ({repertoire.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {viewMode === 'browse' && renderBrowseView()}
      {viewMode === 'repertoire' && renderRepertoireView()}

      {/* Selected Line Preview */}
      {selectedLine && viewMode === 'browse' && (
        <View style={styles.previewPanel}>
          <View style={styles.previewHeader}>
            <Text style={styles.previewTitle}>{selectedLine.name}</Text>
            <TouchableOpacity onPress={() => setSelectedLine(null)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.boardSection}>
            <Chessboard
              showCoordinates={true}
              interactionMode="tap-tap"
            />
          </View>

          {/* Move Navigation */}
          <View style={styles.navigation}>
            <TouchableOpacity
              style={[styles.navButton, currentMoveIndex === 0 && styles.navButtonDisabled]}
              onPress={handlePreviousMove}
              disabled={currentMoveIndex === 0}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color={currentMoveIndex === 0 ? Colors.textSecondary : Colors.primary}
              />
            </TouchableOpacity>

            <Text style={styles.navText}>
              {currentMoveIndex + 1} / {selectedLine.moves.length}
            </Text>

            <TouchableOpacity
              style={[
                styles.navButton,
                currentMoveIndex === selectedLine.moves.length - 1 && styles.navButtonDisabled,
              ]}
              onPress={handleNextMove}
              disabled={currentMoveIndex === selectedLine.moves.length - 1}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={
                  currentMoveIndex === selectedLine.moves.length - 1
                    ? Colors.textSecondary
                    : Colors.primary
                }
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.movesDisplay}>
            {selectedLine.moves.slice(0, currentMoveIndex + 1).join(', ')}
          </Text>
        </View>
      )}
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
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  title: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  placeholder: {
    width: 44,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.md,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  searchSection: {
    padding: Spacing.md,
    gap: Spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: Typography.fontSize.base,
    color: Colors.text,
  },
  filterRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.backgroundSecondary,
    marginRight: Spacing.sm,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.textInverse,
    fontWeight: Typography.fontWeight.semibold,
  },
  linesList: {
    flex: 1,
    padding: Spacing.md,
  },
  lineCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  lineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  lineInfo: {
    flex: 1,
  },
  lineName: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  lineSystem: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  lineMoves: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.md,
  },
  lineActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  addButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  whiteButton: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  blackButton: {
    backgroundColor: Colors.text,
    borderColor: Colors.text,
  },
  addButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  emptyStateSubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  repertoireCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  repertoireHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm,
  },
  repertoireMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  colorBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  whiteBadge: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  blackBadge: {
    backgroundColor: Colors.text,
  },
  colorBadgeText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    textTransform: 'capitalize',
  },
  masteryText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  removeButton: {
    padding: Spacing.xs,
  },
  progressContainer: {
    marginBottom: Spacing.md,
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
  repertoireStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  previewPanel: {
    backgroundColor: Colors.background,
    borderTopWidth: 2,
    borderTopColor: Colors.border,
    padding: Spacing.md,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  previewTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  boardSection: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  navButton: {
    padding: Spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  movesDisplay: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});
