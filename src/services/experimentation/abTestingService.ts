/**
 * A/B Testing Service
 *
 * Feature experimentation and A/B testing framework.
 * Features:
 * - Create and manage experiments
 * - Assign users to variants
 * - Track exposures and conversions
 * - Statistical analysis
 * - Feature flags
 * - Gradual rollouts
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from '../monitoring/analyticsService';

export type VariantType = 'control' | 'variant-a' | 'variant-b' | 'variant-c';

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: 'draft' | 'running' | 'paused' | 'completed';
  startDate?: Date;
  endDate?: Date;
  targetingRules?: TargetingRule[];
  variants: ExperimentVariant[];
  metrics: ExperimentMetric[];
}

export interface ExperimentVariant {
  id: string;
  name: string;
  type: VariantType;
  allocation: number; // Percentage 0-100
  config: Record<string, any>; // Variant-specific configuration
}

export interface ExperimentMetric {
  name: string;
  type: 'conversion' | 'engagement' | 'retention' | 'revenue';
  goalValue?: number;
}

export interface TargetingRule {
  type: 'user-property' | 'device' | 'version' | 'country' | 'custom';
  property: string;
  operator: 'equals' | 'contains' | 'greater-than' | 'less-than' | 'in';
  value: any;
}

export interface UserAssignment {
  experimentId: string;
  variantId: string;
  variantType: VariantType;
  assignedAt: Date;
  exposureCount: number;
  conversionEvents: string[];
}

export interface ExperimentResults {
  experimentId: string;
  experimentName: string;
  totalUsers: number;
  variantResults: VariantResults[];
  winner?: string;
  confidence: number; // 0-100%
  recommendations: string[];
}

export interface VariantResults {
  variantId: string;
  variantName: string;
  variantType: VariantType;
  users: number;
  exposures: number;
  conversions: number;
  conversionRate: number;
  averageEngagement: number;
}

/**
 * A/B Testing Service
 */
export class ABTestingService {
  private experiments: Map<string, Experiment> = new Map();
  private userAssignments: Map<string, UserAssignment[]> = new Map();
  private userId?: string;
  private isInitialized: boolean = false;

  /**
   * Initialize A/B testing service
   */
  async initialize(userId: string): Promise<void> {
    this.userId = userId;

    // Load experiments from backend
    await this.loadExperiments();

    // Load user assignments
    await this.loadUserAssignments();

    this.isInitialized = true;
    console.log('[ABTesting] Initialized for user:', userId);
  }

  /**
   * Load experiments from storage/backend
   */
  private async loadExperiments(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('@experiments');
      if (stored) {
        const experiments = JSON.parse(stored);
        experiments.forEach((exp: Experiment) => {
          this.experiments.set(exp.id, exp);
        });
      }

      // Load default experiments
      this.loadDefaultExperiments();
    } catch (error) {
      console.error('[ABTesting] Failed to load experiments:', error);
    }
  }

  /**
   * Load default experiments for testing
   */
  private loadDefaultExperiments(): void {
    // Example: Onboarding flow experiment
    this.experiments.set('onboarding-v2', {
      id: 'onboarding-v2',
      name: 'Onboarding Flow V2',
      description: 'Test new onboarding flow with gamification',
      status: 'running',
      startDate: new Date('2025-01-01'),
      variants: [
        {
          id: 'control',
          name: 'Original Onboarding',
          type: 'control',
          allocation: 50,
          config: { version: 'v1' },
        },
        {
          id: 'variant-a',
          name: 'Gamified Onboarding',
          type: 'variant-a',
          allocation: 50,
          config: { version: 'v2', gamification: true },
        },
      ],
      metrics: [
        { name: 'onboarding_completed', type: 'conversion' },
        { name: 'time_to_first_game', type: 'engagement' },
        { name: 'day_1_retention', type: 'retention' },
      ],
    });

    // Example: Puzzle difficulty algorithm
    this.experiments.set('puzzle-difficulty', {
      id: 'puzzle-difficulty',
      name: 'Puzzle Difficulty Algorithm',
      description: 'Test adaptive difficulty vs fixed difficulty',
      status: 'running',
      variants: [
        {
          id: 'control',
          name: 'Fixed Difficulty',
          type: 'control',
          allocation: 50,
          config: { algorithm: 'fixed' },
        },
        {
          id: 'variant-a',
          name: 'Adaptive Difficulty',
          type: 'variant-a',
          allocation: 50,
          config: { algorithm: 'adaptive' },
        },
      ],
      metrics: [
        { name: 'puzzles_solved', type: 'engagement' },
        { name: 'puzzle_accuracy', type: 'engagement' },
        { name: 'session_length', type: 'engagement' },
      ],
    });

    // Example: Daily rewards experiment
    this.experiments.set('daily-rewards', {
      id: 'daily-rewards',
      name: 'Daily Rewards System',
      description: 'Test different daily reward structures',
      status: 'running',
      variants: [
        {
          id: 'control',
          name: 'Standard Rewards',
          type: 'control',
          allocation: 33,
          config: { rewardMultiplier: 1 },
        },
        {
          id: 'variant-a',
          name: '2x Rewards',
          type: 'variant-a',
          allocation: 33,
          config: { rewardMultiplier: 2 },
        },
        {
          id: 'variant-b',
          name: 'Progressive Rewards',
          type: 'variant-b',
          allocation: 34,
          config: { rewardMultiplier: 'progressive' },
        },
      ],
      metrics: [
        { name: 'daily_return_rate', type: 'retention' },
        { name: 'streak_length', type: 'engagement' },
      ],
    });
  }

  /**
   * Load user assignments from storage
   */
  private async loadUserAssignments(): Promise<void> {
    if (!this.userId) return;

    try {
      const stored = await AsyncStorage.getItem(`@assignments_${this.userId}`);
      if (stored) {
        const assignments = JSON.parse(stored);
        this.userAssignments.set(this.userId, assignments);
      }
    } catch (error) {
      console.error('[ABTesting] Failed to load user assignments:', error);
    }
  }

  /**
   * Get variant for an experiment
   */
  async getVariant(experimentId: string): Promise<ExperimentVariant | null> {
    if (!this.isInitialized || !this.userId) {
      console.warn('[ABTesting] Service not initialized');
      return null;
    }

    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== 'running') {
      return null;
    }

    // Check if user already has an assignment
    const assignments = this.userAssignments.get(this.userId) || [];
    let assignment = assignments.find(a => a.experimentId === experimentId);

    if (!assignment) {
      // Assign user to a variant
      const variant = this.assignUserToVariant(experiment);
      if (!variant) return null;

      assignment = {
        experimentId,
        variantId: variant.id,
        variantType: variant.type,
        assignedAt: new Date(),
        exposureCount: 0,
        conversionEvents: [],
      };

      assignments.push(assignment);
      this.userAssignments.set(this.userId, assignments);
      await this.saveUserAssignments();

      // Track assignment in analytics
      analyticsService.trackEvent('experiment_assigned', 'user_action', {
        experimentId,
        experimentName: experiment.name,
        variantId: variant.id,
        variantType: variant.type,
      });
    }

    // Track exposure
    assignment.exposureCount++;
    await this.saveUserAssignments();

    analyticsService.trackEvent('experiment_exposed', 'user_action', {
      experimentId,
      variantId: assignment.variantId,
      exposureCount: assignment.exposureCount,
    });

    // Return the variant
    return experiment.variants.find(v => v.id === assignment.variantId) || null;
  }

  /**
   * Assign user to a variant based on allocation
   */
  private assignUserToVariant(experiment: Experiment): ExperimentVariant | null {
    if (!this.userId) return null;

    // Check targeting rules
    if (experiment.targetingRules && !this.matchesTargetingRules(experiment.targetingRules)) {
      return null;
    }

    // Use consistent hashing for stable assignments
    const hash = this.hashUserId(this.userId + experiment.id);
    const bucket = hash % 100; // 0-99

    let cumulativeAllocation = 0;
    for (const variant of experiment.variants) {
      cumulativeAllocation += variant.allocation;
      if (bucket < cumulativeAllocation) {
        return variant;
      }
    }

    // Fallback to control
    return experiment.variants[0];
  }

  /**
   * Check if user matches targeting rules
   */
  private matchesTargetingRules(rules: TargetingRule[]): boolean {
    // TODO: Implement targeting rule evaluation
    // For now, return true (no targeting)
    return true;
  }

  /**
   * Hash user ID for consistent bucketing
   */
  private hashUserId(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Track conversion event
   */
  async trackConversion(experimentId: string, eventName: string, value?: number): Promise<void> {
    if (!this.userId) return;

    const assignments = this.userAssignments.get(this.userId) || [];
    const assignment = assignments.find(a => a.experimentId === experimentId);

    if (!assignment) {
      console.warn(`[ABTesting] No assignment found for experiment: ${experimentId}`);
      return;
    }

    // Track conversion
    assignment.conversionEvents.push(eventName);
    await this.saveUserAssignments();

    analyticsService.trackEvent('experiment_conversion', 'user_action', {
      experimentId,
      variantId: assignment.variantId,
      eventName,
      value,
    });
  }

  /**
   * Get experiment results
   */
  async getExperimentResults(experimentId: string): Promise<ExperimentResults | null> {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) return null;

    // TODO: Fetch actual results from backend
    // For now, return mock results
    const mockResults: ExperimentResults = {
      experimentId,
      experimentName: experiment.name,
      totalUsers: 10000,
      variantResults: experiment.variants.map(variant => ({
        variantId: variant.id,
        variantName: variant.name,
        variantType: variant.type,
        users: 5000,
        exposures: 7500,
        conversions: 3750,
        conversionRate: 75,
        averageEngagement: 8.5,
      })),
      confidence: 95,
      recommendations: [
        'Variant A shows 15% improvement in conversion rate',
        'Recommend rolling out Variant A to 100% of users',
      ],
    };

    return mockResults;
  }

  /**
   * Check if user is in experiment
   */
  isInExperiment(experimentId: string): boolean {
    if (!this.userId) return false;

    const assignments = this.userAssignments.get(this.userId) || [];
    return assignments.some(a => a.experimentId === experimentId);
  }

  /**
   * Get user's variant type
   */
  getUserVariantType(experimentId: string): VariantType | null {
    if (!this.userId) return null;

    const assignments = this.userAssignments.get(this.userId) || [];
    const assignment = assignments.find(a => a.experimentId === experimentId);

    return assignment?.variantType || null;
  }

  /**
   * Save user assignments to storage
   */
  private async saveUserAssignments(): Promise<void> {
    if (!this.userId) return;

    try {
      const assignments = this.userAssignments.get(this.userId) || [];
      await AsyncStorage.setItem(
        `@assignments_${this.userId}`,
        JSON.stringify(assignments)
      );
    } catch (error) {
      console.error('[ABTesting] Failed to save user assignments:', error);
    }
  }

  /**
   * Create a new experiment
   */
  async createExperiment(experiment: Experiment): Promise<void> {
    this.experiments.set(experiment.id, experiment);
    await this.saveExperiments();
  }

  /**
   * Save experiments to storage
   */
  private async saveExperiments(): Promise<void> {
    try {
      const experiments = Array.from(this.experiments.values());
      await AsyncStorage.setItem('@experiments', JSON.stringify(experiments));
    } catch (error) {
      console.error('[ABTesting] Failed to save experiments:', error);
    }
  }

  /**
   * Get all running experiments
   */
  getRunningExperiments(): Experiment[] {
    return Array.from(this.experiments.values()).filter(e => e.status === 'running');
  }
}

/**
 * Global A/B testing service instance
 */
export const abTestingService = new ABTestingService();

/**
 * Hook to use experiment variant
 */
export function useExperiment(experimentId: string): {
  variant: ExperimentVariant | null;
  isLoading: boolean;
  trackConversion: (eventName: string, value?: number) => Promise<void>;
} {
  const [variant, setVariant] = React.useState<ExperimentVariant | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const loadVariant = async () => {
      const v = await abTestingService.getVariant(experimentId);
      setVariant(v);
      setIsLoading(false);
    };

    loadVariant();
  }, [experimentId]);

  const trackConversion = React.useCallback(
    async (eventName: string, value?: number) => {
      await abTestingService.trackConversion(experimentId, eventName, value);
    },
    [experimentId]
  );

  return { variant, isLoading, trackConversion };
}

/**
 * Hook to check if feature is enabled
 */
export function useFeatureFlag(flagName: string): boolean {
  // Simple feature flag implementation using experiments
  // In production, this would integrate with a feature flag service
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    const checkFlag = async () => {
      const variant = await abTestingService.getVariant(flagName);
      setEnabled(variant?.type !== 'control');
    };

    checkFlag();
  }, [flagName]);

  return enabled;
}
