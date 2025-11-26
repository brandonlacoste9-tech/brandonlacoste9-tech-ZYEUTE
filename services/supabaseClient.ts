import { createClient } from '@supabase/supabase-js';

// Helper to safely access env vars without crashing
const getEnv = (key: string) => {
  try {
    const meta = import.meta as any;
    return (meta.env && meta.env[key]) || '';
  } catch (e) {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseKey = getEnv('VITE_SUPABASE_ANON_KEY');

// If keys are missing, return a Mock client to allow the UI to render
export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : {
      auth: {
        getSession: async () => ({ data: { session: null } }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: async () => ({ error: { message: "API Keys missing. Configure VITE_SUPABASE_URL." } }),
        signInWithPassword: async () => ({ error: { message: "API Keys missing. Configure VITE_SUPABASE_URL." } }),
        signUp: async () => ({ error: { message: "API Keys missing. Configure VITE_SUPABASE_URL." } }),
      },
      from: () => ({
        select: () => ({
          order: async () => ({ data: [], error: null })
        })
      })
    } as any;
