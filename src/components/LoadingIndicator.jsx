import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function LoadingIndicator() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color="#00D564" />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 16 },
});

