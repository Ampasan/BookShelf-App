import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useFetch from '../hooks/useFetch';
import { fetchDailyTrending } from '../services/api';

import BookCard from '../components/BookCard';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorState from '../components/ErrorState';

function workId(work, index) {
  const key = typeof work?.key === 'string' ? work.key : '';
  const tail = key.includes('/') ? key.split('/').pop() : key;
  return tail || String(work?.cover_i) || `${index}`;
}

function workAuthor(work) {
  if (Array.isArray(work?.authors) && work.authors[0]?.name) return work.authors[0].name;
  if (Array.isArray(work?.author_name) && work.author_name[0]) return work.author_name[0];
  if (typeof work?.author_name === 'string') return work.author_name;
  return 'Unknown';
}

export default function HomeScreen({ navigation }) {
  const { data, loading, error, refetch } = useFetch(fetchDailyTrending, []);
  const [refreshing, setRefreshing] = useState(false);

  const books = useMemo(() => {
    const works = Array.isArray(data?.works) ? data.works : [];
    const withCover = works.filter((w) => Number.isFinite(w?.cover_i));
    return withCover.slice(0, 10).map((w, idx) => ({
      id: workId(w, idx),
      title: w?.title ?? 'Untitled',
      author: workAuthor(w),
      coverId: w?.cover_i ?? null,
    }));
  }, [data]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const openDetail = useCallback(
    (book) => {
      navigation.navigate('Detail', { workId: book.id, title: book.title });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }) => (
      <BookCard
        title={item.title}
        author={item.author}
        coverId={item.coverId}
        onPress={() => openDetail(item)}
      />
    ),
    [openDetail],
  );

  if (loading && !refreshing) return <LoadingIndicator />;
  if (error) return <ErrorState message="Gagal memuat data" />;

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Trending Hari Ini</Text>
        <Text style={styles.subtitle}>Kisah favorit Anda selanjutnya sedang menunggu.</Text>
      </View>

      <FlatList
        data={books}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        refreshing={refreshing}
        onRefresh={onRefresh}
        removeClippedSubviews
        initialNumToRender={10}
        windowSize={7}
        ListEmptyComponent={<ErrorState message="Gagal memuat data" />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  header: { paddingHorizontal: 16},
  title: { fontSize: 22, fontWeight: '900', color: '#111827' },
  subtitle: { marginTop: 4, color: '#6b7280' },
  listContent: { paddingHorizontal: 16, paddingVertical: 12 },
  row: { gap: 12, marginBottom: 12 },
});

