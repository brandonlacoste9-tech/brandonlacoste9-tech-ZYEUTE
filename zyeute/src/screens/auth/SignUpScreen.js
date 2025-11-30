import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import AuthTextInput from '../../components/AuthTextInput';
import AuthButton from '../../components/AuthButton';
import AuthError from '../../components/AuthError';
import AuthDiagnosticPanel from '../../components/AuthDiagnosticPanel';
import { captureAuthError, formatDiagnosticForDisplay } from '../../lib/utils/authDiagnostics';

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(undefined);

  const toJoual = (e) => {
    const msg = (typeof e === 'string' ? e : e?.message) || 'Quelque chose a foiré.';
    if (/email/i.test(msg) && /already/i.test(msg)) return 'Cet email-là est déjà pris, mon chum.';
    if (/password/i.test(msg) && /short/i.test(msg)) return 'Ton mot de passe est trop court, mets-en un plus solide.';
    if (/invalid login credentials/i.test(msg)) return 'Tes infos marchent pas. Vérifie donc.';
    return msg;
  };

  const onSignUp = async () => {
    setErr(undefined);
    if (!email || !password || !confirm) {
      setErr('Remplis tous les champs, tsé.');
      return;
    }
    if (password !== confirm) {
      setErr('Tes mots de passe matchent pas.');
      return;
    }
    if (password.length < 6) {
      setErr('Ton mot de passe doit avoir au moins 6 caractères.');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'exp://127.0.0.1:8081',
        },
      });
      if (error) throw error;
      navigation.replace('VerifyEmail', { email });
    } catch (e) {
      // Capture detailed diagnostic information
      const diagnostic = captureAuthError(e, {
        action: 'signUp',
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
      console.error('🔴 SIGNUP ERROR DIAGNOSTIC:', diagnostic);
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
          <Text style={styles.title}>🔥 Créer un compte</Text>
          <Text style={styles.subtitle}>Rejoins la gang de Zyeuté! ⚜️</Text>

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
          <AuthTextInput
            placeholder="Confirme ton mot de passe"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />

          <AuthError message={err} />
          <AuthButton title="S'inscrire" onPress={onSignUp} loading={loading} />

          <TouchableOpacity onPress={() => navigation.replace('SignIn')}>
            <Text style={styles.link}>T'as déjà un compte? Connecte-toi.</Text>
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

