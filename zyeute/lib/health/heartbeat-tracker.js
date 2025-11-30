/**
 * Tracks bee heartbeat outcomes and raises alerts on repeated failures
 */

import { alerting } from './alerting';

class HeartbeatTracker {
  constructor() {
    this.history = [];
    this.consecutiveFailures = 0;
    this.failureThreshold = 3;
    this.lastSuccessAt = null;
    this.lastFailureAt = null;
    this.alerted = false;
  }

  recordSuccess(latencyMs) {
    this.lastSuccessAt = new Date().toISOString();
    this.consecutiveFailures = 0;
    this.alerted = false;
    this.pushHistory({
      success: true,
      latency: latencyMs || null,
    });
  }

  recordFailure(error) {
    this.consecutiveFailures += 1;
    this.lastFailureAt = new Date().toISOString();
    this.pushHistory({
      success: false,
      error: error?.message || String(error),
    });

    if (this.consecutiveFailures >= this.failureThreshold && !this.alerted) {
      this.alerted = true;
      alerting.sendAlert({
        type: 'heartbeat.missed',
        severity: 'critical',
        message: `Bee heartbeat missed ${this.consecutiveFailures} times`,
        service: 'bee-heartbeat',
        context: {
          consecutiveFailures: this.consecutiveFailures,
          lastFailureAt: this.lastFailureAt,
        },
      }).catch(() => {
        // Alert failures are non-blocking
      });
    }
  }

  pushHistory(entry) {
    this.history.unshift({
      ...entry,
      timestamp: new Date().toISOString(),
    });
    // Keep recent 50 entries
    this.history = this.history.slice(0, 50);
  }

  getStats() {
    return {
      lastSuccessAt: this.lastSuccessAt,
      lastFailureAt: this.lastFailureAt,
      consecutiveFailures: this.consecutiveFailures,
      history: this.history,
    };
  }
}

export const heartbeatTracker = new HeartbeatTracker();
