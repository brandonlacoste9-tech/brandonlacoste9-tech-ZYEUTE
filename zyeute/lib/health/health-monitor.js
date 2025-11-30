/**
 * Health monitor aggregates service health checks and exposes status for UI/alerting
 */

import {
  serviceChecks,
} from './service-checkers';
import { alerting } from './alerting';
import { heartbeatTracker } from './heartbeat-tracker';

class HealthMonitor {
  constructor() {
    this.state = {};
    this.interval = null;
    this.listeners = new Set();
  }

  start(intervalMs = 60000) {
    if (this.interval) {
      clearInterval(this.interval);
    }

    // Run immediately and then on interval
    this.runChecks();
    this.interval = setInterval(() => {
      this.runChecks();
    }, intervalMs);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  async runChecks() {
    try {
      const results = await Promise.all(
        serviceChecks.map(check => check())
      );

      results.forEach(result => this.updateService(result));
      this.notify();
      return this.getStatus();
    } catch (error) {
      console.warn('Health monitor run failed:', error.message);
      return this.getStatus();
    }
  }

  updateService(result) {
    const existing = this.state[result.service] || {
      successes: 0,
      failures: 0,
      history: [],
      status: 'unknown',
    };

    const status = result.status;
    const successes = existing.successes + (status === 'healthy' ? 1 : 0);
    const failures = existing.failures + (status === 'down' ? 1 : 0);
    const checks =
      successes +
      failures +
      (status === 'degraded' ? 1 : 0);

    const history = [
      {
        status,
        latency: result.latency,
        timestamp: result.timestamp || new Date().toISOString(),
        message: result.message,
        error: result.error,
      },
      ...(existing.history || []),
    ].slice(0, 20);

    this.state[result.service] = {
      ...result,
      successes,
      failures,
      history,
      lastChecked: result.timestamp || new Date().toISOString(),
      uptime: checks > 0 ? successes / checks : 1,
      errorRate: checks > 0 ? failures / checks : 0,
    };

    const previousStatus = existing.status;
    if ((status === 'down' || status === 'degraded') && previousStatus !== status) {
      alerting.sendAlert({
        type: 'service.health',
        severity: status === 'down' ? 'critical' : 'warning',
        message: `${result.service} is ${status}`,
        service: result.service,
        context: {
          latency: result.latency,
          error: result.error || result.message,
        },
      }).catch(() => {});
    }

    if (status === 'healthy' && previousStatus && previousStatus !== 'healthy') {
      alerting.sendAlert({
        type: 'service.recovered',
        severity: 'info',
        message: `${result.service} recovered`,
        service: result.service,
        context: {
          latency: result.latency,
        },
      }).catch(() => {});
    }
  }

  computeOverallStatus(services) {
    if (services.some(s => s.status === 'down')) return 'down';
    if (services.some(s => s.status === 'degraded')) return 'degraded';
    if (services.length === 0) return 'unknown';
    return 'healthy';
  }

  getStatus() {
    const services = Object.keys(this.state).map(key => {
      const s = this.state[key];
      const checks = (s.successes || 0) + (s.failures || 0);
      const uptime = checks > 0 ? s.successes / checks : 1;
      return {
        name: key,
        status: s.status,
        latency: s.latency,
        lastChecked: s.lastChecked,
        message: s.message,
        error: s.error,
        uptime,
        errorRate: s.errorRate,
        history: s.history || [],
      };
    });

    return {
      overallStatus: this.computeOverallStatus(services),
      services,
      heartbeat: heartbeatTracker.getStats(),
    };
  }

  onChange(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify() {
    const status = this.getStatus();
    this.listeners.forEach(listener => {
      try {
        listener(status);
      } catch (error) {
        console.warn('Health monitor listener error:', error.message);
      }
    });
  }
}

export const healthMonitor = new HealthMonitor();
