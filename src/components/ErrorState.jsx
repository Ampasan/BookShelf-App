import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function ErrorState({ message }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
  text: { color: '#111827', fontWeight: '700' },
});

