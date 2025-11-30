import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../lib/supabase';
import { tiGuyClient } from '../../lib/services/ti-guy-client';
import { colors } from '../theme/colors';
import GraphVisualization from '../components/GraphVisualization';

export default function TIGuyScreen() {
  const [userId, setUserId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'tiguy',
      text: "Hey salut! J'suis TI-Guy. Envoie-moi quelque chose pis on jase en Joual.",
      meta: { swarmEnabled: false },
    },
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [swarmStatus, setSwarmStatus] = useState({ enabled: false });
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [visualizing, setVisualizing] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const bootstrap = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        if (mounted) {
          setUserId(data?.user?.id || null);
        }

        await tiGuyClient.initializeSwarm();
        const status = await tiGuyClient.getSwarmStatus();
        if (mounted) {
          setSwarmStatus(status);
        }
      } catch (err) {
        if (mounted) {
          setSwarmStatus({ enabled: false, error: err.message });
        }
      } finally {
        if (mounted) setInitializing(false);
      }
    };

    bootstrap();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshStatus = async () => {
    try {
      const status = await tiGuyClient.getSwarmStatus();
      setSwarmStatus(status);
    } catch (err) {
      setSwarmStatus({ enabled: false, error: err.message });
    }
  };

  const onSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    scrollToBottom();

    try {
      const response = await tiGuyClient.chat(trimmed, userId);
      const reply = response?.reply || "J'peux pas répondre asteur. Réessaye plus tard.";

      setMessages(prev => [
        ...prev,
        {
          id: `tiguy-${Date.now()}`,
          sender: 'tiguy',
          text: reply,
          meta: {
            swarmEnabled: response?.swarmEnabled || false,
            agents: response?.agents || [],
            confidence: response?.confidence,
          },
        },
      ]);

      // Refresh status after a chat to reflect current swarm state
      refreshStatus();
    } catch (err) {
      setError(err.message);
      setMessages(prev => [
        ...prev,
        {
          id: `tiguy-${Date.now()}`,
          sender: 'tiguy',
          text: "Oups, j'ai eu un pépin. On réessaie tantôt.",
          meta: { swarmEnabled: false },
        },
      ]);
    } finally {
      setSending(false);
      scrollToBottom();
    }
  };

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const visualizeThought = async (text) => {
    if (!text || visualizing) return;
    
    setVisualizing(true);
    setGraphData(null);
    setError(null);

    try {
      const result = await tiGuyClient.structureThought(text);
      
      if (result.success) {
        setGraphData({
          graph: result.graph,
          metadata: result.metadata,
        });
      } else {
        setError(result.error || 'Impossible de visualiser la pensée');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setVisualizing(false);
    }
  };

  const dispatchToSwarm = async () => {
    const trimmed = input.trim();
    if (!trimmed || dispatching || sending) return;
    
    setDispatching(true);
    setError(null);

    const userMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      meta: { dispatched: true },
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    scrollToBottom();

    try {
      // Dispatch to swarm for multi-agent collaboration
      const { tiGuySwarmAdapter } = require('../../zyeute-colony-bridge/adapters/ti-guy-swarm-adapter');
      
      const dispatchResult = await tiGuySwarmAdapter.executeSwarmTask({
        description: trimmed,
        requirements: {
          userId,
          conversationHistory: tiGuyClient.getHistory(userId, 5),
          language: 'joual',
          culturalContext: 'quebec',
        },
        tags: ['ti-guy', 'dispatch', 'user-query'],
        priority: 7,
      });

      if (dispatchResult.success) {
        const reply = dispatchResult.result || 
          "J'ai dispatché ça au swarm, mais j'ai pas eu de réponse claire. Réessaye avec 'Envoyer' pour une réponse directe.";

        setMessages(prev => [
          ...prev,
          {
            id: `tiguy-${Date.now()}`,
            sender: 'tiguy',
            text: reply,
            meta: {
              swarmEnabled: true,
              dispatched: true,
              agents: dispatchResult.agents || [],
              taskId: dispatchResult.taskId,
            },
          },
        ]);
      } else {
        throw new Error(dispatchResult.error || 'Dispatch failed');
      }

      refreshStatus();
    } catch (err) {
      setError(err.message);
      setMessages(prev => [
        ...prev,
        {
          id: `tiguy-${Date.now()}`,
          sender: 'tiguy',
          text: "Oups, le dispatch au swarm a pas marché. Essaie avec 'Envoyer' à place.",
          meta: { swarmEnabled: false, dispatched: false },
        },
      ]);
    } finally {
      setDispatching(false);
      scrollToBottom();
    }
  };

  const statusColor = swarmStatus.enabled ? colors.success : colors.muted;
  const statusText = swarmStatus.enabled ? 'Swarm connecté' : 'Mode solo';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <Text style={styles.title}>TI-Guy (Joual)</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.visualizeButton}
            onPress={() => visualizeThought(input || messages[messages.length - 1]?.text)}
            disabled={visualizing || (!input && messages.length === 1)}
          >
            {visualizing ? (
              <ActivityIndicator size="small" color={colors.gold} />
            ) : (
              <Text style={styles.visualizeText}>🧠</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.statusPill} onPress={refreshStatus}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={styles.statusText}>{statusText}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {initializing ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.gold} />
          <Text style={styles.meta}>Initialisation du swarm...</Text>
        </View>
      ) : (
        <>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {swarmStatus.error ? (
            <Text style={styles.meta}>Swarm off: {swarmStatus.error}</Text>
          ) : null}

          {graphData && (
            <GraphVisualization 
              graph={graphData.graph} 
              metadata={graphData.metadata}
            />
          )}

          <ScrollView
            ref={scrollViewRef}
            contentContainerStyle={styles.messages}
            onContentSizeChange={scrollToBottom}
          >
            {messages.map(msg => (
              <View
                key={msg.id}
                style={[
                  styles.message,
                  msg.sender === 'user' ? styles.messageUser : styles.messageTIGuy,
                ]}
              >
                <Text style={styles.messageSender}>
                  {msg.sender === 'user' ? 'Toi' : 'TI-Guy'}
                </Text>
                <Text style={styles.messageText}>{msg.text}</Text>
                {msg.meta?.dispatched ? (
                  <Text style={styles.meta}>🐝 Dispatché au swarm</Text>
                ) : null}
                {msg.meta?.swarmEnabled ? (
                  <Text style={styles.meta}>Swarm réponse (agents: {msg.meta.agents?.length || 0})</Text>
                ) : null}
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputRow}>
            <TextInput
              style={styles.input}
              placeholder="Dis-lui quelque chose en Joual..."
              placeholderTextColor={colors.muted}
              value={input}
              onChangeText={setInput}
              onSubmitEditing={onSend}
              editable={!sending && !dispatching}
            />
            <TouchableOpacity
              style={[
                styles.dispatchButton,
                (dispatching || sending || !swarmStatus.enabled) && styles.dispatchButtonDisabled
              ]}
              onPress={dispatchToSwarm}
              disabled={dispatching || sending || !swarmStatus.enabled}
            >
              {dispatching ? (
                <ActivityIndicator size="small" color={colors.gold} />
              ) : (
                <Text style={styles.dispatchText}>🐝</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.sendButton, (sending || dispatching) && styles.sendButtonDisabled]}
              onPress={onSend}
              disabled={sending || dispatching}
            >
              {sending ? (
                <ActivityIndicator color={colors.bg} />
              ) : (
                <Text style={styles.sendText}>Envoyer</Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  visualizeButton: {
    backgroundColor: colors.leather,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  visualizeText: {
    fontSize: 16,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '700',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.leather,
    borderColor: colors.border,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  statusText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  messages: {
    paddingVertical: 8,
  },
  message: {
    padding: 10,
    borderRadius: 10,
    marginBottom: 8,
    maxWidth: '90%',
  },
  messageUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.leather,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageTIGuy: {
    alignSelf: 'flex-start',
    backgroundColor: '#2F261C',
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageSender: {
    color: colors.muted,
    fontSize: 11,
    marginBottom: 2,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
  },
  meta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4,
  },
  error: {
    color: colors.danger,
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#2F261C',
    color: colors.text,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  dispatchButton: {
    backgroundColor: colors.leather,
    borderColor: colors.gold,
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dispatchButtonDisabled: {
    opacity: 0.5,
    borderColor: colors.muted,
  },
  dispatchText: {
    fontSize: 18,
  },
  sendButton: {
    backgroundColor: colors.gold,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendText: {
    color: colors.bg,
    fontWeight: '700',
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
