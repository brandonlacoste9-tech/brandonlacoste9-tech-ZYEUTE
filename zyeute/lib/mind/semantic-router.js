/**
 * Mind Layer - Semantic Task Routing
 * Uses Qdrant for vector similarity search and LiteLLM for embeddings
 */

import { qdrantService } from '../services/qdrant-client';
import { liteLLMService } from '../services/litellm-client';

class SemanticRouter {
  /**
   * Route task to best bee using semantic similarity
   */
  async routeTask(task) {
    console.log(`🧠 Routing task: ${task.description}`);

    try {
      // Generate embedding for task description
      const taskEmbedding = await liteLLMService.getEmbedding(task.description);

      // Find best matching bees
      const candidates = await qdrantService.findBestBee(
        task.description,
        taskEmbedding,
        5
      );

      console.log(`🔍 Found ${candidates.length} candidate bees`);

      if (candidates.length === 0) {
        // No candidates found, return fallback
        return {
          selectedBee: null,
          candidates: [],
          reasoning: 'No matching bees found in vector database',
        };
      }

      // Score candidates based on multiple factors
      const scored = candidates.map(bee => ({
        ...bee,
        score: this.calculateScore(bee, task),
      }));

      // Sort by score
      scored.sort((a, b) => b.score - a.score);

      const bestBee = scored[0];

      console.log(`✅ Selected bee ${bestBee.beeId} with score ${bestBee.score.toFixed(3)}`);

      return {
        selectedBee: bestBee.beeId,
        candidates: scored,
        reasoning: this.explainSelection(bestBee, task),
      };
    } catch (error) {
      console.error('Error in semantic routing:', error);
      // Fallback: return null (will use default routing)
      return {
        selectedBee: null,
        candidates: [],
        reasoning: `Routing error: ${error.message}`,
      };
    }
  }

  /**
   * Calculate routing score
   */
  calculateScore(bee, task) {
    let score = bee.similarity || 0; // Base score from vector similarity

    // Boost if capabilities match requirements
    if (task.requirements && Array.isArray(task.requirements)) {
      const matchCount = task.requirements.filter(req =>
        bee.capabilities?.some(cap =>
          cap.toLowerCase().includes(req.toLowerCase())
        )
      ).length;

      if (task.requirements.length > 0) {
        score += (matchCount / task.requirements.length) * 0.3;
      }
    }

    // Adjust for priority
    if (task.priority && task.priority > 5) {
      score += 0.1; // Prioritize high-priority tasks
    }

    return Math.min(score, 1); // Cap at 1.0
  }

  /**
   * Explain why bee was selected
   */
  explainSelection(bee, task) {
    return {
      similarity: bee.similarity,
      capabilities: bee.capabilities || [],
      reasoning: `Selected based on ${((bee.similarity || 0) * 100).toFixed(1)}% semantic similarity to task description`,
    };
  }
}

export const semanticRouter = new SemanticRouter();

