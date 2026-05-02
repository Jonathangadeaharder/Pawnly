# Blunder Prevention Scanner — Design Spec

**Date:** 2026-05-02
**Status:** Approved for implementation

## Overview

A gamified training mode called **"Scan"** that trains the habit of checking for opponent threats before moving. The user sees a chess position and must mark all squares where the opponent has Checks, Captures, and Threats (CCT). Timed challenges with star ratings encourage speed. Progressive unlock adds Loose pieces and Double attack categories as levels increase.

## Core Loop

1. Position appears with a countdown timer
2. User selects a mode (Check/Capture/Threat) from bottom toolbar
3. Taps squares to mark/unmark in that mode (color-coded highlights)
4. Submits → system compares marks against answer key
5. Stars awarded per position (3/2/1/0)
6. Next position, harder/faster

## Interaction Rules

- **Tap to mark**: Tap a square to mark it in the currently selected mode. The square gets the mode's color highlight.
- **Tap to unmark**: Tap an already-marked square in the same mode to remove the mark. The highlight disappears.
- **Multi-mode marking**: The same square can be marked in multiple modes simultaneously (e.g., a square can be both a Check and a Capture). Each mode's color is shown as a layered highlight.
- **Mode switching**: User can switch modes at any time. Existing marks persist when switching.
- **Submission scope**: On submit, only the active categories at the current level are evaluated. Categories not yet unlocked are ignored.
- **No partial submission**: User must press Submit (or wait for timer). There is no "skip" — unmarked categories count as misses.

## Data Model

```typescript
interface ScanPosition {
  id: string;
  fen: string;
  playerColor: 'w' | 'b'; // side the USER plays — scan for opponent's threats
  level: number; // 1-20, controls unlock progression
  targetTime: number; // seconds for 3 stars
  answerKey: {
    checks: string[];      // squares where opponent can give check
    captures: string[];    // squares where opponent can capture
    threats: string[];     // squares where opponent threatens valuable pieces
    loose?: string[];      // undefended pieces (unlocked at level 5+)
    doubleAttack?: string[]; // fork/double-attack squares (unlocked at level 10+)
  };
  hint?: string;
}
```

### Category Definitions (from opponent's perspective)

| Category | Definition | Example |
|----------|-----------|---------|
| **Checks** | Opponent pieces that give check right now, or could give check if a blocker moved | Rook on e-file with king on e8, no blockers |
| **Captures** | Opponent pieces that can legally capture something on their turn | Knight can take undefended pawn |
| **Threats** | Opponent pieces attacking something valuable (queen, rook) — not necessarily capturable now | Bishop diagonal pointing at rook, blocked by pawn |
| **Loose** | Your pieces that have zero defenders | Pawn on e4 with nothing defending it |
| **Double attack** | Opponent pieces that could create two threats with one move (forks) | Knight that could fork king and queen |

### Unlock Progression

| Levels | Active Categories |
|--------|-------------------|
| 1-4 | Checks, Captures |
| 5-7 | + Threats |
| 8-11 | + Loose |
| 12+ | + Double attack |

## Screen Layout

### ScanOverlay

Full-screen overlay (same pattern as PuzzleScreen/GameScreen).

```
┌─────────────────────────────────┐
│ ✕  Scan    ⏱ 0:12    ★ ★ ★    │  Header: close, title, timer, star indicator
│─────────────────────────────────│
│                                 │
│  ┌─────────────────────────┐    │
│  │                         │    │
│  │      CHESS BOARD        │    │
│  │   (MiniBoard with       │    │
│  │    colored highlights)  │    │
│  │                         │    │
│  └─────────────────────────┘    │
│                                 │
│  [⚡ Check] [💥 Capture] [🎯 Threat] │  Mode buttons (color-coded)
│  [🔒 Loose] [🔒 Double]              │  Advanced modes (locked/disabled)
│                                 │
│  [     Submit Scan     ]        │  Submit button
│                                 │
│  "Find all captures"            │  Current mode prompt
└─────────────────────────────────┘
```

### Color Scheme

| Mode | Highlight Color | Hex |
|------|----------------|-----|
| Check | Red glow | #E53935 |
| Capture | Amber glow | #FF9800 |
| Threat | Yellow glow | #FDD835 |
| Loose | Purple glow | #7E57C2 |
| Double attack | Pink glow | #EC407A |

### Post-Submit Feedback

- Correct squares: green checkmark overlay
- Missed squares: red X overlay
- Wrong marks: orange shake animation
- Score card slides up: stars earned, time taken, streak count, "Next" button

## Scoring

### Stars per Position

| Stars | Criteria |
|-------|----------|
| 3 | All active-category squares correctly marked (no misses, no wrong marks), under target time |
| 2 | All active-category squares correctly marked (no misses, no wrong marks), over target time |
| 1 | >50% of active-category squares correctly marked, or all correct but with some wrong marks |
| 0 | <50% of active-category squares correctly marked |

### Level Progression

- Each level has 5 positions
- Must earn ≥7 stars (out of 15) to unlock next level
- Streak counter: consecutive positions with 3 stars
- Best time tracked per position

### Timer Behavior

- Timer starts at position load
- Target time decreases as levels increase: 20s → 15s → 12s → 10s → 8s
- Timer bar color: green (>50%) → yellow (25-50%) → red (<25%)
- At 0: auto-submits with whatever is marked

## Integration with Existing App

### Train Screen

- New "Scan 🧠" section alongside existing Puzzle grid
- Hero card: "Blunder Prevention Scanner" with Mascot (thinking mood)
- Opens ScanOverlay via `overlay.openScan()`

### Overlay System

- Add `'scan'` to `OverlayType` union in `overlay.svelte.ts`
- Add `openScan()` method
- Render ScanOverlay in `+layout.svelte` alongside PuzzleScreen

### Files to Create/Modify

| File | Action |
|------|--------|
| `web/src/lib/data/scan-positions.ts` | New — scan position data with answer keys |
| `web/src/lib/components/screens/ScanScreen.svelte` | New — scan overlay component |
| `web/src/lib/stores/overlay.svelte.ts` | Modify — add 'scan' type and openScan() |
| `web/src/routes/+layout.svelte` | Modify — render ScanOverlay |
| `web/src/lib/components/screens/TrainScreen.svelte` | Modify — add Scan section |
| `web/tests/scan-positions.test.ts` | New — verify positions and answer keys |
| `web/tests/scan-screen.test.ts` | New — component behavior tests |

## Position Curation

20 hand-crafted positions across levels 1-15. Each position verified with chess.js to ensure:

- All FEN positions are legal
- All answer key squares are reachable by opponent pieces
- Answer key squares match the category definitions
- Target times are achievable but challenging

### Level Distribution

| Level | Positions | Categories | Target Time |
|-------|-----------|------------|-------------|
| 1-2 | 5 each | CCT | 20s |
| 3-4 | 5 each | CCT | 15s |
| 5-6 | 5 each | CCT + Threats | 15s |
| 7-8 | 5 each | CCT + Threats | 12s |
| 9-10 | 5 each | CCT + Threats + Loose | 12s |
| 11-12 | 5 each | All | 10s |
| 13-15 | 5 each | All | 8s |

## Testing Strategy

### Unit Tests

- `scan-positions.test.ts`: All FENs valid, all answer key squares exist on board, all answer key squares are reachable by opponent pieces
- `scan-screen.test.ts`: Mode switching, square marking/unmarking, timer behavior, submit scoring logic

### Integration Tests

- Level unlock progression (enough stars → next level unlocks)
- Streak counter increments/resets correctly
- Timer auto-submit at 0

## Success Criteria

- User can complete a scan drill in under 30 seconds
- Color-coded board provides immediate visual feedback
- Progressive difficulty keeps user challenged
- Streak counter motivates consistency
- All 20 positions verified with chess.js
- All tests pass
- Integrates cleanly with existing Train screen and overlay system
