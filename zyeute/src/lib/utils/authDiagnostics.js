/**
 * Auth Diagnostics Tool
 * Captures detailed error information for troubleshooting
 */

export function captureAuthError(error, context = {}) {
  const diagnostic = {
    timestamp: new Date().toISOString(),
    context,
    error: {
      message: error?.message || String(error),
      name: error?.name,
      code: error?.code,
      status: error?.status,
      statusCode: error?.statusCode,
    },
    // Supabase-specific error details
    supabaseError: null,
    // Network error details
    networkError: null,
    // Full error object (stringified for logging)
    fullError: null,
  };

  // Try to extract Supabase error details
  if (error?.error) {
    diagnostic.supabaseError = {
      message: error.error.message,
      status: error.error.status,
      statusCode: error.error.statusCode,
    };
  }

  // Try to extract network error details
  if (error?.response) {
    diagnostic.networkError = {
      status: error.response.status,
      statusText: error.response.statusText,
      data: error.response.data,
    };
  }

  // Capture full error (safe stringification)
  try {
    diagnostic.fullError = JSON.stringify(error, Object.getOwnPropertyNames(error));
  } catch (e) {
    diagnostic.fullError = String(error);
  }

  // Log to console with clear formatting
  console.group('🔴 AUTH ERROR DIAGNOSTIC');
  console.log('Timestamp:', diagnostic.timestamp);
  console.log('Context:', diagnostic.context);
  console.log('Error Message:', diagnostic.error.message);
  console.log('Error Code:', diagnostic.error.code);
  console.log('Status Code:', diagnostic.error.status || diagnostic.error.statusCode);
  
  if (diagnostic.supabaseError) {
    console.log('Supabase Error:', diagnostic.supabaseError);
  }
  
  if (diagnostic.networkError) {
    console.log('Network Error:', diagnostic.networkError);
  }
  
  console.log('Full Error:', diagnostic.fullError);
  console.groupEnd();

  return diagnostic;
}

export function formatDiagnosticForDisplay(diagnostic) {
  const lines = [];
  
  lines.push('🔴 ERREUR DÉTAILLÉE');
  lines.push('');
  lines.push(`Message: ${diagnostic.error.message}`);
  
  if (diagnostic.error.status || diagnostic.error.statusCode) {
    lines.push(`Code HTTP: ${diagnostic.error.status || diagnostic.error.statusCode}`);
  }
  
  if (diagnostic.error.code) {
    lines.push(`Code d'erreur: ${diagnostic.error.code}`);
  }
  
  if (diagnostic.supabaseError) {
    lines.push('');
    lines.push('Erreur Supabase:');
    lines.push(`  Status: ${diagnostic.supabaseError.status || 'N/A'}`);
    lines.push(`  Message: ${diagnostic.supabaseError.message || 'N/A'}`);
  }
  
  if (diagnostic.networkError) {
    lines.push('');
    lines.push('Erreur Réseau:');
    lines.push(`  Status: ${diagnostic.networkError.status || 'N/A'}`);
    lines.push(`  Status Text: ${diagnostic.networkError.statusText || 'N/A'}`);
  }
  
  lines.push('');
  lines.push(`Timestamp: ${diagnostic.timestamp}`);
  
  return lines.join('\n');
}

export async function testSupabaseConnection() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: [],
    overall: 'unknown',
  };

  try {
    // Test 1: Check if Supabase client is initialized
    const { supabase } = await import('../supabase');
    results.tests.push({
      name: 'Supabase Client Initialized',
      status: supabase ? 'pass' : 'fail',
      details: supabase ? 'Client exists' : 'Client is null',
    });

    // Test 2: Check environment variables
    const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
    const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    
    results.tests.push({
      name: 'Environment Variables',
      status: (SUPABASE_URL && SUPABASE_KEY) ? 'pass' : 'fail',
      details: {
        url: SUPABASE_URL ? 'Set' : 'Missing',
        key: SUPABASE_KEY ? 'Set' : 'Missing',
      },
    });

    // Test 3: Test basic API connectivity
    try {
      const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
      results.tests.push({
        name: 'API Connectivity',
        status: error ? 'fail' : 'pass',
        details: error ? { message: error.message, code: error.code } : 'Connected',
      });
    } catch (e) {
      results.tests.push({
        name: 'API Connectivity',
        status: 'fail',
        details: { error: e.message },
      });
    }

    // Test 4: Test auth endpoint
    try {
      // Try to get current session (this will fail if not authenticated, but should not fail with network error)
      const { data: { session }, error } = await supabase.auth.getSession();
      results.tests.push({
        name: 'Auth Endpoint',
        status: error && error.message.includes('Failed to fetch') ? 'fail' : 'pass',
        details: error ? { message: error.message, code: error.code } : 'Endpoint reachable',
      });
    } catch (e) {
      results.tests.push({
        name: 'Auth Endpoint',
        status: 'fail',
        details: { error: e.message, type: e.constructor.name },
      });
    }

    // Calculate overall status
    const failedTests = results.tests.filter(t => t.status === 'fail');
    results.overall = failedTests.length === 0 ? 'pass' : 'fail';

  } catch (e) {
    results.tests.push({
      name: 'Diagnostic Test Execution',
      status: 'fail',
      details: { error: e.message },
    });
    results.overall = 'fail';
  }

  return results;
}

