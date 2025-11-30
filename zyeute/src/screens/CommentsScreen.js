import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { colors } from '../theme/colors';
import { supabase } from '../lib/supabase';
import { subscribeToComments, unsubscribe } from '../lib/realtime';
import CommentItem from '../components/CommentItem';
import CommentComposer from '../components/CommentComposer';

export default function CommentsScreen({ route, navigation }) {
  const { publicationId } = route.params || {};
  const [comments, setComments] = useState([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [paging, setPaging] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [sending, setSending] = useState(false);
  const pageSize = 20;
  const reachedEndRef = useRef(false);
  const channelRef = useRef(null);

  useEffect(() => {
    navigation.setOptions({
      title: '💬 Commentaires',
    });
  }, [navigation]);

  const fetchPage = useCallback(async (opts = { reset: false }) => {
    if (paging) return;
    setPaging(true);
    try {
      const from = opts.reset ? 0 : comments.length;
      const to = from + pageSize - 1;

      const query = supabase
        .from('commentaires')
        .select(`
          id,
          publication_id,
          user_id,
          content,
          created_at,
          user_profiles:user_id (
            id,
            email
          )
        `)
        .eq('publication_id', publicationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .range(from, to);

      const { data, error } = await query;
      if (error) throw error;

      if (opts.reset) {
        setComments(data || []);
        reachedEndRef.current = (data?.length || 0) < pageSize;
      } else {
        setComments((prev) => {
          const next = [...prev, ...(data || [])];
          return next;
        });
        if ((data?.length || 0) < pageSize) reachedEndRef.current = true;
      }
    } catch (e) {
      Alert.alert('Oups', 'On peut pas charger les commentaires là, réessaye plus tard.');
      console.error('fetch comments error', e);
    } finally {
      setPaging(false);
      setInitialLoading(false);
      if (refreshing) setRefreshing(false);
    }
  }, [paging, comments.length, publicationId, refreshing, pageSize]);

  useEffect(() => {
    fetchPage({ reset: true });
  }, [publicationId]);

  // Realtime subscription for this publication
  useEffect(() => {
    if (!publicationId) return;

    const channel = subscribeToComments(publicationId, (eventType, payload) => {
      const { record, old_record } = payload;
      
      if (eventType === 'INSERT') {
        // Fetch user profile for new comment
        (async () => {
          const { data: profileData } = await supabase
            .from('user_profiles')
            .select('id, email')
            .eq('id', record.user_id)
            .single();
          
          const newComment = {
            ...record,
            user_profiles: profileData,
          };
          
          setComments((prev) => [newComment, ...prev]);
        })();
      } else if (eventType === 'UPDATE') {
        setComments((prev) =>
          prev.map((c) => (c.id === record.id ? { ...c, ...record } : c))
        );
      } else if (eventType === 'DELETE') {
        setComments((prev) => prev.filter((c) => c.id !== old_record.id));
      }
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        unsubscribe(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [publicationId]);

  const onRefresh = async () => {
    reachedEndRef.current = false;
    setRefreshing(true);
    await fetchPage({ reset: true });
  };

  const onEndReached = async () => {
    if (initialLoading || paging || reachedEndRef.current) return;
    await fetchPage();
  };

  const sendComment = useCallback(async (text, clearCb) => {
    setSending(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        Alert.alert('Erreur', 'Tu dois être connecté pour commenter!');
        return;
      }

      const { data, error } = await supabase
        .from('commentaires')
        .insert([
          {
            publication_id: publicationId,
            content: text,
            user_id: user.id,
          },
        ])
        .select(`
          id,
          publication_id,
          user_id,
          content,
          created_at,
          user_profiles:user_id (
            id,
            email
          )
        `)
        .single();

      if (error) throw error;

      // Optimistic: already inserted and returned
      setComments((prev) => [data, ...prev]);
      clearCb?.();
    } catch (e) {
      Alert.alert('Oups', 'Ton commentaire a pas pu être envoyé. Réessaye, stp.');
      console.error('insert comment error', e);
    } finally {
      setSending(false);
    }
  }, [publicationId]);

  const renderItem = useCallback(({ item }) => <CommentItem comment={item} />, []);
  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={styles.wrap}>
      {initialLoading ? (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color={colors.gold} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={comments}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor={colors.gold}
              />
            }
            onEndReachedThreshold={0.5}
            onEndReached={onEndReached}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Aucun commentaire pour le moment</Text>
                <Text style={styles.emptySubtext}>Soyez le premier à commenter! 💬</Text>
              </View>
            }
          />
          <CommentComposer onSubmit={sendComment} loading={sending} />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  list: {
    padding: 16,
    paddingBottom: 96,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.gold,
    marginTop: 12,
    fontSize: 16,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.gold,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    color: colors.muted,
    fontSize: 14,
  },
});

