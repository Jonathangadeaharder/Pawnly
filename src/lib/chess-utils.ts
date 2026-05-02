type MoveClassification =
	| 'brilliant'
	| 'great'
	| 'best'
	| 'good'
	| 'inaccuracy'
	| 'mistake'
	| 'blunder'
	| 'missed-win';

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
