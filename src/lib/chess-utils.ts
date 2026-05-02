type MoveClassification =
	| 'brilliant'
	| 'great'
	| 'best'
	| 'good'
	| 'inaccuracy'
	| 'mistake'
	| 'blunder'
	| 'missed-win';

export function classifyMove(
	loss: number,
): 'brilliant' | 'great' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder' {
	if (loss < -50) return 'brilliant';
	if (loss < -20) return 'great';
	if (loss < 10) return 'best';
	if (loss < 40) return 'good';
	if (loss < 100) return 'inaccuracy';
	if (loss < 300) return 'mistake';
	return 'blunder';
}

export function calculateAccuracy(totalLoss: number, moveCount: number): number {
	if (moveCount === 0) return 100;
	const avgLoss = totalLoss / moveCount;
	const accuracy = Math.max(0, Math.min(100, 100 - avgLoss / 10));
	return Math.round(accuracy * 10) / 10;
}

export interface MoveAnalysisResult {
	move: string;
	evaluation: number;
	previousEval: number;
	loss: number;
	classification: 'brilliant' | 'great' | 'best' | 'good' | 'inaccuracy' | 'mistake' | 'blunder';
	comment: string;
	bestMove: string;
	depth: number;
}

export interface PositionAnalysis {
	evaluation: number;
	mate?: number;
	bestMove: string;
	depth: number;
}

export function createMoveAnalysis(
	move: string,
	posAnalysis: PositionAnalysis,
	previousEval: number,
	isWhite: boolean,
): MoveAnalysisResult {
	const rawEval = posAnalysis.mate !== undefined
		? posAnalysis.mate > 0 ? 10000 : -10000
		: posAnalysis.evaluation;
	const normalizedEval = isWhite ? rawEval : -rawEval;
	const loss = previousEval - normalizedEval;
	const classification = classifyMove(loss);
	const comment = getMoveComment(classification, loss);

	return {
		move,
		evaluation: rawEval,
		previousEval,
		loss,
		classification,
		comment,
		bestMove: posAnalysis.bestMove,
		depth: posAnalysis.depth,
	};
}

export function getMoveComment(classification: MoveClassification, loss: number): string {
	const comments: Record<MoveClassification, string> = {
		brilliant: 'Brilliant move! A stunning tactical blow.',
		great: 'Excellent move! This significantly improves your position.',
		best: 'Best move. Maintains or improves your advantage.',
		good: 'Good move. Keeps the position balanced.',
		inaccuracy: `Inaccuracy. You lost ${Math.round(loss / 10) / 10} pawns of advantage.`,
		mistake: `Mistake! This loses ${Math.round(loss / 10) / 10} pawns.`,
		blunder: `Blunder!! This is a serious error, losing ${Math.round(loss / 10) / 10} pawns.`,
		'missed-win': 'You missed a winning move!',
	};
	return comments[classification];
}
