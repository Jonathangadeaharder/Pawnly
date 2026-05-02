import { analyzeMove, SymbolicAnalysis } from '../chess/symbolicAnalyzer';
import { generateFeedback, UserLevel } from '../ai/coachEngine';
import { CoachPrompt, CoachPersonalityName, VisualHighlight, Square } from '../../types';

export interface AnalysisInput {
  beforeFen: string;
  afterFen: string;
  movePlayed: string;
  evaluationDrop: number;
  userLevel: UserLevel;
  personality: CoachPersonalityName;
}

/**
 * Main service for generating algorithmic coach interventions.
 */
export function getCoachIntervention(input: AnalysisInput): CoachPrompt {
  const { beforeFen, afterFen, movePlayed, userLevel, personality } = input;

  // 1. Perform symbolic analysis
  const analysis = analyzeMove(beforeFen, afterFen, movePlayed);

  // 2. Generate natural language feedback
  const feedback = generateFeedback(analysis, userLevel, personality);

  // 3. Construct the CoachPrompt
  return {
    id: `coach-${Date.now()}`,
    type: analysis.tag === 'Missed Mate' ? 'socratic-question' : 'explanation',
    text: feedback.text,
    visualHighlights: convertSaliencyToHighlights(feedback.saliencySquares),
    followUpPrompts: [
      {
        id: `coach-${Date.now()}-explanation`,
        type: 'explanation',
        text: `The engine detected a significant evaluation drop. Analysis shows it was a ${analysis.tag}.`,
      }
    ]
  };
}

/**
 * Converts saliency squares from the analysis into visual highlights for the board.
 */
function convertSaliencyToHighlights(squares: string[]): VisualHighlight[] {
  if (squares.length === 0) return [];

  const highlights: VisualHighlight[] = [];
  
  // First square is usually the moved piece or the source of the tactic
  // If there are multiple, they are targets or related pieces
  
  if (squares.length === 1) {
    highlights.push({
      type: 'circle',
      squares: [squares[0] as Square],
      color: 'red',
    });
  } else if (squares.length >= 2) {
    // For forks/pins, draw arrows from the first square to others
    const source = squares[0] as Square;
    for (let i = 1; i < squares.length; i++) {
      highlights.push({
        type: 'arrow',
        squares: [source, squares[i] as Square],
        color: 'yellow',
        from: source,
        to: squares[i] as Square,
      });
    }
  }

  return highlights;
}
