/**
 * Cost Tracker Service
 * Tracks AI model usage and costs for Colony OS
 */

import { supabase } from '../../src/lib/supabase';

class CostTracker {
  constructor() {
    this.dailyCosts = new Map();
    this.userCosts = new Map();
  }

  /**
   * Track cost for an AI operation
   */
  async trackCost(operation) {
    const {
      userId,
      model,
      inputTokens,
      outputTokens,
      cost,
      beeId,
      taskType,
    } = operation;

    const costRecord = {
      userId: userId || 'anonymous',
      model,
      inputTokens,
      outputTokens,
      cost: cost.totalCost,
      beeId: beeId || 'zyeute',
      taskType: taskType || 'unknown',
      timestamp: new Date().toISOString(),
    };

    // Update in-memory cache
    const today = new Date().toISOString().split('T')[0];
    const dailyTotal = this.dailyCosts.get(today) || 0;
    this.dailyCosts.set(today, dailyTotal + cost.totalCost);

    if (userId) {
      const userTotal = this.userCosts.get(userId) || 0;
      this.userCosts.set(userId, userTotal + cost.totalCost);
    }

    // Store in Supabase (if table exists)
    try {
      const { error } = await supabase
        .from('colony_costs')
        .insert(costRecord);

      if (error && error.code !== '42P01') {
        // Ignore "table doesn't exist" error
        console.warn('Cost tracking failed:', error);
      }
    } catch (error) {
      // Table might not exist yet, that's okay
      console.warn('Cost tracking (non-critical):', error.message);
    }

    return costRecord;
  }

  /**
   * Get daily cost summary
   */
  getDailyCost(date = new Date().toISOString().split('T')[0]) {
    return {
      date,
      totalCost: this.dailyCosts.get(date) || 0,
      currency: 'USD',
    };
  }

  /**
   * Get user cost summary
   */
  getUserCost(userId) {
    return {
      userId,
      totalCost: this.userCosts.get(userId) || 0,
      currency: 'USD',
    };
  }

  /**
   * Get cost statistics
   */
  getStats() {
    const today = new Date().toISOString().split('T')[0];
    const dailyTotal = this.dailyCosts.get(today) || 0;
    const monthlyEstimate = dailyTotal * 30;

    return {
      today: {
        cost: dailyTotal,
        currency: 'USD',
      },
      monthlyEstimate: {
        cost: monthlyEstimate,
        currency: 'USD',
      },
      totalUsers: this.userCosts.size,
      cacheSize: this.dailyCosts.size,
    };
  }
}

export const costTracker = new CostTracker();

