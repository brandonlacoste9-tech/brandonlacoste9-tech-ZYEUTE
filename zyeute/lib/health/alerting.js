/**
 * Alerting helpers for health and heartbeat events
 * Supports Supabase table logging and optional Slack webhook
 */

import { supabase } from '../../src/lib/supabase';

class Alerting {
  constructor() {
    this.slackWebhook =
      process.env.HEALTH_SLACK_WEBHOOK_URL ||
      process.env.EXPO_PUBLIC_HEALTH_SLACK_WEBHOOK ||
      null;
    this.supabaseTable = process.env.HEALTH_ALERTS_TABLE || 'health_alerts';
  }

  async sendAlert(alert) {
    const payload = {
      type: alert.type,
      severity: alert.severity || 'info',
      message: alert.message,
      service: alert.service,
      context: alert.context || {},
      timestamp: new Date().toISOString(),
    };

    await Promise.allSettled([
      this.sendToSupabase(payload),
      this.sendToSlack(payload),
    ]);

    return payload;
  }

  async sendToSupabase(payload) {
    try {
      await supabase.from(this.supabaseTable).insert({
        type: payload.type,
        severity: payload.severity,
        service: payload.service,
        message: payload.message,
        context: payload.context,
        created_at: payload.timestamp,
      });
    } catch (error) {
      console.warn('Health alert Supabase sink failed:', error.message);
    }
  }

  async sendToSlack(payload) {
    if (!this.slackWebhook) return;

    try {
      await fetch(this.slackWebhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `Health alert: ${payload.severity.toUpperCase()} - ${payload.message}`,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*Health alert*\n*Severity:* ${payload.severity}\n*Service:* ${payload.service || 'n/a'}\n*Message:* ${payload.message}`,
              },
            },
            {
              type: 'context',
              elements: [
                {
                  type: 'mrkdwn',
                  text: `Timestamp: ${payload.timestamp}`,
                },
              ],
            },
          ],
        }),
      });
    } catch (error) {
      console.warn('Health alert Slack sink failed:', error.message);
    }
  }
}

export const alerting = new Alerting();
