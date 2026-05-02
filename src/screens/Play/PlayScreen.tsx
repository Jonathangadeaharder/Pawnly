/**
 * Play Screen (The Sparring Ring)
 * Play against AI opponents with varying difficulty levels
 */

import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chess } from 'chess.js';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Chessboard from '../../components/organisms/Chessboard';
import DigitalCoachDialog from '../../components/organisms/DigitalCoachDialog';
import { useGameStore } from '../../state/gameStore';
import { useUserStore } from '../../state/userStore';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import type { CoachPrompt, Square, SimpleGameHistory, PlayStackParamList } from '../../types';
import { getAIMoveDelayed, type AIDifficulty, getDifficultyDescription, getEstimatedELO } from '../../services/ai/enhancedAI';
import * as Haptics from 'expo-haptics';

type GameState = 'setup' | 'playing' | 'finished';
type PlayScreenNavigationProp = NativeStackNavigationProp<PlayStackParamList, 'PlayHome'>;

export default function PlayScreen() {
  const navigation = useNavigation<PlayScreenNavigationProp>();
  const { position, resetGame, moves, loadPosition } = useGameStore();
  const { addGameToHistory, addXP } = useUserStore();

  // Game state
  const [gameState, setGameState] = useState<GameState>('setup');
  const [difficulty, setDifficulty] = useState<AIDifficulty>('intermediate');
  const [playerColor, setPlayerColor] = useState<'white' | 'black'>('white');
  const [chess] = useState(() => new Chess());
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [gameResult, setGameResult] = useState<string | null>(null);
  const [showDifficultyModal, setShowDifficultyModal] = useState(false);

  // Coach state
  const [showCoach, setShowCoach] = useState(false);
  const [coachPrompt, setCoachPrompt] = useState<CoachPrompt | null>(null);

  // Sync chess.js with game store position
  useEffect(() => {
    if (gameState === 'playing') {
      try {
        chess.load(position.fen);
      } catch (error) {
        console.error('Error loading FEN:', error);
      }
    }
  }, [position.fen, gameState]);

  // AI move handling
  useEffect(() => {
    if (gameState === 'playing' && !isAIThinking) {
      const isPlayerTurn =
        (playerColor === 'white' && chess.turn() === 'w') ||
        (playerColor === 'black' && chess.turn() === 'b');

      if (!isPlayerTurn && !chess.isGameOver()) {
        makeAIMove();
      }
    }
  }, [position.fen, gameState, playerColor, isAIThinking]);

  // Check for game over
  useEffect(() => {
    if (gameState === 'playing' && chess.isGameOver()) {
      handleGameOver();
    }
  }, [position.fen, gameState]);

  const makeAIMove = async () => {
    setIsAIThinking(true);

    try {
      const aiMove = await getAIMoveDelayed(chess, difficulty);

      if (aiMove && gameState === 'playing') {
        // Small delay to prevent too fast AI
        await new Promise(resolve => setTimeout(resolve, 300));

        loadPosition(chess.fen());
        const move = chess.move({ from: aiMove.from, to: aiMove.to });

        if (move) {
          loadPosition(chess.fen());
        }
      }
    } catch (error) {
      console.error('AI move error:', error);
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleMove = (from: Square, to: Square) => {
    if (gameState !== 'playing' || isAIThinking) return;

    const isPlayerTurn =
      (playerColor === 'white' && chess.turn() === 'w') ||
      (playerColor === 'black' && chess.turn() === 'b');

    if (!isPlayerTurn) return;

    try {
      const move = chess.move({ from, to });
      if (move) {
        loadPosition(chess.fen());
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.error('Invalid move:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleGameOver = () => {
    let result = 'Draw';
    let xpReward = 25;

    if (chess.isCheckmate()) {
      const winner = chess.turn() === 'w' ? 'Black' : 'White';
      const playerWon =
        (winner === 'White' && playerColor === 'white') ||
        (winner === 'Black' && playerColor === 'black');

      result = playerWon ? 'You won!' : 'You lost';
      xpReward = playerWon ? 100 : 25;
    } else if (chess.isStalemate()) {
      result = 'Stalemate';
    } else if (chess.isThreefoldRepetition()) {
      result = 'Draw by repetition';
    } else if (chess.isInsufficientMaterial()) {
      result = 'Draw by insufficient material';
    }

    setGameResult(result);
    setGameState('finished');

    // Save game to history
    const session: SimpleGameHistory = {
      id: Date.now().toString(),
      date: new Date(),
      playerColor,
      opponentType: 'ai',
      opponentRating: getEstimatedELO(difficulty),
      result: result.includes('won') ? 'win' : result.includes('lost') ? 'loss' : 'draw',
      moves: chess.history(),
      finalPosition: chess.fen(),
      timeSpent: 0,
      accuracy: 0,
    };

    addGameToHistory(session);
    addXP(xpReward);

    Haptics.notificationAsync(
      result.includes('won')
        ? Haptics.NotificationFeedbackType.Success
        : Haptics.NotificationFeedbackType.Warning
    );
  };

  const startNewGame = () => {
    chess.reset();
    resetGame();
    setGameState('playing');
    setGameResult(null);
    setIsAIThinking(false);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleResign = () => {
    Alert.alert(
      'Resign Game',
      'Are you sure you want to resign?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Resign',
          style: 'destructive',
          onPress: () => {
            setGameResult('You resigned');
            setGameState('finished');

            const session: SimpleGameHistory = {
              id: Date.now().toString(),
              date: new Date(),
              playerColor,
              opponentType: 'ai',
              opponentRating: getEstimatedELO(difficulty),
              result: 'loss',
              moves: chess.history(),
              finalPosition: chess.fen(),
              timeSpent: 0,
              accuracy: 0,
            };

            addGameToHistory(session);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          },
        },
      ]
    );
  };

  // Render setup screen
  const renderSetup = () => (
    <View style={styles.setupContainer}>
      <Text style={styles.title}>The Sparring Ring</Text>
      <Text style={styles.subtitle}>
        Play against AI opponents to practice your skills
      </Text>

      {/* Difficulty Selection */}
      <View style={styles.setupCard}>
        <Text style={styles.setupLabel}>AI Difficulty</Text>

        <TouchableOpacity
          style={[styles.difficultyOption, difficulty === 'beginner' && styles.difficultySelected]}
          onPress={() => setDifficulty('beginner')}
        >
          <Ionicons
            name={difficulty === 'beginner' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={difficulty === 'beginner' ? Colors.primary : Colors.textSecondary}
          />
          <View style={styles.difficultyInfo}>
            <Text style={styles.difficultyName}>Beginner (~800 ELO)</Text>
            <Text style={styles.difficultyDesc}>{getDifficultyDescription('beginner')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.difficultyOption, difficulty === 'intermediate' && styles.difficultySelected]}
          onPress={() => setDifficulty('intermediate')}
        >
          <Ionicons
            name={difficulty === 'intermediate' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={difficulty === 'intermediate' ? Colors.primary : Colors.textSecondary}
          />
          <View style={styles.difficultyInfo}>
            <Text style={styles.difficultyName}>Intermediate (~1200 ELO)</Text>
            <Text style={styles.difficultyDesc}>{getDifficultyDescription('intermediate')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.difficultyOption, difficulty === 'advanced' && styles.difficultySelected]}
          onPress={() => setDifficulty('advanced')}
        >
          <Ionicons
            name={difficulty === 'advanced' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={difficulty === 'advanced' ? Colors.primary : Colors.textSecondary}
          />
          <View style={styles.difficultyInfo}>
            <Text style={styles.difficultyName}>Advanced (~1800 ELO)</Text>
            <Text style={styles.difficultyDesc}>{getDifficultyDescription('advanced')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.difficultyOption, difficulty === 'expert' && styles.difficultySelected]}
          onPress={() => setDifficulty('expert')}
        >
          <Ionicons
            name={difficulty === 'expert' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={difficulty === 'expert' ? Colors.primary : Colors.textSecondary}
          />
          <View style={styles.difficultyInfo}>
            <Text style={styles.difficultyName}>Expert (~2200 ELO)</Text>
            <Text style={styles.difficultyDesc}>{getDifficultyDescription('expert')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.difficultyOption, difficulty === 'master' && styles.difficultySelected]}
          onPress={() => setDifficulty('master')}
        >
          <Ionicons
            name={difficulty === 'master' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={difficulty === 'master' ? Colors.primary : Colors.textSecondary}
          />
          <View style={styles.difficultyInfo}>
            <Text style={styles.difficultyName}>Master (~2600 ELO) - Stockfish</Text>
            <Text style={styles.difficultyDesc}>{getDifficultyDescription('master')}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.difficultyOption, difficulty === 'grandmaster' && styles.difficultySelected]}
          onPress={() => setDifficulty('grandmaster')}
        >
          <Ionicons
            name={difficulty === 'grandmaster' ? 'radio-button-on' : 'radio-button-off'}
            size={24}
            color={difficulty === 'grandmaster' ? Colors.primary : Colors.textSecondary}
          />
          <View style={styles.difficultyInfo}>
            <Text style={styles.difficultyName}>Grandmaster (~3200 ELO) - Stockfish</Text>
            <Text style={styles.difficultyDesc}>{getDifficultyDescription('grandmaster')}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Color Selection */}
      <View style={styles.setupCard}>
        <Text style={styles.setupLabel}>Play As</Text>

        <View style={styles.colorOptions}>
          <TouchableOpacity
            style={[styles.colorOption, playerColor === 'white' && styles.colorSelected]}
            onPress={() => setPlayerColor('white')}
          >
            <Ionicons name="square-outline" size={32} color={Colors.text} />
            <Text style={styles.colorText}>White</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.colorOption, playerColor === 'black' && styles.colorSelected]}
            onPress={() => setPlayerColor('black')}
          >
            <Ionicons name="square" size={32} color={Colors.text} />
            <Text style={styles.colorText}>Black</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Start Button */}
      <TouchableOpacity style={styles.startButton} onPress={startNewGame}>
        <Ionicons name="play" size={24} color={Colors.textInverse} />
        <Text style={styles.startButtonText}>Start Game</Text>
      </TouchableOpacity>
    </View>
  );

  // Render playing screen
  const renderPlaying = () => (
    <>
      <Text style={styles.title}>The Sparring Ring</Text>

      {/* Game Status */}
      <View style={styles.gameInfo}>
        <View style={styles.infoRow}>
          <Ionicons name="person" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoLabel}>
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} AI
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoLabel}>
            {isAIThinking ? 'AI Thinking...' : chess.turn() === 'w' ? "White's Turn" : "Black's Turn"}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="list" size={16} color={Colors.textSecondary} />
          <Text style={styles.infoLabel}>Move {Math.floor(chess.history().length / 2) + 1}</Text>
        </View>
      </View>

      {/* Chessboard */}
      <View style={styles.boardSection}>
        <Chessboard
          showCoordinates={true}
          isFlipped={playerColor === 'black'}
          onMove={handleMove}
          interactionMode="both"
        />
      </View>

      {/* Move History */}
      {chess.history().length > 0 && (
        <View style={styles.moveHistory}>
          <Text style={styles.moveHistoryTitle}>Move History</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Text style={styles.moveHistoryText}>
              {chess.history().join(' • ')}
            </Text>
          </ScrollView>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => setGameState('setup')}
        >
          <Ionicons name="close" size={20} color={Colors.text} />
          <Text style={styles.secondaryButtonText}>New Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.dangerButton]}
          onPress={handleResign}
        >
          <Ionicons name="flag" size={20} color={Colors.textInverse} />
          <Text style={styles.dangerButtonText}>Resign</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  // Render finished screen
  const renderFinished = () => (
    <View style={styles.finishedContainer}>
      <Ionicons
        name={gameResult?.includes('won') ? 'trophy' : gameResult?.includes('lost') ? 'sad' : 'ribbon'}
        size={64}
        color={gameResult?.includes('won') ? Colors.success : gameResult?.includes('lost') ? Colors.error : Colors.warning}
      />

      <Text style={styles.resultTitle}>{gameResult}</Text>

      <View style={styles.resultStats}>
        <View style={styles.resultStat}>
          <Text style={styles.resultStatLabel}>Total Moves</Text>
          <Text style={styles.resultStatValue}>{chess.history().length}</Text>
        </View>
        <View style={styles.resultStat}>
          <Text style={styles.resultStatLabel}>XP Earned</Text>
          <Text style={styles.resultStatValue}>
            {gameResult?.includes('won') ? '+100' : '+25'}
          </Text>
        </View>
      </View>

      {/* Final Position */}
      <View style={styles.boardSection}>
        <Chessboard
          showCoordinates={true}
          isFlipped={playerColor === 'black'}
          interactionMode="tap-tap"
        />
      </View>

      {/* Move History */}
      <View style={styles.moveHistory}>
        <Text style={styles.moveHistoryTitle}>Final Move History</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text style={styles.moveHistoryText}>
            {chess.history().join(' • ')}
          </Text>
        </ScrollView>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => {
            const gameToAnalyze: SimpleGameHistory = {
              id: Date.now().toString(),
              date: new Date(),
              playerColor,
              opponentType: 'ai',
              opponentRating: getEstimatedELO(difficulty),
              result: gameResult?.includes('won') ? 'win' : gameResult?.includes('lost') ? 'loss' : 'draw',
              moves: chess.history(),
              finalPosition: chess.fen(),
              timeSpent: 0,
              accuracy: 0,
            };
            navigation.navigate('GameAnalysis', { game: gameToAnalyze });
          }}
        >
          <Ionicons name="analytics" size={20} color={Colors.text} />
          <Text style={styles.secondaryButtonText}>Analyze Game</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={() => setGameState('setup')}
        >
          <Ionicons name="refresh" size={20} color={Colors.textInverse} />
          <Text style={styles.primaryButtonText}>New Game</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {gameState === 'setup' && renderSetup()}
        {gameState === 'playing' && renderPlaying()}
        {gameState === 'finished' && renderFinished()}
      </ScrollView>
    </View>
  );
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
    marginBottom: Spacing.lg,
  },

  // Setup screen styles
  setupContainer: {
    flex: 1,
  },
  setupCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  setupLabel: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  difficultyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  difficultySelected: {
    backgroundColor: Colors.primary + '20',
  },
  difficultyInfo: {
    flex: 1,
  },
  difficultyName: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  difficultyDesc: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  colorOptions: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  colorOption: {
    flex: 1,
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    borderWidth: 2,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  colorSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '10',
  },
  colorText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  startButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.lg,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
  },
  startButtonText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.textInverse,
  },

  // Playing screen styles
  gameInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.backgroundSecondary,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  infoLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
  },
  boardSection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  moveHistory: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  moveHistoryTitle: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  moveHistoryText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
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
  primaryButton: {
    backgroundColor: Colors.primary,
  },
  primaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },
  secondaryButton: {
    backgroundColor: Colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondaryButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  dangerButton: {
    backgroundColor: Colors.error,
  },
  dangerButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textInverse,
  },

  // Finished screen styles
  finishedContainer: {
    flex: 1,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginVertical: Spacing.lg,
  },
  resultStats: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  resultStat: {
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    minWidth: 120,
  },
  resultStatLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  resultStatValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
});
