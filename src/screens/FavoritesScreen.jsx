import React, { useCallback, useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import EmptyState from '../components/EmptyState';
import BookCard from '../components/BookCard';
import useFavoriteStore from '../store/useFavoriteStore';

export default function FavoritesScreen({ navigation }) {
  const favorites = useFavoriteStore((s) => s.favorites);
  const removeFavorite = useFavoriteStore((s) => s.removeFavorite);

  const gridData = useMemo(() => {
    if (!favorites.length) return favorites;
    if (favorites.length % 2 === 0) return favorites;
    return [...favorites, { id: '__favorite_spacer__', __spacer: true }];
  }, [favorites]);

  const openDetail = useCallback(
    (book) => {
      if (!book?.id) return;
      navigation.navigate('Detail', { workId: book.id, title: book.title });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }) => {
      if (item?.__spacer) return <View style={[styles.itemWrap, styles.spacer]} />;

      return (
        <View style={styles.itemWrap}>
          <BookCard
            title={item.title}
            author={item.author}
            coverId={item.coverId}
            onPress={() => openDetail(item)}
          />
          <Pressable onPress={() => removeFavorite(item.id)} style={styles.removeBtn}>
            <Text style={styles.removeBtnText}>Hapus dari Favorit</Text>
          </Pressable>
        </View>
      );
    },
    [openDetail, removeFavorite],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Favorites</Text>
        <Text style={styles.subtitle}>Buku yang Anda simpan untuk dibaca nanti.</Text>
      </View>

      <FlatList
        data={gridData}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={favorites.length ? styles.listContent : [styles.listContent, styles.emptyContent]}
        removeClippedSubviews
        initialNumToRender={10}
        windowSize={7}
        ListEmptyComponent={<EmptyState title="Belum ada favorit" message="Tambahkan dari halaman detail buku." />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: 16 },
  title: { fontSize: 22, fontWeight: '900', color: '#111827' },
  subtitle: { marginTop: 4, color: '#6b7280' },

  listContent: { paddingHorizontal: 16, paddingVertical: 12 },
  emptyContent: { flexGrow: 1 },
  row: { gap: 12, marginBottom: 12 },

  itemWrap: { flex: 1, gap: 8, marginBottom: 12 },
  spacer: { opacity: 0 },
  removeBtn: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  removeBtnText: { fontWeight: '900', color: '#111827' },
});

