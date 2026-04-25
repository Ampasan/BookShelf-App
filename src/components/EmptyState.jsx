import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function EmptyState({ title = 'Kosong', message }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>—</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 22, fontWeight: '900', color: '#9ca3af' },
  title: { fontSize: 16, fontWeight: '900', color: '#111827', textAlign: 'center' },
  message: { color: '#6b7280', textAlign: 'center', lineHeight: 20 },
});

