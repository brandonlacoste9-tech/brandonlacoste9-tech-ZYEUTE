import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function AuthError({ message }) {
  if (!message) return null;
  return <Text style={styles.err}>{message}</Text>;
}

const styles = StyleSheet.create({
  err: {
    color: colors.danger,
    marginBottom: 12,
    fontSize: 14,
    textAlign: 'center',
  },
});

