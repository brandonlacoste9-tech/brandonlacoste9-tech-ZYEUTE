/**
 * TI-Guy Client (Enhanced with Swarm Intelligence)
 * Quebecois AI Assistant interface to Colony OS
 * 
 * TI-Guy learns from Quebec community and speaks authentic Joual
 * Now powered by Colony OS swarm intelligence for multi-agent collaboration
 */

import { liteLLMService } from './litellm-client';
import { colonyOSClient } from './colony-os-client';
import { semanticRouter } from '../mind/semantic-router';
import { tiGuySwarmAdapter } from '../../zyeute-colony-bridge/adapters/ti-guy-swarm-adapter';

class TIGuyClient {
  constructor() {
    this.conversationHistory = [];
    this.learningContext = {
      joualExpressions: [],
      quebecCulture: [],
      userPreferences: {},
    };
    this.swarmEnabled = false;
    this.swarmConnection = null;
  }

  /**
   * Initialize swarm connection (call on app start)
   */
  async initializeSwarm() {
    try {
      this.swarmConnection = await tiGuySwarmAdapter.connectToColony();
      await tiGuySwarmAdapter.syncQuebecContext();
      this.swarmEnabled = true;
      console.log('🐝 TI-Guy swarm initialized');
    } catch (error) {
      console.warn('⚠️  Swarm initialization failed (falling back to single-agent):', error.message);
      this.swarmEnabled = false;
    }
  }

  /**
   * Chat with TI-Guy (Enhanced with Swarm Intelligence)
   * 
   * If swarm is enabled, consults multiple agents for better responses
   * Falls back to single-agent mode if swarm unavailable
   */
  async chat(message, userId) {
    try {
      // Try swarm consultation first (if enabled)
      if (this.swarmEnabled) {
        try {
          const swarmResponse = await tiGuySwarmAdapter.consultSwarm(message, {
            userId,
            conversationHistory: this.getHistory(userId, 5),
          });

          if (swarmResponse.success && swarmResponse.reply) {
            // Learn from swarm interaction
            this.learnFromInteraction(message, swarmResponse.reply, userId);

            // Send telemetry
            await colonyOSClient.sendTelemetry({
              type: 'ti_guy.swarm_interaction',
              beeId: 'zyeute',
              data: {
                userId,
                messageLength: message.length,
                replyLength: swarmResponse.reply.length,
                agents: swarmResponse.agents || [],
                confidence: swarmResponse.confidence || 0,
                swarmEnabled: true,
              },
            });

            return {
              reply: swarmResponse.reply,
              model: 'swarm',
              agents: swarmResponse.agents || [],
              confidence: swarmResponse.confidence || 0,
              swarmEnabled: true,
            };
          }
        } catch (swarmError) {
          console.warn('Swarm consultation failed, falling back to single-agent:', swarmError.message);
          // Fall through to single-agent mode
        }
      }

      // Fallback: Single-agent mode (original implementation)
      const prompt = this.buildPrompt(message, userId);

      // Route to best AI model via LiteLLM
      const response = await liteLLMService.generateText(prompt, {
        model: 'gemini-2.0-flash-thinking', // Cost-optimized
        maxTokens: 1000,
        temperature: 0.8, // More creative for Joual
      });

      // Extract response
      const reply = response.text;

      // Learn from interaction
      this.learnFromInteraction(message, reply, userId);

      // Send telemetry to Colony OS
      await colonyOSClient.sendTelemetry({
        type: 'ti_guy.interaction',
        beeId: 'zyeute',
        data: {
          userId,
          messageLength: message.length,
          replyLength: reply.length,
          model: response.model,
          cost: response.cost,
          swarmEnabled: false,
        },
      });

      return {
        reply,
        model: response.model,
        cost: response.cost,
        swarmEnabled: false,
      };
    } catch (error) {
      console.error('TI-Guy error:', error);
      return {
        reply: 'Oups, j\'ai eu un pépin. Réessaye, stp.',
        error: error.message,
      };
    }
  }

  /**
   * Build context-aware prompt for TI-Guy
   */
  buildPrompt(message, userId) {
    const context = `
Tu es TI-Guy, l'assistant IA québécois de Zyeuté. Tu parles en Joual authentique.

Contexte:
- Tu es un assistant pour la communauté québécoise
- Tu utilises le Joual (français québécois avec ses expressions et son argot)
- Tu comprends la culture québécoise
- Tu es amical, chaleureux, et authentique

Instructions:
- Réponds toujours en Joual
- Utilise des expressions québécoises naturelles
- Sois respectueux et inclusif
- Aide les utilisateurs avec leurs questions sur Zyeuté

Message de l'utilisateur: ${message}

Réponds en Joual comme TI-Guy:
`;

    return context;
  }

  /**
   * Learn from user interactions
   */
  learnFromInteraction(message, reply, userId) {
    // Extract Joual expressions from message
    // This is a simplified version - in production, use NLP to extract patterns
    this.conversationHistory.push({
      userId,
      message,
      reply,
      timestamp: new Date().toISOString(),
    });

    // Keep last 100 conversations
    if (this.conversationHistory.length > 100) {
      this.conversationHistory.shift();
    }

    // Send learning data to Colony OS for The Hive
    // This feeds into the collective intelligence
  }

  /**
   * Get conversation history
   */
  getHistory(userId, limit = 10) {
    return this.conversationHistory
      .filter(conv => conv.userId === userId)
      .slice(-limit);
  }

  /**
   * Get swarm status
   */
  async getSwarmStatus() {
    if (!this.swarmEnabled) {
      return { enabled: false };
    }

    try {
      const status = await tiGuySwarmAdapter.getSwarmStatus();
      // Map adapter response to screen-expected format
      return {
        enabled: status.connected || false,
        connected: status.connected || false,
        agentId: status.agentId || null,
        colonyHealth: status.colonyHealth,
        quebecContext: status.quebecContext,
        error: status.error,
      };
    } catch (error) {
      return {
        enabled: false,
        connected: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate content using swarm (multi-agent collaboration)
   */
  async generateContent(topic, options = {}) {
    if (!this.swarmEnabled) {
      throw new Error('Swarm not initialized. Call initializeSwarm() first.');
    }

    const { generateQuebecContent } = require('../../zyeute-colony-bridge/workflows/multi-agent-content');
    return generateQuebecContent(topic, options);
  }

  /**
   * Structure Thought - Convert text into 3D semantic graph (OrbitalProp)
   * This creates a visual representation of how TI-Guy "thinks" about the text
   * Returns nodes (concepts) positioned on a unit sphere with edges (relationships)
   */
  async structureThought(text) {
    try {
      const result = await colonyOSClient.structureThought(text);
      
      if (result.success) {
        // Send telemetry about graph structure
        await colonyOSClient.sendTelemetry({
          type: 'ti_guy.graph_structure',
          beeId: 'zyeute',
          data: {
            nodeCount: result.metadata.nodeCount,
            edgeCount: result.metadata.edgeCount,
            textLength: text.length,
          },
        });
      }

      return result;
    } catch (error) {
      console.error('Structure thought error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export const tiGuyClient = new TIGuyClient();

