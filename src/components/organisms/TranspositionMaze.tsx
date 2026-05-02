/**
 * Transposition Maze Component
 * Teaches move order flexibility and transposition concepts
 * Players navigate different move orders to reach a target position
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chess } from 'chess.js';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import Chessboard from './Chessboard';
import DigitalCoachDialog from './DigitalCoachDialog';
import { playSound } from '../../services/audio/soundService';
import type { CoachPrompt, OpeningSystem } from '../../types';

interface TranspositionMazeProps {
  onComplete: (pathsFound: number, attempts: number) => void;
  onExit: () => void;
}

interface MazeNode {
  move: string; // UCI notation (e.g., "e2e4")
  san: string; // SAN notation (e.g., "e4")
  description: string;
  isCorrect: boolean; // Leads to target position
  position?: string; // FEN after this move (for wrong moves)
}

interface TranspositionPuzzle {
  id: string;
  name: string;
  system: OpeningSystem;
  targetFen: string;
  targetDescription: string;
  startFen: string;
  correctPaths: string[][]; // Array of move sequences that reach target
  wrongMoves: MazeNode[]; // Moves that don't lead to target
  hint: string;
}

const { width } = Dimensions.get('window');
const BOARD_SIZE = Math.min(width - Spacing.md * 2, 350);

// Sample transposition puzzles
const TRANSPOSITION_PUZZLES: TranspositionPuzzle[] = [
  {
    id: 'trans-1',
    name: 'KIA Setup: Two Routes',
    system: 'kings-indian-attack',
    targetFen: 'rnbqkb1r/pppppppp/5n2/8/4P3/5NP1/PPPP1PBP/RNBQK2R w KQkq - 0 1',
    targetDescription: 'KIA with e4, g3, Nf3, Bg2',
    startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    correctPaths: [
      ['e2e4', 'e7e6', 'g1f3', 'g8f6', 'g2g3', 'f1g2'],
      ['g1f3', 'g8f6', 'g2g3', 'e7e6', 'f1g2', 'e2e4'],
      ['g2g3', 'g8f6', 'f1g2', 'e7e6', 'g1f3', 'e2e4'],
    ],
    wrongMoves: [
      {
        move: 'd2d4',
        san: 'd4',
        description: 'This leads to a different opening system',
        isCorrect: false,
      },
      {
        move: 'e2e3',
        san: 'e3',
        description: 'Too passive - the KIA requires e4',
        isCorrect: false,
      },
    ],
    hint: 'The KIA can be reached by playing Nf3, g3, Bg2, and e4 in any order!',
  },
  {
    id: 'trans-2',
    name: 'Colle vs London',
    system: 'colle-system',
    targetFen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1B2/4PN2/PPP2PPP/RN1QKB1R w KQkq - 0 4',
    targetDescription: 'London System setup',
    startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    correctPaths: [
      ['d2d4', 'd7d5', 'g1f3', 'g8f6', 'c1f4', 'e7e6', 'e2e3'],
      ['d2d4', 'd7d5', 'c1f4', 'g8f6', 'g1f3', 'e7e6', 'e2e3'],
      ['g1f3', 'g8f6', 'd2d4', 'd7d5', 'c1f4', 'e7e6', 'e2e3'],
    ],
    wrongMoves: [
      {
        move: 'e2e3',
        san: 'e3',
        description: 'Playing e3 before Bf4 blocks the bishop - that\'s the Colle, not London!',
        isCorrect: false,
      },
    ],
    hint: 'The London requires Bf4 BEFORE e3. The move order matters here!',
  },
  {
    id: 'trans-3',
    name: 'Stonewall Flexibility',
    system: 'stonewall-attack',
    targetFen: 'rnbqkb1r/ppp1pppp/5n2/3p4/3P1P2/3BPN2/PPP3PP/RNBQK2R w KQkq - 0 5',
    targetDescription: 'Stonewall with bishop out before f4',
    startFen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    correctPaths: [
      ['d2d4', 'd7d5', 'e2e3', 'g8f6', 'f1d3', 'g1f3', 'f2f4'],
      ['d2d4', 'd7d5', 'g1f3', 'g8f6', 'e2e3', 'f1d3', 'f2f4'],
      ['g1f3', 'g8f6', 'd2d4', 'd7d5', 'e2e3', 'f1d3', 'f2f4'],
    ],
    wrongMoves: [
      {
        move: 'f2f4',
        san: 'f4',
        description: 'Playing f4 too early locks in the light-squared bishop!',
        isCorrect: false,
      },
    ],
    hint: 'Develop Bd3 before playing f4 to avoid the bad bishop problem!',
  },
];

export default function TranspositionMaze({ onComplete, onExit }: TranspositionMazeProps) {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const [chess] = useState(new Chess());
  const [availableMoves, setAvailableMoves] = useState<MazeNode[]>([]);
  const [pathsFound, setPathsFound] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showFailed, setShowFailed] = useState(false);
  const [coachPrompt, setCoachPrompt] = useState<CoachPrompt | null>(null);
  const [completedPuzzles, setCompletedPuzzles] = useState<string[]>([]);

  const currentPuzzle = TRANSPOSITION_PUZZLES[currentPuzzleIndex];

  useEffect(() => {
    resetPuzzle();
  }, [currentPuzzleIndex]);

  const resetPuzzle = () => {
    chess.load(currentPuzzle.startFen);
    setCurrentPath([]);
    setShowSuccess(false);
    setShowFailed(false);
    updateAvailableMoves();
  };

  const updateAvailableMoves = () => {
    const moves = chess.moves({ verbose: true });
    const nodes: MazeNode[] = [];

    // Find which moves are part of correct paths
    for (const move of moves) {
      const isCorrect = isPartOfCorrectPath(move.lan);

      nodes.push({
        move: move.lan,
        san: move.san,
        description: getMoveDescription(move.lan),
        isCorrect,
      });
    }

    // Add wrong moves from puzzle definition if applicable
    for (const wrongMove of currentPuzzle.wrongMoves) {
      const moveExists = moves.some(m => m.lan === wrongMove.move);
      if (moveExists && !nodes.some(n => n.move === wrongMove.move)) {
        nodes.push(wrongMove);
      }
    }

    setAvailableMoves(nodes);
  };

  const isPartOfCorrectPath = (moveUci: string): boolean => {
    const testPath = [...currentPath, moveUci];

    // Check if this path prefix matches any correct path
    return currentPuzzle.correctPaths.some(correctPath => {
      if (testPath.length > correctPath.length) return false;
      return testPath.every((move, index) => move === correctPath[index]);
    });
  };

  const getMoveDescription = (moveUci: string): string => {
    // Check wrong moves for descriptions
    const wrongMove = currentPuzzle.wrongMoves.find(m => m.move === moveUci);
    if (wrongMove) return wrongMove.description;

    // Generic descriptions
    if (isPartOfCorrectPath(moveUci)) {
      return 'This move is part of a correct path';
    }
    return 'This move leads away from the target';
  };

  const handleMoveSelect = (node: MazeNode) => {
    setAttempts(attempts + 1);

    if (!node.isCorrect) {
      // Wrong move
      playSound('error');
      setShowFailed(true);

      const failPrompt: CoachPrompt = {
        type: 'explanation',
        text: `That's not the right path. ${node.description}`,
        followUp: {
          type: 'hint',
          text: currentPuzzle.hint,
        },
      };
      setCoachPrompt(failPrompt);

      // Reset after delay
      setTimeout(() => {
        setShowFailed(false);
        resetPuzzle();
      }, 2000);
      return;
    }

    // Correct move
    const newPath = [...currentPath, node.move];
    setCurrentPath(newPath);
    chess.move(node.move);

    // Check if we reached the target
    if (isTargetReached()) {
      playSound('success');
      setPathsFound(pathsFound + 1);
      setShowSuccess(true);

      const successPrompt: CoachPrompt = {
        type: 'encouragement',
        text: `Excellent! You found a transposition path to the ${currentPuzzle.targetDescription}!`,
      };
      setCoachPrompt(successPrompt);

      // Mark puzzle as completed
      if (!completedPuzzles.includes(currentPuzzle.id)) {
        setCompletedPuzzles([...completedPuzzles, currentPuzzle.id]);
      }

      // Move to next puzzle or complete
      setTimeout(() => {
        if (currentPuzzleIndex < TRANSPOSITION_PUZZLES.length - 1) {
          setCurrentPuzzleIndex(currentPuzzleIndex + 1);
        } else {
          // All puzzles completed
          onComplete(pathsFound + 1, attempts + 1);
        }
      }, 2000);
      return;
    }

    // Continue on the path
    updateAvailableMoves();
  };

  const isTargetReached = (): boolean => {
    // Compare current position to target (ignoring move counters)
    const currentPos = chess.fen().split(' ').slice(0, 4).join(' ');
    const targetPos = currentPuzzle.targetFen.split(' ').slice(0, 4).join(' ');
    return currentPos === targetPos;
  };

  const handleTryAnotherPath = () => {
    resetPuzzle();
  };

  const handleSkip = () => {
    if (currentPuzzleIndex < TRANSPOSITION_PUZZLES.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      onComplete(pathsFound, attempts);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Ionicons name="close" size={28} color={Colors.text} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Transposition Maze</Text>
          <Text style={styles.subtitle}>{currentPuzzle.name}</Text>
        </View>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Target Position */}
        <View style={styles.targetCard}>
          <Text style={styles.targetLabel}>TARGET POSITION</Text>
          <Text style={styles.targetDescription}>{currentPuzzle.targetDescription}</Text>
          <View style={styles.boardContainer}>
            <Chessboard
              size={BOARD_SIZE}
              position={currentPuzzle.targetFen}
              interactive={false}
            />
          </View>
        </View>

        {/* Current Progress */}
        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Ionicons name="navigate" size={20} color={Colors.primary} />
            <Text style={styles.progressTitle}>Your Path</Text>
          </View>
          <View style={styles.pathContainer}>
            {currentPath.length === 0 ? (
              <Text style={styles.pathEmpty}>Start by selecting a move below</Text>
            ) : (
              <Text style={styles.pathText}>
                {currentPath.map((move, index) => {
                  const chessTest = new Chess(currentPuzzle.startFen);
                  for (let i = 0; i <= index; i++) {
                    chessTest.move(currentPath[i]);
                  }
                  return chessTest.history().slice(-1)[0];
                }).join(' → ')}
              </Text>
            )}
          </View>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pathsFound}</Text>
              <Text style={styles.statLabel}>Paths Found</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{currentPuzzleIndex + 1}/{TRANSPOSITION_PUZZLES.length}</Text>
              <Text style={styles.statLabel}>Puzzle</Text>
            </View>
          </View>
        </View>

        {/* Available Moves */}
        <Text style={styles.sectionTitle}>Choose Your Next Move</Text>
        <View style={styles.movesGrid}>
          {availableMoves.map((node, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.moveButton,
                showSuccess && styles.moveButtonSuccess,
                showFailed && !node.isCorrect && styles.moveButtonError,
              ]}
              onPress={() => handleMoveSelect(node)}
              disabled={showSuccess || showFailed}
            >
              <Text style={styles.moveButtonText}>{node.san}</Text>
              {node.description && (
                <Text style={styles.moveButtonDescription} numberOfLines={2}>
                  {node.description}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Success/Failure State */}
        {showSuccess && (
          <View style={styles.resultCard}>
            <Ionicons name="checkmark-circle" size={48} color={Colors.success} />
            <Text style={styles.resultTitle}>Path Complete!</Text>
            <Text style={styles.resultText}>
              You successfully navigated to the target position
            </Text>
          </View>
        )}

        {showFailed && (
          <View style={[styles.resultCard, styles.resultCardError]}>
            <Ionicons name="close-circle" size={48} color={Colors.error} />
            <Text style={[styles.resultTitle, styles.resultTitleError]}>Wrong Path</Text>
            <Text style={styles.resultText}>
              That move doesn't lead to the target. Try again!
            </Text>
          </View>
        )}

        {/* Hint Button */}
        {!showSuccess && !showFailed && (
          <TouchableOpacity
            style={styles.hintButton}
            onPress={() => {
              const hintPrompt: CoachPrompt = {
                type: 'hint',
                text: currentPuzzle.hint,
              };
              setCoachPrompt(hintPrompt);
            }}
          >
            <Ionicons name="bulb-outline" size={20} color={Colors.milestone} />
            <Text style={styles.hintButtonText}>Show Hint</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Digital Coach Dialog */}
      {coachPrompt && (
        <DigitalCoachDialog
          prompt={coachPrompt}
          onDismiss={() => setCoachPrompt(null)}
        />
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
  skipButton: {
    padding: Spacing.xs,
  },
  skipText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semibold,
  },
  content: {
    padding: Spacing.md,
  },
  targetCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
  },
  targetLabel: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.milestone,
    letterSpacing: 1.5,
    marginBottom: Spacing.xs,
  },
  targetDescription: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  boardContainer: {
    marginVertical: Spacing.md,
  },
  progressCard: {
    backgroundColor: Colors.primary + '15',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  progressTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  pathContainer: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    minHeight: 60,
    justifyContent: 'center',
  },
  pathEmpty: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  pathText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    fontWeight: Typography.fontWeight.semibold,
    textAlign: 'center',
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
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  moveButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  moveButtonSuccess: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
  },
  moveButtonError: {
    backgroundColor: Colors.error + '20',
    borderColor: Colors.error,
  },
  moveButtonText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  moveButtonDescription: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  resultCard: {
    backgroundColor: Colors.success + '20',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  resultCardError: {
    backgroundColor: Colors.error + '20',
  },
  resultTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.success,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  resultTitleError: {
    color: Colors.error,
  },
  resultText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
    textAlign: 'center',
  },
  hintButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.milestone + '20',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  hintButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.milestone,
  },
});
