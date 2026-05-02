/**
 * Main Application Entry Point
 * Chess Learning App - Master Universal Opening Systems
 */

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native';

// Import navigation
import MainTabNavigator from './src/navigation/MainTabNavigator';

// Import stores
import { useUserStore } from './src/state/userStore';
import { useUIStore } from './src/state/uiStore';

// Import services
import { initializeErrorHandling } from './src/services/errorHandler';
import { performanceService } from './src/services/monitoring/performanceService';
import { analyticsService } from './src/services/monitoring/analyticsService';
import { errorTrackingService } from './src/services/monitoring/errorTrackingService';
import { abTestingService } from './src/services/experimentation/abTestingService';
import { initializeImageOptimization } from './src/utils/imageOptimization';
import { preloadCriticalScreens } from './src/navigation/LazyRoutes';
import { initializeBackend } from './src/services/backend/backendService';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import { hookConsole } from './src/config/highlight';

function AppContent() {
  const { loadUserProfile, profile } = useUserStore();
  const { loadSettings } = useUIStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize app on mount
    const initializeApp = async () => {
      try {
        // 1. Initialize error handling first (so we can track initialization errors)
        initializeErrorHandling();
        console.log('[App] Error handling initialized');

        // 1b. Initialize Highlight.io telemetry
        hookConsole();
        console.log('[App] Highlight.io telemetry initialized');

        // 2. Initialize backend
        await initializeBackend({ provider: 'none' });
        console.log('[App] Backend initialized');

        // 3. Initialize monitoring services
        await Promise.all([
          performanceService.initialize(),
          errorTrackingService.initialize(),
        ]);
        console.log('[App] Monitoring services initialized');

        // 4. Load user profile and settings
        await Promise.all([
          loadUserProfile(),
          loadSettings(),
        ]);
        console.log('[App] User data loaded');

        // 5. Initialize analytics with user ID
        const userId = profile?.id || 'anonymous';
        await analyticsService.initialize(userId);
        console.log('[App] Analytics initialized');

        // 6. Initialize A/B testing
        await abTestingService.initialize(userId);
        console.log('[App] A/B testing initialized');

        // 7. Initialize image optimization
        await initializeImageOptimization();
        console.log('[App] Image optimization initialized');

        // 8. Preload critical screens in background
        setTimeout(() => {
          preloadCriticalScreens();
          console.log('[App] Critical screens preloading started');
        }, 1000);

        // 9. Track app launch
        await analyticsService.trackAppLaunch(false); // TODO: Detect first launch
        console.log('[App] App launch tracked');

        // Mark initialization complete
        setIsInitializing(false);
      } catch (error) {
        console.error('[App] Error initializing app:', error);
        errorTrackingService.captureError(error as Error, {
          severity: 'fatal',
          category: 'unknown',
          handled: false,
          context: {
            userAction: 'App initialization',
          },
        });
        // Still allow app to continue even if initialization fails
        setIsInitializing(false);
      }
    };

    initializeApp();

    // Cleanup on unmount
    return () => {
      analyticsService.endSession();
      performanceService.stop();
    };
  }, []);

  // Show loading screen during initialization
  if (isInitializing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4a9eff" />
        <Text style={styles.loadingText}>Initializing Chess Academy...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <MainTabNavigator />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#999999',
  },
});
