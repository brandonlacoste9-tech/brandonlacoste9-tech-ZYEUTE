/**
 * Qdrant Client for Colony OS
 * Vector database for semantic routing and capability matching
 */

class QdrantService {
  constructor() {
    this.baseUrl = process.env.QDRANT_URL || process.env.EXPO_PUBLIC_QDRANT_URL || 'http://localhost:6333';
    this.collectionName = 'bee-capabilities';
  }

  /**
   * Initialize capabilities collection
   */
  async initializeCollection() {
    try {
      const response = await fetch(`${this.baseUrl}/collections/${this.collectionName}`, {
        method: 'GET',
      });

      if (response.status === 404) {
        // Collection doesn't exist, create it
        const createResponse = await fetch(`${this.baseUrl}/collections/${this.collectionName}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vectors: {
              size: 1536, // OpenAI embedding size (text-embedding-ada-002)
              distance: 'Cosine',
            },
          }),
        });

        if (createResponse.ok) {
          console.log('✅ Qdrant collection initialized');
        } else {
          throw new Error('Failed to create collection');
        }
      } else if (response.ok) {
        console.log('ℹ️  Collection already exists');
      }
    } catch (error) {
      console.warn('⚠️  Qdrant not available:', error.message);
    }
  }

  /**
   * Store bee capabilities as vectors
   */
  async storeBeeCapabilities(beeId, capabilities, embedding) {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${this.collectionName}/points`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            points: [
              {
                id: beeId,
                vector: embedding,
                payload: {
                  beeId,
                  capabilities,
                  registeredAt: new Date().toISOString(),
                },
              },
            ],
          }),
        }
      );

      if (response.ok) {
        console.log(`🐝 Stored capabilities for bee ${beeId}`);
      } else {
        throw new Error('Failed to store capabilities');
      }
    } catch (error) {
      console.error('Error storing capabilities:', error);
      throw error;
    }
  }

  /**
   * Find best bee for task using semantic search
   */
  async findBestBee(taskDescription, taskEmbedding, limit = 5) {
    try {
      const response = await fetch(
        `${this.baseUrl}/collections/${this.collectionName}/points/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vector: taskEmbedding,
            limit,
            with_payload: true,
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      return data.result.map(result => ({
        beeId: result.payload?.beeId,
        capabilities: result.payload?.capabilities || [],
        similarity: result.score,
      }));
    } catch (error) {
      console.error('Error finding best bee:', error);
      return [];
    }
  }

  /**
   * Get embedding for text (using LiteLLM)
   * This is a helper that calls LiteLLM service
   */
  async getEmbedding(text) {
    // This will be called from semantic-router which has access to liteLLMService
    // For now, return a placeholder
    throw new Error('getEmbedding should be called via liteLLMService');
  }

  /**
   * Store memory in a collection
   */
  async storeMemory(collectionName, memory) {
    try {
      // Ensure collection exists
      await this.ensureCollection(collectionName);

      const response = await fetch(
        `${this.baseUrl}/collections/${collectionName}/points`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            points: [memory], // memory is already a point object
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to store memory');
      }

      return true;
    } catch (error) {
      console.error('Error storing memory:', error);
      throw error;
    }
  }

  /**
   * Search memories in a collection
   */
  async searchMemory(collectionName, options) {
    try {
      const { vector, limit = 10, filter = {} } = options;

      const body = {
        vector,
        limit,
        with_payload: true,
      };

      // Add filter if provided
      if (Object.keys(filter).length > 0) {
        body.filter = {
          must: Object.entries(filter).map(([key, value]) => ({
            key: `payload.${key}`,
            match: { value },
          })),
        };
      }

      const response = await fetch(
        `${this.baseUrl}/collections/${collectionName}/points/search`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      return data.result.map(result => ({
        score: result.score,
        payload: result.payload,
      }));
    } catch (error) {
      console.error('Error searching memory:', error);
      return [];
    }
  }

  /**
   * Ensure a collection exists
   */
  async ensureCollection(collectionName) {
    try {
      const response = await fetch(`${this.baseUrl}/collections/${collectionName}`, {
        method: 'GET',
      });

      if (response.status === 404) {
        // Create collection
        const createResponse = await fetch(`${this.baseUrl}/collections/${collectionName}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            vectors: {
              size: 1536, // OpenAI embedding size
              distance: 'Cosine',
            },
          }),
        });

        if (!createResponse.ok) {
          throw new Error('Failed to create collection');
        }
      }
    } catch (error) {
      console.warn('Collection check failed:', error);
    }
  }
}

export const qdrantService = new QdrantService();

