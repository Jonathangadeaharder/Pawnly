/**
 * Bishop's Prison Mini-Game
 * Teaches "Good vs. Bad Bishop" concept through asymmetric endgame drill
 *
 * Setup:
 * - User (White): King, Light-Squared Bishop (good), Pawns on dark squares
 * - AI (Black): King, Light-Squared Bishop (bad), Pawns on light squares (same color as bishop)
 *
 * Goal: Win by exploiting the opponent's bad bishop
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Chess } from 'chess.js';

import Chessboard from './Chessboard';
import DigitalCoachDialog from './DigitalCoachDialog';
import { useGameStore } from '../../state/gameStore';
import { playSound, playSoundSequence } from '../../services/audio/soundService';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import type { CoachPrompt, Square } from '../../types';

// Starting position for Bishop's Prison
// White: King on e3, Bishop on c1 (light-squared), Pawns on d4, e5, f4
// Black: King on e7, Bishop on f8 (light-squared), Pawns on c5, d6, e7
const BISHOPS_PRISON_FEN = '5b2/ppp1k1pp/3p4/2p1P3/3P1P2/4K3/PPP3PP/2B5 w - - 0 1';

interface BishopsPrisonProps {
  onComplete: (success: boolean, moves: number, timeSpent: number) => void;
  onExit: () => void;
}

export default function BishopsPrison({ onComplete, onExit }: BishopsPrisonProps) {
  const { position, loadPosition, resetGame, moves } = useGameStore();

  const [moveCount, setMoveCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [showCoach, setShowCoach] = useState(false);
  const [coachPrompt, setCoachPrompt] = useState<CoachPrompt | null>(null);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost' | 'draw'>('playing');

  // Initialize the puzzle
  useEffect(() => {
    loadPosition(BISHOPS_PRISON_FEN);

    // Show initial coach prompt
    const welcomePrompt: CoachPrompt = {
      id: 'bishops-prison-welcome',
      type: 'explanation',
      text: "Welcome to Bishop's Prison! In this endgame, you have a 'good' bishop whose pawns are on the opposite color. Your opponent has a 'bad' bishop - its pawns block it on the same color squares.",
      followUpPrompts: [
        {
          id: 'bishops-prison-goal',
          type: 'socratic-question',
          text: "Your goal: Use your king and good bishop to infiltrate and win. What advantage does your bishop have?",
        },
      ],
    };

    setCoachPrompt(welcomePrompt);
    setShowCoach(true);

    return () => {
      resetGame();
    };
  }, []);

  // Check game status after each move
  useEffect(() => {
    const chess = new Chess(position.fen);

    if (chess.isCheckmate()) {
      if (position.turn === 'b') {
        // White won
        handleWin();
      } else {
        // Black won (unlikely but possible)
        handleLoss();
      }
    } else if (chess.isDraw() || chess.isStalemate() || chess.isThreefoldRepetition()) {
      handleDraw();
    }
  }, [position]);

  const handleWin = () => {
    setGameStatus('won');
    playSound('checkmate');

    const timeSpent = Date.now() - startTime;

    const winPrompt: CoachPrompt = {
      id: 'bishops-prison-win',
      type: 'encouragement',
      text: `Excellent work! You won in ${moveCount} moves. You successfully exploited the bad bishop - notice how it couldn't defend its own pawns because they were on the same color!`,
    };

    setCoachPrompt(winPrompt);
    setShowCoach(true);

    setTimeout(() => {
      onComplete(true, moveCount, timeSpent);
    }, 3000);
  };

  const handleLoss = () => {
    setGameStatus('lost');
    playSound('error');

    const lossPrompt: CoachPrompt = {
      id: 'bishops-prison-loss',
      type: 'hint',
      text: "Your king got checkmated! Remember: In this endgame, your advantage is mobility. Keep your king active and infiltrate where their bad bishop can't reach.",
    };

    setCoachPrompt(lossPrompt);
    setShowCoach(true);

    setTimeout(() => {
      const timeSpent = Date.now() - startTime;
      onComplete(false, moveCount, timeSpent);
    }, 2000);
  };

  const handleDraw = () => {
    setGameStatus('draw');
    playSound('draw');

    const drawPrompt: CoachPrompt = {
      id: 'bishops-prison-draw',
      type: 'hint',
      text: "It's a draw. In this position, you had a winning advantage. Try to be more aggressive with your king - it's your strongest piece in this endgame!",
    };

    setCoachPrompt(drawPrompt);
    setShowCoach(true);

    setTimeout(() => {
      const timeSpent = Date.now() - startTime;
      onComplete(false, moveCount, timeSpent);
    }, 2000);
  };

  const handleMoveAttempt = useCallback(
    (from: Square, to: Square) => {
      // Only allow user moves (White)
      if (position.turn !== 'w') return;

      setMoveCount(moveCount + 1);

      // After user move, make simple AI move for Black
      setTimeout(() => {
        makeAIMove();
      }, 500);
    },
    [position, moveCount]
  );

  const makeAIMove = () => {
    const chess = new Chess(position.fen);
    const possibleMoves = chess.moves({ verbose: true });

    if (possibleMoves.length === 0) return;

    // Simple AI: Make a random legal move
    // In production, this would use Maia or a simple heuristic
    const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

    // The game store will handle the actual move via the board
    // For now, this is a placeholder for AI integration
  };

  const handleReset = () => {
    loadPosition(BISHOPS_PRISON_FEN);
    setMoveCount(0);
    setGameStatus('playing');
  };

  const handleHint = () => {
    const hintPrompt: CoachPrompt = {
      id: 'bishops-prison-hint',
      type: 'hint',
      text: "Look at Black's bishop. See how it's trapped behind its own pawns? Your king can invade on the dark squares where their bishop can't reach. Try advancing your king!",
      visualHighlights: [
        {
          type: 'circle',
          squares: ['c5', 'd6', 'e7'], // Black's bad pawns
          color: 'red',
        },
      ],
    };

    setCoachPrompt(hintPrompt);
    setShowCoach(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Bishop's Prison</Text>
          <Text style={styles.subtitle}>Good vs. Bad Bishop</Text>
        </View>
        <TouchableOpacity onPress={onExit} style={styles.exitButton}>
          <Ionicons name="close" size={24} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Game Stats */}
      <View style={styles.stats}>
        <View style={styles.statItem}>
          <Ionicons name="move" size={20} color={Colors.primary} />
          <Text style={styles.statValue}>{moveCount}</Text>
          <Text style={styles.statLabel}>Moves</Text>
        </View>

        <View style={styles.statItem}>
          <Ionicons name="time" size={20} color={Colors.info} />
          <Text style={styles.statValue}>
            {Math.floor((Date.now() - startTime) / 1000)}s
          </Text>
          <Text style={styles.statLabel}>Time</Text>
        </View>

        <View style={styles.statItem}>
          {gameStatus === 'playing' ? (
            <Ionicons name="play-circle" size={20} color={Colors.success} />
          ) : gameStatus === 'won' ? (
            <Ionicons name="trophy" size={20} color={Colors.milestone} />
          ) : (
            <Ionicons name="close-circle" size={20} color={Colors.error} />
          )}
          <Text style={styles.statValue}>{gameStatus}</Text>
          <Text style={styles.statLabel}>Status</Text>
        </View>
      </View>

      {/* Chessboard */}
      <View style={styles.boardContainer}>
        <Chessboard
          showCoordinates={true}
          interactionMode="tap-tap"
          onMove={handleMoveAttempt}
        />
      </View>

      {/* Concept Explanation */}
      <View style={styles.conceptBox}>
        <View style={styles.conceptHeader}>
          <Ionicons name="school" size={20} color={Colors.primary} />
          <Text style={styles.conceptTitle}>Key Concept</Text>
        </View>
        <Text style={styles.conceptText}>
          A "bad" bishop is blocked by its own pawns on the same color. A "good" bishop has pawns on opposite colors, giving it mobility and control.
        </Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.hintButton]}
          onPress={handleHint}
        >
          <Ionicons name="bulb-outline" size={20} color={Colors.info} />
          <Text style={styles.hintButtonText}>Hint</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.resetButton]}
          onPress={handleReset}
        >
          <Ionicons name="refresh-outline" size={20} color={Colors.textSecondary} />
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      </View>

      {/* Digital Coach Dialog */}
      {coachPrompt && (
        <DigitalCoachDialog
          visible={showCoach}
          prompt={coachPrompt}
          onDismiss={() => setShowCoach(false)}
          personality="tactical"
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: Spacing.md,
    backgroundColor: Colors.backgroundSecondary,
  },
  statItem: {
    alignItems: 'center',
    gap: Spacing.xs,
  },
  statValue: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  boardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.md,
  },
  conceptBox: {
    margin: Spacing.md,
    padding: Spacing.md,
    backgroundColor: Colors.primary + '10',
    borderLeftWidth: 4,
    borderLeftColor: Colors.primary,
    borderRadius: BorderRadius.md,
  },
  conceptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    marginBottom: Spacing.sm,
  },
  conceptTitle: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  conceptText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    lineHeight: Typography.lineHeight.relaxed * Typography.fontSize.sm,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  hintButton: {
    backgroundColor: Colors.info + '20',
  },
  hintButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.info,
  },
  resetButton: {
    backgroundColor: Colors.backgroundTertiary,
  },
  resetButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
  },
});
