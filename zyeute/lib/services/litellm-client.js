/**
 * LiteLLM Client for Colony OS
 * AI Gateway with fallbacks and cost tracking
 */

class LiteLLMService {
  constructor() {
    this.baseUrl = process.env.LITELLM_URL || process.env.EXPO_PUBLIC_LITELLM_URL || 'http://localhost:4000';
    this.apiKey = process.env.LITELLM_MASTER_KEY || process.env.EXPO_PUBLIC_LITELLM_KEY || '';
  }

  /**
   * Generate text with automatic model selection and fallbacks
   */
  async generateText(prompt, options = {}) {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: options.model || 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: options.maxTokens || 2000,
          temperature: options.temperature || 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`LiteLLM API error: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        text: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
        cost: this.calculateCost(data.model, data.usage),
      };
    } catch (error) {
      console.error('LiteLLM error:', error);
      // Fallback: return error response
      throw error;
    }
  }

  /**
   * Calculate cost based on model and usage
   */
  calculateCost(model, usage) {
    const pricing = {
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0015, output: 0.002 },
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'gemini-pro': { input: 0.00025, output: 0.0005 },
      'gemini-2.0-flash-thinking': { input: 0.001, output: 0.001 },
    };

    // Extract model name (handle model variants)
    const modelKey = Object.keys(pricing).find(key => model.includes(key)) || 'gpt-4';
    const modelPricing = pricing[modelKey] || { input: 0.01, output: 0.02 };

    const inputCost = (usage.prompt_tokens / 1000) * modelPricing.input;
    const outputCost = (usage.completion_tokens / 1000) * modelPricing.output;

    return {
      inputCost,
      outputCost,
      totalCost: inputCost + outputCost,
      currency: 'USD',
    };
  }

  /**
   * Get embedding for text
   */
  async getEmbedding(text) {
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'text-embedding-ada-002',
          input: text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Embedding API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.data[0].embedding;
    } catch (error) {
      console.error('Embedding error:', error);
      throw error;
    }
  }

  /**
   * Get usage statistics
   */
  async getUsageStats(startDate, endDate) {
    try {
      const response = await fetch(
        `${this.baseUrl}/usage/stats?start_date=${startDate}&end_date=${endDate}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Usage stats error: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('Usage stats error:', error);
      return { error: error.message };
    }
  }
}

export const liteLLMService = new LiteLLMService();

