/**
 * Game Analysis Screen
 * Post-game analysis with move-by-move evaluation
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Chess } from 'chess.js';
import Chessboard, { type Arrow, type Highlight } from '../../components/organisms/Chessboard';
import DigitalCoachDialog from '../../components/organisms/DigitalCoachDialog';
import { Colors, Typography, Spacing, BorderRadius } from '../../constants/theme';
import { analyzeGame, type MoveEvaluation, getBestMove as getBestMoveAI, evaluatePosition } from '../../services/ai/enhancedAI';
import { stockfishService, type MoveAnalysis, type GameAnalysis } from '../../services/ai/stockfishService';
import {
  identifyCriticalPositions,
  getCoachPromptForMove,
  isCriticalMove,
  type CriticalPosition,
} from '../../services/coach/coachCommentary';
import { getCoachIntervention } from '../../services/coach/coachService';
import { analyzeMove } from '../../services/chess/symbolicAnalyzer';
import { generateFeedback } from '../../services/ai/coachEngine';
import type { SimpleGameHistory, CoachPrompt, Square as ChessSquare } from '../../types';

interface GameAnalysisScreenProps {
  route: {
    params: {
      game: SimpleGameHistory;
    };
  };
  navigation: any;
}

export default function GameAnalysisScreen({ route, navigation }: GameAnalysisScreenProps) {
  const { game } = route.params;

  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [chess] = useState(() => new Chess());
  const [isAnalyzing, setIsAnalyzing] = useState(true);
  const [evaluations, setEvaluations] = useState<MoveEvaluation[]>([]);
  const [stockfishAnalysis, setStockfishAnalysis] = useState<GameAnalysis | null>(null);
  const [useStockfish] = useState(true);
  const [criticalPositions, setCriticalPositions] = useState<CriticalPosition[]>([]);
  const [showCoach, setShowCoach] = useState(false);
  const [currentCoachPrompt, setCurrentCoachPrompt] = useState<CoachPrompt | null>(null);
  const [punishmentArrows, setPunishmentArrows] = useState<Arrow[]>([]);
  const [isShowingPunishment, setIsShowingPunishment] = useState(false);

  // ... rest of state and effects

  const handleShowPunishment = async () => {
    if (!currentEvaluation || !currentEvaluation.isBlunder) return;

    setIsShowingPunishment(true);
    const beforeFen = chess.fen();
    
    // Find the punishment move using AI
    try {
      const bestMoveInfo = getBestMoveAI(chess, 4);
      if (bestMoveInfo) {
        setPunishmentArrows([
          {
            from: bestMoveInfo.from,
            to: bestMoveInfo.to,
            color: 'orange',
          }
        ]);
        
        // Show the coach explanation for the punishment
        const analysis = analyzeMove(beforeFen, chess.fen(), currentMove);
        const feedback = generateFeedback(analysis, 'beginner', 'friendly');
        
        setCurrentCoachPrompt({
          id: 'punishment-explanation',
          type: 'explanation',
          text: `If you play ${currentMove}, the opponent can punish it with ${bestMoveInfo.san}. ${feedback.text}`,
        });
        setShowCoach(true);
      }
    } catch (error) {
      console.error('Error getting punishment move:', error);
    }
  };

  const handleWhyNotMove = async (from: ChessSquare, to: ChessSquare) => {
    const tempChess = new Chess(chess.fen());
    const move = tempChess.move({ from, to });
    
    if (move) {
      // Analyze this "Why Not" move
      const beforeFen = chess.fen();
      const afterFen = tempChess.fen();
      
      try {
        const bestMoveInfo = getBestMoveAI(tempChess, 3);
        const evalScore = evaluatePosition(tempChess);
        
        // Construct explanation
        const analysis = analyzeMove(beforeFen, afterFen, move.san);
        const feedback = generateFeedback(analysis, 'beginner', 'friendly');
        
        setCurrentCoachPrompt({
          id: 'why-not-explanation',
          type: 'explanation',
          text: `If you played ${move.san} instead, the evaluation would be ${evalScore / 100}. The opponent's best response is ${bestMoveInfo?.san || 'unknown'}. ${feedback.text}`,
          visualHighlights: [
            {
              type: 'arrow',
              from,
              to,
              color: 'blue',
              squares: [from, to],
            },
            ...(bestMoveInfo ? [{
              type: 'arrow' as const,
              from: bestMoveInfo.from,
              to: bestMoveInfo.to,
              color: 'orange' as const,
              squares: [bestMoveInfo.from, bestMoveInfo.to],
            }] : [])
          ]
        });
        setShowCoach(true);
      } catch (error) {
        console.error('Error in Why Not analysis:', error);
      }
    }
  };

  // Analyze the game on mount
  useEffect(() => {
    const performAnalysis = async () => {
      setIsAnalyzing(true);

      try {
        if (useStockfish) {
          // Try Stockfish analysis first
          console.log('[Analysis] Using Stockfish for deeper analysis...');
          const stockfishResults = await stockfishService.analyzeGame(game.moves);
          setStockfishAnalysis(stockfishResults);

          // Convert Stockfish analysis to MoveEvaluation format for compatibility
          const convertedEvals: MoveEvaluation[] = stockfishResults.moves.map(move => ({
            move: move.move,
            evaluation: move.evaluation,
            isBlunder: move.classification === 'blunder',
            isMistake: move.classification === 'mistake',
            isInaccuracy: move.classification === 'inaccuracy',
            isBest: move.classification === 'best' || move.classification === 'brilliant',
            comment: move.comment,
          }));
          setEvaluations(convertedEvals);
        } else {
          throw new Error('Stockfish disabled, using minimax');
        }
      } catch (error) {
        console.warn('[Analysis] Stockfish analysis failed, falling back to minimax:', error);
        // Fallback to minimax-based analysis
        const results = analyzeGame(game.moves);
        setEvaluations(results);
      }

      // Identify critical positions for coach commentary
      const critical = identifyCriticalPositions(game.moves);
      setCriticalPositions(critical);

      setIsAnalyzing(false);
    };

    performAnalysis();
  }, [game.moves, useStockfish]);

  // Update board position when move index changes
  useEffect(() => {
    chess.reset();
    for (let i = 0; i <= currentMoveIndex; i++) {
      if (i < game.moves.length) {
        chess.move(game.moves[i]);
      }
    }

    // Reset punishment and interactive states when moving through the game
    setPunishmentArrows([]);
    setIsShowingPunishment(false);

    // Check if current move is critical and update coach prompt
    const coachPrompt = getCoachPromptForMove(criticalPositions, currentMoveIndex);
    setCurrentCoachPrompt(coachPrompt);
  }, [currentMoveIndex, game.moves, criticalPositions]);

  // Calculate statistics
  const stats = useMemo(() => {
    if (evaluations.length === 0) return null;

    const blunders = evaluations.filter(e => e.isBlunder).length;
    const mistakes = evaluations.filter(e => e.isMistake).length;
    const inaccuracies = evaluations.filter(e => e.isInaccuracy).length;
    const bestMoves = evaluations.filter(e => e.isBest).length;

    const accuracy = (bestMoves / evaluations.length) * 100;

    return {
      blunders,
      mistakes,
      inaccuracies,
      bestMoves,
      accuracy: Math.round(accuracy),
      totalMoves: evaluations.length,
    };
  }, [evaluations]);

  const handlePreviousMove = () => {
    if (currentMoveIndex > 0) {
      setCurrentMoveIndex(currentMoveIndex - 1);
    }
  };

  const handleNextMove = () => {
    if (currentMoveIndex < game.moves.length - 1) {
      setCurrentMoveIndex(currentMoveIndex + 1);
    }
  };

  const handleJumpToMove = (index: number) => {
    setCurrentMoveIndex(index);
  };

  const getMoveColor = (evaluation: MoveEvaluation) => {
    if (evaluation.isBlunder) return Colors.error;
    if (evaluation.isMistake) return Colors.warning;
    if (evaluation.isInaccuracy) return '#FFA500'; // Orange
    if (evaluation.isBest) return Colors.success;
    return Colors.textSecondary;
  };

  const getMoveIcon = (evaluation: MoveEvaluation) => {
    if (evaluation.isBlunder) return 'close-circle';
    if (evaluation.isMistake) return 'alert-circle';
    if (evaluation.isInaccuracy) return 'help-circle';
    if (evaluation.isBest) return 'checkmark-circle';
    return 'ellipse';
  };

  if (isAnalyzing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Analyzing game...</Text>
        <Text style={styles.loadingSubtext}>
          Evaluating {game.moves.length} moves
        </Text>
      </View>
    );
  }

  const currentEvaluation = evaluations[currentMoveIndex];
  const currentMove = game.moves[currentMoveIndex];
  const moveNumber = Math.floor(currentMoveIndex / 2) + 1;
  const isWhiteMove = currentMoveIndex % 2 === 0;

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Statistics Summary */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>Game Analysis Summary</Text>

          {stockfishAnalysis && (
            <View style={styles.accuracySection}>
              <View style={styles.accuracyRow}>
                <View style={styles.accuracyItem}>
                  <Text style={styles.accuracyLabel}>White Accuracy</Text>
                  <Text style={[styles.accuracyValue, { color: Colors.primary }]}>
                    {stockfishAnalysis.accuracy.white.toFixed(1)}%
                  </Text>
                  <Text style={styles.accuracySubtext}>
                    Avg loss: {stockfishAnalysis.averageCentipawnLoss.white.toFixed(0)}cp
                  </Text>
                </View>
                <View style={[styles.accuracyItem, { borderLeftWidth: 1, borderLeftColor: Colors.border }]}>
                  <Text style={styles.accuracyLabel}>Black Accuracy</Text>
                  <Text style={[styles.accuracyValue, { color: Colors.primary }]}>
                    {stockfishAnalysis.accuracy.black.toFixed(1)}%
                  </Text>
                  <Text style={styles.accuracySubtext}>
                    Avg loss: {stockfishAnalysis.averageCentipawnLoss.black.toFixed(0)}cp
                  </Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats?.accuracy}%</Text>
              <Text style={styles.statLabel}>Overall Accuracy</Text>
            </View>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={[styles.statValue, { color: Colors.success }]}>
                {stats?.bestMoves}
              </Text>
              <Text style={styles.statLabel}>Best Moves</Text>
            </View>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={[styles.statValue, { color: '#FFA500' }]}>
                {stats?.inaccuracies}
              </Text>
              <Text style={styles.statLabel}>Inaccuracies</Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: Colors.warning }]}>
                {stats?.mistakes}
              </Text>
              <Text style={styles.statLabel}>Mistakes</Text>
            </View>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={[styles.statValue, { color: Colors.error }]}>
                {stats?.blunders}
              </Text>
              <Text style={styles.statLabel}>Blunders</Text>
            </View>
            <View style={[styles.statItem, styles.statDivider]}>
              <Text style={styles.statValue}>{stats?.totalMoves}</Text>
              <Text style={styles.statLabel}>Total Moves</Text>
            </View>
          </View>
        </View>

        {/* Current Move Info */}
        <View style={styles.moveCard}>
          <View style={styles.moveHeader}>
            <Text style={styles.moveTitle}>
              Move {moveNumber}. {isWhiteMove ? 'White' : 'Black'}
            </Text>
            <View style={[styles.moveBadge, { backgroundColor: getMoveColor(currentEvaluation) + '20' }]}>
              <Ionicons
                name={getMoveIcon(currentEvaluation)}
                size={16}
                color={getMoveColor(currentEvaluation)}
              />
              <Text style={[styles.moveBadgeText, { color: getMoveColor(currentEvaluation) }]}>
                {currentMove}
              </Text>
            </View>
          </View>

          {currentEvaluation.comment && (
            <View style={styles.commentBox}>
              <Ionicons name="chatbubble-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.commentText}>{currentEvaluation.comment}</Text>
            </View>
          )}

          <View style={styles.evaluationBar}>
            <Text style={styles.evaluationLabel}>Evaluation:</Text>
            <Text style={styles.evaluationValue}>
              {currentEvaluation.evaluation > 0 ? '+' : ''}
              {(currentEvaluation.evaluation / 100).toFixed(2)}
            </Text>
          </View>

          {/* Coach Insight Button for Critical Positions */}
          <View style={styles.coachButtonsRow}>
            {currentCoachPrompt && (
              <TouchableOpacity
                style={[styles.coachInsightButton, { flex: 1 }]}
                onPress={() => setShowCoach(true)}
              >
                <Ionicons name="school" size={20} color={Colors.primary} />
                <Text style={styles.coachInsightText}>Coach Insight</Text>
              </TouchableOpacity>
            )}

            {currentEvaluation.isBlunder && (
              <TouchableOpacity
                style={[styles.punishmentButton, { flex: 1, marginLeft: Spacing.s }]}
                onPress={handleShowPunishment}
              >
                <Ionicons name="eye" size={20} color={Colors.error} />
                <Text style={styles.punishmentButtonText}>Show Punishment</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Chessboard */}
        <View style={styles.boardSection}>
          <Chessboard
            showCoordinates={true}
            isFlipped={game.playerColor === 'black'}
            interactionMode="both"
            onMove={handleWhyNotMove}
            arrows={[
              ...punishmentArrows,
              ...(currentCoachPrompt?.visualHighlights?.filter(h => h.type === 'arrow') as Arrow[] || [])
            ]}
            highlights={currentCoachPrompt?.visualHighlights?.filter(h => h.type !== 'arrow') as Highlight[] || []}
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
            {currentMoveIndex + 1} / {game.moves.length}
          </Text>

          <TouchableOpacity
            style={[
              styles.navButton,
              currentMoveIndex === game.moves.length - 1 && styles.navButtonDisabled,
            ]}
            onPress={handleNextMove}
            disabled={currentMoveIndex === game.moves.length - 1}
          >
            <Ionicons
              name="chevron-forward"
              size={24}
              color={
                currentMoveIndex === game.moves.length - 1
                  ? Colors.textSecondary
                  : Colors.primary
              }
            />
          </TouchableOpacity>
        </View>

        {/* Move List */}
        <View style={styles.moveList}>
          <Text style={styles.moveListTitle}>Move History</Text>
          <ScrollView style={styles.moveListScroll} nestedScrollEnabled>
            {game.moves.map((move, index) => {
              const evaluation = evaluations[index];
              const number = Math.floor(index / 2) + 1;
              const isWhite = index % 2 === 0;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.moveListItem,
                    index === currentMoveIndex && styles.moveListItemActive,
                  ]}
                  onPress={() => handleJumpToMove(index)}
                >
                  {isWhite && <Text style={styles.moveNumber}>{number}.</Text>}
                  <View style={styles.moveListMove}>
                    <Text
                      style={[
                        styles.moveListMoveText,
                        index === currentMoveIndex && styles.moveListMoveTextActive,
                      ]}
                    >
                      {move}
                    </Text>
                    <View style={styles.moveListIcons}>
                      <Ionicons
                        name={getMoveIcon(evaluation)}
                        size={14}
                        color={getMoveColor(evaluation)}
                      />
                      {isCriticalMove(criticalPositions, index) && (
                        <Ionicons
                          name="school"
                          size={12}
                          color={Colors.primary}
                          style={styles.coachIcon}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </ScrollView>

      {/* Digital Coach Dialog */}
      {currentCoachPrompt && (
        <DigitalCoachDialog
          visible={showCoach}
          prompt={currentCoachPrompt}
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
  content: {
    padding: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  loadingSubtext: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
    marginTop: Spacing.sm,
  },
  statsCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  statsTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  accuracySection: {
    marginBottom: Spacing.md,
  },
  accuracyRow: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  accuracyItem: {
    flex: 1,
    alignItems: 'center',
  },
  accuracyLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  accuracyValue: {
    fontSize: Typography.fontSize['3xl'],
    fontWeight: Typography.fontWeight.bold,
    marginBottom: Spacing.xs,
  },
  accuracySubtext: {
    fontSize: Typography.fontSize.xs,
    color: Colors.textSecondary,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: Spacing.sm,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.border,
  },
  statValue: {
    fontSize: Typography.fontSize['2xl'],
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },
  moveCard: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  moveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  moveTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  moveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  moveBadgeText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
  },
  commentBox: {
    flexDirection: 'row',
    gap: Spacing.sm,
    backgroundColor: Colors.background,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
  },
  commentText: {
    flex: 1,
    fontSize: Typography.fontSize.sm,
    color: Colors.text,
    lineHeight: Typography.lineHeight.normal * Typography.fontSize.sm,
  },
  evaluationBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  evaluationLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.textSecondary,
  },
  evaluationValue: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.text,
  },
  coachInsightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.primary + '15',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginTop: Spacing.sm,
  },
  coachInsightText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  coachButtonsRow: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
  },
  punishmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.error + '15',
    borderWidth: 1,
    borderColor: Colors.error,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
  },
  punishmentButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.error,
  },
  boardSection: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  navButton: {
    padding: Spacing.sm,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
  },
  moveList: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    maxHeight: 300,
  },
  moveListTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  moveListScroll: {
    maxHeight: 250,
  },
  moveListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.xs,
  },
  moveListItemActive: {
    backgroundColor: Colors.primary + '20',
  },
  moveNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.textSecondary,
    width: 30,
  },
  moveListMove: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    flex: 1,
  },
  moveListMoveText: {
    fontSize: Typography.fontSize.base,
    color: Colors.text,
  },
  moveListMoveTextActive: {
    fontWeight: Typography.fontWeight.semibold,
    color: Colors.primary,
  },
  moveListIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  coachIcon: {
    marginLeft: Spacing.xs,
  },
});
