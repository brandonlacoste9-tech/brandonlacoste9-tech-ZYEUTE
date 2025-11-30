/**
 * Centrifugo Client for Colony OS
 * Real-time telemetry streaming
 * 
 * Note: For React Native, we'll use WebSocket directly
 * For production, install: npm install centrifuge
 */

class CentrifugoService {
  constructor() {
    this.ws = null;
    this.connected = false;
    this.subscriptions = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  connect(token) {
    const centrifugoUrl = process.env.CENTRIFUGO_URL || process.env.EXPO_PUBLIC_CENTRIFUGO_URL || 'ws://localhost:8000/connection/websocket';
    
    try {
      // For React Native, use WebSocket directly
      this.ws = new WebSocket(centrifugoUrl);

      this.ws.onopen = () => {
        console.log('✅ Connected to Centrifugo');
        this.connected = true;
        this.reconnectAttempts = 0;
        
        // Send connect message with token
        if (token) {
          this.ws.send(JSON.stringify({
            method: 'connect',
            params: {
              token: token,
            },
          }));
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Error parsing Centrifugo message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('❌ Centrifugo connection error:', error);
      };

      this.ws.onclose = () => {
        console.log('❌ Disconnected from Centrifugo');
        this.connected = false;
        this.attemptReconnect(token);
      };
    } catch (error) {
      console.warn('⚠️  Centrifugo not available:', error.message);
      this.connected = false;
    }
  }

  attemptReconnect(token) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`🔄 Reconnecting to Centrifugo (attempt ${this.reconnectAttempts})...`);
      setTimeout(() => {
        this.connect(token);
      }, 2000 * this.reconnectAttempts); // Exponential backoff
    }
  }

  handleMessage(data) {
    // Handle different message types
    if (data.method === 'publication') {
      const channel = data.params?.channel;
      const subscription = this.subscriptions.get(channel);
      if (subscription && subscription.callback) {
        subscription.callback(data.params?.data);
      }
    }
  }

  /**
   * Subscribe to telemetry channel
   */
  subscribeTelemetry(beeId, callback) {
    const channel = `telemetry:${beeId}`;
    
    if (!this.connected || !this.ws) {
      console.warn('Centrifugo not connected, subscription queued');
      // Queue subscription for when connected
      this.subscriptions.set(channel, { callback, queued: true });
      return { unsubscribe: () => this.subscriptions.delete(channel) };
    }

    // Store subscription
    this.subscriptions.set(channel, { callback });

    // Send subscribe message
    try {
      this.ws.send(JSON.stringify({
        method: 'subscribe',
        params: {
          channel: channel,
        },
      }));
    } catch (error) {
      console.error('Error subscribing:', error);
    }

    return {
      unsubscribe: () => {
        this.subscriptions.delete(channel);
        if (this.ws && this.connected) {
          this.ws.send(JSON.stringify({
            method: 'unsubscribe',
            params: {
              channel: channel,
            },
          }));
        }
      },
    };
  }

  /**
   * Publish telemetry event
   */
  async publishTelemetry(beeId, event) {
    const apiUrl = process.env.CENTRIFUGO_API_URL || process.env.EXPO_PUBLIC_CENTRIFUGO_API_URL || 'http://localhost:8000';
    const apiKey = process.env.CENTRIFUGO_API_KEY || process.env.EXPO_PUBLIC_CENTRIFUGO_API_KEY || '';

    try {
      const response = await fetch(`${apiUrl}/api/publish`, {
        method: 'POST',
        headers: {
          'Authorization': `apikey ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          channel: `telemetry:${beeId}`,
          data: event,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to publish telemetry');
      }

      return response.json();
    } catch (error) {
      console.error('Error publishing telemetry:', error);
      // Silently fail in development
      return { error: error.message };
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.connected = false;
      this.subscriptions.clear();
      console.log('👋 Disconnected from Centrifugo');
    }
  }
}

export const centrifugoService = new CentrifugoService();

