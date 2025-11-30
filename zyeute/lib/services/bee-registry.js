/**
 * Bee Registry Service
 * Manages Zyeuté's registration as a Bee in Colony OS
 */

import { colonyOSClient } from './colony-os-client';
import { qdrantService } from './qdrant-client';
import { liteLLMService } from './litellm-client';
import { temporalService } from './temporal-client';
import { supabase } from '../../src/lib/supabase';
import { heartbeatTracker } from '../health/heartbeat-tracker';
import { alerting } from '../health/alerting';

class BeeRegistry {
  constructor() {
    this.beeId = null;
    this.registered = false;
    this.capabilities = [
      'social_media',
      'quebec_community',
      'content_sharing',
      'real_time_updates',
      'user_engagement',
      'joual_language',
    ];
    this.lastHeartbeatResult = null;
  }

  /**
   * Register Zyeuté as a Bee in Colony OS
   */
  async register() {
    try {
      // Get current user ID as bee ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User must be authenticated to register as Bee');
      }

      this.beeId = `zyeute-${user.id}`;

      console.log(`🐝 Registering Zyeuté as Bee: ${this.beeId}`);

      // Step 1: Register in Colony OS
      const registration = await colonyOSClient.registerBee({
        beeId: this.beeId,
        capabilities: this.capabilities,
        metadata: {
          platform: 'react_native',
          version: '1.0.0',
          userId: user.id,
        },
      });

      console.log('✅ Registered in Colony OS');

      // Step 2: Store capabilities in Qdrant
      try {
        const capabilitiesText = this.capabilities.join(', ');
        const embedding = await liteLLMService.getEmbedding(capabilitiesText);
        
        await qdrantService.storeBeeCapabilities(
          this.beeId,
          this.capabilities,
          embedding
        );
        console.log('✅ Capabilities stored in Qdrant');
      } catch (error) {
        console.warn('⚠️  Qdrant storage failed (non-critical):', error.message);
      }

      // Step 3: Submit registration workflow to Temporal
      try {
        await temporalService.submitBeeTask(
          `registration-${Date.now()}`,
          this.beeId,
          'bee_registration',
          {
            beeId: this.beeId,
            beeType: 'zyeute',
            capabilities: this.capabilities,
          }
        );
        console.log('✅ Registration workflow submitted to Temporal');
      } catch (error) {
        console.warn('⚠️  Temporal workflow failed (non-critical):', error.message);
      }

      this.registered = true;
      return registration;
    } catch (error) {
      console.error('❌ Bee registration failed:', error);
      throw error;
    }
  }

  /**
   * Send heartbeat to Colony OS
   */
  async sendHeartbeat() {
    if (!this.registered || !this.beeId) {
      return;
    }

    try {
      const started = Date.now();
      await colonyOSClient.sendTelemetry({
        type: 'bee.heartbeat',
        beeId: this.beeId,
        data: {
          timestamp: new Date().toISOString(),
          status: 'active',
        },
      });
      const latency = Date.now() - started;
      heartbeatTracker.recordSuccess(latency);
      this.lastHeartbeatResult = {
        status: 'success',
        latency,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      heartbeatTracker.recordFailure(error);
      this.lastHeartbeatResult = {
        status: 'failed',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
      console.warn('Heartbeat failed (non-critical):', error);
      alerting.sendAlert({
        type: 'heartbeat.error',
        severity: 'warning',
        message: 'Bee heartbeat failed',
        service: 'bee-heartbeat',
        context: {
          error: error.message,
          beeId: this.beeId,
        },
      }).catch(() => {});
    }
  }

  /**
   * Start periodic heartbeat
   */
  startHeartbeat(intervalSeconds = 60) {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.sendHeartbeat();
    }, intervalSeconds * 1000);

    // Send initial heartbeat
    this.sendHeartbeat();
  }

  /**
   * Stop heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  getHeartbeatStatus() {
    return {
      lastHeartbeat: this.lastHeartbeatResult,
      tracker: heartbeatTracker.getStats(),
    };
  }
}

export const beeRegistry = new BeeRegistry();

