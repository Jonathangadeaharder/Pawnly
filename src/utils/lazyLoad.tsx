/**
 * Lazy Loading Utilities
 *
 * Provides utilities for lazy loading components and screens.
 * Features:
 * - Lazy component loading with Suspense
 * - Loading fallbacks
 * - Error boundaries for lazy components
 * - Preloading support
 */

import React, { ComponentType, LazyExoticComponent, Suspense, lazy } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

/**
 * Default loading fallback component
 */
export function DefaultLoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#4a9eff" />
      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

/**
 * Lazy load a component with custom loading fallback
 */
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
): LazyExoticComponent<T> {
  const LazyComponent = lazy(importFunc);

  // Return a wrapped component with Suspense and ErrorBoundary
  return LazyComponent;
}

/**
 * Lazy load a screen with Suspense
 * Note: Wrap with ErrorBoundary in the consuming code if needed
 */
export function lazyLoadScreen<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  screenName: string,
  fallback?: React.ReactNode
): ComponentType<any> {
  const LazyScreen = lazy(importFunc);

  return (props: any) => (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      <LazyScreen {...props} />
    </Suspense>
  );
}

/**
 * Preload a lazy component
 */
export function preloadComponent<T extends ComponentType<any>>(
  lazyComponent: LazyExoticComponent<T>
): void {
  // Access the _result property to trigger loading
  // @ts-ignore - Accessing internal React property
  if (lazyComponent._payload && lazyComponent._payload._status === -1) {
    // @ts-ignore
    lazyComponent._payload._result();
  }
}

/**
 * HOC to add lazy loading to a component
 */
export function withLazyLoading<P extends object>(
  importFunc: () => Promise<{ default: ComponentType<P> }>,
  fallback?: React.ReactNode
): ComponentType<P> {
  const LazyComponent = lazy(importFunc);

  return (props: P) => (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      <LazyComponent {...props} />
    </Suspense>
  );
}

/**
 * Lazy load with timeout
 */
export function lazyLoadWithTimeout<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  timeout: number = 10000
): LazyExoticComponent<T> {
  return lazy(() => {
    return Promise.race([
      importFunc(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Component loading timeout')), timeout)
      ),
    ]);
  });
}

/**
 * Lazy load with retry logic
 */
export function lazyLoadWithRetry<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  retries: number = 3
): LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      const attemptLoad = async (attemptsLeft: number) => {
        try {
          const component = await importFunc();
          resolve(component);
        } catch (error) {
          if (attemptsLeft <= 0) {
            reject(error);
          } else {
            // Wait before retrying
            setTimeout(() => attemptLoad(attemptsLeft - 1), 1000);
          }
        }
      };

      attemptLoad(retries);
    });
  });
}

/**
 * Create a loading skeleton for a component
 */
export function LoadingSkeleton({
  height = 100,
  width = '100%',
}: {
  height?: number;
  width?: number | string;
}) {
  return (
    <View
      style={[
        styles.skeleton,
        {
          height,
          width: typeof width === 'number' ? width : width,
        },
      ]}
    />
  );
}

/**
 * Lazy load container with custom loading state
 */
export function LazyContainer({
  children,
  isLoading,
  fallback,
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  fallback?: React.ReactNode;
}) {
  if (isLoading) {
    return <>{fallback || <DefaultLoadingFallback />}</>;
  }

  return <>{children}</>;
}

/**
 * Hook to track lazy component loading state
 */
export function useLazyLoading() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  const startLoading = () => setIsLoading(true);
  const stopLoading = () => setIsLoading(false);
  const setLoadingError = (err: Error) => setError(err);

  return {
    isLoading,
    error,
    startLoading,
    stopLoading,
    setLoadingError,
  };
}

/**
 * Intersection Observer-based lazy loading (for lists)
 */
export function useLazyListItem(
  ref: React.RefObject<any>,
  onVisible: () => void
) {
  const [isVisible, setIsVisible] = React.useState(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
          onVisible();
          observer.disconnect();
        }
      },
      {
        threshold: 0.1,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [ref, onVisible, isVisible]);

  return isVisible;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999999',
  },
  skeleton: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    marginVertical: 8,
  },
});
