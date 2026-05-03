# Pawnly — Chess, one warm move at a time

Mobile-first chess learning app built with SvelteKit. Play vs Stockfish, solve puzzles, take interactive lessons, and track your progress.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | SvelteKit 2 (Svelte 5 runes) |
| Styling | Tailwind CSS 4 |
| Chess engine | chess.js + Stockfish (Web Worker) |
| Backend | Supabase (auth, database) |
| Build | Vite 6, adapter-static |
| Linting | Biome |
| Testing | Vitest 4 + Testing Library |
| Language | TypeScript |

## Getting Started

```bash
pnpm install

# Set environment variables (from Supabase project)
export PUBLIC_SUPABASE_URL=https://your-project.supabase.co
export PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Start local Supabase (optional, requires Docker)
pnpm supabase:start

# Dev server
pnpm dev
```

## Commands

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Dev server |
| `pnpm build` | Static build |
| `pnpm preview` | Preview production build |
| `pnpm test` | Run tests |
| `pnpm test:watch` | Watch mode |
| `pnpm lint` | Biome check |
| `pnpm lint:fix` | Biome fix |
| `pnpm format` | Biome format |
| `pnpm check` | Svelte check + type check |

## Features

- **Play** — Full chess game vs Stockfish with configurable time control and difficulty. Post-game analysis with accuracy %, blunders, mistakes, inaccuracies.
- **Learn** — 5 interactive lessons (piece movement, capture/check, special moves, checkmate patterns, opening principles) with coach text, board highlights, and arrows.
- **Train** — 8 tactical puzzles (fork, pin, back rank mate, etc.) plus "Scan trainer" mode (find all checks/captures/threats before timer expires).
- **You** — Profile with rating, stats, achievement badges, settings.
- **Onboarding** — 5-step welcome flow.
- **Auth** — Email/password login, signup, magic link via Supabase.

## Routes

| Path | Purpose |
|------|---------|
| `/` | Dashboard with greeting, streak, quick actions, rating |
| `/auth` | Login/signup |
| `/play` | Game setup (time control, difficulty) |
| `/learn` | Lesson list with progress |
| `/train` | Puzzle grid, daily challenge, scan trainer |
| `/you` | Profile, stats, achievements |
| `/onboarding` | Welcome flow |

## Architecture

- `src/lib/game.svelte.ts` — Reactive game state wrapping chess.js
- `src/lib/stockfish.svelte.ts` — Stockfish Web Worker wrapper
- `src/lib/analysis.svelte.ts` — Post-game analysis engine
- `src/lib/board.svelte.ts` — Board rendering utilities
- `src/lib/brand.ts` — Design tokens (colors, fonts)
- `src/lib/repositories/` — Supabase data access layer
- `src/lib/components/` — Chessboard, GameScreen, TabBar, Mascot, etc.

## Supabase Tables

| Table | Purpose |
|-------|---------|
| `profiles` | User profile (rating, stats, streak) |
| `games` | Game history |
| `achievements` | Unlocked badges |
| `puzzle_progress` | Puzzle completion |
| `lesson_progress` | Lesson completion |
| `streaks` | Daily streak tracking |

All tables have RLS — users can only access their own data.

## Design

- **Fonts**: Fraunces (display), Geist (body), Geist Mono
- **Colors**: cream, moss, sunny, coral, sky
- **Mascot**: Animated character with moods (happy/thinking/celebrating/teaching)
