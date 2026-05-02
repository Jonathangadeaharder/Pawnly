/**
 * Lazy Loaded Routes
 *
 * Implements code splitting by route for better performance.
 * Each screen is lazy loaded only when needed.
 */

import { lazyLoadScreen } from '../utils/lazyLoad';

/**
 * Home & Main Screens (keep these loaded for faster initial render)
 */
// Home screen is not lazy loaded for instant display
export { default as HomeScreen } from '../screens/Home/HomeScreen';

/**
 * Game Screens (lazy loaded)
 */
export const PlayScreen = lazyLoadScreen(
  () => import('../screens/Game/PlayScreen'),
  'PlayScreen'
);

export const GameAnalysisScreen = lazyLoadScreen(
  () => import('../screens/Game/GameAnalysisScreen'),
  'GameAnalysisScreen'
);

export const PuzzleScreen = lazyLoadScreen(
  () => import('../screens/Learning/PuzzleScreen'),
  'PuzzleScreen'
);

/**
 * Learning Screens (lazy loaded)
 */
export const LearningScreen = lazyLoadScreen(
  () => import('../screens/Learning/LearningScreen'),
  'LearningScreen'
);

export const LessonScreen = lazyLoadScreen(
  () => import('../screens/Learning/LessonScreen'),
  'LessonScreen'
);

export const OpeningLibraryScreen = lazyLoadScreen(
  () => import('../screens/Learning/OpeningLibraryScreen'),
  'OpeningLibraryScreen'
);

export const EndgameDrillsScreen = lazyLoadScreen(
  () => import('../screens/Learning/EndgameDrillsScreen'),
  'EndgameDrillsScreen'
);

/**
 * Profile & Progress Screens (lazy loaded)
 */
export const ProfileScreen = lazyLoadScreen(
  () => import('../screens/Profile/ProfileScreen'),
  'ProfileScreen'
);

export const ProgressScreen = lazyLoadScreen(
  () => import('../screens/Profile/ProgressScreen'),
  'ProgressScreen'
);

export const StatisticsScreen = lazyLoadScreen(
  () => import('../screens/Profile/StatisticsScreen'),
  'StatisticsScreen'
);

export const AchievementsScreen = lazyLoadScreen(
  () => import('../screens/Profile/AchievementsScreen'),
  'AchievementsScreen'
);

/**
 * Settings Screens (lazy loaded)
 */
export const SettingsScreen = lazyLoadScreen(
  () => import('../screens/Settings/SettingsScreen'),
  'SettingsScreen'
);

/**
 * Community Screens (lazy loaded - lower priority)
 */
export const LeaderboardScreen = lazyLoadScreen(
  () => import('../screens/Community/LeaderboardScreen'),
  'LeaderboardScreen'
);

export const SocialProfileScreen = lazyLoadScreen(
  () => import('../screens/Community/SocialProfileScreen'),
  'SocialProfileScreen'
);

export const FriendsScreen = lazyLoadScreen(
  () => import('../screens/Community/FriendsScreen'),
  'FriendsScreen'
);

/**
 * Onboarding Screens (lazy loaded)
 */
export const OnboardingFlowScreen = lazyLoadScreen(
  () => import('../screens/Onboarding/OnboardingFlow'),
  'OnboardingFlow'
);

/**
 * Analytics Screens (lazy loaded - admin/debug)
 */
export const AnalyticsDashboardScreen = lazyLoadScreen(
  () => import('../screens/Analytics/AnalyticsDashboard'),
  'AnalyticsDashboard'
);

/**
 * Preload critical screens for better UX
 */
export function preloadCriticalScreens() {
  // Preload screens that are likely to be accessed soon
  const criticalImports = [
    () => import('../screens/Game/PlayScreen'),
    () => import('../screens/Learning/PuzzleScreen'),
    () => import('../screens/Profile/ProfileScreen'),
  ];

  // Start loading in background
  criticalImports.forEach(importFunc => {
    importFunc().catch(err => {
      console.warn('[LazyRoutes] Failed to preload screen:', err);
    });
  });
}

/**
 * Route loading priorities
 */
export const ROUTE_PRIORITIES = {
  // High priority - preload immediately
  high: [
    'PlayScreen',
    'PuzzleScreen',
    'ProfileScreen',
  ],
  // Medium priority - preload after initial render
  medium: [
    'LearningScreen',
    'GameAnalysisScreen',
    'LeaderboardScreen',
  ],
  // Low priority - load on demand only
  low: [
    'AnalyticsDashboard',
    'OnboardingFlow',
    'SettingsScreen',
  ],
};

/**
 * Preload screens by priority
 */
export async function preloadScreensByPriority(priority: keyof typeof ROUTE_PRIORITIES) {
  const screenNames = ROUTE_PRIORITIES[priority];

  const importMap: Record<string, () => Promise<any>> = {
    PlayScreen: () => import('../screens/Game/PlayScreen'),
    PuzzleScreen: () => import('../screens/Learning/PuzzleScreen'),
    ProfileScreen: () => import('../screens/Profile/ProfileScreen'),
    LearningScreen: () => import('../screens/Learning/LearningScreen'),
    GameAnalysisScreen: () => import('../screens/Game/GameAnalysisScreen'),
    LeaderboardScreen: () => import('../screens/Community/LeaderboardScreen'),
    AnalyticsDashboard: () => import('../screens/Analytics/AnalyticsDashboard'),
    OnboardingFlow: () => import('../screens/Onboarding/OnboardingFlow'),
    SettingsScreen: () => import('../screens/Settings/SettingsScreen'),
  };

  for (const screenName of screenNames) {
    const importFunc = importMap[screenName];
    if (importFunc) {
      try {
        await importFunc();
      } catch (error) {
        console.warn(`[LazyRoutes] Failed to preload ${screenName}:`, error);
      }
    }
  }
}
