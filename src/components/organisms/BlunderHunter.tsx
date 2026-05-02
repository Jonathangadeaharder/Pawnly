/**
 * Blunder Hunter Mini-Game
 * Find and exploit the opponent's blunder
 *
 * Concept: Opponent just made a terrible mistake - find the punishing move!
 * Trains: Tactical awareness, pattern recognition, and exploiting weaknesses
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Chessboard, { type Arrow, type Highlight } from './Chessboard';
import DigitalCoachDialog from './DigitalCoachDialog';
import { useGameStore } from '../../state/gameStore';
import { playSound } from '../../services/audio/soundService';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { createBlunderArrow, createBestMoveArrow } from '../../utils/boardAnnotations';
import type { CoachPrompt, Square } from '../../types';

interface BlunderPuzzle {
  id: string;
  name: string;
  fen: string;
  blunderMove: string; // The move that was just played (opponent's blunder)
  solution: string; // The punishing move in SAN notation
  theme: string; // Tactical theme (e.g., "Hanging Piece", "Back Rank", "Fork")
  hint: string;
  explanation: string;
}

const BLUNDER_PUZZLES: BlunderPuzzle[] = [
  {
    id: 'blunder-1',
    name: 'Hanging Queen',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQ1RK1 b kq - 0 1',
    blunderMove: 'Bc4',
    solution: 'Nxe4',
    theme: 'Hanging Piece',
    hint: 'White just played Bc4 and left something undefended. What can you capture?',
    explanation: 'White played Bc4 and forgot to defend the e4 pawn! Nxe4 wins a clean pawn with no compensation.',
  },
  {
    id: 'blunder-2',
    name: 'Back Rank Weakness',
    fen: '6k1/5ppp/8/8/8/8/5PPP/R5K1 b - - 0 1',
    blunderMove: 'Ra1',
    solution: 'Ra1#',
    theme: 'Back Rank Mate',
    hint: 'White\'s king is trapped on the back rank. Look for checkmate!',
    explanation: 'White played Ra1 but their own king is trapped! Ra1# is immediate checkmate because the king cannot escape.',
  },
  {
    id: 'blunder-3',
    name: 'Undefended Knight',
    fen: 'rnbqkb1r/pppp1ppp/5n2/4p3/4P3/5N2/PPPP1PPP/RNBQKB1R w KQkq - 0 1',
    blunderMove: 'e5',
    solution: 'Nxe5',
    theme: 'Hanging Piece',
    hint: 'Black just pushed the e-pawn. Did they defend it?',
    explanation: 'Black played ...e5 without defending it! Nxe5 wins the pawn, and if Black recaptures with the knight, White can simply take it back.',
  },
  {
    id: 'blunder-4',
    name: 'Discovered Attack',
    fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQkq - 0 1',
    blunderMove: 'Bc5',
    solution: 'Nxe5',
    theme: 'Discovered Attack',
    hint: 'Black\'s bishop just moved. What piece is now undefended?',
    explanation: 'Black played ...Bc5, but the knight on c6 was defending e5! Nxe5 wins the pawn, and the knight can\'t be recaptured without losing the bishop.',
  },
  {
    id: 'blunder-5',
    name: 'Queen Fork',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R b KQkq - 0 1',
    blunderMove: 'Bc4',
    solution: 'Qd4',
    theme: 'Fork',
    hint: 'White\'s bishop and e4 pawn are on the same diagonal. Your queen can attack both!',
    explanation: 'After Bc4, the queen can land on d4 forking the bishop and the e4 pawn. White must lose material.',
  },
];

interface BlunderHunterProps {
  onComplete: (puzzlesSolved: number, accuracy: number) => void;
  onExit: () => void;
}

export default function BlunderHunter({ onComplete, onExit }: BlunderHunterProps) {
  const { loadPosition, makeMove, resetGame } = useGameStore();

  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [solvedCount, setSolvedCount] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showCoach, setShowCoach] = useState(true);
  const [coachPrompt, setCoachPrompt] = useState<CoachPrompt | null>(null);
  const [arrows, setArrows] = useState<Arrow[]>([]);

  const currentPuzzle = BLUNDER_PUZZLES[currentPuzzleIndex];

  // Load puzzle
  useEffect(() => {
    if (currentPuzzle) {
      resetGame();
      loadPosition(currentPuzzle.fen);
      setSolved(false);
      setAttempts(0);
      setShowHint(false);
      setArrows([]);

      // Show intro
      const introPrompt: CoachPrompt = {
        id: 'blunder-intro',
        type: 'socratic-question',
        text: `Your opponent just blundered with ${currentPuzzle.blunderMove}! Find the punishing move. Theme: ${currentPuzzle.theme}`,
      };

      setCoachPrompt(introPrompt);
      setShowCoach(true);
    }
  }, [currentPuzzle]);

  const handleMove = (from: Square, to: Square) => {
    if (solved) return;

    const moveMade = makeMove(from, to);
    if (!moveMade) return;

    const moveNotation = `${from}${to}`;
    const isCorrect = currentPuzzle.solution.toLowerCase().includes(from) &&
                      currentPuzzle.solution.toLowerCase().includes(to);

    setAttempts(prev => prev + 1);
    setTotalAttempts(prev => prev + 1);

    if (isCorrect) {
      // Correct!
      setSolved(true);
      setSolvedCount(prev => prev + 1);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      playSound('success');

      setArrows([createBestMoveArrow(from, to)]);

      const successPrompt: CoachPrompt = {
        id: 'blunder-success',
        type: 'encouragement',
        text: `Excellent! ${currentPuzzle.explanation}`,
      };

      setCoachPrompt(successPrompt);
      setShowCoach(true);
    } else {
      // Incorrect
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      const failPrompt: CoachPrompt = {
        id: 'blunder-fail',
        type: 'hint',
        text: attempts >= 1 ? `Not quite. ${currentPuzzle.hint}` : 'That\'s not the best move. Try again!',
      };

      setCoachPrompt(failPrompt);
      setShowCoach(true);

      // Reset position after wrong move
      setTimeout(() => {
        loadPosition(currentPuzzle.fen);
      }, 1000);
    }
  };

  const handleHint = () => {
    setShowHint(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const hintPrompt: CoachPrompt = {
      id: 'blunder-hint',
      type: 'hint',
      text: currentPuzzle.hint,
    };

    setCoachPrompt(hintPrompt);
    setShowCoach(true);
  };

  const handleNextPuzzle = () => {
    if (currentPuzzleIndex < BLUNDER_PUZZLES.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      // All puzzles complete
      const accuracy = totalAttempts > 0 ? Math.round((solvedCount / totalAttempts) * 100) : 0;
      onComplete(solvedCount, accuracy);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Blunder Hunter 🎯</Text>
          <Text style={styles.subtitle}>
            Puzzle {currentPuzzleIndex + 1} of {BLUNDER_PUZZLES.length}
          </Text>
        </View>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${((currentPuzzleIndex + 1) / BLUNDER_PUZZLES.length) * 100}%` },
          ]}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Solved</Text>
          <Text style={styles.statValue}>{solvedCount}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Theme</Text>
          <Text style={styles.statValue}>{currentPuzzle.theme}</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Attempts</Text>
          <Text style={styles.statValue}>{attempts}</Text>
        </View>
      </View>

      {/* Chessboard */}
      <View style={styles.boardContainer}>
        <Chessboard
          interactionMode="both"
          onMove={handleMove}
          arrows={arrows}
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        {!solved && (
          <TouchableOpacity
            style={[styles.button, styles.hintButton]}
            onPress={handleHint}
          >
            <Ionicons name="help-circle" size={20} color={Colors.textInverse} />
            <Text style={styles.buttonText}>Hint</Text>
          </TouchableOpacity>
        )}

        {solved && (
          <TouchableOpacity
            style={[styles.button, styles.nextButton]}
            onPress={handleNextPuzzle}
          >
            <Text style={styles.buttonText}>
              {currentPuzzleIndex < BLUNDER_PUZZLES.length - 1 ? 'Next Puzzle' : 'Finish'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color={Colors.textInverse} />
          </TouchableOpacity>
        )}
      </View>

      {/* Digital Coach */}
      {showCoach && coachPrompt && (
        <Modal visible={showCoach} transparent animationType="fade">
          <DigitalCoachDialog
            prompt={coachPrompt}
            onDismiss={() => setShowCoach(false)}
          />
        </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  title: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  exitButton: {
    padding: Spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: Colors.backgroundSecondary,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.md,
    padding: Spacing.md,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  hintButton: {
    backgroundColor: Colors.info,
  },
  nextButton: {
    backgroundColor: Colors.success,
  },
  buttonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
});
