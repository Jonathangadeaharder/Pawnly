/**
 * Checkmate Master Mini-Game
 * Train your ability to spot and deliver checkmate patterns
 *
 * Concept: Identify and execute classic checkmate patterns
 * Focus: Pattern recognition for mating attacks
 * Trains: Tactical vision for finishing positions
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Chessboard from './Chessboard';
import DigitalCoachDialog from './DigitalCoachDialog';
import { useGameStore } from '../../state/gameStore';
import { playSound } from '../../services/audio/soundService';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import type { CoachPrompt, Square } from '../../types';

export interface CheckmatePuzzle {
  id: string;
  name: string;
  fen: string;
  solution: string[]; // Sequence of moves to deliver mate
  patternType: CheckmatePattern;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  hint: string;
  timeLimit: number;
}

export type CheckmatePattern =
  | 'back-rank-mate'
  | 'smothered-mate'
  | 'arabian-mate'
  | 'anastasias-mate'
  | 'epaulette-mate'
  | 'opera-mate'
  | 'double-bishop-mate'
  | 'queen-and-king-mate'
  | 'two-rooks-mate'
  | 'ladder-mate';

/**
 * Checkmate Pattern Library
 */
const CHECKMATE_PUZZLES: CheckmatePuzzle[] = [
  {
    id: 'mate-1',
    name: 'Classic Back Rank',
    fen: '6k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
    solution: ['Rd8#'],
    patternType: 'back-rank-mate',
    difficulty: 'easy',
    description: 'The king is trapped by its own pawns - deliver mate on the back rank.',
    hint: 'The rook can deliver mate immediately!',
    timeLimit: 15,
  },
  {
    id: 'mate-2',
    name: 'Two Rooks Ladder',
    fen: '6k1/8/6K1/8/8/8/R7/R7 w - - 0 1',
    solution: ['Ra8#'],
    patternType: 'ladder-mate',
    difficulty: 'easy',
    description: 'Use your two rooks to drive the king up the board and deliver mate.',
    hint: 'One rook gives check, the other cuts off escape squares.',
    timeLimit: 15,
  },
  {
    id: 'mate-3',
    name: 'Smothered Beauty',
    fen: '5rk1/5ppp/8/8/8/8/8/5RNK w - - 0 1',
    solution: ['Rf8+', 'Rxf8', 'Nf7#'],
    patternType: 'smothered-mate',
    difficulty: 'medium',
    description: 'Sacrifice your rook to set up a smothered mate with the knight.',
    hint: 'Give up the rook to smother the king!',
    timeLimit: 20,
  },
  {
    id: 'mate-4',
    name: 'Arabian Mate',
    fen: '5r1k/5N1p/7K/8/8/8/8/7R w - - 0 1',
    solution: ['Rh1#'],
    patternType: 'arabian-mate',
    difficulty: 'medium',
    description: 'The knight and rook coordinate to deliver mate.',
    hint: 'The knight controls the escape squares - bring the rook to the h-file.',
    timeLimit: 18,
  },
  {
    id: 'mate-5',
    name: 'Anastasia\'s Mate',
    fen: '5rk1/5Npp/8/8/8/8/8/6RK w - - 0 1',
    solution: ['Rg8+', 'Rxg8', 'Nxg8'],
    patternType: 'anastasias-mate',
    difficulty: 'medium',
    description: 'Knight and rook deliver mate with the help of enemy pawns.',
    hint: 'Sacrifice the rook on g8 to bring the knight in!',
    timeLimit: 20,
  },
  {
    id: 'mate-6',
    name: 'Epaulette Mate',
    fen: 'r4r2/5pkp/8/8/8/8/8/4Q2K w - - 0 1',
    solution: ['Qe8#'],
    patternType: 'epaulette-mate',
    difficulty: 'medium',
    description: 'The king\'s own rooks block escape - like epaulettes on a uniform.',
    hint: 'The rooks are blocking the king\'s escape!',
    timeLimit: 15,
  },
  {
    id: 'mate-7',
    name: 'Opera House Mate',
    fen: 'r4rk1/ppp2ppp/8/8/8/8/8/3R2BK w - - 0 1',
    solution: ['Rd8+', 'Rxd8', 'Bxd8'],
    patternType: 'opera-mate',
    difficulty: 'medium',
    description: 'A classic combination: rook sacrifice followed by bishop mate.',
    hint: 'Sacrifice the rook to open the diagonal!',
    timeLimit: 20,
  },
  {
    id: 'mate-8',
    name: 'Double Bishop',
    fen: 'r3k2r/ppp2ppp/8/8/8/8/8/4BB1K w kq - 0 1',
    solution: ['Bc4#'],
    patternType: 'double-bishop-mate',
    difficulty: 'hard',
    description: 'Two bishops working together deliver mate.',
    hint: 'The bishops control all the escape squares!',
    timeLimit: 18,
  },
  {
    id: 'mate-9',
    name: 'Queen and King Cooperation',
    fen: '7k/7P/6K1/8/8/8/8/6Q1 w - - 0 1',
    solution: ['Qg7#'],
    patternType: 'queen-and-king-mate',
    difficulty: 'easy',
    description: 'The queen and king work together to deliver mate.',
    hint: 'The pawn and king control escape squares - bring the queen in!',
    timeLimit: 12,
  },
  {
    id: 'mate-10',
    name: 'Advanced Back Rank',
    fen: '3r2k1/5ppp/8/8/8/8/5PPP/3R2K1 w - - 0 1',
    solution: ['Rxd8#'],
    patternType: 'back-rank-mate',
    difficulty: 'easy',
    description: 'Trade rooks and deliver back rank mate.',
    hint: 'Exchange rooks and checkmate!',
    timeLimit: 15,
  },
  {
    id: 'mate-11',
    name: 'Smothered Mate Setup',
    fen: 'r1b1k2r/ppppnppp/8/8/8/8/PPPP1PPP/RNBQKBNR w KQkq - 0 1',
    solution: ['Qxe7#'],
    patternType: 'smothered-mate',
    difficulty: 'hard',
    description: 'The knight on e7 smothers the king - deliver mate.',
    hint: 'The knight prevents the king from escaping!',
    timeLimit: 15,
  },
  {
    id: 'mate-12',
    name: 'Complex Arabian',
    fen: '6rk/5N1p/7K/8/8/8/8/7R w - - 0 1',
    solution: ['Rxh7+', 'Kg8', 'Rh8#'],
    patternType: 'arabian-mate',
    difficulty: 'hard',
    description: 'Force the king to g8, then deliver Arabian mate.',
    hint: 'First capture the pawn with check!',
    timeLimit: 22,
  },
];

/**
 * Get checkmate pattern display name
 */
function getPatternName(pattern: CheckmatePattern): string {
  const names: Record<CheckmatePattern, string> = {
    'back-rank-mate': 'Back Rank Mate',
    'smothered-mate': 'Smothered Mate',
    'arabian-mate': 'Arabian Mate',
    'anastasias-mate': 'Anastasia\'s Mate',
    'epaulette-mate': 'Epaulette Mate',
    'opera-mate': 'Opera Mate',
    'double-bishop-mate': 'Double Bishop Mate',
    'queen-and-king-mate': 'Queen and King Mate',
    'two-rooks-mate': 'Two Rooks Mate',
    'ladder-mate': 'Ladder Mate',
  };
  return names[pattern];
}

interface CheckmateMasterProps {
  onComplete: (score: number, accuracy: number) => void;
  onExit: () => void;
}

export default function CheckmateMaster({ onComplete, onExit }: CheckmateMasterProps) {
  const { loadPosition, makeMove, resetGame, position, isCheckmate } = useGameStore();

  const [puzzles] = useState<CheckmatePuzzle[]>(() =>
    [...CHECKMATE_PUZZLES].sort(() => Math.random() - 0.5).slice(0, 8)
  );
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState(0);
  const [movesMade, setMovesMade] = useState<string[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(15);
  const [isActive, setIsActive] = useState(false);
  const [solved, setSolved] = useState(false);
  const [failed, setFailed] = useState(false);
  const [showCoach, setShowCoach] = useState(false);
  const [coachPrompt, setCoachPrompt] = useState<CoachPrompt | null>(null);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);

  const [crownAnim] = useState(new Animated.Value(0));
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentPuzzle = puzzles[currentPuzzleIndex];

  // Load puzzle
  useEffect(() => {
    if (currentPuzzle) {
      resetGame();
      loadPosition(currentPuzzle.fen);
      setMovesMade([]);
      setTimeRemaining(currentPuzzle.timeLimit);
      setSolved(false);
      setFailed(false);
      crownAnim.setValue(0);

      // Show puzzle intro
      const introPrompt: CoachPrompt = {
        id: 'checkmate-intro',
        type: 'socratic-question',
        text: `${getPatternName(currentPuzzle.patternType)}: ${currentPuzzle.description}`,
      };

      setCoachPrompt(introPrompt);
      setShowCoach(true);

      setTimeout(() => {
        setShowCoach(false);
        startTimer();
      }, 3000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [currentPuzzleIndex]);

  const startTimer = () => {
    setIsActive(true);

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleTimeOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeOut = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsActive(false);
    setFailed(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    playSound('incorrect');

    const failPrompt: CoachPrompt = {
      id: 'time-out',
      type: 'feedback-negative',
      text: `Time's up! The solution was: ${currentPuzzle.solution.join(', ')}. ${currentPuzzle.hint}`,
    };

    setCoachPrompt(failPrompt);
    setShowCoach(true);

    setTimeout(() => {
      setShowCoach(false);
      nextPuzzle();
    }, 4000);
  };

  const handleMoveAttempt = (move: { from: Square; to: Square }) => {
    const moveNotation = `${move.from}${move.to}`;
    const expectedMove = currentPuzzle.solution[movesMade.length];

    // Try to make the move in the game
    const success = makeMove(move.from, move.to);

    if (!success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      playSound('incorrect');
      return;
    }

    const newMovesList = [...movesMade, moveNotation];
    setMovesMade(newMovesList);
    setAttempts(attempts + 1);

    // Check if this completes the solution
    if (newMovesList.length === currentPuzzle.solution.length) {
      handlePuzzleSolved();
    } else {
      // Continue to next move in sequence
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      playSound('move');
    }
  };

  const handlePuzzleSolved = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setIsActive(false);
    setSolved(true);
    setScore(score + 1);

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    playSound('correct');

    // Animate crown
    Animated.spring(crownAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();

    const successPrompt: CoachPrompt = {
      id: 'checkmate-success',
      type: 'feedback-positive',
      text: `Checkmate! Perfect ${getPatternName(currentPuzzle.patternType)}! This pattern is essential to master.`,
    };

    setCoachPrompt(successPrompt);
    setShowCoach(true);

    setTimeout(() => {
      setShowCoach(false);
      nextPuzzle();
    }, 3000);
  };

  const nextPuzzle = () => {
    if (currentPuzzleIndex < puzzles.length - 1) {
      setCurrentPuzzleIndex(currentPuzzleIndex + 1);
    } else {
      // Game complete
      const accuracy = attempts > 0 ? (score / attempts) * 100 : 0;
      onComplete(score, accuracy);
    }
  };

  const handleHint = () => {
    const hintPrompt: CoachPrompt = {
      id: 'hint',
      type: 'hint',
      text: currentPuzzle.hint,
    };

    setCoachPrompt(hintPrompt);
    setShowCoach(true);

    setTimeout(() => {
      setShowCoach(false);
    }, 3000);
  };

  const progressPercentage = ((currentPuzzleIndex + 1) / puzzles.length) * 100;
  const crownScale = crownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const timerColor = timeRemaining <= 5 ? Colors.error : timeRemaining <= 10 ? Colors.warning : Colors.primary;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <View style={styles.titleContainer}>
            <Ionicons name="trophy" size={24} color={Colors.gold} />
            <Text style={styles.title}>Checkmate Master</Text>
          </View>
          <Text style={styles.subtitle}>
            {getPatternName(currentPuzzle.patternType)}
          </Text>
        </View>

        <TouchableOpacity onPress={handleHint} style={styles.hintButton}>
          <Ionicons name="bulb-outline" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
        </View>
        <Text style={styles.progressText}>
          Puzzle {currentPuzzleIndex + 1} of {puzzles.length}
        </Text>
      </View>

      {/* Timer */}
      <View style={styles.timerContainer}>
        <Ionicons name="time-outline" size={20} color={timerColor} />
        <Text style={[styles.timerText, { color: timerColor }]}>
          {timeRemaining}s
        </Text>
      </View>

      {/* Chessboard */}
      <View style={styles.boardContainer}>
        <Chessboard
          onMoveAttempt={handleMoveAttempt}
          disabled={solved || failed || !isActive}
        />

        {/* Success Crown Animation */}
        {solved && (
          <Animated.View
            style={[
              styles.crownOverlay,
              {
                transform: [{ scale: crownScale }],
                opacity: crownAnim,
              },
            ]}
          >
            <Ionicons name="trophy" size={80} color={Colors.gold} />
            <Text style={styles.crownText}>CHECKMATE!</Text>
          </Animated.View>
        )}
      </View>

      {/* Score */}
      <View style={styles.scoreContainer}>
        <View style={styles.scoreItem}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.success} />
          <Text style={styles.scoreText}>Solved: {score}</Text>
        </View>
        <View style={styles.scoreItem}>
          <Ionicons name="eye" size={20} color={Colors.primary} />
          <Text style={styles.scoreText}>Pattern: {currentPuzzle.difficulty}</Text>
        </View>
      </View>

      {/* Description */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>{currentPuzzle.name}</Text>
        <Text style={styles.descriptionHint}>{currentPuzzle.description}</Text>
      </View>

      {/* Digital Coach Dialog */}
      {showCoach && coachPrompt && (
        <DigitalCoachDialog
          prompt={coachPrompt}
          onDismiss={() => setShowCoach(false)}
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
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  exitButton: {
    padding: Spacing.sm,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    ...Typography.h2,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  hintButton: {
    padding: Spacing.sm,
  },
  progressContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: Colors.border,
    borderRadius: BorderRadius.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.gold,
  },
  progressText: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    paddingVertical: Spacing.sm,
  },
  timerText: {
    ...Typography.h3,
    fontWeight: 'bold',
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  crownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  crownText: {
    ...Typography.h1,
    color: Colors.gold,
    marginTop: Spacing.md,
    fontWeight: 'bold',
  },
  scoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  scoreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  scoreText: {
    ...Typography.body,
    color: Colors.text,
  },
  descriptionContainer: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    alignItems: 'center',
  },
  description: {
    ...Typography.body,
    color: Colors.text,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  descriptionHint: {
    ...Typography.caption,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
  },
});
