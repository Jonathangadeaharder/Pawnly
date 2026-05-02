/**
 * Analytics Dashboard Screen
 *
 * Displays comprehensive analytics about app usage, performance, and user behavior.
 * Features:
 * - User activity metrics
 * - Game performance stats
 * - Learning progress analytics
 * - Error and performance monitoring
 * - A/B test results
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { analyticsService } from '../../services/monitoring/analyticsService';
import { performanceService } from '../../services/monitoring/performanceService';
import { errorTrackingService } from '../../services/monitoring/errorTrackingService';
import { abTestingService } from '../../services/experimentation/abTestingService';

const { width } = Dimensions.get('window');

type TabType = 'overview' | 'performance' | 'errors' | 'experiments';

interface MetricCard {
  title: string;
  value: string | number;
  change?: number;
  unit?: string;
  icon?: string;
}

export default function AnalyticsDashboard() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [sessionMetrics, setSessionMetrics] = useState<any>(null);
  const [performanceStats, setPerformanceStats] = useState<any>(null);
  const [errorStats, setErrorStats] = useState<any>(null);
  const [experiments, setExperiments] = useState<any[]>([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      // Load session metrics
      const session = analyticsService.getSessionMetrics();
      setSessionMetrics(session);

      // Load performance stats
      const perf = performanceService.getStatistics();
      setPerformanceStats(perf);

      // Load error stats
      const errors = errorTrackingService.getErrorStats();
      setErrorStats(errors);

      // Load running experiments
      const runningExps = abTestingService.getRunningExperiments();
      setExperiments(runningExps);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadAnalytics();
    setRefreshing(false);
  };

  const renderOverview = () => {
    const metrics: MetricCard[] = [
      {
        title: 'Session Duration',
        value: sessionMetrics
          ? Math.floor(sessionMetrics.duration / 60000)
          : 0,
        unit: 'min',
        icon: '⏱️',
      },
      {
        title: 'Screen Views',
        value: sessionMetrics?.screenViews || 0,
        icon: '📱',
      },
      {
        title: 'Performance Score',
        value: performanceStats
          ? Math.round(100 - (performanceStats.issueCount / performanceStats.totalMetrics) * 100)
          : 100,
        unit: '%',
        icon: '⚡',
        change: 5,
      },
      {
        title: 'Error Count',
        value: errorStats?.totalErrors || 0,
        icon: '⚠️',
        change: -2,
      },
    ];

    return (
      <View style={styles.tabContent}>
        <View style={styles.metricsGrid}>
          {metrics.map((metric, index) => (
            <View key={index} style={styles.metricCard}>
              <Text style={styles.metricIcon}>{metric.icon}</Text>
              <Text style={styles.metricValue}>
                {metric.value}
                {metric.unit && <Text style={styles.metricUnit}>{metric.unit}</Text>}
              </Text>
              <Text style={styles.metricTitle}>{metric.title}</Text>
              {metric.change !== undefined && (
                <Text
                  style={[
                    styles.metricChange,
                    metric.change > 0 ? styles.metricChangePositive : styles.metricChangeNegative,
                  ]}
                >
                  {metric.change > 0 ? '+' : ''}
                  {metric.change}%
                </Text>
              )}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Information</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Session ID" value={sessionMetrics?.sessionId || 'N/A'} />
            <InfoRow
              label="Duration"
              value={`${Math.floor((sessionMetrics?.duration || 0) / 60000)} minutes`}
            />
            <InfoRow label="Screen Views" value={sessionMetrics?.screenViews || 0} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Stats</Text>
          <View style={styles.statsContainer}>
            <StatBar
              label="Avg Render Time"
              value={performanceStats?.averageRenderTime || 0}
              maxValue={1000}
              unit="ms"
              color="#4a9eff"
            />
            <StatBar
              label="Avg Network Time"
              value={performanceStats?.averageNetworkTime || 0}
              maxValue={5000}
              unit="ms"
              color="#9b59b6"
            />
          </View>
        </View>
      </View>
    );
  };

  const renderPerformance = () => {
    if (!performanceStats) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading performance data...</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Metrics</Text>
          <View style={styles.infoCard}>
            <InfoRow
              label="Average Render Time"
              value={`${performanceStats.averageRenderTime}ms`}
            />
            <InfoRow
              label="Average Network Time"
              value={`${performanceStats.averageNetworkTime}ms`}
            />
            <InfoRow label="Total Metrics Collected" value={performanceStats.totalMetrics} />
            <InfoRow label="Issues Detected" value={performanceStats.issueCount} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Performance Health</Text>
          <View style={styles.healthIndicator}>
            <View
              style={[
                styles.healthBadge,
                performanceStats.issueCount === 0
                  ? styles.healthGood
                  : performanceStats.issueCount < 10
                  ? styles.healthWarning
                  : styles.healthBad,
              ]}
            >
              <Text style={styles.healthBadgeText}>
                {performanceStats.issueCount === 0
                  ? '✓ Excellent'
                  : performanceStats.issueCount < 10
                  ? '⚠ Fair'
                  : '✗ Needs Attention'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <View style={styles.recommendationCard}>
            <Text style={styles.recommendationText}>
              • Monitor render times for screens taking &gt;1s
            </Text>
            <Text style={styles.recommendationText}>
              • Implement caching for slow network requests
            </Text>
            <Text style={styles.recommendationText}>
              • Optimize component re-renders with React.memo
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderErrors = () => {
    if (!errorStats) {
      return (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateText}>Loading error data...</Text>
        </View>
      );
    }

    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Error Statistics</Text>
          <View style={styles.infoCard}>
            <InfoRow label="Total Errors Tracked" value={errorStats.totalErrors} />
            <InfoRow label="Error Categories" value={Object.keys(errorStats.errorsByCategory).length} />
            <InfoRow label="Severity Levels" value={Object.keys(errorStats.errorsBySeverity).length} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Error Health</Text>
          <View style={styles.healthIndicator}>
            <View
              style={[
                styles.healthBadge,
                errorStats.totalErrors === 0
                  ? styles.healthGood
                  : errorStats.totalErrors < 5
                  ? styles.healthWarning
                  : styles.healthBad,
              ]}
            >
              <Text style={styles.healthBadgeText}>
                {errorStats.totalErrors === 0
                  ? '✓ No Errors'
                  : errorStats.totalErrors < 5
                  ? '⚠ Minor Issues'
                  : '✗ Action Required'}
              </Text>
            </View>
          </View>
        </View>

        {errorStats.totalErrors === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>✓</Text>
            <Text style={styles.emptyStateText}>No errors detected in this session</Text>
          </View>
        )}
      </View>
    );
  };

  const renderExperiments = () => {
    return (
      <View style={styles.tabContent}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Running Experiments</Text>
          {experiments.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No active experiments</Text>
            </View>
          ) : (
            experiments.map((exp, index) => (
              <View key={exp.id} style={styles.experimentCard}>
                <Text style={styles.experimentName}>{exp.name}</Text>
                <Text style={styles.experimentDescription}>{exp.description}</Text>
                <View style={styles.experimentVariants}>
                  {exp.variants.map((variant: any) => (
                    <View key={variant.id} style={styles.variantChip}>
                      <Text style={styles.variantName}>{variant.name}</Text>
                      <Text style={styles.variantAllocation}>{variant.allocation}%</Text>
                    </View>
                  ))}
                </View>
                <Text style={styles.experimentMetrics}>
                  {exp.metrics.length} metrics tracked
                </Text>
              </View>
            ))
          )}
        </View>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'performance':
        return renderPerformance();
      case 'errors':
        return renderErrors();
      case 'experiments':
        return renderExperiments();
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
      </View>

      <View style={styles.tabs}>
        <TabButton
          title="Overview"
          active={activeTab === 'overview'}
          onPress={() => setActiveTab('overview')}
        />
        <TabButton
          title="Performance"
          active={activeTab === 'performance'}
          onPress={() => setActiveTab('performance')}
        />
        <TabButton
          title="Errors"
          active={activeTab === 'errors'}
          onPress={() => setActiveTab('errors')}
        />
        <TabButton
          title="Experiments"
          active={activeTab === 'experiments'}
          onPress={() => setActiveTab('experiments')}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {renderTabContent()}
      </ScrollView>
    </View>
  );
}

function TabButton({
  title,
  active,
  onPress,
}: {
  title: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.tab, active && styles.tabActive]}
      onPress={onPress}
    >
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{title}</Text>
    </TouchableOpacity>
  );
}

function InfoRow({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function StatBar({
  label,
  value,
  maxValue,
  unit,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  unit: string;
  color: string;
}) {
  const percentage = Math.min((value / maxValue) * 100, 100);

  return (
    <View style={styles.statBar}>
      <View style={styles.statBarHeader}>
        <Text style={styles.statBarLabel}>{label}</Text>
        <Text style={styles.statBarValue}>
          {value}
          {unit}
        </Text>
      </View>
      <View style={styles.statBarTrack}>
        <View style={[styles.statBarFill, { width: `${percentage}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#2a2a2a',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 10,
    paddingBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#4a9eff',
  },
  tabText: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#4a9eff',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 12,
  },
  metricCard: {
    width: (width - 44) / 2,
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  metricUnit: {
    fontSize: 14,
    color: '#999999',
  },
  metricTitle: {
    fontSize: 12,
    color: '#999999',
    textAlign: 'center',
    marginTop: 4,
  },
  metricChange: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  metricChangePositive: {
    color: '#4caf50',
  },
  metricChangeNegative: {
    color: '#f44336',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  infoLabel: {
    fontSize: 14,
    color: '#999999',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  statsContainer: {
    gap: 16,
  },
  statBar: {
    gap: 8,
  },
  statBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statBarLabel: {
    fontSize: 14,
    color: '#ffffff',
  },
  statBarValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a9eff',
  },
  statBarTrack: {
    height: 8,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
    overflow: 'hidden',
  },
  statBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  healthIndicator: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  healthBadge: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  healthGood: {
    backgroundColor: '#4caf5020',
  },
  healthWarning: {
    backgroundColor: '#ff990020',
  },
  healthBad: {
    backgroundColor: '#f4433620',
  },
  healthBadgeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  recommendationCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  recommendationText: {
    fontSize: 14,
    color: '#b3b3b3',
    lineHeight: 20,
  },
  experimentCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  experimentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  experimentDescription: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 12,
  },
  experimentVariants: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  variantChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3a3a3a',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  variantName: {
    fontSize: 12,
    color: '#ffffff',
  },
  variantAllocation: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4a9eff',
  },
  experimentMetrics: {
    fontSize: 12,
    color: '#999999',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999999',
  },
});
