/**
 * Analytics Service
 *
 * Track user behavior, app performance, and business metrics.
 * Features:
 * - Event tracking
 * - Screen view tracking
 * - User property tracking
 * - Conversion funnels
 * - Retention analysis
 * - Performance metrics
 */

export interface AnalyticsEvent {
  name: string;
  category: 'user_action' | 'game' | 'learning' | 'social' | 'monetization' | 'error';
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface ScreenView {
  screenName: string;
  timestamp: Date;
  timeSpent?: number; // milliseconds
  userId?: string;
}

export interface UserProperties {
  userId: string;
  properties: Record<string, any>;
  updatedAt: Date;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count' | 'percentage';
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Analytics Service
 */
export class AnalyticsService {
  private sessionId: string;
  private sessionStartTime: Date;
  private currentScreen?: string;
  private screenStartTime?: Date;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.sessionStartTime = new Date();
  }

  /**
   * Initialize analytics
   */
  async initialize(userId?: string): Promise<void> {
    console.log('[Analytics] Initialized for user:', userId);
    // TODO: Initialize analytics SDK (Firebase Analytics, Mixpanel, etc.)
  }

  /**
   * Track custom event
   */
  async trackEvent(
    name: string,
    category: AnalyticsEvent['category'],
    properties?: Record<string, any>
  ): Promise<void> {
    const event: AnalyticsEvent = {
      name,
      category,
      properties,
      timestamp: new Date(),
      sessionId: this.sessionId,
    };

    console.log('[Analytics] Event:', event);
    // TODO: Send to analytics backend
  }

  /**
   * Track screen view
   */
  async trackScreenView(screenName: string): Promise<void> {
    // Track time spent on previous screen
    if (this.currentScreen && this.screenStartTime) {
      const timeSpent = Date.now() - this.screenStartTime.getTime();
      await this.trackEvent('screen_view', 'user_action', {
        screen: this.currentScreen,
        timeSpent,
      });
    }

    this.currentScreen = screenName;
    this.screenStartTime = new Date();

    console.log('[Analytics] Screen view:', screenName);
    // TODO: Send to analytics backend
  }

  /**
   * Set user properties
   */
  async setUserProperties(properties: Record<string, any>): Promise<void> {
    console.log('[Analytics] User properties:', properties);
    // TODO: Send to analytics backend
  }

  /**
   * Track game started
   */
  async trackGameStarted(difficulty: string, color: 'white' | 'black'): Promise<void> {
    await this.trackEvent('game_started', 'game', {
      difficulty,
      color,
    });
  }

  /**
   * Track game completed
   */
  async trackGameCompleted(
    result: 'win' | 'loss' | 'draw',
    difficulty: string,
    moves: number,
    timeSpent: number,
    accuracy: number
  ): Promise<void> {
    await this.trackEvent('game_completed', 'game', {
      result,
      difficulty,
      moves,
      timeSpent,
      accuracy,
    });
  }

  /**
   * Track lesson completed
   */
  async trackLessonCompleted(lessonId: string, system: string, timeSpent: number): Promise<void> {
    await this.trackEvent('lesson_completed', 'learning', {
      lessonId,
      system,
      timeSpent,
    });
  }

  /**
   * Track puzzle solved
   */
  async trackPuzzleSolved(
    puzzleId: string,
    difficulty: string,
    timeTaken: number,
    correct: boolean
  ): Promise<void> {
    await this.trackEvent('puzzle_solved', 'learning', {
      puzzleId,
      difficulty,
      timeTaken,
      correct,
    });
  }

  /**
   * Track achievement unlocked
   */
  async trackAchievementUnlocked(achievementId: string, category: string): Promise<void> {
    await this.trackEvent('achievement_unlocked', 'user_action', {
      achievementId,
      category,
    });
  }

  /**
   * Track social interaction
   */
  async trackSocialInteraction(action: string, targetUserId?: string): Promise<void> {
    await this.trackEvent('social_interaction', 'social', {
      action,
      targetUserId,
    });
  }

  /**
   * Track share
   */
  async trackShare(contentType: string, platform: string): Promise<void> {
    await this.trackEvent('content_shared', 'social', {
      contentType,
      platform,
    });
  }

  /**
   * Track error
   */
  async trackError(error: Error, context?: string): Promise<void> {
    await this.trackEvent('error_occurred', 'error', {
      errorMessage: error.message,
      errorStack: error.stack,
      context,
    });
  }

  /**
   * Track performance metric
   */
  async trackPerformance(
    name: string,
    value: number,
    unit: PerformanceMetric['unit'],
    metadata?: Record<string, any>
  ): Promise<void> {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      metadata,
    };

    console.log('[Analytics] Performance:', metric);
    // TODO: Send to analytics backend
  }

  /**
   * Track app launch
   */
  async trackAppLaunch(isFirstLaunch: boolean): Promise<void> {
    await this.trackEvent('app_launched', 'user_action', {
      isFirstLaunch,
      sessionId: this.sessionId,
    });
  }

  /**
   * Track retention (day 1, day 7, day 30)
   */
  async trackRetention(daysSinceInstall: number): Promise<void> {
    if (daysSinceInstall === 1 || daysSinceInstall === 7 || daysSinceInstall === 30) {
      await this.trackEvent('retention_milestone', 'user_action', {
        daysSinceInstall,
      });
    }
  }

  /**
   * Track conversion funnel step
   */
  async trackFunnelStep(funnelName: string, stepName: string, stepIndex: number): Promise<void> {
    await this.trackEvent('funnel_step', 'user_action', {
      funnelName,
      stepName,
      stepIndex,
    });
  }

  /**
   * Get session metrics
   */
  getSessionMetrics(): {
    sessionId: string;
    duration: number;
    screenViews: number;
  } {
    return {
      sessionId: this.sessionId,
      duration: Date.now() - this.sessionStartTime.getTime(),
      screenViews: 0, // TODO: Track screen view count
    };
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * End session
   */
  async endSession(): Promise<void> {
    const metrics = this.getSessionMetrics();
    await this.trackEvent('session_ended', 'user_action', {
      sessionDuration: metrics.duration,
    });
  }
}

export const analyticsService = new AnalyticsService();
