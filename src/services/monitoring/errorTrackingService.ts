/**
 * Error Tracking Service
 *
 * Comprehensive error tracking and crash reporting system.
 * Features:
 * - Error categorization and severity levels
 * - Stack trace parsing
 * - Context capture (screen, user action, app state)
 * - Error deduplication
 * - Crash reporting
 * - Integration with analytics
 */

import { Platform } from 'react-native';
import { analyticsService } from './analyticsService';

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info';

export type ErrorCategory =
  | 'network'
  | 'storage'
  | 'rendering'
  | 'business-logic'
  | 'chess-engine'
  | 'navigation'
  | 'user-input'
  | 'external-api'
  | 'unknown';

export interface ErrorReport {
  id: string;
  timestamp: Date;
  severity: ErrorSeverity;
  category: ErrorCategory;
  message: string;
  stack?: string;
  context?: ErrorContext;
  handled: boolean;
  userId?: string;
  sessionId?: string;
  appVersion?: string;
  platform: string;
  osVersion?: string;
  deviceModel?: string;
}

export interface ErrorContext {
  screen?: string;
  userAction?: string;
  componentStack?: string;
  appState?: any;
  breadcrumbs?: Breadcrumb[];
  metadata?: Record<string, any>;
}

export interface Breadcrumb {
  timestamp: Date;
  category: 'navigation' | 'user-action' | 'network' | 'state-change' | 'log';
  message: string;
  data?: Record<string, any>;
}

/**
 * Error Tracking Service
 */
export class ErrorTrackingService {
  private breadcrumbs: Breadcrumb[] = [];
  private maxBreadcrumbs: number = 50;
  private reportedErrors: Set<string> = new Set();
  private currentScreen?: string;
  private sessionId: string;
  private isInitialized: boolean = false;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  /**
   * Initialize error tracking
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Set up global error handlers
    this.setupGlobalErrorHandlers();

    console.log('[ErrorTracking] Initialized');
    this.isInitialized = true;

    // TODO: Initialize error reporting SDK (Sentry, Bugsnag, etc.)
  }

  /**
   * Set up global error handlers
   */
  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    const originalPromiseRejection = global.Promise.prototype.catch;

    // @ts-ignore
    global.Promise.prototype.catch = function(onRejected) {
      return originalPromiseRejection.call(this, (error: any) => {
        errorTrackingService.captureError(error, {
          severity: 'error',
          category: 'unknown',
          handled: false,
          context: {
            userAction: 'Promise rejection',
          },
        });

        if (onRejected) {
          return onRejected(error);
        }
        throw error;
      });
    };

    // Note: React Native's ErrorUtils.setGlobalHandler is the proper way
    // to handle uncaught errors, but we'll let ErrorBoundary handle React errors
  }

  /**
   * Capture an error
   */
  captureError(
    error: Error,
    options?: {
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      handled?: boolean;
      context?: Partial<ErrorContext>;
    }
  ): string {
    const errorId = this.generateErrorId(error);

    // Check if we've already reported this error (deduplication)
    if (this.reportedErrors.has(errorId)) {
      return errorId;
    }

    const severity = options?.severity || this.inferSeverity(error);
    const category = options?.category || this.categorizeError(error);
    const handled = options?.handled ?? true;

    const report: ErrorReport = {
      id: errorId,
      timestamp: new Date(),
      severity,
      category,
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: {
        screen: this.currentScreen,
        breadcrumbs: [...this.breadcrumbs],
        ...options?.context,
      },
      handled,
      sessionId: this.sessionId,
      platform: Platform.OS,
      osVersion: Platform.Version.toString(),
    };

    // Log to console based on severity
    this.logError(report);

    // Track in analytics
    analyticsService.trackError(error, this.currentScreen);

    // Send to backend
    this.sendErrorReport(report);

    // Add to reported set
    this.reportedErrors.add(errorId);

    return errorId;
  }

  /**
   * Capture a message (non-error event)
   */
  captureMessage(
    message: string,
    severity: ErrorSeverity = 'info',
    category: ErrorCategory = 'unknown'
  ): void {
    const report: ErrorReport = {
      id: this.generateMessageId(message),
      timestamp: new Date(),
      severity,
      category,
      message,
      handled: true,
      sessionId: this.sessionId,
      platform: Platform.OS,
      context: {
        screen: this.currentScreen,
        breadcrumbs: [...this.breadcrumbs],
      },
    };

    this.logError(report);
    this.sendErrorReport(report);
  }

  /**
   * Add a breadcrumb (event trail)
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
    this.breadcrumbs.push({
      ...breadcrumb,
      timestamp: new Date(),
    });

    // Keep only the most recent breadcrumbs
    if (this.breadcrumbs.length > this.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
  }

  /**
   * Track screen navigation
   */
  setCurrentScreen(screenName: string): void {
    this.currentScreen = screenName;
    this.addBreadcrumb({
      category: 'navigation',
      message: `Navigated to ${screenName}`,
    });
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, data?: Record<string, any>): void {
    this.addBreadcrumb({
      category: 'user-action',
      message: action,
      data,
    });
  }

  /**
   * Track network request
   */
  trackNetworkRequest(
    url: string,
    method: string,
    status?: number,
    error?: string
  ): void {
    this.addBreadcrumb({
      category: 'network',
      message: `${method} ${url}`,
      data: { status, error },
    });
  }

  /**
   * Track state change
   */
  trackStateChange(change: string, data?: Record<string, any>): void {
    this.addBreadcrumb({
      category: 'state-change',
      message: change,
      data,
    });
  }

  /**
   * Get recent breadcrumbs
   */
  getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }

  /**
   * Clear breadcrumbs
   */
  clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  /**
   * Categorize error based on error message and type
   */
  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    const stack = error.stack?.toLowerCase() || '';

    if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
      return 'network';
    }

    if (message.includes('storage') || message.includes('sqlite') || message.includes('asyncstorage')) {
      return 'storage';
    }

    if (
      message.includes('render') ||
      stack.includes('react') ||
      message.includes('component')
    ) {
      return 'rendering';
    }

    if (message.includes('stockfish') || message.includes('chess') || message.includes('move')) {
      return 'chess-engine';
    }

    if (message.includes('navigation') || message.includes('route')) {
      return 'navigation';
    }

    if (message.includes('api') || message.includes('endpoint')) {
      return 'external-api';
    }

    if (message.includes('validation') || message.includes('invalid input')) {
      return 'user-input';
    }

    return 'unknown';
  }

  /**
   * Infer error severity
   */
  private inferSeverity(error: Error): ErrorSeverity {
    const message = error.message.toLowerCase();

    // Fatal errors that crash the app
    if (
      message.includes('fatal') ||
      message.includes('crash') ||
      message.includes('unhandled')
    ) {
      return 'fatal';
    }

    // Network errors are usually not critical
    if (message.includes('network') || message.includes('timeout')) {
      return 'warning';
    }

    // Default to error
    return 'error';
  }

  /**
   * Log error to console
   */
  private logError(report: ErrorReport): void {
    const prefix = `[ErrorTracking] [${report.severity.toUpperCase()}] [${report.category}]`;

    switch (report.severity) {
      case 'fatal':
      case 'error':
        console.error(prefix, report.message, report.stack);
        break;
      case 'warning':
        console.warn(prefix, report.message);
        break;
      case 'info':
        console.log(prefix, report.message);
        break;
    }
  }

  /**
   * Send error report to backend
   */
  private async sendErrorReport(report: ErrorReport): Promise<void> {
    try {
      // TODO: Send to error tracking backend (Sentry, Bugsnag, custom endpoint)
      // For now, just log it
      console.log('[ErrorTracking] Would send report:', {
        id: report.id,
        severity: report.severity,
        category: report.category,
        message: report.message,
      });
    } catch (error) {
      // Don't throw errors while reporting errors
      console.error('[ErrorTracking] Failed to send error report:', error);
    }
  }

  /**
   * Generate unique error ID based on error characteristics
   */
  private generateErrorId(error: Error): string {
    const message = error.message || 'unknown';
    const stack = error.stack || '';

    // Extract first line of stack trace (most specific)
    const stackLine = stack.split('\n')[1] || '';

    // Create hash-like ID
    const combined = `${error.name}-${message}-${stackLine}`;
    return this.simpleHash(combined);
  }

  /**
   * Generate message ID
   */
  private generateMessageId(message: string): string {
    return `msg-${this.simpleHash(message)}-${Date.now()}`;
  }

  /**
   * Simple hash function for deduplication
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `error-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get error statistics
   */
  getErrorStats(): {
    totalErrors: number;
    errorsByCategory: Record<ErrorCategory, number>;
    errorsBySeverity: Record<ErrorSeverity, number>;
  } {
    // TODO: Implement actual statistics tracking
    return {
      totalErrors: this.reportedErrors.size,
      errorsByCategory: {} as any,
      errorsBySeverity: {} as any,
    };
  }

  /**
   * Clear error tracking data
   */
  clear(): void {
    this.reportedErrors.clear();
    this.breadcrumbs = [];
  }
}

/**
 * Global error tracking service instance
 */
export const errorTrackingService = new ErrorTrackingService();

/**
 * Convenience function to capture errors
 */
export function captureError(
  error: Error,
  context?: string,
  metadata?: Record<string, any>
): void {
  errorTrackingService.captureError(error, {
    context: {
      userAction: context,
      metadata,
    },
  });
}

/**
 * Convenience function to capture messages
 */
export function captureMessage(
  message: string,
  severity: ErrorSeverity = 'info'
): void {
  errorTrackingService.captureMessage(message, severity);
}
