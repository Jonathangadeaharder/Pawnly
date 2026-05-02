/**
 * Performance Monitoring Service
 *
 * Tracks app performance metrics and identifies bottlenecks.
 * Features:
 * - FPS monitoring
 * - Memory usage tracking
 * - Screen render times
 * - Network request performance
 * - Database query performance
 * - App startup metrics
 * - Interaction responsiveness
 */

import React from 'react';
import { InteractionManager, PerformanceObserver } from 'react-native';
import { analyticsService } from './analyticsService';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'fps' | 'mb' | 'bytes' | 'count' | 'percentage';
  timestamp: Date;
  category: 'render' | 'network' | 'storage' | 'interaction' | 'memory' | 'startup';
  metadata?: Record<string, any>;
}

export interface NetworkPerformance {
  url: string;
  method: string;
  duration: number;
  size: number;
  status: number;
  timestamp: Date;
}

export interface RenderPerformance {
  screenName: string;
  renderTime: number;
  interactionTime: number;
  timestamp: Date;
}

export interface MemorySnapshot {
  used: number;
  total: number;
  percentage: number;
  timestamp: Date;
}

/**
 * Performance Monitoring Service
 */
export class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private maxMetrics: number = 1000;
  private isMonitoring: boolean = false;
  private startupTime?: Date;
  private appReadyTime?: number;

  // FPS tracking
  private frameTimestamps: number[] = [];
  private lastFrameTime: number = 0;

  // Network tracking
  private activeRequests: Map<string, number> = new Map();
  private networkMetrics: NetworkPerformance[] = [];

  // Render tracking
  private renderStartTimes: Map<string, number> = new Map();
  private renderMetrics: RenderPerformance[] = [];

  constructor() {
    this.startupTime = new Date();
  }

  /**
   * Initialize performance monitoring
   */
  async initialize(): Promise<void> {
    console.log('[Performance] Initialized');
    this.isMonitoring = true;

    // Start monitoring
    this.startFPSMonitoring();
    this.startMemoryMonitoring();

    // Track app ready time
    InteractionManager.runAfterInteractions(() => {
      this.appReadyTime = Date.now() - (this.startupTime?.getTime() || Date.now());
      this.recordMetric({
        name: 'app_startup_time',
        value: this.appReadyTime,
        unit: 'ms',
        category: 'startup',
      });

      analyticsService.trackPerformance(
        'app_startup_time',
        this.appReadyTime,
        'ms'
      );
    });

    // TODO: Set up performance observer for native events
    this.setupPerformanceObserver();
  }

  /**
   * Set up performance observer (if available)
   */
  private setupPerformanceObserver(): void {
    // React Native doesn't have full PerformanceObserver support yet
    // This is a placeholder for future implementation
    // Can integrate with react-native-performance or similar libraries
  }

  /**
   * Start FPS monitoring
   */
  private startFPSMonitoring(): void {
    const checkFPS = () => {
      if (!this.isMonitoring) return;

      const now = Date.now();

      // Record frame time
      this.frameTimestamps.push(now);

      // Keep only last second of frames
      const oneSecondAgo = now - 1000;
      this.frameTimestamps = this.frameTimestamps.filter(t => t > oneSecondAgo);

      // Calculate FPS every second
      if (now - this.lastFrameTime >= 1000) {
        const fps = this.frameTimestamps.length;

        // Only report if FPS is low (performance issue)
        if (fps < 55) {
          this.recordMetric({
            name: 'low_fps',
            value: fps,
            unit: 'fps',
            category: 'render',
          });
        }

        this.lastFrameTime = now;
      }

      requestAnimationFrame(checkFPS);
    };

    requestAnimationFrame(checkFPS);
  }

  /**
   * Start memory monitoring
   */
  private startMemoryMonitoring(): void {
    // Check memory every 30 seconds
    setInterval(() => {
      if (!this.isMonitoring) return;

      // Note: React Native doesn't expose detailed memory info
      // This would require native modules or libraries like react-native-device-info
      // For now, we'll use a placeholder

      // TODO: Implement actual memory tracking with native modules
    }, 30000);
  }

  /**
   * Record a performance metric
   */
  recordMetric(metric: Omit<PerformanceMetric, 'timestamp'>): void {
    const fullMetric: PerformanceMetric = {
      ...metric,
      timestamp: new Date(),
    };

    this.metrics.push(fullMetric);

    // Keep only recent metrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }

    // Log significant performance issues
    if (this.isSignificantIssue(fullMetric)) {
      console.warn('[Performance] Issue detected:', fullMetric);

      // Track in analytics
      analyticsService.trackPerformance(
        fullMetric.name,
        fullMetric.value,
        fullMetric.unit,
        { category: fullMetric.category, ...fullMetric.metadata }
      );
    }
  }

  /**
   * Start tracking a network request
   */
  startNetworkRequest(requestId: string, url: string, method: string): void {
    this.activeRequests.set(requestId, Date.now());
  }

  /**
   * End tracking a network request
   */
  endNetworkRequest(
    requestId: string,
    url: string,
    method: string,
    status: number,
    size: number
  ): void {
    const startTime = this.activeRequests.get(requestId);
    if (!startTime) return;

    const duration = Date.now() - startTime;
    this.activeRequests.delete(requestId);

    const metric: NetworkPerformance = {
      url,
      method,
      duration,
      size,
      status,
      timestamp: new Date(),
    };

    this.networkMetrics.push(metric);

    // Record metric
    this.recordMetric({
      name: 'network_request',
      value: duration,
      unit: 'ms',
      category: 'network',
      metadata: {
        url,
        method,
        status,
        size,
      },
    });

    // Warn on slow requests
    if (duration > 3000) {
      console.warn(`[Performance] Slow network request: ${method} ${url} took ${duration}ms`);
    }
  }

  /**
   * Start tracking screen render
   */
  startRenderTracking(screenName: string): void {
    this.renderStartTimes.set(screenName, Date.now());
  }

  /**
   * End tracking screen render
   */
  endRenderTracking(screenName: string): void {
    const startTime = this.renderStartTimes.get(screenName);
    if (!startTime) return;

    const renderTime = Date.now() - startTime;
    this.renderStartTimes.delete(screenName);

    // Wait for interactions to complete
    InteractionManager.runAfterInteractions(() => {
      const interactionTime = Date.now() - startTime;

      const metric: RenderPerformance = {
        screenName,
        renderTime,
        interactionTime,
        timestamp: new Date(),
      };

      this.renderMetrics.push(metric);

      // Record metrics
      this.recordMetric({
        name: 'screen_render_time',
        value: renderTime,
        unit: 'ms',
        category: 'render',
        metadata: { screenName },
      });

      this.recordMetric({
        name: 'screen_interaction_time',
        value: interactionTime,
        unit: 'ms',
        category: 'interaction',
        metadata: { screenName },
      });

      // Warn on slow renders
      if (renderTime > 1000) {
        console.warn(`[Performance] Slow render: ${screenName} took ${renderTime}ms`);
      }
    });
  }

  /**
   * Track database query performance
   */
  trackDatabaseQuery(queryName: string, duration: number): void {
    this.recordMetric({
      name: 'database_query',
      value: duration,
      unit: 'ms',
      category: 'storage',
      metadata: { queryName },
    });

    if (duration > 500) {
      console.warn(`[Performance] Slow database query: ${queryName} took ${duration}ms`);
    }
  }

  /**
   * Track custom performance mark
   */
  mark(name: string, value: number, unit: PerformanceMetric['unit']): void {
    this.recordMetric({
      name,
      value,
      unit,
      category: 'interaction',
    });
  }

  /**
   * Measure time between two operations
   */
  measure(name: string, startMark: string, endMark: string): number | null {
    // Simple implementation - for a full solution, use performance.mark/measure
    const start = this.metrics.find(m => m.name === startMark);
    const end = this.metrics.find(m => m.name === endMark);

    if (!start || !end) return null;

    const duration = end.timestamp.getTime() - start.timestamp.getTime();

    this.recordMetric({
      name,
      value: duration,
      unit: 'ms',
      category: 'interaction',
      metadata: { startMark, endMark },
    });

    return duration;
  }

  /**
   * Get performance statistics
   */
  getStatistics(): {
    averageRenderTime: number;
    averageNetworkTime: number;
    totalMetrics: number;
    issueCount: number;
  } {
    const renderMetrics = this.metrics.filter(m => m.category === 'render');
    const networkMetrics = this.metrics.filter(m => m.category === 'network');
    const issues = this.metrics.filter(m => this.isSignificantIssue(m));

    const averageRenderTime =
      renderMetrics.length > 0
        ? renderMetrics.reduce((sum, m) => sum + m.value, 0) / renderMetrics.length
        : 0;

    const averageNetworkTime =
      networkMetrics.length > 0
        ? networkMetrics.reduce((sum, m) => sum + m.value, 0) / networkMetrics.length
        : 0;

    return {
      averageRenderTime: Math.round(averageRenderTime),
      averageNetworkTime: Math.round(averageNetworkTime),
      totalMetrics: this.metrics.length,
      issueCount: issues.length,
    };
  }

  /**
   * Get metrics by category
   */
  getMetricsByCategory(category: PerformanceMetric['category']): PerformanceMetric[] {
    return this.metrics.filter(m => m.category === category);
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count: number = 100): PerformanceMetric[] {
    return this.metrics.slice(-count);
  }

  /**
   * Check if a metric indicates a significant issue
   */
  private isSignificantIssue(metric: PerformanceMetric): boolean {
    switch (metric.category) {
      case 'render':
        return metric.value > 1000; // >1s render time
      case 'network':
        return metric.value > 5000; // >5s network time
      case 'storage':
        return metric.value > 500; // >500ms database query
      case 'interaction':
        return metric.value > 100; // >100ms interaction delay
      case 'memory':
        return metric.unit === 'percentage' && metric.value > 85; // >85% memory usage
      default:
        return false;
    }
  }

  /**
   * Generate performance report
   */
  generateReport(): {
    summary: string;
    metrics: PerformanceMetric[];
    recommendations: string[];
  } {
    const stats = this.getStatistics();
    const issues = this.metrics.filter(m => this.isSignificantIssue(m));

    const recommendations: string[] = [];

    if (stats.averageRenderTime > 500) {
      recommendations.push('Consider optimizing component renders with React.memo and useMemo');
    }

    if (stats.averageNetworkTime > 2000) {
      recommendations.push('Network requests are slow - consider caching or optimizing API calls');
    }

    const slowScreens = this.renderMetrics
      .filter(r => r.renderTime > 1000)
      .map(r => r.screenName);

    if (slowScreens.length > 0) {
      recommendations.push(`Slow screens detected: ${slowScreens.join(', ')}`);
    }

    return {
      summary: `Collected ${stats.totalMetrics} metrics. Found ${stats.issueCount} performance issues.`,
      metrics: this.metrics,
      recommendations,
    };
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.networkMetrics = [];
    this.renderMetrics = [];
    this.activeRequests.clear();
    this.renderStartTimes.clear();
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    this.isMonitoring = false;
  }
}

/**
 * Global performance service instance
 */
export const performanceService = new PerformanceService();

/**
 * HOC to track component render performance
 */
export function withPerformanceTracking<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.FC<P> {
  return (props: P) => {
    React.useEffect(() => {
      const startTime = Date.now();

      return () => {
        const renderTime = Date.now() - startTime;
        performanceService.mark(`${componentName}_render`, renderTime, 'ms');
      };
    }, []);

    return <Component {...props} />;
  };
}

/**
 * Hook to track screen render performance
 */
export function useScreenPerformance(screenName: string): void {
  React.useEffect(() => {
    performanceService.startRenderTracking(screenName);

    return () => {
      performanceService.endRenderTracking(screenName);
    };
  }, [screenName]);
}

/**
 * Hook to track operation performance
 */
export function usePerformanceMark(
  name: string,
  operation: () => Promise<any> | any
): () => Promise<void> {
  return React.useCallback(async () => {
    const startTime = Date.now();

    try {
      await operation();
    } finally {
      const duration = Date.now() - startTime;
      performanceService.mark(name, duration, 'ms');
    }
  }, [name, operation]);
}
