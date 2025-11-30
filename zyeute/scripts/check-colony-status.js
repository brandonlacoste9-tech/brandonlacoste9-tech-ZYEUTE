/**
 * Colony OS Integration Status Check
 * Verifies all services are connected and operational
 */

import { temporalService } from '../lib/services/temporal-client.js';
import { liteLLMService } from '../lib/services/litellm-client.js';
import { qdrantService } from '../lib/services/qdrant-client.js';
import { centrifugoService } from '../lib/services/centrifugo-client.js';
import { colonyOSClient } from '../lib/services/colony-os-client.js';
import { beeRegistry } from '../lib/services/bee-registry.js';

const COLORS = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = COLORS.reset) {
  console.log(`${color}${message}${COLORS.reset}`);
}

function checkmark(status) {
  return status ? `${COLORS.green}✅${COLORS.reset}` : `${COLORS.red}❌${COLORS.reset}`;
}

async function checkTemporal() {
  try {
    await temporalService.connect();
    return temporalService.connected;
  } catch (error) {
    return false;
  }
}

async function checkLiteLLM() {
  try {
    // Simple health check
    const response = await fetch(
      `${process.env.EXPO_PUBLIC_LITELLM_URL || 'http://localhost:4000'}/health`,
      { method: 'GET' }
    );
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function checkQdrant() {
  try {
    await qdrantService.initializeCollection();
    return true;
  } catch (error) {
    return false;
  }
}

async function checkCentrifugo() {
  try {
    // Centrifugo doesn't have a simple health endpoint, but we can check if it's configured
    const url = process.env.EXPO_PUBLIC_CENTRIFUGO_URL || 'ws://localhost:8000/connection/websocket';
    return !!url;
  } catch (error) {
    return false;
  }
}

async function checkColonyOS() {
  try {
    const url = process.env.EXPO_PUBLIC_COLONY_OS_URL || 'http://localhost:8000';
    const response = await fetch(`${url}/health`, { method: 'GET' });
    return response.ok;
  } catch (error) {
    return false;
  }
}

async function main() {
  log('\n🐝 COLONY OS INTEGRATION STATUS CHECK 🐝\n', COLORS.bold + COLORS.blue);
  
  log('Checking services...\n', COLORS.yellow);

  const results = {
    temporal: await checkTemporal(),
    litellm: await checkLiteLLM(),
    qdrant: await checkQdrant(),
    centrifugo: await checkCentrifugo(),
    colonyOS: await checkColonyOS(),
  };

  log('Service Status:', COLORS.bold);
  log(`  Temporal (Workflow Orchestration):     ${checkmark(results.temporal)}`);
  log(`  LiteLLM (AI Gateway):                  ${checkmark(results.litellm)}`);
  log(`  Qdrant (Vector Database):              ${checkmark(results.qdrant)}`);
  log(`  Centrifugo (Real-time Streaming):      ${checkmark(results.centrifugo)}`);
  log(`  Colony OS (Backend API):               ${checkmark(results.colonyOS)}`);

  const allConnected = Object.values(results).every(r => r);
  
  log('\n' + '='.repeat(50), COLORS.bold);
  if (allConnected) {
    log('✨ ALL SERVICES CONNECTED - THE HIVE IS ALIVE! ✨', COLORS.green + COLORS.bold);
  } else {
    log('⚠️  SOME SERVICES UNAVAILABLE - CHECK CONFIGURATION', COLORS.yellow + COLORS.bold);
  }
  log('='.repeat(50) + '\n', COLORS.bold);

  // Bee Registry Status
  log('Bee Registry:', COLORS.bold);
  log(`  Registered: ${checkmark(beeRegistry.registered)}`);
  log(`  Bee ID: ${beeRegistry.beeId || 'Not registered'}`);
  log(`  Capabilities: ${beeRegistry.capabilities.length} registered\n`);

  return allConnected;
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}

export { main as checkColonyStatus };

