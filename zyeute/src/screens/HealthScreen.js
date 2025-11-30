import React, { useCallback, useEffect, useState } from 'react';
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { healthMonitor } from '../../lib/health/health-monitor';
import { beeRegistry } from '../../lib/services/bee-registry';
import { colors } from '../theme/colors';

const statusColor = (status) => {
  switch (status) {
    case 'healthy':
      return colors.success;
    case 'degraded':
      return colors.gold;
    case 'down':
      return colors.danger;
    default:
      return colors.muted;
  }
};

const formatTime = (timestamp) => {
  if (!timestamp) return 'n/a';
  try {
    return new Date(timestamp).toLocaleTimeString();
  } catch (error) {
    return timestamp;
  }
};

const toLabel = (name) => {
  if (!name) return 'Unknown';
  return name.slice(0, 1).toUpperCase() + name.slice(1);
};

export default function HealthScreen() {
  const [status, setStatus] = useState(() => healthMonitor.getStatus());
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const unsubscribe = healthMonitor.onChange(setStatus);
    healthMonitor.runChecks();
    return () => unsubscribe();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    healthMonitor.runChecks().finally(() => setRefreshing(false));
  }, []);

  const heartbeat = beeRegistry.getHeartbeatStatus
    ? beeRegistry.getHeartbeatStatus()
    : { tracker: status.heartbeat, lastHeartbeat: null };

  const services = status?.services || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.gold}
        />
      }
    >
      <Text style={styles.title}>Health status</Text>

      <View style={styles.overallCard}>
        <View style={styles.row}>
          <View style={[styles.dot, { backgroundColor: statusColor(status.overallStatus) }]} />
          <Text style={styles.overallText}>
            {(status.overallStatus || 'unknown').toUpperCase()}
          </Text>
        </View>
        <Text style={styles.meta}>Services monitored: {services.length}</Text>
      </View>

      <Text style={styles.sectionTitle}>Services</Text>
      {services.length === 0 && (
        <Text style={styles.meta}>No checks yet. Pull to refresh.</Text>
      )}
      {services.map(service => (
        <View key={service.name} style={styles.card}>
          <View style={styles.row}>
            <View style={[styles.dot, { backgroundColor: statusColor(service.status) }]} />
            <Text style={styles.cardTitle}>{toLabel(service.name)}</Text>
            <Text style={styles.statusText}>{(service.status || 'unknown').toUpperCase()}</Text>
          </View>
          <Text style={styles.meta}>
            Latency: {service.latency ? `${service.latency} ms` : 'n/a'}
          </Text>
          <Text style={styles.meta}>Last check: {formatTime(service.lastChecked)}</Text>
          {service.message ? <Text style={styles.meta}>Note: {service.message}</Text> : null}
          {service.error ? <Text style={styles.errorText}>Error: {service.error}</Text> : null}
        </View>
      ))}

      <Text style={styles.sectionTitle}>Bee heartbeat</Text>
      <View style={styles.card}>
        <Text style={styles.meta}>
          Last success: {formatTime(heartbeat.tracker?.lastSuccessAt)}
        </Text>
        <Text style={styles.meta}>
          Last failure: {formatTime(heartbeat.tracker?.lastFailureAt)}
        </Text>
        <Text style={styles.meta}>
          Consecutive failures: {heartbeat.tracker?.consecutiveFailures || 0}
        </Text>
        {heartbeat.lastHeartbeat?.latency ? (
          <Text style={styles.meta}>
            Last heartbeat latency: {heartbeat.lastHeartbeat.latency} ms
          </Text>
        ) : null}
        {heartbeat.lastHeartbeat?.error ? (
          <Text style={styles.errorText}>Last error: {heartbeat.lastHeartbeat.error}</Text>
        ) : null}
      </View>

      <TouchableOpacity style={styles.button} onPress={onRefresh}>
        <Text style={styles.buttonText}>Run health checks</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  overallCard: {
    backgroundColor: colors.leather,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  card: {
    backgroundColor: colors.leather,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  overallText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  statusText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  errorText: {
    color: colors.danger,
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.gold,
    backgroundColor: colors.bg,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.gold,
    fontWeight: '700',
  },
});
