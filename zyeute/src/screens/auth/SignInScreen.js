import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import AuthTextInput from '../../components/AuthTextInput';
import AuthButton from '../../components/AuthButton';
import AuthError from '../../components/AuthError';
import AuthDiagnosticPanel from '../../components/AuthDiagnosticPanel';
import { captureAuthError, formatDiagnosticForDisplay } from '../../lib/utils/authDiagnostics';

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(undefined);

  const toJoual = (e) => {
    const msg = (typeof e === 'string' ? e : e?.message) || 'Une couille est arrivée.';
    if (/email not confirmed/i.test(msg)) return 'Va voir tes courriels pour confirmer, stp.';
    if (/invalid login credentials/i.test(msg)) return 'Tes infos sont pas bonnes, réessaye.';
    if (/too many/i.test(msg)) return 'Wo là, trop d\'essais. Prends une pause pis reviens.';
    return msg;
  };

  const onSignIn = async () => {
    setErr(undefined);
    if (!email || !password) {
      setErr('Entre ton courriel pis ton mot de passe.');
      return;
    }
    setLoading(true);
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      // If email confirmation is enabled, Supabase may still return a session = null for unconfirmed emails
      if (!data.session) {
        navigation.replace('VerifyEmail', { email });
        return;
      }
      // Auth listener in App.js will route to App stack
    } catch (e) {
      // Capture detailed diagnostic information
      const diagnostic = captureAuthError(e, {
        action: 'signIn',
        email: email.substring(0, 3) + '***', // Partial email for privacy
        timestamp: new Date().toISOString(),
      });

      // Extract HTTP status code
      const statusCode = 
        diagnostic.error.status || 
        diagnostic.error.statusCode || 
        diagnostic.supabaseError?.status || 
        diagnostic.supabaseError?.statusCode ||
        diagnostic.networkError?.status ||
        null;

      // Enhanced error handling for network issues
      let errorMessage = toJoual(e);
      
      // Check for network errors
      const errorMsg = e?.message || String(e);
      if (errorMsg.includes('Failed to fetch') || errorMsg.includes('Network request failed') || errorMsg.includes('NetworkError')) {
        errorMessage = 'Problème de connexion. Vérifie ton internet et réessaye.';
        
        // Show diagnostic alert with status code
        if (statusCode) {
          Alert.alert(
            '🔴 Erreur de Connexion',
            `Code HTTP: ${statusCode}\n\n${formatDiagnosticForDisplay(diagnostic)}\n\nCopie ces infos pour le support technique.`,
            [
              { text: 'OK', style: 'default' },
              { 
                text: 'Copier les détails', 
                onPress: () => {
                  // Copy diagnostic to clipboard (would need expo-clipboard)
                  console.log('DIAGNOSTIC TO COPY:', JSON.stringify(diagnostic, null, 2));
                }
              }
            ],
            { cancelable: true }
          );
        }
      } else if (errorMsg.includes('timeout') || errorMsg.includes('TIMEOUT')) {
        errorMessage = 'Ça prend trop de temps. Réessaye dans une seconde.';
      } else if (errorMsg.includes('ECONNREFUSED') || errorMsg.includes('ENOTFOUND')) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifie ta connexion.';
      } else if (statusCode) {
        // If we have a status code, include it in the error
        errorMessage += ` (Code: ${statusCode})`;
      }
      
      setErr(errorMessage);
      
      // Log full diagnostic to console
      console.error('🔴 SIGNIN ERROR DIAGNOSTIC:', diagnostic);
      console.error('HTTP Status Code:', statusCode || 'NOT AVAILABLE');
      console.error('Full Error Object:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.wrap}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.title}>🔥 Se connecter</Text>
          <Text style={styles.subtitle}>Bienvenue sur Zyeuté! ⚜️</Text>

          <AuthTextInput
            placeholder="Courriel"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <AuthTextInput
            placeholder="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <AuthError message={err} />
          <AuthButton title="Se connecter" onPress={onSignIn} loading={loading} />

          <TouchableOpacity onPress={() => navigation.replace('SignUp')}>
            <Text style={styles.link}>Pas de compte? Inscris-toi.</Text>
          </TouchableOpacity>

          {/* Diagnostic Panel - Only show in development or when error occurs */}
          {(__DEV__ || err) && (
            <View style={styles.diagnosticContainer}>
              <AuthDiagnosticPanel />
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    backgroundColor: colors.leather,
    borderRadius: 14,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.gold,
    fontWeight: '800',
    fontSize: 24,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.lightLeather,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  link: {
    color: colors.gold,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
  diagnosticContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
});

