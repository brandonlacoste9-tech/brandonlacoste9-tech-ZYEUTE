# Colony OS Integration - Zyeuté Bee

This document describes how Zyeuté integrates with Colony OS (The Hive) and the Dream Stack.

## Architecture

```
Zyeuté (React Native App)
    ↓
Colony OS Client (lib/services/colony-os-client.js)
    ↓
Colony OS Backend (Python)
    ↓
Dream Stack Services:
  - Temporal (Workflow Orchestration)
  - LiteLLM (AI Gateway)
  - Qdrant (Vector Database)
  - Centrifugo (Real-time Streaming)
```

## Services

### 1. Temporal Service (`lib/services/temporal-client.js`)
- Workflow orchestration for bee tasks
- Handles task submission, status tracking, cancellation
- Fallback mode if Temporal is unavailable

### 2. LiteLLM Service (`lib/services/litellm-client.js`)
- AI Gateway with automatic model selection
- Cost tracking and optimization
- Embedding generation for semantic search

### 3. Qdrant Service (`lib/services/qdrant-client.js`)
- Vector database for semantic routing
- Stores bee capabilities as embeddings
- Finds best bee for tasks using similarity search

### 4. Centrifugo Service (`lib/services/centrifugo-client.js`)
- Real-time telemetry streaming
- WebSocket-based event broadcasting
- Live dashboard updates

### 5. Colony OS Client (`lib/services/colony-os-client.js`)
- Bridge between Zyeuté and Colony OS backend
- Task submission and status tracking
- Bee registration and telemetry

### 6. Bee Registry (`lib/services/bee-registry.js`)
- Manages Zyeuté's registration as a Bee
- Periodic heartbeat to Colony OS
- Capability management

### 7. TI-Guy Client (`lib/services/ti-guy-client.js`)
- Quebecois AI Assistant interface
- Learns from Quebec community
- Speaks authentic Joual

### 8. Semantic Router (`lib/mind/semantic-router.js`)
- Intelligent task routing using vector similarity
- Scores candidates based on multiple factors
- Explains routing decisions

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file (or use Expo environment variables):

```env
# Colony OS
EXPO_PUBLIC_COLONY_OS_URL=http://localhost:8000

# Temporal
TEMPORAL_ADDRESS=localhost:7233

# LiteLLM
EXPO_PUBLIC_LITELLM_URL=http://localhost:4000
EXPO_PUBLIC_LITELLM_KEY=your-api-key

# Qdrant
EXPO_PUBLIC_QDRANT_URL=http://localhost:6333

# Centrifugo
EXPO_PUBLIC_CENTRIFUGO_URL=ws://localhost:8000/connection/websocket
EXPO_PUBLIC_CENTRIFUGO_API_URL=http://localhost:8000
EXPO_PUBLIC_CENTRIFUGO_API_KEY=your-api-key
```

### 3. Start Services (Docker Compose)

```bash
docker-compose -f docker-compose.integration.yml up -d
```

This starts:
- Temporal (workflow orchestration)
- LiteLLM (AI gateway)
- Qdrant (vector database)
- Centrifugo (real-time streaming)
- Dragonfly (cache)

### 4. Initialize Services

```bash
node scripts/initialize-services.js
```

## Usage

### Bee Registration

Zyeuté automatically registers as a Bee when a user signs in:

```javascript
import { beeRegistry } from './lib/services/bee-registry';

// Automatic on sign-in (handled in App.js)
// Or manually:
await beeRegistry.register();
beeRegistry.startHeartbeat(60); // Heartbeat every 60 seconds
```

### TI-Guy Chat

```javascript
import { tiGuyClient } from './lib/services/ti-guy-client';

const response = await tiGuyClient.chat("Salut TI-Guy!", userId);
console.log(response.reply); // Response in Joual
```

### Task Submission

```javascript
import { colonyOSClient } from './lib/services/colony-os-client';

const task = await colonyOSClient.submitTask({
  description: "Generate Quebec-themed content",
  requirements: { language: "joual", theme: "quebec" },
  priority: 7,
});
```

### Semantic Routing

```javascript
import { semanticRouter } from './lib/mind/semantic-router';

const routing = await semanticRouter.routeTask({
  description: "Create Quebec social media post",
  requirements: ["social_media", "quebec_community"],
  priority: 8,
});

console.log(routing.selectedBee); // Best bee for the task
```

## Cost Tracking

```javascript
import { costTracker } from './lib/services/cost-tracker';

await costTracker.trackCost({
  userId: 'user-123',
  model: 'gemini-2.0-flash-thinking',
  inputTokens: 100,
  outputTokens: 200,
  cost: { totalCost: 0.001 },
});

const stats = costTracker.getStats();
console.log(stats.today.cost); // Today's total cost
```

## Telemetry

```javascript
import { colonyOSClient } from './lib/services/colony-os-client';

await colonyOSClient.sendTelemetry({
  type: 'user.action',
  beeId: 'zyeute',
  data: {
    action: 'post_created',
    userId: 'user-123',
  },
});
```

## Real-time Updates

```javascript
import { centrifugoService } from './lib/services/centrifugo-client';

centrifugoService.connect(token);

const subscription = centrifugoService.subscribeTelemetry('hive', (data) => {
  console.log('Telemetry event:', data);
});

// Cleanup
subscription.unsubscribe();
```

## Integration Status

✅ **Completed:**
- Service clients (Temporal, LiteLLM, Qdrant, Centrifugo)
- Bee registration workflow
- Semantic routing with Qdrant
- Real-time telemetry with Centrifugo
- Colony OS API bridge
- Cost tracking
- TI-Guy client
- Docker Compose setup

🔄 **Next Steps:**
- Create TI-Guy UI component in Zyeuté
- Add telemetry dashboard
- Implement cost optimization strategies
- Set up production deployments

## Notes

- All services have fallback modes if unavailable
- Non-critical operations (telemetry, cost tracking) fail gracefully
- Services are initialized automatically on app start
- Bee registration happens automatically on user sign-in

## The Hive Connection

Zyeuté feeds The Hive (Colony OS) with:
- User interactions and engagement
- Quebec community data and culture
- Joual language patterns
- Content preferences
- Social graph data

The Hive learns and grows from all Bees, making TI-Guy smarter over time.

