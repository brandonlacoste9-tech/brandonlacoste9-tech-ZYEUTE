import 'react-native-url-polyfill/auto';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { supabase } from './src/lib/supabase';
import { initializeRealtimeAuth } from './src/lib/realtime';
import { beeRegistry } from './lib/services/bee-registry';
import { sensoryCortex } from './lib/sensory/sensory-cortex';
import { codex } from './lib/memory/codex';
import { healthMonitor } from './lib/health/health-monitor';
import { tiGuyClient } from './lib/services/ti-guy-client';
import AuthStack from './src/navigation/AuthStack';
import AppStack from './src/navigation/AppStack';
import { colors } from './src/theme/colors';

export default function App() {
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (mounted) {
        setSession(data.session);
        setReady(true);
      }
    })();

    // Initialize Realtime auth
    initializeRealtimeAuth();

    // Start health monitoring loop
    healthMonitor.start(60000);

    // Initialize Sensory Cortex (The Body)
    sensoryCortex.initialize().catch(err => {
      console.warn('⚠️  Sensory Cortex initialization failed (non-critical):', err.message);
    });

    // Initialize The Codex (Memory)
    codex.initialize().catch(err => {
      console.warn('⚠️  Codex initialization failed (non-critical):', err.message);
    });

    // Initialize TI-Guy Swarm (Multi-Agent Intelligence)
    tiGuyClient.initializeSwarm().catch(err => {
      console.warn('⚠️  TI-Guy swarm initialization failed (non-critical):', err.message);
    });

    // Listen for auth state changes (session refresh, token rotation)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sess) => {
      if (mounted) {
        setSession(sess);
      }
      
      // Update Realtime auth when session changes
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (sess?.access_token) {
          await supabase.realtime.setAuth(sess.access_token);
        }
      }

      // Register as Bee in Colony OS when user signs in
      if (event === 'SIGNED_IN' && sess?.user) {
        try {
          await beeRegistry.register();
          beeRegistry.startHeartbeat(60); // Heartbeat every 60 seconds
          console.log('🐝 Zyeuté registered as Bee in Colony OS');
        } catch (error) {
          console.warn('⚠️  Bee registration failed (non-critical):', error.message);
        }
      }

      // Stop heartbeat and shutdown sensory cortex when user signs out
      if (event === 'SIGNED_OUT') {
        beeRegistry.stopHeartbeat();
        sensoryCortex.shutdown().catch(err => {
          console.warn('Sensory Cortex shutdown warning:', err.message);
        });
      }
    });

    // Cleanup
    return () => {
      mounted = false;
      subscription?.unsubscribe();
      healthMonitor.stop();
    };
  }, []);

  if (!ready) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.gold} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {session ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
