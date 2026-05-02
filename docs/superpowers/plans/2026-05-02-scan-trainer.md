# Scan Trainer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a "Scan" blunder prevention trainer — a timed gamified mode where users mark opponent's Checks, Captures, and Threats on chess positions.

**Architecture:** New ScanScreen overlay component with curated position data. Integrates into existing Train screen and overlay system. Uses MiniBoard for display with colored square highlights for each category.

**Tech Stack:** Svelte 5 (runes), TypeScript, chess.js, Vitest, Tailwind CSS v4, existing Pawnly brand tokens

**Spec:** `docs/superpowers/specs/2026-05-02-blunder-prevention-scanner-design.md`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `web/src/lib/data/scan-positions.ts` | Create | ScanPosition type, ScanMode type, color map, 20 positions with answer keys, helper functions |
| `web/tests/scan-positions.test.ts` | Create | Verify FEN legality, answer key validity, helper functions |
| `web/src/lib/stores/overlay.svelte.ts` | Modify | Add `'scan'` to `OverlayType`, add `openScan()` |
| `web/src/lib/components/screens/ScanScreen.svelte` | Create | Full scan overlay: board, mode buttons, timer, scoring, feedback |
| `web/src/routes/+layout.svelte` | Modify | Render ScanScreen when overlay is 'scan' |
| `web/src/lib/components/screens/TrainScreen.svelte` | Modify | Add `onOpenScan` prop, add Scan hero card section |
| `web/src/routes/train/+page.svelte` | Modify | Wire `onOpenScan` to `overlay.openScan()` |
| `web/tests/scan-screen.test.ts` | Create | Mode switching, marking, timer, scoring logic tests |

---

### Task 1: Scan Position Data Types and Positions

**Files:**
- Create: `web/src/lib/data/scan-positions.ts`

- [ ] **Step 1: Create the scan-positions module with types, constants, helpers, and 20 curated positions**

```typescript
// web/src/lib/data/scan-positions.ts
import { Brand } from '$lib/brand';

export type ScanMode = 'check' | 'capture' | 'threat' | 'loose' | 'doubleAttack';

export interface ScanAnswerKey {
	checks: string[];
	captures: string[];
	threats: string[];
	loose?: string[];
	doubleAttack?: string[];
}

export interface ScanPosition {
	id: string;
	fen: string;
	playerColor: 'w' | 'b';
	level: number;
	targetTime: number;
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
	doubleAttack: 'Double',
};

export const SCAN_MODE_ICONS: Record<ScanMode, string> = {
	check: '⚡',
	capture: '💥',
	threat: '🎯',
	loose: '🔗',
	doubleAttack: '🔀',
};

export function getActiveModes(level: number): ScanMode[] {
	const modes: ScanMode[] = ['check', 'capture'];
	if (level >= 5) modes.push('threat');
	if (level >= 8) modes.push('loose');
	if (level >= 12) modes.push('doubleAttack');
	return modes;
}

export function getTargetTime(level: number): number {
	if (level <= 2) return 20;
	if (level <= 6) return 15;
	if (level <= 10) return 12;
	if (level <= 12) return 10;
	return 8;
}

export const scanPositions: ScanPosition[] = [
	// === Levels 1-2: CCT only, 20s target ===
	{
		id: 'sp-01',
		fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
		playerColor: 'b',
		level: 1,
		targetTime: 20,
		answerKey: {
			checks: ['c4'],
			captures: ['c4', 'f6', 'c6'],
			threats: [],
		},
		hint: 'The bishop on c4 attacks f7, and the knight on f6 can capture e4',
	},
	{
		id: 'sp-02',
		fen: 'rnbqkb1r/ppp2ppp/3p4/4p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 4',
		playerColor: 'b',
		level: 1,
		targetTime: 20,
		answerKey: {
			checks: [],
			captures: ['e4', 'c4'],
			threats: [],
		},
		hint: 'The knight on e4 and bishop on c4 can both capture',
	},
	{
		id: 'sp-03',
		fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4',
		playerColor: 'b',
		level: 1,
		targetTime: 20,
		answerKey: {
			checks: ['c4'],
			captures: ['c4', 'f6', 'c6', 'c5'],
			threats: [],
		},
		hint: 'The bishop checks on f7 — look at bishops and knights',
	},
	{
		id: 'sp-04',
		fen: '2r3k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1',
		playerColor: 'b',
		level: 2,
		targetTime: 20,
		answerKey: {
			checks: ['e1'],
			captures: ['e1'],
			threats: [],
		},
		hint: 'The rook on e1 has a clear file to the king',
	},
	{
		id: 'sp-05',
		fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 2,
		targetTime: 20,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'f6', 'e6', 'c6'],
			threats: [],
		},
		hint: 'Central pawns and knights can all capture',
	},

	// === Levels 3-4: CCT only, 15s target ===
	{
		id: 'sp-06',
		fen: 'r2qkb1r/ppp2ppp/2n1bn2/3pp3/2PP4/4BN2/PP3PPP/RN1QKB1R w KQkq - 0 1',
		playerColor: 'b',
		level: 3,
		targetTime: 15,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'e6', 'f6', 'c6', 'd5'],
			threats: [],
		},
		hint: 'Lots of central tension — count all capture squares',
	},
	{
		id: 'sp-07',
		fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1N2/PPP2PPP/RNBQK2R w KQ - 0 5',
		playerColor: 'b',
		level: 3,
		targetTime: 15,
		answerKey: {
			checks: ['c4'],
			captures: ['c4', 'f6', 'c6', 'c5'],
			threats: [],
		},
		hint: 'The bishop on c4 checks on f7',
	},
	{
		id: 'sp-08',
		fen: 'r1bqr1k1/ppp2ppp/2n1pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 4,
		targetTime: 15,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'f6', 'e6', 'c6', 'd5'],
			threats: [],
		},
		hint: 'Look at all central pieces',
	},
	{
		id: 'sp-09',
		fen: 'r1bqk2r/pppp1ppp/2n5/2b1p3/2B1n3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 1',
		playerColor: 'b',
		level: 4,
		targetTime: 15,
		answerKey: {
			checks: ['c4', 'e4'],
			captures: ['c4', 'e4', 'c6', 'c5'],
			threats: [],
		},
		hint: 'Both the bishop on c4 and knight on e4 give check on f7/f2',
	},
	{
		id: 'sp-10',
		fen: 'r1bq1rk1/pppn1ppp/4pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 4,
		targetTime: 15,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'f6', 'e6', 'd5'],
			threats: [],
		},
		hint: 'The knight on d7 and pawns can capture',
	},

	// === Levels 5-6: CCT + Threats, 15s target ===
	{
		id: 'sp-11',
		fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/2N1BN2/PP3PPP/R2QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 5,
		targetTime: 15,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'f6', 'e6', 'c6', 'd5'],
			threats: ['f8', 'c8'],
		},
		hint: 'The rooks on f8 and c8 line up against pieces',
	},
	{
		id: 'sp-12',
		fen: 'r1bqr1k1/ppp2ppp/2n1pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 5,
		targetTime: 15,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'f6', 'e6', 'c6', 'd5'],
			threats: ['e8', 'c8'],
		},
		hint: 'Queen on e8 and rook on c8 threaten down the files',
	},
	{
		id: 'sp-13',
		fen: 'r1bq1rk1/ppp2ppp/2n5/3pp3/2B1n3/5N2/PPPP1PPP/RNBQ1RK1 w - - 0 1',
		playerColor: 'b',
		level: 6,
		targetTime: 15,
		answerKey: {
			checks: ['c4', 'e4'],
			captures: ['c4', 'e4', 'c6', 'd5'],
			threats: ['d8', 'c8'],
		},
		hint: 'Knight on e4 checks, queen and rook threaten',
	},
	{
		id: 'sp-14',
		fen: 'r2qkb1r/ppp2ppp/2n1bn2/3pp3/2PP4/2N1BN2/PP3PPP/R2QKB1R w KQkq - 0 1',
		playerColor: 'b',
		level: 6,
		targetTime: 15,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'e6', 'f6', 'c6', 'd5'],
			threats: ['f8', 'c8', 'd8'],
		},
		hint: 'Bishop on f6 and rook on f8 target the f-file',
	},
	{
		id: 'sp-15',
		fen: 'r1bq1rk1/pppp1ppp/2n2n2/2b1p3/2B1P3/3P1Q2/PPP2PPP/RNB1K1NR w KQ - 0 5',
		playerColor: 'b',
		level: 6,
		targetTime: 15,
		answerKey: {
			checks: ['c4', 'c5'],
			captures: ['c4', 'f6', 'c6', 'c5'],
			threats: ['f3', 'c5'],
		},
		hint: 'The bishop checks on f7, queen on f3 threatens',
	},

	// === Levels 7-8: CCT + Threats, 12s target ===
	{
		id: 'sp-16',
		fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/2PP4/4BN2/PP2QPPP/RN2KB1R w KQ - 0 1',
		playerColor: 'b',
		level: 7,
		targetTime: 12,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'f6', 'e6', 'c6', 'd5'],
			threats: ['e2', 'f8'],
		},
		hint: 'Queen on e2 is exposed, rook on f8 eyes the f-file',
	},
	{
		id: 'sp-17',
		fen: 'r2q1rk1/pppbbppp/2n1pn2/3p4/2PP4/4BN2/PP3PPP/RN1QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 7,
		targetTime: 12,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'f6', 'e6', 'c6', 'd5'],
			threats: ['d7', 'e7', 'f8', 'd8'],
		},
		hint: 'Bishops on d7 and e7 have long diagonals',
	},
	{
		id: 'sp-18',
		fen: 'r1bq1rk1/pppn1ppp/4pn2/3p4/2PP4/2N1BN2/PP3PPP/R2QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 8,
		targetTime: 12,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'f6', 'e6', 'd5'],
			threats: ['f8', 'd8'],
			loose: ['c3'],
		},
		hint: 'The knight on c3 has no defenders',
	},
	{
		id: 'sp-19',
		fen: 'r1bqr1k1/ppp2ppp/2n1pn2/3p4/2PP4/2N1BN2/PP3PPP/R2QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 8,
		targetTime: 12,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'f6', 'e6', 'c6', 'd5'],
			threats: ['e8', 'c8'],
			loose: ['c3', 'e3'],
		},
		hint: 'Both knights on c3 and e3 are undefended',
	},
	{
		id: 'sp-20',
		fen: 'r1bq1rk1/ppp2ppp/2n1pn2/3p4/1bPP4/2N1BN2/PP3PPP/R2QKB1R w KQ - 0 1',
		playerColor: 'b',
		level: 8,
		targetTime: 12,
		answerKey: {
			checks: [],
			captures: ['d4', 'c4', 'f6', 'e6', 'c6', 'd5'],
			threats: ['b4', 'f8', 'd8'],
			loose: ['c3'],
		},
		hint: 'The bishop on b4 pins the knight on c3',
	},
];
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd web && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/data/scan-positions.ts
git commit -m "feat: add scan position data with 20 curated positions and answer keys"
```

---

### Task 2: Scan Position Tests

**Files:**
- Create: `web/tests/scan-positions.test.ts`

- [ ] **Step 1: Write tests for scan positions and helper functions**

```typescript
// web/tests/scan-positions.test.ts
import { describe, expect, it } from 'vitest';
import { Chess } from 'chess.js';
import {
	scanPositions,
	getActiveModes,
	getTargetTime,
	SCAN_COLORS,
	SCAN_MODE_LABELS,
	SCAN_MODE_ICONS,
	type ScanMode,
} from '$lib/data/scan-positions';

describe('scanPositions', () => {
	it('should have 20 positions', () => {
		expect(scanPositions).toHaveLength(20);
	});

	it('should have unique IDs', () => {
		const ids = scanPositions.map((p) => p.id);
		expect(new Set(ids).size).toBe(ids.length);
	});

	it('should have valid FEN for every position', () => {
		for (const pos of scanPositions) {
			expect(() => new Chess(pos.fen)).not.toThrow();
		}
	});

	it('should have levels between 1 and 20', () => {
		for (const pos of scanPositions) {
			expect(pos.level).toBeGreaterThanOrEqual(1);
			expect(pos.level).toBeLessThanOrEqual(20);
		}
	});

	it('should have targetTime > 0', () => {
		for (const pos of scanPositions) {
			expect(pos.targetTime).toBeGreaterThan(0);
		}
	});

	it('should have valid square format in all answer key arrays', () => {
		for (const pos of scanPositions) {
			const allSquares = [
				...pos.answerKey.checks,
				...pos.answerKey.captures,
				...pos.answerKey.threats,
				...(pos.answerKey.loose ?? []),
				...(pos.answerKey.doubleAttack ?? []),
			];
			for (const sq of allSquares) {
				expect(sq).toMatch(/^[a-h][1-8]$/);
			}
		}
	});

	it('should have captures as non-empty arrays', () => {
		for (const pos of scanPositions) {
			expect(pos.answerKey.captures.length).toBeGreaterThan(0);
		}
	});

	it('should only have loose for level >= 8', () => {
		for (const pos of scanPositions) {
			if (pos.level < 8) {
				expect(pos.answerKey.loose).toBeUndefined();
			}
		}
	});

	it('should have all answer key squares with pieces on them', () => {
		for (const pos of scanPositions) {
			const chess = new Chess(pos.fen);
			const allSquares = [
				...pos.answerKey.checks,
				...pos.answerKey.captures,
				...pos.answerKey.threats,
				...(pos.answerKey.loose ?? []),
				...(pos.answerKey.doubleAttack ?? []),
			];
			for (const sq of allSquares) {
				const piece = chess.get(sq as any);
				expect(piece).toBeDefined();
				expect(piece).not.toBeNull();
			}
		}
	});

	it('should have checks and captures squares with opponent pieces', () => {
		for (const pos of scanPositions) {
			const chess = new Chess(pos.fen);
			const opponentColor = pos.playerColor === 'w' ? 'b' : 'w';
			for (const sq of [...pos.answerKey.checks, ...pos.answerKey.captures]) {
				const piece = chess.get(sq as any);
				if (piece) {
					expect(piece.color).toBe(opponentColor);
				}
			}
		}
	});

	it('should have loose squares with player pieces', () => {
		for (const pos of scanPositions) {
			if (!pos.answerKey.loose) continue;
			const chess = new Chess(pos.fen);
			for (const sq of pos.answerKey.loose) {
				const piece = chess.get(sq as any);
				if (piece) {
					expect(piece.color).toBe(pos.playerColor);
				}
			}
		}
	});
});

describe('getActiveModes', () => {
	it('should return check and capture for levels 1-4', () => {
		expect(getActiveModes(1)).toEqual(['check', 'capture']);
		expect(getActiveModes(4)).toEqual(['check', 'capture']);
	});

	it('should add threat at level 5', () => {
		expect(getActiveModes(5)).toEqual(['check', 'capture', 'threat']);
	});

	it('should add loose at level 8', () => {
		expect(getActiveModes(8)).toEqual(['check', 'capture', 'threat', 'loose']);
	});

	it('should add doubleAttack at level 12', () => {
		expect(getActiveModes(12)).toEqual(['check', 'capture', 'threat', 'loose', 'doubleAttack']);
	});
});

describe('getTargetTime', () => {
	it('should return 20s for levels 1-2', () => {
		expect(getTargetTime(1)).toBe(20);
		expect(getTargetTime(2)).toBe(20);
	});

	it('should return 15s for levels 3-6', () => {
		expect(getTargetTime(3)).toBe(15);
		expect(getTargetTime(6)).toBe(15);
	});

	it('should return 12s for levels 7-10', () => {
		expect(getTargetTime(7)).toBe(12);
		expect(getTargetTime(10)).toBe(12);
	});

	it('should return 10s for levels 11-12', () => {
		expect(getTargetTime(11)).toBe(10);
		expect(getTargetTime(12)).toBe(10);
	});

	it('should return 8s for levels 13+', () => {
		expect(getTargetTime(13)).toBe(8);
		expect(getTargetTime(20)).toBe(8);
	});
});

describe('SCAN_COLORS', () => {
	it('should have a hex color for every mode', () => {
		const modes: ScanMode[] = ['check', 'capture', 'threat', 'loose', 'doubleAttack'];
		for (const mode of modes) {
			expect(SCAN_COLORS[mode]).toMatch(/^#[0-9A-Fa-f]{6}$/);
		}
	});
});

describe('SCAN_MODE_LABELS', () => {
	it('should have a label for every mode', () => {
		const modes: ScanMode[] = ['check', 'capture', 'threat', 'loose', 'doubleAttack'];
		for (const mode of modes) {
			expect(typeof SCAN_MODE_LABELS[mode]).toBe('string');
			expect(SCAN_MODE_LABELS[mode].length).toBeGreaterThan(0);
		}
	});
});

describe('SCAN_MODE_ICONS', () => {
	it('should have an icon for every mode', () => {
		const modes: ScanMode[] = ['check', 'capture', 'threat', 'loose', 'doubleAttack'];
		for (const mode of modes) {
			expect(typeof SCAN_MODE_ICONS[mode]).toBe('string');
			expect(SCAN_MODE_ICONS[mode].length).toBeGreaterThan(0);
		}
	});
});
```

- [ ] **Step 2: Run tests to verify they pass**

Run: `cd web && pnpm test -- tests/scan-positions.test.ts`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add web/tests/scan-positions.test.ts
git commit -m "test: add scan position validation tests"
```

---

### Task 3: Overlay Store Modification

**Files:**
- Modify: `web/src/lib/stores/overlay.svelte.ts:1`

- [ ] **Step 1: Add 'scan' to OverlayType and openScan() method**

Change line 1 from:
```typescript
export type OverlayType = 'game' | 'lesson' | 'puzzle' | 'celebration' | null;
```
to:
```typescript
export type OverlayType = 'game' | 'lesson' | 'puzzle' | 'celebration' | 'scan' | null;
```

Add `openScan()` method after `openCelebration()` (after line 20):
```typescript
		openScan(): void {
			current = 'scan';
		},
```

- [ ] **Step 2: Verify no type errors**

Run: `cd web && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Commit**

```bash
git add web/src/lib/stores/overlay.svelte.ts
git commit -m "feat: add scan overlay type and openScan method"
```

---

### Task 4: ScanScreen Component

**Files:**
- Create: `web/src/lib/components/screens/ScanScreen.svelte`

- [ ] **Step 1: Create the ScanScreen component**

This is the main component. Key behaviors:
- Shows a chess position using MiniBoard with colored highlights
- Mode buttons to switch between Check/Capture/Threat/Loose/Double
- Tap squares to mark/unmark in current mode
- Countdown timer that auto-submits at 0
- Post-submit feedback with correct/missed/wrong highlights
- Star rating (3/2/1/0) based on completeness and speed
- Streak counter for consecutive 3-star positions

The component should follow the same patterns as PuzzleScreen.svelte:
- Fixed position overlay with z-index 200
- Cream background with gradient
- Same header style (close button, title, timer)
- Same button/control patterns

Refer to the spec's Screen Layout section and the PuzzleScreen.svelte code for exact styling. The key difference from PuzzleScreen is:
- No Chessboard (interactive moves) — uses MiniBoard (display only) with click handler overlay
- Mode buttons instead of puzzle controls
- Timer bar under header
- Post-submit feedback overlays on the board

For the click handler: add a transparent click area div on top of MiniBoard that converts click coordinates to chess squares (same logic as the existing board interaction pattern).

- [ ] **Step 2: Verify no type errors**

Run: `cd web && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 3: Run biome check**

Run: `cd web && pnpm dlx @biomejs/biome check src/lib/components/screens/ScanScreen.svelte`
Expected: No errors (auto-fix with `--write` if needed)

- [ ] **Step 4: Commit**

```bash
git add web/src/lib/components/screens/ScanScreen.svelte
git commit -m "feat: add ScanScreen component with board, modes, timer, and scoring"
```

---

### Task 5: Layout and Route Integration

**Files:**
- Modify: `web/src/routes/+layout.svelte:7,56-66`
- Modify: `web/src/lib/components/screens/TrainScreen.svelte:7-11`
- Modify: `web/src/routes/train/+page.svelte:5-8`

- [ ] **Step 1: Import ScanScreen in +layout.svelte**

Add import after line 7 (GameScreen import):
```typescript
import ScanScreen from '$lib/components/screens/ScanScreen.svelte';
```

Replace the overlay rendering block (lines 56-66) with:
```svelte
{#if overlay.current === 'game'}
	<GameScreen onExit={() => overlay.close()} />
{:else if overlay.current === 'scan'}
	<ScanScreen onClose={() => overlay.close()} />
{:else if overlay.current !== null}
	<Overlay visible={true} onClose={() => overlay.close()}>
		<div class="flex h-full items-center justify-center">
			<p class="font-body text-lg text-white">
				{overlay.current ?? ''} overlay
			</p>
		</div>
	</Overlay>
{/if}
```

- [ ] **Step 2: Add onOpenScan prop to TrainScreen.svelte**

Add `onOpenScan` to the props (lines 7-11):
```svelte
let {
	onOpenPuzzle,
	onOpenScan,
}: {
	onOpenPuzzle: (puzzleId: string) => void;
	onOpenScan: () => void;
} = $props();
```

Add the Scan hero card section after the puzzle grid closing `</div>` (after line 105), before `</PaperBg>`. Note: import `Mascot` from `$lib/components/Mascot.svelte` at the top of the script if not already imported:
```svelte
		<!-- Scan trainer -->
		<div style:padding="16px 16px 0">
			<div
				class="mb-3 text-lg font-semibold italic text-ink"
				style:font-family={Brand.fonts.display}
			>
				Scanner
			</div>
		</div>
		<div style:padding="0 16px 16px">
			<button
				class="w-full cursor-pointer border-none text-left"
				style:background={Brand.colors.moss}
				style:border-radius="22px"
				style:padding="20px"
				style:box-shadow="0 12px 28px rgba(63,107,67,0.25)"
				onclick={onOpenScan}
			>
				<div class="flex items-center gap-3">
					<div>
						<span
							style:font-family={Brand.fonts.display}
							style:font-style="italic"
							style:font-size="22px"
							style:font-weight="600"
							style:color={Brand.colors.cream}
						>
							Scan 🧠
						</span>
						<div
							style:font-family={Brand.fonts.body}
							style:font-size="13px"
							style:color={Brand.colors.cream}
							style:opacity="0.8"
							style:margin-top="4px"
						>
							Find all checks, captures & threats before you move
						</div>
					</div>
				</div>
			</button>
		</div>
```

- [ ] **Step 3: Wire onOpenScan in train/+page.svelte**

Update `web/src/routes/train/+page.svelte`:
```svelte
<script lang="ts">
import { Brand } from '$lib/brand';
import TrainScreen from '$lib/components/screens/TrainScreen.svelte';
import { overlay } from '$lib/stores/overlay.svelte';

function onOpenPuzzle(puzzleId: string) {
	console.log('open puzzle', puzzleId);
}

function onOpenScan() {
	overlay.openScan();
}
</script>

<svelte:head>
	<title>{Brand.name} — Train</title>
</svelte:head>

<TrainScreen {onOpenPuzzle} {onOpenScan} />
```

- [ ] **Step 4: Verify no type errors**

Run: `cd web && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Run full test suite**

Run: `cd web && pnpm test`
Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add web/src/routes/+layout.svelte web/src/lib/components/screens/TrainScreen.svelte web/src/routes/train/+page.svelte
git commit -m "feat: integrate ScanScreen into overlay system and Train screen"
```

---

### Task 6: ScanScreen Tests

**Files:**
- Create: `web/tests/scan-screen.test.ts`

- [ ] **Step 1: Write tests for ScanScreen behavior**

```typescript
// web/tests/scan-screen.test.ts
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import ScanScreen from '$lib/components/screens/ScanScreen.svelte';

describe('ScanScreen', () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	it('should render the scan title', () => {
		render(ScanScreen, { props: { onClose: () => {} } });
		expect(screen.getByText('Scan')).toBeTruthy();
	});

	it('should render mode buttons', () => {
		render(ScanScreen, { props: { onClose: () => {}, level: 1 } });
		expect(screen.getByText('Check')).toBeTruthy();
		expect(screen.getByText('Capture')).toBeTruthy();
	});

	it('should render threat mode for level 5+', () => {
		render(ScanScreen, { props: { onClose: () => {}, level: 5 } });
		expect(screen.getByText('Threat')).toBeTruthy();
	});

	it('should not render threat mode for level < 5', () => {
		render(ScanScreen, { props: { onClose: () => {}, level: 3 } });
		expect(screen.queryByText('Threat')).toBeNull();
	});

	it('should render submit button', () => {
		render(ScanScreen, { props: { onClose: () => {} } });
		expect(screen.getByText('Submit Scan')).toBeTruthy();
	});

	it('should call onClose when close button clicked', async () => {
		const onClose = vi.fn();
		render(ScanScreen, { props: { onClose } });
		const closeBtn = screen.getByLabelText('Close scan');
		await fireEvent.click(closeBtn);
		expect(onClose).toHaveBeenCalled();
	});

	it('should show timer display', () => {
		render(ScanScreen, { props: { onClose: () => {}, level: 1 } });
		expect(screen.getByText(/⏱/)).toBeTruthy();
	});
});
```

- [ ] **Step 2: Run tests**

Run: `cd web && pnpm test -- tests/scan-screen.test.ts`
Expected: All tests pass

- [ ] **Step 3: Run full test suite**

Run: `cd web && pnpm test`
Expected: All tests pass (including existing 604 tests)

- [ ] **Step 4: Final biome and typecheck**

Run: `cd web && pnpm dlx @biomejs/biome check src/ && pnpm exec tsc --noEmit`
Expected: No errors

- [ ] **Step 5: Commit**

```bash
git add web/tests/scan-screen.test.ts
git commit -m "test: add ScanScreen component tests"
```

---

## Summary

| Task | Files | Tests |
|------|-------|-------|
| 1. Data types & positions | `scan-positions.ts` | — |
| 2. Position tests | — | `scan-positions.test.ts` |
| 3. Overlay store | `overlay.svelte.ts` | — |
| 4. ScanScreen | `ScanScreen.svelte` | — |
| 5. Integration | `+layout.svelte`, `TrainScreen.svelte`, `train/+page.svelte` | — |
| 6. Component tests | — | `scan-screen.test.ts` |

**Total new files:** 4 (scan-positions.ts, ScanScreen.svelte, scan-positions.test.ts, scan-screen.test.ts)
**Modified files:** 4 (overlay.svelte.ts, +layout.svelte, TrainScreen.svelte, train/+page.svelte)
**Expected new tests:** ~25 (20 position validation + 5 helper function tests + 7 component tests)
