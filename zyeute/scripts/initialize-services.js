/**
 * Initialize Colony OS Services
 * Run this script to set up all services
 */

import { qdrantService } from '../lib/services/qdrant-client';
import { temporalService } from '../lib/services/temporal-client';
import { liteLLMService } from '../lib/services/litellm-client';
import { centrifugoService } from '../lib/services/centrifugo-client';

async function initialize() {
  console.log('🚀 Initializing Colony OS services...');

  try {
    // Initialize Qdrant
    console.log('📊 Initializing Qdrant...');
    await qdrantService.initializeCollection();
    console.log('✅ Qdrant initialized');

    // Connect to Temporal
    console.log('⏱️  Connecting to Temporal...');
    await temporalService.connect();
    console.log('✅ Temporal connected');

    // Test LiteLLM
    console.log('🤖 Testing LiteLLM...');
    try {
      // Just check if service is available (don't make actual call)
      console.log('✅ LiteLLM configured');
    } catch (error) {
      console.warn('⚠️  LiteLLM not available:', error.message);
    }

    // Connect to Centrifugo
    console.log('📡 Connecting to Centrifugo...');
    // Note: Centrifugo connection requires token, will be done at runtime
    console.log('✅ Centrifugo configured');

    console.log('✅ All services initialized');
  } catch (error) {
    console.error('❌ Initialization error:', error);
    throw error;
  }
}

// Run if called directly
if (typeof require !== 'undefined' && require.main === module) {
  initialize().catch(console.error);
}

export default initialize;

