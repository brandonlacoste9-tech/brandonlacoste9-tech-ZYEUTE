import { supabase } from './supabase';

/**
 * Subscribe to publication changes from a specific author
 * @param {string} authorId - The user_id of the author
 * @param {Function} onEvent - Callback (eventType, payload) => void
 * @returns {RealtimeChannel} - Channel instance for cleanup
 */
export const subscribeToAuthorPublications = (authorId, onEvent) => {
  const channel = supabase.channel(`publication:${authorId}:changes`, {
    config: { private: true }
  });

  channel
    .on('broadcast', { event: 'INSERT' }, (payload) => onEvent('INSERT', payload))
    .on('broadcast', { event: 'UPDATE' }, (payload) => onEvent('UPDATE', payload))
    .on('broadcast', { event: 'DELETE' }, (payload) => onEvent('DELETE', payload))
    .subscribe();

  return channel;
};

/**
 * Subscribe to comment changes for a specific publication
 * @param {string} publicationId - The publication ID
 * @param {Function} onEvent - Callback (eventType, payload) => void
 * @returns {RealtimeChannel} - Channel instance for cleanup
 */
export const subscribeToComments = (publicationId, onEvent) => {
  const channel = supabase.channel(`comments:${publicationId}:changes`, {
    config: { private: true }
  });

  channel
    .on('broadcast', { event: 'INSERT' }, (payload) => onEvent('INSERT', payload))
    .on('broadcast', { event: 'UPDATE' }, (payload) => onEvent('UPDATE', payload))
    .on('broadcast', { event: 'DELETE' }, (payload) => onEvent('DELETE', payload))
    .subscribe();

  return channel;
};

/**
 * Subscribe to reaction changes for a specific publication
 * @param {string} publicationId - The publication ID
 * @param {Function} onEvent - Callback (eventType, payload) => void
 * @returns {RealtimeChannel} - Channel instance for cleanup
 */
export const subscribeToReactions = (publicationId, onEvent) => {
  const channel = supabase.channel(`reactions:${publicationId}:changes`, {
    config: { private: true }
  });

  channel
    .on('broadcast', { event: 'INSERT' }, (payload) => onEvent('INSERT', payload))
    .on('broadcast', { event: 'UPDATE' }, (payload) => onEvent('UPDATE', payload))
    .on('broadcast', { event: 'DELETE' }, (payload) => onEvent('DELETE', payload))
    .subscribe();

  return channel;
};

/**
 * Unsubscribe from a channel
 * @param {RealtimeChannel} channel - Channel to unsubscribe from
 */
export const unsubscribe = (channel) => {
  if (channel) {
    supabase.removeChannel(channel);
  }
};

/**
 * Initialize Realtime auth (call after login/session refresh)
 */
export const initializeRealtimeAuth = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.access_token) {
    await supabase.realtime.setAuth(session.access_token);
  }
};

