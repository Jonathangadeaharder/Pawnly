export type ScanMode = 'check' | 'capture' | 'threat' | 'loose' | 'doubleAttack';

export interface ScanAnswerKey {
	checks?: string[];
	captures?: string[];
	threats?: string[];
	loose?: string[];
	doubleAttack?: string[];
}

export interface ScanPosition {
	id: string;
	fen: string;
	playerColor: 'w' | 'b';
	level: number;
	answerKey: ScanAnswerKey;
	hint?: string;
}

export const SCAN_COLORS: Record<ScanMode, string> = {
	check: '#E53935',
	capture: '#FF9800',
	threat: '#FDD835',
	loose: '#7E57C2',
	doubleAttack: '#EC407A',
};

export const SCAN_MODE_LABELS: Record<ScanMode, string> = {
	check: 'Check',
	capture: 'Capture',
	threat: 'Threat',
	loose: 'Loose',
	doubleAttack: 'Double Attack',
};

export const SCAN_MODE_ICONS: Record<ScanMode, string> = {
	check: '♚',
	capture: '⚔',
	threat: '⚠',
	loose: '🔓',
	doubleAttack: '💥',
};

export function getActiveModes(level: number): ScanMode[] {
	if (level >= 12) return ['check', 'capture', 'threat', 'loose', 'doubleAttack'];
	if (level >= 8) return ['check', 'capture', 'threat', 'loose'];
	if (level >= 5) return ['check', 'capture', 'threat'];
	return ['check', 'capture'];
}

export function getTargetTime(level: number): number {
	if (level >= 13) return 8;
	if (level >= 11) return 10;
	if (level >= 7) return 12;
	if (level >= 3) return 15;
	return 20;
}

export const scanPositions: ScanPosition[] = [
	{
		id: 'sp-01',
		fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
		playerColor: 'b',
		level: 1,
		answerKey: { checks: ['c4'], captures: ['c4', 'f3'], threats: [] },
	},
	{
		id: 'sp-02',
		fen: 'rnbqkb1r/ppp2ppp/3p4/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
		playerColor: 'b',
		level: 1,
		answerKey: { checks: ['c4'], captures: ['c4', 'f3'], threats: [] },
	},
	{
		id: 'sp-03',
		fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
		playerColor: 'b',
		level: 1,
		answerKey: { checks: ['c4'], captures: ['c4', 'f3'], threats: [] },
	},
	{
		id: 'sp-04',
		fen: '2r3k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
		playerColor: 'b',
		level: 2,
		answerKey: { checks: ['e1'], captures: [], threats: [] },
	},
	{
		id: 'sp-05',
		fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 2,
		answerKey: { checks: [], captures: ['c4'], threats: [] },
	},
	{
		id: 'sp-06',
		fen: 'r2qkb1r/ppp2ppp/2n1bn2/3pp3/2PP4/4BN2/PP3PPP/RN1QKB1R w KQkq - 0 1',
		playerColor: 'b',
		level: 3,
		answerKey: { checks: [], captures: ['c4', 'd4', 'f3'], threats: [] },
	},
	{
		id: 'sp-07',
		fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQ - 0 5',
		playerColor: 'b',
		level: 3,
		answerKey: { checks: ['c4'], captures: ['c4', 'f3'], threats: [] },
	},
	{
		id: 'sp-08',
		fen: 'r1bqr1k1/ppp2ppp/2n1pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 4,
		answerKey: { checks: [], captures: ['c4'], threats: [] },
	},
	{
		id: 'sp-09',
		fen: 'r1bqk2r/pppp1ppp/2n5/2b1p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
		playerColor: 'b',
		level: 4,
		answerKey: { checks: ['c4'], captures: ['c4', 'f3'], threats: [] },
	},
	{
		id: 'sp-10',
		fen: 'r1bq1rk1/pppn1ppp/4pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 4,
		answerKey: { checks: [], captures: ['c4'], threats: [] },
	},
	{
		id: 'sp-11',
		fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2N1BN2/PP3PPP/R2QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 5,
		answerKey: { checks: [], captures: ['c3', 'c4'], threats: [] },
	},
	{
		id: 'sp-12',
		fen: 'r1bqr1k1/ppp2ppp/2n1pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 5,
		answerKey: { checks: [], captures: ['c4'], threats: [] },
	},
	{
		id: 'sp-13',
		fen: 'r1bq1rk1/ppp2ppp/2n5/3pp3/2B1n3/5N2/PPPP1PPP/RNBQ1RK1 w - - 0 1',
		playerColor: 'b',
		level: 6,
		answerKey: { checks: [], captures: ['c4', 'f3'], threats: [] },
	},
	{
		id: 'sp-14',
		fen: 'r2qkb1r/ppp2ppp/2n1bn2/3pp3/2PP4/2N1BN2/PP3PPP/R2QKB1R w KQkq - 0 1',
		playerColor: 'b',
		level: 6,
		answerKey: { checks: [], captures: ['c3', 'c4', 'd4', 'f3'], threats: [] },
	},
	{
		id: 'sp-15',
		fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1Q2/PPP2PPP/RNB1K1NR w KQ - 0 5',
		playerColor: 'b',
		level: 6,
		answerKey: { checks: ['c4'], captures: ['c4', 'f3'], threats: ['f3'] },
	},
	{
		id: 'sp-16',
		fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/4BN2/PP2QPPP/RN2KB1R w KQ - 0 1',
		playerColor: 'b',
		level: 7,
		answerKey: { checks: [], captures: ['c4'], threats: [] },
	},
	{
		id: 'sp-17',
		fen: 'r2q1rk1/pppbbppp/2n1pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 7,
		answerKey: { checks: [], captures: ['c4'], threats: [] },
	},
	{
		id: 'sp-18',
		fen: 'r1bq1rk1/pppn1ppp/4pn2/3p4/2PP4/2N1BN2/PP3PPP/R2QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 8,
		answerKey: { checks: [], captures: ['c3', 'c4'], threats: [], loose: ['c3'] },
	},
	{
		id: 'sp-19',
		fen: 'r1bqr1k1/ppp2ppp/2n1pn2/3p4/2PP4/2N1BN2/PP3PPP/R2QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 8,
		answerKey: { checks: [], captures: ['c3', 'c4'], threats: [], loose: ['c3', 'e3'] },
	},
	{
		id: 'sp-20',
		fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2N1BN2/PP3PPP/R2QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 8,
		answerKey: { checks: [], captures: ['c4'], threats: [], loose: ['c3'] },
	},
];
