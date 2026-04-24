import React, { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

function coverUrl(coverId) {
  if (!coverId) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`;
}

function BookCard({ title, author, coverId, onPress }) {
  const uri = coverUrl(coverId);

  return (
    <Pressable onPress={onPress} style={styles.card} android_ripple={{ color: '#e5e7eb' }}>
      <View style={styles.coverFrame}>
        {uri ? (
          <Image source={{ uri }} style={styles.cover} resizeMode="cover" />
        ) : (
          <View style={styles.coverFallback}>
            <Text style={styles.coverFallbackText}>No Cover</Text>
          </View>
        )}
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {title}
      </Text>
      <Text numberOfLines={1} style={styles.author}>
        {author}
      </Text>
    </Pressable>
  );
}

export default memo(BookCard);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  coverFrame: {
    width: '100%',
    aspectRatio: 3 / 4,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    marginBottom: 10,
  },
  cover: { width: '100%', height: '100%' },
  coverFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverFallbackText: { color: '#6b7280', fontWeight: '700' },
  title: { fontSize: 13, fontWeight: '800', color: '#111827' },
  author: { marginTop: 4, fontSize: 12, color: '#6b7280' },
});

