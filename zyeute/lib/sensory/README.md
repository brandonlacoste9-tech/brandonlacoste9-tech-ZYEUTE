# Sensory Cortex - The Body

The Sensory Cortex is the sensory input layer of Colony OS, responsible for collecting and processing all sensory data from Zyeuté users.

## Overview

The Sensory Cortex acts as "The Body" in the Colony OS architecture, sensing and processing:

- **Visual**: Images, media content
- **Textual**: Posts, comments, captions
- **Social**: Reactions, follows, interactions
- **Temporal**: Timing patterns, engagement windows
- **Behavioral**: User preferences, engagement patterns
- **Emotional**: Sentiment analysis, reaction types

## Architecture

```
User Actions (Zyeuté App)
    ↓
Sensory Cortex (The Body)
    ↓
Processing & Enrichment
    ↓
Colony OS (The Hive)
```

## Sensory Modalities

### 1. Visual Sensing
- Image uploads trigger visual feature extraction
- Detects objects, scenes, and visual patterns
- Feeds to vision models (Open-Sora, Stable Diffusion)

### 2. Textual Sensing
- Captures all text content (posts, comments)
- Extracts semantic embeddings via LiteLLM
- Detects language (Quebec French, English)
- Analyzes sentiment

### 3. Social Sensing
- Tracks reactions (like, love, haha, wow, sad, angry)
- Monitors follows/unfollows
- Maps social graph edges
- Measures engagement patterns

### 4. Emotional Sensing
- Analyzes reaction types for emotional value
- Sentiment analysis on comments
- Tracks emotional patterns over time

### 5. Behavioral Sensing
- User action patterns
- Engagement timing
- Content preferences
- Interaction frequency

## Data Flow

1. **Collection**: Real-time listeners capture events from Supabase
2. **Processing**: Events are enriched with:
   - Semantic embeddings
   - Visual features
   - Sentiment analysis
   - Language detection
3. **Buffering**: Events are batched (10 events or 30 seconds)
4. **Transmission**: Batches are sent to Colony OS telemetry

## Usage

### Automatic Initialization

The Sensory Cortex initializes automatically when the app starts:

```javascript
// In App.js
import { sensoryCortex } from './lib/sensory/sensory-cortex';

// Automatically initialized on app start
```

### Manual Sensing

You can manually sense custom user actions:

```javascript
import { sensoryCortex } from './lib/sensory/sensory-cortex';

// Sense a custom user action
await sensoryCortex.senseUserAction('screen_view', {
  screen_name: 'ProfileScreen',
  user_id: 'user-123',
  duration: 5000,
});
```

### Get Statistics

```javascript
const stats = sensoryCortex.getStats();
console.log(`Buffer size: ${stats.buffer_size}`);
console.log(`Active: ${stats.active}`);
```

## Event Types

The Sensory Cortex captures these event types:

- `publication.created` - New post with visual/textual data
- `publication.updated` - Post modifications
- `comment.created` - New comment with sentiment
- `reaction.added` - Emotional engagement
- `reaction.removed` - Emotional disengagement
- `follow.created` - Social graph expansion
- `user.action.*` - Custom behavioral events

## Configuration

### Buffer Settings

- **Buffer Size**: 10 events (configurable)
- **Flush Interval**: 30 seconds (configurable)

### Processing Options

- **Semantic Extraction**: Enabled by default
- **Visual Features**: Enabled when images present
- **Sentiment Analysis**: Enabled for text content
- **Language Detection**: Automatic

## Integration with Colony OS

All sensory data flows to Colony OS via:

1. **Telemetry Endpoint**: `/telemetry`
2. **Event Type**: `sensory.batch`
3. **Bee ID**: `zyeute`

The Hive processes this data to:
- Learn user preferences
- Improve TI-Guy responses
- Understand Quebec community patterns
- Optimize content recommendations
- Track engagement metrics

## Privacy & Security

- All sensory data respects user privacy settings
- No personal information is extracted without consent
- Data is anonymized where possible
- RLS policies apply to all data access

## Performance

- Non-blocking: All operations are async
- Graceful degradation: Failures don't break the app
- Batching: Reduces API calls
- Buffering: Handles network issues

## Future Enhancements

- [ ] Real-time vision model integration (Open-Sora)
- [ ] Advanced sentiment analysis
- [ ] Multi-modal embeddings (text + image)
- [ ] Predictive behavioral modeling
- [ ] Real-time anomaly detection
- [ ] Custom sensory modalities

---

**The Body senses. The Mind thinks. The Will decides. Memory remembers.**

*Sensory Cortex - Part of Colony OS Magnum Opus*

