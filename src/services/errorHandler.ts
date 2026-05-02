/**
 * Global Error Handler
 *
 * Sets up global error handlers for the entire application.
 * Should be initialized early in the app lifecycle.
 */

import { errorTrackingService } from '../services/monitoring/errorTrackingService';

/**
 * Initialize global error handling
 */
export function initializeErrorHandling(): void {
  // Handle uncaught errors (JavaScript errors outside React)
  if (typeof ErrorUtils !== 'undefined') {
    const defaultHandler = ErrorUtils.getGlobalHandler();

    ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
      // Report to error tracking
      errorTrackingService.captureError(error, {
        severity: isFatal ? 'fatal' : 'error',
        category: 'unknown',
        handled: false,
        context: {
          userAction: 'Uncaught error',
          metadata: { isFatal },
        },
      });

      // Call the default handler
      if (defaultHandler) {
        defaultHandler(error, isFatal);
      }
    });
  }

  // Handle unhandled promise rejections
  const originalHandler = global.onunhandledrejection;

  global.onunhandledrejection = (event: any) => {
    const error = event.reason instanceof Error
      ? event.reason
      : new Error(String(event.reason));

    errorTrackingService.captureError(error, {
      severity: 'error',
      category: 'unknown',
      handled: false,
      context: {
        userAction: 'Unhandled promise rejection',
      },
    });

    // Call original handler if exists
    if (originalHandler) {
      originalHandler(event);
    }
  };

  // Initialize error tracking service
  errorTrackingService.initialize();

  console.log('[ErrorHandler] Global error handling initialized');
}

/**
 * Try-catch wrapper for async functions with automatic error reporting
 */
export function tryCatch<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      errorTrackingService.captureError(error as Error, {
        context: {
          userAction: context || fn.name || 'Unknown function',
        },
      });
      throw error;
    }
  }) as T;
}

/**
 * Safe async function executor with error handling
 */
export async function safeAsync<T>(
  fn: () => Promise<T>,
  fallbackValue: T,
  context?: string
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    errorTrackingService.captureError(error as Error, {
      severity: 'warning',
      context: {
        userAction: context || 'Safe async execution',
      },
    });
    return fallbackValue;
  }
}

/**
 * Network request wrapper with automatic error tracking
 */
export async function trackNetworkRequest<T>(
  url: string,
  options: RequestInit,
  context?: string
): Promise<T> {
  const method = options.method || 'GET';

  try {
    errorTrackingService.trackNetworkRequest(url, method);

    const response = await fetch(url, options);

    if (!response.ok) {
      errorTrackingService.trackNetworkRequest(
        url,
        method,
        response.status,
        `HTTP ${response.status}`
      );

      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    errorTrackingService.trackNetworkRequest(url, method, response.status);

    return await response.json();
  } catch (error) {
    errorTrackingService.captureError(error as Error, {
      category: 'network',
      context: {
        userAction: context || `Network request to ${url}`,
        metadata: { url, method },
      },
    });
    throw error;
  }
}

/**
 * Storage operation wrapper with error tracking
 */
export async function safeStorage<T>(
  operation: () => Promise<T>,
  operationName: string,
  fallbackValue: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    errorTrackingService.captureError(error as Error, {
      category: 'storage',
      severity: 'warning',
      context: {
        userAction: operationName,
      },
    });
    return fallbackValue;
  }
}

/**
 * Chess engine operation wrapper
 */
export async function safeChessOperation<T>(
  operation: () => Promise<T>,
  operationName: string,
  fallbackValue: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    errorTrackingService.captureError(error as Error, {
      category: 'chess-engine',
      context: {
        userAction: operationName,
      },
    });
    return fallbackValue;
  }
}

/**
 * Report a handled error (non-throwing)
 */
export function reportError(
  error: Error,
  context?: string,
  metadata?: Record<string, any>
): void {
  errorTrackingService.captureError(error, {
    handled: true,
    context: {
      userAction: context,
      metadata,
    },
  });
}

/**
 * Report a warning message
 */
export function reportWarning(message: string, metadata?: Record<string, any>): void {
  errorTrackingService.captureMessage(message, 'warning', 'unknown');
}

/**
 * Report an info message
 */
export function reportInfo(message: string): void {
  errorTrackingService.captureMessage(message, 'info', 'unknown');
}
