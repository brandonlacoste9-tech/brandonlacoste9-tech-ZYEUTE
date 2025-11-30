/**
 * Service health check helpers
 * Each checker returns { service, status: 'healthy' | 'degraded' | 'down', latency, message?, error?, timestamp }
 */

import { supabase } from '../../src/lib/supabase';

const nowIso = () => new Date().toISOString();

export async function checkTemporal() {
  const start = Date.now();
  const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
  const temporalUrl = `http://${temporalAddress}/api/v1/namespaces`;

  try {
    const response = await fetch(temporalUrl, { method: 'GET' });
    const latency = Date.now() - start;
    const ok = response.ok;

    return {
      service: 'temporal',
      status: ok ? 'healthy' : 'degraded',
      latency,
      message: ok ? 'namespaces reachable' : `http ${response.status}`,
      timestamp: nowIso(),
    };
  } catch (error) {
    return {
      service: 'temporal',
      status: 'down',
      latency: Date.now() - start,
      error: error.message,
      timestamp: nowIso(),
    };
  }
}

export async function checkLiteLLM() {
  const start = Date.now();
  const baseUrl =
    process.env.LITELLM_URL ||
    process.env.EXPO_PUBLIC_LITELLM_URL ||
    'http://localhost:4000';

  try {
    const response = await fetch(`${baseUrl}/health`, { method: 'GET' });
    const latency = Date.now() - start;

    // Some LiteLLM deployments may not expose /health; treat 404 as degraded
    const ok = response.ok;
    const status = ok ? 'healthy' : 'degraded';

    return {
      service: 'litellm',
      status,
      latency,
      message: ok ? 'health ok' : `http ${response.status}`,
      timestamp: nowIso(),
    };
  } catch (error) {
    return {
      service: 'litellm',
      status: 'down',
      latency: Date.now() - start,
      error: error.message,
      timestamp: nowIso(),
    };
  }
}

export async function checkQdrant() {
  const start = Date.now();
  const baseUrl =
    process.env.QDRANT_URL ||
    process.env.EXPO_PUBLIC_QDRANT_URL ||
    'http://localhost:6333';

  try {
    const response = await fetch(`${baseUrl}/collections`, { method: 'GET' });
    const latency = Date.now() - start;
    const ok = response.ok;

    return {
      service: 'qdrant',
      status: ok ? 'healthy' : 'degraded',
      latency,
      message: ok ? 'collections reachable' : `http ${response.status}`,
      timestamp: nowIso(),
    };
  } catch (error) {
    return {
      service: 'qdrant',
      status: 'down',
      latency: Date.now() - start,
      error: error.message,
      timestamp: nowIso(),
    };
  }
}

export async function checkCentrifugo() {
  const start = Date.now();
  const apiUrl =
    process.env.CENTRIFUGO_API_URL ||
    process.env.EXPO_PUBLIC_CENTRIFUGO_API_URL ||
    'http://localhost:8000';

  try {
    const response = await fetch(`${apiUrl}/health`, { method: 'GET' });
    const latency = Date.now() - start;
    const ok = response.ok;

    return {
      service: 'centrifugo',
      status: ok ? 'healthy' : 'degraded',
      latency,
      message: ok ? 'health ok' : `http ${response.status}`,
      timestamp: nowIso(),
    };
  } catch (error) {
    return {
      service: 'centrifugo',
      status: 'down',
      latency: Date.now() - start,
      error: error.message,
      timestamp: nowIso(),
    };
  }
}

export async function checkSupabase() {
  const start = Date.now();

  try {
    // Simple auth check to validate connectivity
    const { data, error } = await supabase.auth.getSession();
    const latency = Date.now() - start;

    if (error) {
      return {
        service: 'supabase',
        status: 'degraded',
        latency,
        error: error.message,
        timestamp: nowIso(),
      };
    }

    const hasSession = !!data?.session;
    return {
      service: 'supabase',
      status: hasSession ? 'healthy' : 'degraded',
      latency,
      message: hasSession ? 'session active' : 'no session yet',
      timestamp: nowIso(),
    };
  } catch (error) {
    return {
      service: 'supabase',
      status: 'down',
      latency: Date.now() - start,
      error: error.message,
      timestamp: nowIso(),
    };
  }
}

export const serviceChecks = [
  checkTemporal,
  checkLiteLLM,
  checkQdrant,
  checkCentrifugo,
  checkSupabase,
];
