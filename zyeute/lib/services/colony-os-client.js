/**
 * Colony OS API Client
 * Bridge between Zyeuté mobile app and Colony OS backend
 */

import { supabase } from '../../src/lib/supabase';

class ColonyOSClient {
  constructor() {
    this.baseUrl = process.env.COLONY_OS_API_URL || process.env.EXPO_PUBLIC_COLONY_OS_URL || 'http://localhost:8000';
  }

  /**
   * Get authentication token from Supabase session
   */
  async getAuthToken() {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  }

  /**
   * Submit task to Colony OS
   */
  async submitTask(task) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: task.description,
          requirements: task.requirements || {},
          constraints: task.constraints || {},
          priority: task.priority || 5,
          timeout_seconds: task.timeout_seconds || 300,
          tags: task.tags || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Colony OS API error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error submitting task to Colony OS:', error);
      throw error;
    }
  }

  /**
   * Get task status
   */
  async getTaskStatus(taskId) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to get task status: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error getting task status:', error);
      throw error;
    }
  }

  /**
   * Register Zyeuté as a Bee in Colony OS
   */
  async registerBee(beeData) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/bees/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          beeId: beeData.beeId,
          beeType: 'zyeute',
          capabilities: beeData.capabilities || [
            'social_media',
            'quebec_community',
            'content_sharing',
            'real_time_updates',
          ],
          metadata: {
            platform: 'react_native',
            version: '1.0.0',
            ...beeData.metadata,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to register bee: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Error registering bee:', error);
      throw error;
    }
  }

  /**
   * Get shared knowledge from The Hive
   */
  async getSharedKnowledge(options = {}) {
    try {
      const token = await this.getAuthToken();
      const { beeId, types = [] } = options;

      const queryParams = new URLSearchParams();
      if (beeId) queryParams.append('beeId', beeId);
      types.forEach(type => queryParams.append('type', type));

      const response = await fetch(
        `${this.baseUrl}/knowledge/shared?${queryParams.toString()}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to get shared knowledge: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.warn('Failed to get shared knowledge (non-critical):', error.message);
      return { knowledge: [] };
    }
  }

  /**
   * Health check - ping Colony OS to verify connection
   */
  async healthCheck() {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        status: response.status,
        data: data,
      };
    } catch (error) {
      console.error('Health check error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Sensory Pulse - Send text input to Colony OS for AI processing
   * Returns classified tags (category, sentiment, etc.)
   */
  async sensoryPulse(text) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/sensory/pulse`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          beeId: 'zyeute',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        // Handle 404 (endpoint not implemented yet)
        if (response.status === 404) {
          throw new Error('Endpoint /sensory/pulse not implemented in Colony OS backend yet. See COLONY_OS_BACKEND_SPEC.md');
        }
        throw new Error(`Sensory pulse failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        analysis: data.analysis || {},
        category: data.category,
        sentiment: data.sentiment,
        language: data.language,
        metadata: data.metadata || {},
      };
    } catch (error) {
      console.error('Sensory pulse error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Structure Thought - Convert text into 3D semantic graph (OrbitalProp)
   * This is the "Big Bang" of a thought - creates nodes and edges on a unit sphere
   */
  async structureThought(text) {
    try {
      // 🧪 DREAM MODE: Bypass backend for testing UI
      // Type "dream" or "rêve" in your message to see the mock graph
      const lowerText = text.toLowerCase();
      if (lowerText.includes('dream') || lowerText.includes('rêve') || lowerText.includes('reve')) {
        console.log('🔮 Simulating OrbitalProp Graph (Dream Mode)...');
        
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const mockGraph = {
          nodes: {
            "1": { 
              id: "1", 
              label: "Poutine", 
              type: "concept", 
              activation: 0.9, 
              mass: 2.0, 
              position: [0.1, 0.8, 0.2] 
            },
            "2": { 
              id: "2", 
              label: "Cheese", 
              type: "concept", 
              activation: 0.7, 
              mass: 1.0, 
              position: [0.15, 0.75, 0.1] 
            },
            "3": { 
              id: "3", 
              label: "Gravy", 
              type: "concept", 
              activation: 0.8, 
              mass: 1.2, 
              position: [0.05, 0.82, 0.3] 
            },
            "4": { 
              id: "4", 
              label: "Hungry", 
              type: "action", 
              activation: 0.95, 
              mass: 1.5, 
              position: [-0.5, 0.2, 0.1] 
            },
            "5": {
              id: "5",
              label: "Québec",
              type: "concept",
              activation: 0.85,
              mass: 1.8,
              position: [0.3, -0.4, 0.6]
            }
          },
          edges: [
            { source: "2", target: "1", weight: 0.9, type: "constituent" },
            { source: "3", target: "1", weight: 0.9, type: "constituent" },
            { source: "4", target: "1", weight: 0.6, type: "desire" },
            { source: "5", target: "1", weight: 0.7, type: "cultural" }
          ]
        };
        
        return {
          success: true,
          graph: mockGraph,
          metadata: {
            nodeCount: Object.keys(mockGraph.nodes).length,
            edgeCount: mockGraph.edges.length,
            dreamMode: true, // Flag to show this is a simulation
          },
        };
      }

      // Real API call to Colony OS backend
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/mind/structure`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!response.ok) {
        // Handle 404 (endpoint not implemented yet)
        if (response.status === 404) {
          throw new Error('Endpoint /mind/structure not implemented in Colony OS backend yet. Try typing "dream" to see a mock graph!');
        }
        throw new Error(`Structure thought failed: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        graph: {
          nodes: data.nodes || {},
          edges: data.edges || [],
        },
        metadata: {
          nodeCount: Object.keys(data.nodes || {}).length,
          edgeCount: (data.edges || []).length,
          dreamMode: false,
        },
      };
    } catch (error) {
      console.error('Structure thought error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send telemetry event to Colony OS
   */
  async sendTelemetry(event) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(`${this.baseUrl}/telemetry`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event: event.type,
          beeId: event.beeId || 'zyeute',
          data: event.data,
          timestamp: new Date().toISOString(),
        }),
      });

      // Don't throw on telemetry errors (non-critical)
      if (!response.ok) {
        console.warn('Telemetry send failed:', response.statusText);
      }

      return response.ok;
    } catch (error) {
      console.warn('Telemetry error (non-critical):', error);
      return false;
    }
  }
}

export const colonyOSClient = new ColonyOSClient();

