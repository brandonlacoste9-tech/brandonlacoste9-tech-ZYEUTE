import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';

export default function AuthTextInput(props) {
  return (
    <TextInput
      placeholderTextColor={colors.muted}
      style={styles.input}
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    backgroundColor: colors.leather,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
    fontSize: 16,
  },
});

