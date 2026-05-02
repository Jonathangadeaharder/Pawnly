# Chess Learning App - Master Universal Opening Systems

A comprehensive React Native chess learning application designed to help users master universal, mirrored chess opening systems through adaptive learning, spaced repetition, and game-based learning.

## Project Overview

This application implements the complete blueprint for a modern chess learning platform that transforms dense expert analysis into an interactive, personalized learning experience. The app uses a "Digital Coach" persona to provide Socratic guidance, integrates the FSRS spaced repetition algorithm, and features human-like AI opponents for realistic practice.

## Architecture

### Technology Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Framework | React Native + Expo | Cross-platform mobile development |
| State Management | Zustand | Lightweight, performant global state |
| Navigation | React Navigation (Bottom Tabs) | Four main sections: Learn, Train, Play, Profile |
| Chess Logic | chess.js | Move validation, FEN/PGN parsing, game state |
| Animations | react-native-reanimated | 60fps animations on UI thread |
| Gestures | react-native-gesture-handler | Drag-and-drop and tap interactions |
| Haptics | expo-haptics | Tactile feedback for moves and events |
| Audio | expo-av | Sound effects for immersive experience |
| Storage | AsyncStorage | Local persistence of user data |
| Database | expo-sqlite | SRS queue storage |

### Folder Structure (Atomic Design)

```
src/
├── components/
│   ├── atoms/          # Basic UI elements (buttons, text, icons)
│   ├── molecules/      # Compound components (move list items)
│   ├── organisms/      # Complex components (Chessboard, mini-games)
│   └── templates/      # Screen layouts
├── screens/
│   ├── Learn/          # The Academy - curriculum and learning paths
│   ├── Train/          # The Gym - SRS reviews and mini-games
│   ├── Play/           # The Sparring Ring - games vs AI
│   └── Profile/        # The Trophy Room - stats and achievements
├── navigation/         # Navigation configuration
├── state/              # Zustand stores
│   ├── gameStore.ts    # Chess game state
│   ├── userStore.ts    # User profile and progress
│   └── uiStore.ts      # UI preferences
├── services/
│   ├── chess/          # Chess utilities
│   ├── srs/            # FSRS algorithm implementation
│   ├── coach/          # Digital Coach system
│   └── ai/             # Maia AI integration
├── constants/
│   └── theme.ts        # Design system (colors, typography, themes)
└── types/
    └── index.ts        # TypeScript type definitions
```

## Core Features Implemented

### 1. Navigation System ✅

Four-tab bottom navigation:
- **Learn (The Academy)**: Structured curriculum and lessons
- **Train (The Gym)**: Daily SRS reviews and mini-games
- **Play (The Sparring Ring)**: Full games against AI
- **Profile (The Trophy Room)**: Stats, achievements, and settings

### 2. State Management ✅

Three Zustand stores:

**GameStore** (`src/state/gameStore.ts`):
- Chess game state (position, moves, turn)
- Move validation and execution
- Legal move generation
- Square selection (tap-tap mode)
- FEN position loading

**UserStore** (`src/state/userStore.ts`):
- User profile management
- Daily streak tracking
- XP and leveling system
- Achievement unlocking
- SRS queue management
- Weakness tracking
- Game history

**UIStore** (`src/state/uiStore.ts`):
- Board and piece theme selection
- Sound/haptics/animation toggles
- Coach voice preferences

### 3. Interactive Chessboard ✅

`src/components/organisms/Chessboard.tsx`

Features:
- **Tap-tap interaction**: Select piece → tap destination
- **Legal move highlighting**: Visual feedback on valid moves
- **Multiple board themes**: Modern, Wood, Neo, Classic Green, Ocean Blue
- **Coordinate display**: File and rank labels
- **Board flipping**: View from either side
- **Haptic feedback**: Tactile response to moves
- **Integrated with chess.js**: Full move validation

### 4. FSRS Spaced Repetition Algorithm ✅

`src/services/srs/fsrs.ts`

Implementation of the state-of-the-art FSRS algorithm:

- **Separates Difficulty and Stability**: More accurate than SM-2
- **Adaptive scheduling**: Personalizes to user's learning curve
- **Supports both move and concept training**: Bifurcated SRS system
- **Advanced metrics**:
  - Calculate retrievability
  - Forecast future reviews
  - Track retention rates
  - Monitor average difficulty/stability

Key functions:
- `scheduleNextReview()`: Main scheduling function
- `createSRSItem()`: Initialize new items
- `getDueItems()`: Query items due for review
- `getForecast()`: Predict future workload

### 5. Design System ✅

`src/constants/theme.ts`

**Modern, Friendly Theme**:
- Primary color: Spicy Red (#B15653)
- Clean, light backgrounds
- DM Sans typography (fallback to System)
- Comprehensive spacing scale
- Consistent border radius
- Elevation/shadow system

**Board Themes**: 5 options for user customization
**Coach Personalities**: 4 unlockable coaches with different tones

### 6. Type System ✅

`src/types/index.ts`

Comprehensive TypeScript definitions for:
- Chess types (Square, Move, Position)
- Opening systems and variations
- SRS items and parameters
- Digital Coach prompts and interventions
- Mini-game configurations
- User profile and achievements
- Game sessions and analysis
- Navigation types

### 7. Sound System ✅

`src/services/audio/soundService.ts`

Multi-sensory audio feedback using expo-av:

- **Context-aware sounds**: Different sounds for moves, captures, checks, checkmate
- **Gamification sounds**: Success, error, streak, level-up, achievement unlock
- **Smart playback**: Respects user preferences, preloading for low latency
- **Sound sequences**: Chain multiple sounds for compound events
- **Key function**: `playMoveSound()` - Intelligently selects sound based on move type

### 8. MoveTrainer Component ✅

`src/components/organisms/MoveTrainer.tsx`

SRS-based drill for learning opening sequences (Procedural Memory):

- **Progressive training**: Walk through opening lines move-by-move
- **Immediate feedback**: Visual and audio response to correct/incorrect moves
- **Adaptive rating**: Grades performance (Easy/Good/Hard/Again) based on mistakes
- **Progress tracking**: Shows move count and completion percentage
- **Integrated with FSRS**: Automatically schedules next review
- **Hint system**: Optional hints without penalty

### 9. Digital Coach Dialog ✅

`src/components/organisms/DigitalCoachDialog.tsx`

Socratic dialogue system for pedagogical guidance:

- **Multiple prompt types**: Questions, hints, explanations, encouragement
- **Coach personalities**: Friendly, Attacker, Positional, Tactical (unlockable)
- **Follow-up prompts**: Multi-step dialogues for complex concepts
- **Visual highlights**: Coordinates with board to highlight squares/arrows
- **Animated presentation**: Smooth fade and slide animations
- **Voice support**: Ready for text-to-speech integration

### 10. Bishop's Prison Mini-Game ✅

`src/components/organisms/BishopsPrison.tsx`

Asymmetric endgame drill teaching "Good vs. Bad Bishop":

- **Educational setup**: User has good bishop, AI has bad bishop
- **Win condition**: Exploit the trapped bad bishop to win the endgame
- **Integrated coach**: Socratic prompts explain the concept during play
- **Performance metrics**: Tracks moves and time to completion
- **Concept reinforcement**: Clear explanation of good vs. bad bishops
- **Replayability**: Reset and try different approaches

### 11. Opening Lines Database ✅

`src/constants/openingLines.ts`

Sample repertoire for 5 universal opening systems:

- **King's Indian Attack**: 2 lines with variations
- **Colle System**: Main line with e4 break
- **Stonewall Attack**: Classic pawn chain formation
- **London System**: Early Bf4 development
- **Torre Attack**: Classical pin setup
- **Utility functions**: Get lines by system, random selection, ID lookup

## Key Design Principles

### 1. Pedagogical First

The app rejects the "engine-first" approach. Instead of raw evaluations (-3.1), it uses a **Digital Coach** that provides:
- Socratic questions ("What square is critical for your opponent?")
- Contextual hints
- Visual highlighting
- Encouraging guidance

### 2. Bifurcated SRS System

Solves the "Chessable Problem":
- **MoveTrainer**: Drills procedural memory (move sequences)
- **ConceptTrainer**: Drills declarative memory (strategic understanding)

### 3. Game-Based Learning

Beyond simple gamification:
- Mini-games use **asymmetric mechanics** to teach concepts
- Examples: Bishop's Prison, Transposition Maze, The Fuse
- Intrinsically fun while teaching strategy

### 4. Human-Like AI

Uses **Maia neural network**:
- Trained on millions of human games
- Makes realistic human mistakes (not random blunders)
- Different ELO levels (1100, 1300, 1500, 1900)
- Teaches users to punish actual human errors

## Running the Application

### Prerequisites

```bash
node >= 18
npm or yarn
expo-cli
```

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on specific platform
npm run android  # Android
npm run ios      # iOS (requires macOS)
npm run web      # Web browser
```

### Project Setup

The app initializes on launch:
1. Loads user profile from AsyncStorage
2. Loads UI settings
3. Initializes SRS queue
4. Sets up navigation

## Current Status

### ✅ Completed (Phases 1-6)

**Core Architecture:**
- [x] Project setup with TypeScript and Expo
- [x] Atomic Design folder structure
- [x] Bottom tab navigation (4 screens)
- [x] Three Zustand stores (game, user, UI)
- [x] Complete type definitions (200+ lines)
- [x] Theme system with 5 board themes
- [x] User profile with lesson tracking and streak management

**Interactive Components:**
- [x] Interactive chessboard component with chess.js
- [x] **Dual interaction modes**: tap-tap and drag-and-drop
- [x] Smooth drag-and-drop with spring animations
- [x] **SVG overlay system** for arrows and square highlights
- [x] Board annotation utilities (predefined colors and helpers)
- [x] Legal move highlighting
- [x] Haptic feedback integration (differentiated by action)
- [x] Sound system integration (expo-av)
- [x] FSRS algorithm implementation

**Pedagogical Features:**
- [x] Digital Coach dialog component with Socratic prompts
- [x] MoveTrainer component for SRS move drills (procedural memory)
- [x] ConceptTrainer component for strategic flashcards (declarative memory)
- [x] **Bifurcated SRS system complete** - moves + concepts
- [x] **20 concept cards** covering all 5 opening systems + general principles
- [x] 13 opening lines across 5 systems
- [x] **15 tactical puzzles** library (easy, medium, hard)

**Mini-Games (4 Complete):**
- [x] **Bishop's Prison** - Good vs. Bad Bishop endgame drill
- [x] **The Fuse** - Timed pattern recognition (15 sec challenges)
- [x] **Transposition Maze** - Navigate different move orders to target positions
- [x] **Blunder Hunter** - Spot and exploit opponent blunders (5 tactical puzzles)

**Learn Screen (The Academy):**
- [x] **15 structured lessons** across 5 opening systems
- [x] Interactive lesson viewer with multiple content types
- [x] Progress tracking per system
- [x] Sequential lesson unlocking
- [x] XP rewards (10 XP per minute)
- [x] Completion statistics

**Train Screen (The Gym):**
- [x] Fully integrated SRS review queue
- [x] Demo content generation (3 moves + 3 concepts)
- [x] "All Done!" completion state
- [x] Achievement checking after reviews
- [x] All 3 mini-games integrated

**Profile Screen (The Trophy Room):**
- [x] Achievement system (17 achievements)
- [x] Achievement celebration with confetti animation
- [x] **Comprehensive statistics dashboard**:
  - Level progress bar with XP tracking
  - SRS statistics (total reviews, mastered items, accuracy)
  - Learning progress by system
  - Game performance metrics (win rate, W/D/L record)

**Content Library:**
- [x] **Opening Lines**: 13 lines (160% increase from original 5)
- [x] **Concept Cards**: 20 strategic flashcards (150% increase from 8)
- [x] **Tactical Puzzles**: 15 puzzles covering 14 tactical patterns

### ✅ Phase 7 Complete

**Content Expansion:**
- [x] Expanded concept cards from 8 to 20 (all systems covered)
- [x] Expanded opening lines from 5 to 13 (all systems)
- [x] Created tactical patterns library with 15 puzzles
- [x] Organized puzzles by difficulty and pattern type

**Profile Enhancements:**
- [x] Level progress visualization
- [x] SRS performance metrics
- [x] Learning progress breakdown
- [x] Game statistics with win rate

### ✅ Phase 8 Complete (UX Enhancements)

**Drag-and-Drop Interaction:**
- [x] Full drag-and-drop support for chessboard
- [x] Smooth spring animations (scale + opacity)
- [x] Differentiated haptic feedback (Light → Medium → Heavy)
- [x] Three interaction modes: 'drag-drop', 'tap-tap', 'both'
- [x] Automatic legal move validation on drop
- [x] Spring-back animation for invalid moves
- [x] Maintains backward compatibility with existing components

### ✅ Phase 9 Complete (Analysis & Visualization)

**SVG Drawing Layer:**
- [x] ChessboardOverlay component with react-native-svg
- [x] Arrow annotations with customizable colors and opacity
- [x] Square highlights with customizable colors and opacity
- [x] Five predefined arrow colors (green, blue, red, yellow, orange)
- [x] Five predefined highlight colors (green, blue, red, yellow, purple)
- [x] Automatic arrowhead generation
- [x] Board flip support (arrows/highlights rotate with board)
- [x] Utility functions for common patterns:
  * Best move arrows
  * Alternative move arrows
  * Blunder arrows
  * Threat visualization
  * Legal move highlighting
  * Move comparison
- [x] Zero performance impact when not in use (conditional rendering)
- [x] Easy integration with any component using Chessboard

### ✅ Phase 10 Complete (Polish & Settings)

**Mini-Games:**
- [x] Blunder Hunter mini-game with 5 tactical puzzles
- [x] Theme-based training (Hanging Piece, Back Rank, Fork, etc.)
- [x] Progressive difficulty with hints and explanations
- [x] Performance tracking and accuracy metrics

**Settings Screen:**
- [x] Board theme selection with visual previews (5 themes)
- [x] Interaction mode toggle (drag-drop, tap-tap, both)
- [x] Audio & feedback preferences (haptics, sound effects)
- [x] App information and version details
- [x] Content library statistics display

### ✅ Phase 11 Complete (Data Persistence & Full Play Experience)

**Data Persistence:**
- [x] AsyncStorage service wrapper for all app data
- [x] User profile persistence (XP, level, streaks, completed lessons)
- [x] UI settings persistence (themes, sound, haptics)
- [x] Game history persistence (last 50 games)
- [x] SRS queue persistence
- [x] Automatic data loading on app initialization
- [x] Export/import functionality for backup/restore

**Full Play Screen:**
- [x] Complete game session management
- [x] AI opponent with 3 difficulty levels:
  * Beginner (~800 ELO) - Random moves with occasional tactics
  * Intermediate (~1200 ELO) - Tactical play with captures/checks
  * Advanced (~1600 ELO) - Strategic evaluation with 1-ply lookahead
- [x] Player color selection (white/black)
- [x] Real-time AI move calculation with thinking delay
- [x] Move history display with SAN notation
- [x] Game result detection (checkmate, stalemate, draws)
- [x] Resign functionality
- [x] XP rewards (100 XP for wins, 25 XP for losses/draws)
- [x] Automatic game history saving
- [x] Board flipping for black pieces
- [x] Dual interaction mode support (drag-drop + tap-tap)

**Navigation Enhancements:**
- [x] Profile stack navigator for Settings access
- [x] Settings button in Profile screen header
- [x] Proper navigation flow throughout app

### 📋 Planned (Future Phases)

**Integration & Backend:**
- [ ] SQLite database setup for SRS persistence
- [ ] Firebase/Supabase backend setup
- [ ] Daily streak validation (server-side)
- [ ] Maia AI integration via API
- [ ] Weakness Finder (PGN analysis)
- [ ] External account linking (Lichess, Chess.com)

**Additional Features:**
- [ ] Game analysis screen with move-by-move review
- [ ] Onboarding flow (Playstyle Sorter quiz)
- [ ] Advanced analytics and progress tracking
- [ ] Cloud sync across devices
- [ ] Upgrade AI to Stockfish.js or Maia for stronger play

## Next Steps

### Immediate Priorities (Phase 12)

1. **Enhanced AI & Analysis**:
   - Integrate Stockfish.js for stronger AI opponents
   - Implement post-game analysis with blunder detection
   - Add move-by-move evaluation
   - Coach commentary on critical positions

2. **SQLite Migration**:
   - Migrate from AsyncStorage to SQLite for better query performance
   - Implement efficient SRS queue queries
   - Add advanced analytics queries
   - Game history search and filtering

3. **Content Expansion**:
   - Add intermediate/advanced lessons (levels 6-10 per system)
   - Create additional mini-games (checkmate patterns, endgame drills)
   - Expand tactical puzzle library to 50+ puzzles
   - Add opening repertoire builder

### Medium-Term Goals (Phase 13-14)

1. **Backend & Sync**:
   - Firebase/Supabase integration
   - Multi-device synchronization
   - Server-side streak validation

2. **Advanced Features**:
   - Weakness Finder (PGN analysis)
   - External account linking (Lichess, Chess.com)
   - Community features (share progress)
   - Onboarding flow with Playstyle Sorter

3. **Scaling & Performance**:
   - Optimize bundle size
   - Implement code splitting
   - Add offline mode
   - Performance monitoring

## Testing Strategy

### Manual Testing Checklist

- [ ] Board renders correctly with starting position
- [ ] Pieces can be selected (highlighted with legal moves)
- [ ] Legal moves are visually highlighted
- [ ] Moves can be made via tap-tap
- [ ] Illegal moves are rejected
- [ ] Haptic feedback fires on moves
- [ ] Board themes can be changed
- [ ] User profile persists across app restarts
- [ ] SRS items can be created and scheduled
- [ ] Navigation between tabs works smoothly

### Unit Tests (Future)

- FSRS algorithm correctness
- Move validation logic
- SRS scheduling calculations
- Achievement unlock conditions

## Contributing Guidelines

### Code Style

- Use TypeScript for all new files
- Follow Atomic Design for components
- Use functional components with hooks
- Prefer `const` over `let`
- Add JSDoc comments for complex functions
- Keep files under 300 lines

### Commit Messages

Format: `[Component] Brief description`

Examples:
- `[Chessboard] Add drag-and-drop support`
- `[FSRS] Fix stability calculation`
- `[Coach] Implement Socratic prompts for opening errors`

## Resources

### Key Dependencies

- [chess.js documentation](https://github.com/jhlywa/chess.js)
- [FSRS algorithm paper](https://github.com/open-spaced-repetition/fsrs4anki/wiki/The-Algorithm)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Zustand](https://github.com/pmndrs/zustand)
- [Expo docs](https://docs.expo.dev/)

### Design References

- Chessable MoveTrainer
- Dr. Wolf chess app (Digital Coach inspiration)
- Lichess UI/UX
- Maia Chess (human-like AI)

## License

[To be determined]

## Authors

Built following the comprehensive blueprint for an adaptive chess learning application.

---

## Recent Updates (Phases 4-7)

### Phase 4: Interactive Mini-Games
- Created **The Fuse** - Timed tactical pattern recognition
- 5 puzzles with 15-second countdown and explosion animation
- Fully integrated into Train screen

### Phase 5: Complete Lesson System
- Built **15 structured lessons** across all 5 opening systems
- Created **LessonViewer** component with multiple content types
- Added **lesson completion tracking** to user profile
- Implemented XP rewards for completed lessons
- Sequential unlocking system (must complete previous lesson)

### Phase 6: Transposition Training
- Created **Transposition Maze** mini-game
- 3 progressive puzzles teaching move order flexibility
- Multiple valid solution paths per puzzle
- Real-time path validation and feedback
- Expanded London System and Torre Attack lesson content (2 lessons each)

### Phase 7: Content Expansion & Enhanced Analytics
- **Concept Card Library**: Expanded from 8 to 20 cards (150% increase)
  - Added 3 London System concepts
  - Added 3 Torre Attack concepts
  - Added 3 additional general concepts
  - All 5 opening systems now fully covered
- **Opening Lines**: Expanded from 5 to 13 lines (160% increase)
  - New lines for KIA, Colle, Stonewall, London, Torre
- **Tactical Patterns Library**: Created comprehensive puzzle database
  - 15 tactical puzzles organized by difficulty (easy/medium/hard)
  - 14 tactical patterns covered (Greek Gift, Pins, Forks, etc.)
  - Utility functions for pattern-based and difficulty-based selection
  - The Fuse mini-game now uses dynamic puzzle library
- **Profile Screen Enhancements**:
  - Level progress bar with XP visualization
  - SRS statistics section (reviews, mastered items, accuracy)
  - Learning progress breakdown by opening system
  - Game performance metrics (win rate, W/D/L record)

### Phase 8: Drag-and-Drop Interaction
- **Chessboard Drag-and-Drop**: Complete implementation with smooth animations
  - Full gesture handling using react-native-gesture-handler
  - Spring animations for natural feel (scale: 1.0 → 1.2, opacity: 1.0 → 0.8)
  - Piece enlarges on drag start, springs back on invalid move
  - Three interaction modes:
    * 'drag-drop' - Drag-only mode
    * 'tap-tap' - Classic two-tap mode
    * 'both' - Supports both methods (default)
  - Differentiated haptic feedback:
    * Light: Tap to select
    * Medium: Drag start
    * Heavy: Successful drop
    * Error notification: Invalid drop
  - Automatic legal move detection on drop location
  - Maintains legal move highlighting during drag
  - Sound effects integrated (move/capture)
  - Backward compatible with all existing components

### Phase 9: SVG Drawing Layer
- **ChessboardOverlay Component**: Professional annotation system
  - Built with react-native-svg for crisp vector graphics
  - Arrow annotations with automatic arrowhead generation
  - Square highlight annotations with customizable opacity
  - Five predefined arrow colors (green, blue, red, yellow, orange)
  - Five predefined highlight colors with strategic meanings
  - Board flip support (annotations rotate with board)
- **Board Annotation Utilities** (src/utils/boardAnnotations.ts):
  - createBestMoveArrow(): Green arrow for best move
  - createAlternativeArrow(): Blue arrow for alternatives
  - createBlunderArrow(): Red arrow for mistakes
  - createThreatArrow(): Orange arrow for threats
  - createTargetHighlight(): Green highlight for good squares
  - createDangerHighlight(): Red highlight for danger squares
  - showThreat(): Combined arrow + highlight visualization
  - compareMoves(): Side-by-side move comparison
- **Use Cases**:
  - Post-game analysis with move annotations
  - Teaching mode showing best moves
  - Puzzle hints with visual guidance
  - Threat detection visualization
  - Multi-move combination display
- **Integration**:
  - Simple props on Chessboard component (arrows, highlights)
  - Zero performance impact when not in use
  - Type-safe with TypeScript
  - Works with all interaction modes

### Phase 10: Polish & Settings Screen
- **Blunder Hunter Mini-Game**: Fourth mini-game complete
  - 5 tactical puzzles teaching exploitation of blunders
  - Themes: Hanging Piece, Back Rank Mate, Discovered Attack, Fork
  - Progressive puzzle flow with attempt tracking
  - Hint system with coach integration
  - Automatic solution validation
  - Visual feedback with best move arrows (green)
  - Performance metrics (solved count, accuracy)
- **Settings Screen**: Comprehensive preferences management
  - Board theme selection with 5 visual preview cards
  - Interaction mode toggle (drag-drop, tap-tap, both)
  - Audio & Feedback section:
    * Haptic feedback toggle
    * Sound effects toggle
  - App information display (version, build, platform)
  - Content library statistics:
    * 15 lessons across 5 opening systems
    * 20 concept cards for strategic learning
    * 15 tactical puzzles (3 difficulty levels)
    * 4 mini-games for skill training
    * 17 achievements to unlock
- **Type System Updates**:
  - Added InteractionMode type definition
  - Added BoardTheme type definition
  - Full type safety across settings

### Phase 11: Data Persistence & Full Play Experience
- **AsyncStorage Service**: Complete data persistence layer
  - Generic save/load functions with type safety
  - Export/import for backup and restore
  - Automatic serialization/deserialization
  - Error handling and logging
- **User Data Persistence**: All progress now persists between sessions
  - Profile (XP, level, streaks, completed lessons)
  - UI settings (themes, sound, haptics)
  - Game history (last 50 games with detailed stats)
  - SRS queue (all review items and scheduling)
  - Achievements (unlock state and dates)
- **Complete Play Screen**: Full game experience vs AI
  - Game setup screen with difficulty and color selection
  - Three AI difficulty levels with realistic play:
    * Beginner (800 ELO): 80% random, 20% tactical
    * Intermediate (1200 ELO): 60% tactical, 40% strategic
    * Advanced (1600 ELO): 90% strategic with minimax evaluation
  - Real-time AI move calculation with human-like delays (0.5-2s)
  - Board auto-flips based on player color
  - Move history scrolling display
  - Game state management (setup → playing → finished)
  - Result detection (checkmate, stalemate, resignation, draws)
  - Post-game summary with stats (moves played, XP earned)
  - Automatic game history saving with full details
- **Simple AI Service**: Placeholder engine before Stockfish/Maia
  - Random move generator
  - Tactical awareness (captures and checks)
  - Basic position evaluation (material counting)
  - 1-ply minimax lookahead
  - Configurable thinking delays
- **Navigation Stack**: Enhanced profile navigation
  - ProfileStackNavigator for Settings access
  - Settings button in Profile header
  - Smooth navigation between Profile and Settings
- **Type System Enhancements**:
  - Added SimpleGameHistory type for efficient storage
  - Updated UserState with gameHistory field
  - Added InteractionMode type
  - Type-safe AI difficulty levels

### Phase 12 Part 1: Enhanced AI Engine
- **Significantly Stronger AI**: Complete rewrite with advanced chess engine
  - Multi-ply minimax algorithm with alpha-beta pruning
  - Piece-square tables for positional evaluation
  - Move ordering for pruning efficiency
  - Material + position + mobility evaluation
  - 4 difficulty levels:
    * Beginner (800 ELO): 1-ply with 50% random moves
    * Intermediate (1400 ELO): 2-ply with 20% random moves
    * Advanced (1800 ELO): 3-ply with 5% random moves
    * Expert (2200 ELO): 4-ply with perfect play
- **Move Evaluation System**: Complete analysis framework
  - evaluateMove() function for individual move analysis
  - analyzeGame() function for full game review
  - Move classification (Best, Good, Inaccuracy, Mistake, Blunder)
  - Numeric evaluation scores
  - Automated commentary generation
- **Foundation for Analysis**: Ready for post-game analysis screens
  - Blunder detection algorithm (>300 centipawn loss)
  - Mistake detection (150-300 centipawn loss)
  - Inaccuracy detection (50-150 centipawn loss)
  - Best move identification

### Phase 12 Part 2: Game Analysis Screen
- **Post-Game Analysis Interface**: Comprehensive move-by-move review screen
  - Interactive game replay with move navigation
  - Statistics summary card (accuracy, blunders, mistakes, inaccuracies, best moves)
  - Visual move classification with color-coded badges and icons
  - Automated commentary for each move
  - Centipawn evaluation display
  - Jump to any move in the game
  - Board position reconstruction for each move
- **Seamless Navigation**: Full stack navigator for Play screens
  - PlayStackNavigator with PlayHome and GameAnalysis routes
  - Type-safe navigation with PlayStackParamList
  - "Analyze Game" button on finished game screen
  - Passes complete game history to analysis screen
- **User Experience**: Professional analysis presentation
  - Loading state with move count during analysis
  - Color-coded move quality (Red=Blunder, Yellow=Mistake, Orange=Inaccuracy, Green=Best)
  - Scrollable move history with quality indicators
  - Respects player color for board orientation
  - Statistics grid with visual dividers

### Phase 12 Part 3: Coach Commentary System
- **Intelligent Critical Position Detection**: Automatic identification of learning moments
  - Blunder detection (>300 centipawn loss) with high/medium severity classification
  - Missed tactic identification (150-300 centipawn loss)
  - Checkmate threat and missed checkmate detection
  - Critical decision point recognition
- **Socratic Coach Prompts**: Question-based learning for deep understanding
  - Randomized Socratic questions tailored to position type
  - Hint system with progressive disclosure
  - Detailed explanations after user engagement
  - Context-aware coaching based on move quality
- **Visual Learning Aids**: Arrow and circle highlights for key positions
  - Red arrows for blunder moves
  - Green arrows for best alternative moves
  - Blue arrows and circles for tactical opportunities
  - Yellow circles for checkmate threats
- **Seamless Integration**: Coach insights embedded in analysis flow
  - "Get Coach Insight" button appears on critical positions
  - School icon indicators in move history for learning moments
  - DigitalCoachDialog modal for interactive learning
  - Non-intrusive design - coach appears only when helpful
- **Pattern Recognition**: Sophisticated tactical detection
  - Fork, pin, and skewer identification
  - Forcing move recognition (checks + captures)
  - Material imbalance detection
  - King safety evaluation

### Phase 12 Part 4: SQLite Database Migration
- **High-Performance Storage**: Migrated from AsyncStorage to SQLite
  - expo-sqlite integration for production-grade data management
  - Relational database schema with proper indexing
  - Significant performance improvements for large datasets
  - Advanced query capabilities for analytics
- **Comprehensive Database Schema**:
  - User Profile table with all profile data and preferences
  - SRS Items table with spaced repetition scheduling
  - Game History table for all played games
  - Weaknesses table tracking recurring mistakes
  - Indexed columns for optimized query performance
- **Automatic Migration System**:
  - Seamless one-time migration from AsyncStorage to SQLite
  - Data preservation during migration
  - Migration status tracking
  - Backward compatibility with existing data
- **Advanced Analytics Queries**:
  - Game statistics (win rate, accuracy, total games)
  - Recent performance tracking (last 7 days)
  - SRS statistics (due items, retention rate, mastered items)
  - Weakness frequency analysis
  - Efficient sorting and filtering
- **Optimized Performance**:
  - Indexed queries for fast retrieval
  - Batch operations for data insertion
  - Efficient SRS scheduling with date-based indexes
  - Limited result sets for memory efficiency (50 games, 50 weaknesses)
- **Database Services**:
  - `sqliteService.ts`: Core database operations and queries
  - `migrationService.ts`: Handles AsyncStorage to SQLite migration
  - Updated `userStore.ts`: Now uses SQLite instead of AsyncStorage

**Version**: 1.5.0 (SQLite Database Migration)
**Last Updated**: 2025-11-17
