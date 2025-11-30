/**
 * The Codex - Memory
 * Stores and retrieves knowledge, patterns, and experiences
 * Part of Colony OS Magnum Opus
 * 
 * The Codex remembers:
 * - User preferences and patterns
 * - Content trends and insights
 * - Quebec culture and Joual patterns
 * - Social graph knowledge
 * - Emotional patterns
 * - Behavioral insights
 */

import { qdrantService } from '../services/qdrant-client';
import { colonyOSClient } from '../services/colony-os-client';
import { liteLLMService } from '../services/litellm-client';
import { supabase } from '../../src/lib/supabase';

class Codex {
  constructor() {
    this.memoryCollection = 'zyeute-memory';
    this.patterns = new Map(); // In-memory pattern cache
    this.knowledgeBase = new Map(); // Cached knowledge
    this.initialized = false;
  }

  /**
   * Initialize The Codex
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize Qdrant collection for memory storage
      await this.initializeMemoryCollection();
      
      // Load cached patterns from Colony OS
      await this.loadPatternsFromHive();

      this.initialized = true;
      console.log('📚 The Codex initialized - Memory is ready');
    } catch (error) {
      console.warn('⚠️  Codex initialization failed (non-critical):', error.message);
      // Continue with in-memory only mode
    }
  }

  /**
   * Initialize Qdrant collection for memory storage
   */
  async initializeMemoryCollection() {
    try {
      // Create collection if it doesn't exist
      // Qdrant will handle this via the service
      await qdrantService.initializeCollection();
      console.log('📚 Memory collection ready');
    } catch (error) {
      console.warn('Memory collection initialization warning:', error);
    }
  }

  /**
   * Store a memory (knowledge, pattern, insight)
   */
  async remember(memory) {
    const {
      type, // 'pattern', 'preference', 'insight', 'trend', 'knowledge'
      userId,
      content,
      context,
      metadata = {},
      embedding = null,
    } = memory;

    try {
      // Generate embedding if not provided
      let memoryEmbedding = embedding;
      if (!memoryEmbedding && content) {
        memoryEmbedding = await this.generateEmbedding(content);
      }

      // Store in Qdrant
      if (memoryEmbedding) {
        const memoryId = `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        await qdrantService.storeMemory(
          this.memoryCollection,
          {
            id: memoryId,
            vector: memoryEmbedding,
            payload: {
              type,
              userId: userId || null,
              content,
              context,
              metadata,
              timestamp: new Date().toISOString(),
            },
          }
        );
      }

      // Store in local cache
      const key = `${type}-${userId || 'global'}`;
      if (!this.knowledgeBase.has(key)) {
        this.knowledgeBase.set(key, []);
      }
      this.knowledgeBase.get(key).push({
        content,
        context,
        metadata,
        timestamp: new Date().toISOString(),
      });

      // Share with The Hive
      await this.shareWithHive({
        type: 'memory.stored',
        memory: {
          type,
          content: content.substring(0, 500), // Truncate for telemetry
          context,
          metadata,
        },
      });

      console.log(`📚 Remembered: ${type} for ${userId || 'global'}`);
    } catch (error) {
      console.warn('Memory storage failed:', error);
    }
  }

  /**
   * Recall memories (search by similarity)
   */
  async recall(query, options = {}) {
    const {
      type = null,
      userId = null,
      limit = 10,
      threshold = 0.7,
    } = options;

    try {
      // Generate query embedding
      const queryEmbedding = await this.generateEmbedding(query);

      // Search in Qdrant
      const results = await qdrantService.searchMemory(
        this.memoryCollection,
        {
          vector: queryEmbedding,
          limit,
          filter: {
            type,
            userId,
          },
        }
      );

      // Filter by threshold and format
      const memories = results
        .filter(r => r.score >= threshold)
        .map(r => ({
          content: r.payload.content,
          context: r.payload.context,
          metadata: r.payload.metadata,
          similarity: r.score,
          timestamp: r.payload.timestamp,
        }));

      return memories;
    } catch (error) {
      console.warn('Memory recall failed:', error);
      // Fallback to local cache
      return this.recallFromCache(query, options);
    }
  }

  /**
   * Recall from local cache (fallback)
   */
  recallFromCache(query, options) {
    const { type = null, userId = null, limit = 10 } = options;
    const key = `${type || 'all'}-${userId || 'global'}`;
    
    const memories = this.knowledgeBase.get(key) || [];
    return memories.slice(0, limit);
  }

  /**
   * Remember a user pattern
   */
  async rememberPattern(userId, patternType, patternData) {
    await this.remember({
      type: 'pattern',
      userId,
      content: `User pattern: ${patternType}`,
      context: {
        patternType,
        ...patternData,
      },
      metadata: {
        source: 'behavioral_analysis',
        confidence: patternData.confidence || 0.5,
      },
    });

    // Update in-memory patterns
    const patternKey = `${userId}-${patternType}`;
    this.patterns.set(patternKey, {
      ...patternData,
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Get user pattern
   */
  getPattern(userId, patternType) {
    const patternKey = `${userId}-${patternType}`;
    return this.patterns.get(patternKey) || null;
  }

  /**
   * Remember a preference
   */
  async rememberPreference(userId, preferenceType, preferenceValue) {
    await this.remember({
      type: 'preference',
      userId,
      content: `User prefers: ${preferenceType} = ${preferenceValue}`,
      context: {
        preferenceType,
        preferenceValue,
      },
      metadata: {
        source: 'user_interaction',
      },
    });
  }

  /**
   * Remember an insight (trend, discovery)
   */
  async rememberInsight(insight) {
    await this.remember({
      type: 'insight',
      userId: null, // Global insight
      content: insight.description,
      context: insight.context || {},
      metadata: {
        source: insight.source || 'analysis',
        confidence: insight.confidence || 0.5,
        category: insight.category,
      },
    });
  }

  /**
   * Remember Quebec culture/Joual pattern
   */
  async rememberQuebecPattern(pattern) {
    await this.remember({
      type: 'quebec_culture',
      userId: null,
      content: pattern.text || pattern.phrase,
      context: {
        patternType: pattern.type, // 'joual', 'expression', 'cultural_reference'
        meaning: pattern.meaning,
        usage: pattern.usage,
      },
      metadata: {
        source: 'community_learning',
        frequency: pattern.frequency || 1,
      },
    });
  }

  /**
   * Load patterns from The Hive
   */
  async loadPatternsFromHive() {
    try {
      const response = await colonyOSClient.getSharedKnowledge({
        beeId: 'zyeute',
        types: ['pattern', 'insight', 'quebec_culture'],
      });

      if (response && response.knowledge) {
        response.knowledge.forEach(knowledge => {
          const key = `${knowledge.type}-${knowledge.userId || 'global'}`;
          if (!this.knowledgeBase.has(key)) {
            this.knowledgeBase.set(key, []);
          }
          this.knowledgeBase.get(key).push(knowledge);
        });

        console.log(`📚 Loaded ${response.knowledge.length} memories from The Hive`);
      }
    } catch (error) {
      console.warn('Failed to load patterns from Hive (non-critical):', error.message);
    }
  }

  /**
   * Share memory with The Hive
   */
  async shareWithHive(memoryData) {
    try {
      await colonyOSClient.sendTelemetry({
        type: 'memory.shared',
        beeId: 'zyeute',
        data: memoryData,
      });
    } catch (error) {
      console.warn('Failed to share memory with Hive (non-critical):', error.message);
    }
  }

  /**
   * Generate embedding for text
   */
  async generateEmbedding(text) {
    try {
      return await liteLLMService.getEmbedding(text);
    } catch (error) {
      console.warn('Embedding generation failed:', error);
      return null;
    }
  }

  /**
   * Query The Codex for knowledge
   */
  async query(question, context = {}) {
    // Search memories
    const memories = await this.recall(question, {
      limit: 5,
      threshold: 0.6,
    });

    // Format response
    return {
      question,
      memories,
      answer: this.synthesizeAnswer(question, memories, context),
    };
  }

  /**
   * Synthesize answer from memories
   */
  synthesizeAnswer(question, memories, context) {
    if (memories.length === 0) {
      return null;
    }

    // Simple synthesis - in production, use LLM
    const relevantMemories = memories
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3);

    return {
      based_on: relevantMemories.length,
      confidence: relevantMemories[0]?.similarity || 0,
      summary: relevantMemories.map(m => m.content).join('; '),
    };
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      initialized: this.initialized,
      patterns_count: this.patterns.size,
      knowledge_base_size: Array.from(this.knowledgeBase.values())
        .reduce((sum, arr) => sum + arr.length, 0),
      collections: [this.memoryCollection],
    };
  }
}

export const codex = new Codex();

