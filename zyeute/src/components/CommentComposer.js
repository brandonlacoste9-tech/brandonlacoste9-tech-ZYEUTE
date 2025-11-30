import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import AuthButton from './AuthButton';

export default function CommentComposer({ onSubmit, loading }) {
  const [text, setText] = useState('');

  const handleSend = async () => {
    if (!text.trim()) return;
    await onSubmit(text.trim(), () => setText(''));
  };

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        placeholder="Écris un commentaire en Joual..."
        placeholderTextColor={colors.muted}
        value={text}
        onChangeText={setText}
        multiline
        maxLength={500}
        editable={!loading}
      />
      <AuthButton
        title="Envoyer"
        onPress={handleSend}
        loading={loading}
        style={styles.button}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    padding: 12,
    backgroundColor: colors.leather,
  },
  input: {
    backgroundColor: colors.bg,
    color: colors.text,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    minHeight: 44,
    fontSize: 14,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 0,
  },
});

