import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { colors } from '../../theme/colors';
import { supabase } from '../../lib/supabase';
import AuthButton from '../../components/AuthButton';
import AuthError from '../../components/AuthError';

export default function VerifyEmailScreen({ route, navigation }) {
  const { email } = route.params || {};
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState(undefined);
  const [info, setInfo] = useState(undefined);

  const toJoual = (e) => {
    const msg = (typeof e === 'string' ? e : e?.message) || 'Oups, p\'tit pépin.';
    if (/rate limit/i.test(msg)) return 'Attends un brin avant de renvoyer le courriel.';
    return msg;
  };

  const resend = async () => {
    if (!email) return;
    setErr(undefined);
    setInfo(undefined);
    setLoading(true);
    try {
      // Send a fresh magic-link style confirmation
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: 'exp://127.0.0.1:8081',
        },
      });
      if (error) throw error;
      setInfo('On a renvoyé un courriel. Va voir ta boîte, mon chum.');
    } catch (e) {
      setErr(toJoual(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
      <View style={styles.card}>
        <Text style={styles.title}>📧 Va confirmer ton courriel</Text>
        <Text style={styles.subtitle}>
          On a envoyé un lien à {email || 'ton courriel'}. Clique là-dessus pour activer ton compte.
        </Text>

        <AuthError message={err} />
        {!!info && <Text style={styles.info}>{info}</Text>}

        <AuthButton title="Renvoyer le courriel" onPress={resend} loading={loading} />

        <TouchableOpacity onPress={() => navigation.replace('SignIn')}>
          <Text style={styles.link}>Retour à la connexion</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: colors.bg,
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
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.text,
    marginBottom: 24,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  info: {
    color: colors.success,
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    color: colors.gold,
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
  },
});

