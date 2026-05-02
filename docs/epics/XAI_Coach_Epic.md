# Epic: Explainable AI (XAI) & Counterfactual Reasoning Coach (Algorithmic)

**Description:** Upgrade the Chess app's digital coach with counterfactual reasoning and a template-based algorithmic explanation engine. By combining Stockfish evaluations with symbolic board analysis (detecting forks, pins, hanging pieces), the coach will generate natural-language feedback and visual saliency maps completely offline, falling back to interactive "Show Punishment" lines when complex patterns aren't recognized.

---

## Story 1: Neuro-Symbolic Parser Integration
**Objective:** Translate raw engine numerical evaluations into human-understandable symbolic concepts.

### Ticket 1.1: Create `symbolicAnalyzer.ts`
*   **Location:** `src/services/chess/symbolicAnalyzer.ts`
*   **Implementation Details:**
    *   Create a new utility service to act as the "Symbolic" parser.
    *   Integrate with `chess.js` to analyze the board's FEN state before and after a blunder.
    *   Implement algorithmic checks for specific tactical concepts: "Hanging Piece", "Fork", "Pin", "Skewer", "Discovered Attack", "Discovered Check", "Double Check", "Back-Rank Weakness/Mate", "Trapped Piece", "Deflection/Removing the Defender", "Overloaded Piece", "Missed Mate", and "Exposed King".
    *   Output a structured object containing the evaluation drop (e.g., -4.0), the identified symbolic tag, and the related squares (for saliency maps).

---

## Story 2: Algorithmic Coach Engine (Template-Based)
**Objective:** Generate dynamic coach feedback offline using templates mapped to symbolic tags and user skill levels, replacing the need for an external AI/SLM.

### Ticket 2.1: Create `coachEngine.ts` and Template Dictionary
*   **Location:** `src/services/ai/coachEngine.ts`
*   **Implementation Details:**
    *   Create a local dictionary of response templates keyed by Symbolic Tag, User Level, and Coach Personality.
        *   *Example:* `Template["Fork"]["Beginner"]["Friendly"] = "Watch out! Moving there allows the opponent to attack two of your pieces at once on {squares}."`
    *   Build an engine that takes the output from `symbolicAnalyzer.ts`, selects the appropriate template, and interpolates the specific squares/pieces.
    *   **Fallback Logic:** If `symbolicAnalyzer.ts` cannot confidently identify a specific tactical motif, fallback to a generic template: *"That move loses a significant advantage. Let's see how the opponent would respond."*

### Ticket 2.2: Update `DigitalCoachDialog`
*   **Location:** `src/components/organisms/DigitalCoachDialog.tsx`
*   **Implementation Details:**
    *   Refactor the dialog to consume the localized text output from `coachEngine.ts`.
    *   Ensure the dialog handles the fallback scenario by prominently prompting the user to use the "Show Punishment" feature.

---

## Story 3: Counterfactual Reasoning & "Why Not" Protocol
**Objective:** Allow users to explore alternative moves and visually see how the engine would punish their mistakes, acting as the ultimate "Show Me" fallback.

### Ticket 3.1: Implement "Punishment Lines" in Game Analysis
*   **Location:** `GameAnalysis` screen (Phase 12 Part 2)
*   **Implementation Details:**
    *   Add a **"Show Punishment"** button that appears when the user navigates to a move classified as a "Blunder".
    *   When clicked, temporarily branch the `gameStore` state.
    *   Render the user's blunder using `createBlunderArrow()` (red arrow) via `src/utils/boardAnnotations.ts`.
    *   Immediately automatically play the engine's top punishment response and render it using `createThreatArrow()` (orange arrow).

### Ticket 3.2: Implement Interactive "Why Not" Protocol
*   **Location:** `GameAnalysis` screen
*   **Implementation Details:**
    *   Enable drag-and-drop interaction during the post-game analysis flow.
    *   If the user drags a piece to an alternative square, intercept the move.
    *   Run the alternative move through Stockfish to get the evaluation and the opponent's punishment move.
    *   Run the punishment move through `symbolicAnalyzer.ts` and `coachEngine.ts` to generate an explanation (e.g., *"If you play that, the opponent replies with [Move], resulting in a [Symbolic Reason]."*).

---

## Story 4: Visual Saliency Maps
**Objective:** Visually highlight the specific pieces and squares involved in the algorithmic explanation.

### Ticket 4.1: Integrate Saliency Maps with `ChessboardOverlay`
*   **Location:** `src/components/organisms/ChessboardOverlay.tsx`
*   **Implementation Details:**
    *   Consume the `saliency_squares` array identified by `symbolicAnalyzer.ts` in Ticket 1.1.
    *   Map these squares to the SVG overlay using existing highlighting functions like `createDangerHighlight()` and `createTargetHighlight()`.
    *   Ensure the visual highlights synchronize with the appearance of the text in the `DigitalCoachDialog`.