# The Codex - Memory

The Codex is the memory layer of Colony OS, responsible for storing and retrieving knowledge, patterns, and experiences learned from all Bees in The Hive.

## Overview

The Codex acts as "Memory" in the Colony OS architecture, remembering:

- **User Patterns**: Behavioral patterns, preferences, engagement styles
- **Content Insights**: Trends, popular content, community patterns
- **Quebec Culture**: Joual expressions, cultural references, local knowledge
- **Social Knowledge**: Social graph patterns, relationship dynamics
- **Emotional Patterns**: Sentiment trends, reaction patterns
- **Cross-Bee Knowledge**: Insights shared from other Bees in The Hive

## Architecture

```
Sensory Cortex (The Body)
    ↓
The Codex (Memory)
    ↓
Qdrant (Vector Storage)
    ↓
Colony OS (The Hive) - Shared Knowledge
```

## Memory Types

### 1. Patterns
User behavioral patterns and preferences:
```javascript
await codex.rememberPattern(userId, 'engagement_time', {
  preferredHours: [18, 19, 20],
  confidence: 0.85,
});
```

### 2. Preferences
User preferences and settings:
```javascript
await codex.rememberPreference(userId, 'content_type', 'images');
```

### 3. Insights
Global insights and trends:
```javascript
await codex.rememberInsight({
  description: 'Quebec users prefer evening engagement',
  category: 'engagement',
  confidence: 0.9,
  source: 'analytics',
});
```

### 4. Quebec Culture
Joual and cultural patterns:
```javascript
await codex.rememberQuebecPattern({
  type: 'joual',
  text: 'tsé',
  meaning: 'tu sais',
  usage: 'conversational',
  frequency: 150,
});
```

## Usage

### Remembering

```javascript
import { codex } from './lib/memory/codex';

// Remember a user pattern
await codex.rememberPattern(userId, 'posting_frequency', {
  averagePostsPerDay: 2.5,
  peakDays: ['Friday', 'Saturday'],
});

// Remember a preference
await codex.rememberPreference(userId, 'language', 'joual');

// Remember an insight
await codex.rememberInsight({
  description: 'Image posts get 3x more engagement',
  category: 'content',
  confidence: 0.95,
});
```

### Recalling

```javascript
// Search memories by query
const memories = await codex.recall('user engagement patterns', {
  type: 'pattern',
  userId: 'user-123',
  limit: 5,
});

// Query The Codex
const answer = await codex.query('What content does this user prefer?', {
  userId: 'user-123',
});
```

### Getting Patterns

```javascript
// Get a specific pattern
const pattern = codex.getPattern(userId, 'engagement_time');
if (pattern) {
  console.log('User prefers:', pattern.preferredHours);
}
```

## Integration with The Hive

The Codex shares memories with The Hive and receives shared knowledge:

1. **Sharing**: All memories are shared with Colony OS
2. **Receiving**: Loads patterns and insights from other Bees
3. **Learning**: Cross-Bee knowledge improves all Bees

## Storage

- **Qdrant**: Vector embeddings for semantic search
- **Local Cache**: In-memory patterns for fast access
- **The Hive**: Shared knowledge repository

## Statistics

```javascript
const stats = codex.getStats();
console.log(`Patterns: ${stats.patterns_count}`);
console.log(`Knowledge Base: ${stats.knowledge_base_size} items`);
```

## Automatic Initialization

The Codex initializes automatically when the app starts:

```javascript
// In App.js - already integrated
codex.initialize();
```

## Privacy

- User-specific memories are scoped to user IDs
- Global insights are anonymized
- All data respects user privacy settings
- RLS policies apply to all memory access

## Future Enhancements

- [ ] Advanced memory synthesis using LLMs
- [ ] Temporal memory (forgetting old patterns)
- [ ] Memory compression and summarization
- [ ] Cross-modal memory (text + image)
- [ ] Predictive memory (anticipating needs)
- [ ] Memory visualization

---

**The Body senses. The Mind thinks. The Will decides. Memory remembers.**

*The Codex - Part of Colony OS Magnum Opus*

