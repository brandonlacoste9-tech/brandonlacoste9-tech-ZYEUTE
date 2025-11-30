/**
 * Sensory Cortex - The Body
 * Collects and processes sensory input from Zyeuté users
 * Feeds data to Colony OS (The Hive)
 * 
 * Sensory modalities:
 * - Visual (images, media)
 * - Textual (posts, comments)
 * - Social (reactions, follows, interactions)
 * - Temporal (timing, patterns)
 * - Behavioral (engagement, preferences)
 */

import { colonyOSClient } from '../services/colony-os-client';
import { liteLLMService } from '../services/litellm-client';
import { supabase } from '../../src/lib/supabase';

class SensoryCortex {
  constructor() {
    this.buffer = []; // Buffer for batching sensory events
    this.bufferSize = 10; // Batch size before sending
    this.flushInterval = 30000; // Flush buffer every 30 seconds
    this.flushTimer = null;
    this.active = false;
  }

  /**
   * Initialize Sensory Cortex
   */
  async initialize() {
    if (this.active) return;

    this.active = true;
    this.startBufferFlush();
    this.setupRealtimeListeners();

    console.log('🧠 Sensory Cortex initialized - The Body is sensing');
  }

  /**
   * Start periodic buffer flush
   */
  startBufferFlush() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Setup Supabase Realtime listeners for sensory input
   */
  setupRealtimeListeners() {
    // Listen to publications (visual + textual)
    const pubChannel = supabase
      .channel('sensory-publications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'publications',
        },
        (payload) => {
          this.sensePublication(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'publications',
        },
        (payload) => {
          this.sensePublicationUpdate(payload.new, payload.old);
        }
      )
      .subscribe();

    // Listen to comments (textual + social)
    const commentChannel = supabase
      .channel('sensory-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'commentaires',
        },
        (payload) => {
          this.senseComment(payload.new);
        }
      )
      .subscribe();

    // Listen to reactions (social + emotional)
    const reactionChannel = supabase
      .channel('sensory-reactions')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'reactions',
        },
        (payload) => {
          this.senseReaction(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'reactions',
        },
        (payload) => {
          this.senseReactionRemoval(payload.old);
        }
      )
      .subscribe();

    // Listen to follows (social graph)
    const followChannel = supabase
      .channel('sensory-follows')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'abonnements',
        },
        (payload) => {
          this.senseFollow(payload.new);
        }
      )
      .subscribe();

    this.channels = [pubChannel, commentChannel, reactionChannel, followChannel];
  }

  /**
   * Sense a new publication (visual + textual)
   */
  async sensePublication(publication) {
    const sensoryEvent = {
      type: 'publication.created',
      modality: ['visual', 'textual'],
      timestamp: new Date().toISOString(),
      data: {
        publication_id: publication.id,
        user_id: publication.user_id,
        content: publication.content,
        media_url: publication.media_url,
        visibilite: publication.visibilite,
        metadata: {
          has_image: !!publication.media_url,
          content_length: publication.content?.length || 0,
          language: this.detectLanguage(publication.content),
        },
      },
    };

    // If there's an image, extract visual features
    if (publication.media_url) {
      sensoryEvent.data.visual_features = await this.extractVisualFeatures(publication.media_url);
    }

    // Extract semantic meaning from text
    if (publication.content) {
      sensoryEvent.data.semantic_embedding = await this.extractSemanticMeaning(publication.content);
    }

    this.addToBuffer(sensoryEvent);
  }

  /**
   * Sense a publication update
   */
  async sensePublicationUpdate(newPub, oldPub) {
    const sensoryEvent = {
      type: 'publication.updated',
      modality: ['textual'],
      timestamp: new Date().toISOString(),
      data: {
        publication_id: newPub.id,
        user_id: newPub.user_id,
        changes: {
          content_changed: newPub.content !== oldPub.content,
          visibility_changed: newPub.visibilite !== oldPub.visibilite,
          hidden: newPub.est_masque !== oldPub.est_masque,
        },
      },
    };

    this.addToBuffer(sensoryEvent);
  }

  /**
   * Sense a comment (textual + social)
   */
  async senseComment(comment) {
    const sensoryEvent = {
      type: 'comment.created',
      modality: ['textual', 'social'],
      timestamp: new Date().toISOString(),
      data: {
        comment_id: comment.id,
        publication_id: comment.publication_id,
        user_id: comment.user_id,
        content: comment.content,
        metadata: {
          content_length: comment.content?.length || 0,
          language: this.detectLanguage(comment.content),
          sentiment: await this.analyzeSentiment(comment.content),
        },
      },
    };

    // Extract semantic meaning
    if (comment.content) {
      sensoryEvent.data.semantic_embedding = await this.extractSemanticMeaning(comment.content);
    }

    this.addToBuffer(sensoryEvent);
  }

  /**
   * Sense a reaction (emotional + social)
   */
  async senseReaction(reaction) {
    const sensoryEvent = {
      type: 'reaction.added',
      modality: ['emotional', 'social'],
      timestamp: new Date().toISOString(),
      data: {
        reaction_id: reaction.id,
        publication_id: reaction.publication_id,
        user_id: reaction.user_id,
        reaction_type: reaction.type,
        emotional_value: this.getEmotionalValue(reaction.type),
      },
    };

    this.addToBuffer(sensoryEvent);
  }

  /**
   * Sense a reaction removal
   */
  senseReactionRemoval(reaction) {
    const sensoryEvent = {
      type: 'reaction.removed',
      modality: ['emotional', 'social'],
      timestamp: new Date().toISOString(),
      data: {
        reaction_id: reaction.id,
        publication_id: reaction.publication_id,
        user_id: reaction.user_id,
        reaction_type: reaction.type,
      },
    };

    this.addToBuffer(sensoryEvent);
  }

  /**
   * Sense a follow (social graph)
   */
  senseFollow(follow) {
    const sensoryEvent = {
      type: 'follow.created',
      modality: ['social'],
      timestamp: new Date().toISOString(),
      data: {
        follower_id: follow.follower_id,
        followee_id: follow.followee_id,
        social_graph_edge: {
          from: follow.follower_id,
          to: follow.followee_id,
        },
      },
    };

    this.addToBuffer(sensoryEvent);
  }

  /**
   * Add sensory event to buffer
   */
  addToBuffer(event) {
    this.buffer.push(event);

    // Flush if buffer is full
    if (this.buffer.length >= this.bufferSize) {
      this.flush();
    }
  }

  /**
   * Flush buffer to Colony OS
   */
  async flush() {
    if (this.buffer.length === 0) return;

    const events = [...this.buffer];
    this.buffer = [];

    try {
      // Send to Colony OS telemetry
      await colonyOSClient.sendTelemetry({
        type: 'sensory.batch',
        beeId: 'zyeute',
        data: {
          events,
          count: events.length,
          timestamp: new Date().toISOString(),
        },
      });

      console.log(`🧠 Sensory Cortex: Flushed ${events.length} events to The Hive`);
    } catch (error) {
      console.warn('⚠️  Sensory Cortex flush failed (non-critical):', error.message);
      // Re-add events to buffer for retry
      this.buffer.unshift(...events);
    }
  }

  /**
   * Extract visual features from image URL
   * (Placeholder - would use vision model in production)
   */
  async extractVisualFeatures(imageUrl) {
    try {
      // In production, this would call a vision model (Open-Sora, Stable Diffusion, etc.)
      // For now, return basic metadata
      return {
        has_image: true,
        url: imageUrl,
        // Placeholder for actual vision analysis
        detected_objects: [],
        scene_description: null,
      };
    } catch (error) {
      console.warn('Visual feature extraction failed:', error);
      return null;
    }
  }

  /**
   * Extract semantic meaning from text using LiteLLM
   */
  async extractSemanticMeaning(text) {
    try {
      // Use LiteLLM embeddings endpoint
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_LITELLM_URL || 'http://localhost:4000'}/embeddings`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_LITELLM_KEY || ''}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-ada-002',
            input: text,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Embedding generation failed');
      }

      const data = await response.json();
      const embedding = data.data[0]?.embedding;

      return {
        embedding,
        text_length: text.length,
        model: data.model,
      };
    } catch (error) {
      console.warn('Semantic extraction failed:', error);
      return null;
    }
  }

  /**
   * Analyze sentiment of text
   */
  async analyzeSentiment(text) {
    try {
      // Use LiteLLM to analyze sentiment
      const prompt = `Analyze the sentiment of this Quebec French text (Joual). Respond with only: positive, negative, or neutral.\n\nText: "${text}"`;
      
      const response = await liteLLMService.generateText(prompt, {
        model: 'gemini-pro',
        maxTokens: 10,
        temperature: 0.3,
      });

      return response.text.trim().toLowerCase();
    } catch (error) {
      console.warn('Sentiment analysis failed:', error);
      return 'neutral';
    }
  }

  /**
   * Detect language (Quebec French, English, etc.)
   */
  detectLanguage(text) {
    // Simple heuristic - in production, use proper language detection
    if (!text) return 'unknown';
    
    const quebecIndicators = ['tsé', 'pis', 'ben', 'là', 'faque', 'coudonc'];
    const hasQuebec = quebecIndicators.some(indicator => 
      text.toLowerCase().includes(indicator)
    );
    
    return hasQuebec ? 'quebec_french' : 'french';
  }

  /**
   * Get emotional value for reaction type
   */
  getEmotionalValue(reactionType) {
    const emotionalMap = {
      like: 1,
      love: 2,
      haha: 1.5,
      wow: 1.2,
      sad: -0.5,
      angry: -1,
    };

    return emotionalMap[reactionType] || 0;
  }

  /**
   * Manually sense a user action (for programmatic use)
   */
  async senseUserAction(actionType, actionData) {
    const sensoryEvent = {
      type: `user.action.${actionType}`,
      modality: ['behavioral'],
      timestamp: new Date().toISOString(),
      data: actionData,
    };

    this.addToBuffer(sensoryEvent);
  }

  /**
   * Get sensory statistics
   */
  getStats() {
    return {
      buffer_size: this.buffer.length,
      active: this.active,
      channels_active: this.channels?.length || 0,
    };
  }

  /**
   * Shutdown Sensory Cortex
   */
  async shutdown() {
    this.active = false;

    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush remaining buffer
    await this.flush();

    // Unsubscribe from channels
    if (this.channels) {
      this.channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
      this.channels = [];
    }

    console.log('🧠 Sensory Cortex shutdown');
  }
}

export const sensoryCortex = new SensoryCortex();

