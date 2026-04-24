import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import useFetch from '../hooks/useFetch';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorState from '../components/ErrorState';
import { fetchAuthor, fetchWorkDetail, fetchWorkEditions } from '../services/api';

function pickWorkId(routeParams) {
  const p = routeParams ?? {};
  const candidate = p.workId ?? p.id ?? '';
  return typeof candidate === 'string' || typeof candidate === 'number' ? String(candidate) : '';
}

function coverUriFromWork(work) {
  const coverId = Array.isArray(work?.covers) ? work.covers[0] : null;
  if (!Number.isFinite(coverId)) return null;
  return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
}

function textValue(value) {
  if (typeof value === 'string') return value.trim();
  if (value && typeof value === 'object' && typeof value.value === 'string') return value.value.trim();
  return '';
}

function cleanJoin(list) {
  const items = Array.isArray(list) ? list : [];
  const out = items.map((x) => String(x ?? '').trim()).filter(Boolean);
  return out.length ? out.join(', ') : '';
}

async function buildBookDetail(workId) {
  const work = await fetchWorkDetail(workId);

  const authorsKeys = Array.isArray(work?.authors)
    ? work.authors
        .map((a) => a?.author?.key)
        .filter((k) => typeof k === 'string' && k.length)
        .slice(0, 4)
    : [];

  const authors = await Promise.all(
    authorsKeys.map(async (key) => {
      try {
        const a = await fetchAuthor(key);
        return a?.name ?? '';
      } catch {
        return '';
      }
    }),
  );

  let edition = null;
  try {
    const editions = await fetchWorkEditions(workId, { limit: 1 });
    edition = Array.isArray(editions?.entries) ? editions.entries[0] : null;
  } catch {
    edition = null;
  }

  return { work, edition, authors: authors.filter(Boolean) };
}

function InfoRow({ label, value }) {
  const text = String(value ?? '').trim();
  if (!text) return null;
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{text}</Text>
    </View>
  );
}

export default function DetailScreen({ route }) {
  const workId = pickWorkId(route?.params);
  const [fav, setFav] = useState(false);

  const fetcher = useCallback(() => buildBookDetail(workId), [workId]);
  const { data, loading, error, refetch } = useFetch(fetcher, [fetcher]);

  const viewModel = useMemo(() => {
    const work = data?.work ?? null;
    const edition = data?.edition ?? null;
    const coverUri = coverUriFromWork(work);
    const title = textValue(work?.title) || textValue(edition?.title) || 'Untitled';

    const description =
      textValue(work?.description) ||
      textValue(edition?.description) ||
      'Tidak ada sinopsis.';

    const editionName =
      textValue(edition?.edition_name) ||
      textValue(edition?.subtitle) ||
      '';

    const authors = Array.isArray(data?.authors) ? data.authors : [];
    const authorLine = authors.length ? authors.join(', ') : 'Unknown';

    const publishYear =
      textValue(work?.first_publish_date) ||
      textValue(edition?.publish_date) ||
      '';

    const publisher = cleanJoin(edition?.publishers);
    const language = cleanJoin(edition?.languages?.map((l) => l?.key?.split('/').pop()));
    const pages = Number.isFinite(edition?.number_of_pages) ? String(edition.number_of_pages) : '';

    return {
      coverUri,
      title,
      editionName,
      authorLine,
      publishYear,
      publisher,
      language,
      pages,
      description,
    };
  }, [data]);

  if (!workId) {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <ErrorState message="workId tidak ditemukan dari navigation params." />
      </SafeAreaView>
    );
  }

  if (loading) return <LoadingIndicator />;
  if (error)
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <View style={styles.errorWrap}>
          <ErrorState message="Gagal memuat detail buku." />
          <Pressable onPress={refetch} style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Coba Lagi</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <View style={styles.coverFrame}>
            {viewModel.coverUri ? (
              <Image source={{ uri: viewModel.coverUri }} style={styles.cover} resizeMode="cover" />
            ) : (
              <View style={styles.coverFallback}>
                <Text style={styles.coverFallbackText}>No Cover</Text>
              </View>
            )}
          </View>

          <View style={styles.meta}>
            <Text style={styles.title}>{viewModel.title}</Text>
            <Text style={styles.author}>{viewModel.authorLine}</Text>

            <View style={styles.pills}>
              {viewModel.publishYear ? (
                <View style={styles.pillMuted}>
                  <Text style={styles.pillMutedText}>{viewModel.publishYear}</Text>
                </View>
              ) : null}
            </View>

            <Pressable
              onPress={() => setFav((v) => !v)}
              style={[styles.button, fav ? styles.buttonActive : null]}
            >
              <Text style={styles.buttonText}>{fav ? 'Tersimpan di Favorit' : 'Tambah ke Favorit'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Informasi</Text>
          <InfoRow label="Edisi" value={viewModel.editionName} />
          <InfoRow label="Judul" value={viewModel.title} />
          <InfoRow label="Author" value={viewModel.authorLine} />
          <InfoRow label="Tahun terbit" value={viewModel.publishYear} />
          <InfoRow label="Publisher" value={viewModel.publisher} />
          <InfoRow label="Bahasa" value={viewModel.language} />
          <InfoRow label="Pages" value={viewModel.pages} />
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sinopsis</Text>
          <Text style={styles.desc}>{viewModel.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 16, paddingBottom: 24, gap: 14 },

  top: { flexDirection: 'row', gap: 14 },
  coverFrame: {
    width: 120,
    aspectRatio: 3 / 4,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  cover: { width: '100%', height: '100%' },
  coverFallback: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  coverFallbackText: { color: '#6b7280', fontWeight: '800' },

  meta: { flex: 1, gap: 8 },
  title: { fontSize: 18, fontWeight: '900', color: '#111827' },
  author: { color: '#6b7280', fontWeight: '700' },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  pill: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  pillText: { color: '#065f46', fontWeight: '800', fontSize: 12 },
  pillMuted: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  pillMutedText: { color: '#374151', fontWeight: '800', fontSize: 12 },

  button: {
    marginTop: 4,
    backgroundColor: '#00D564',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  buttonActive: { backgroundColor: '#111827' },
  buttonText: { color: '#fff', fontWeight: '900' },

  card: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 14,
    gap: 10,
  },
  sectionTitle: { fontWeight: '900', color: '#111827', fontSize: 14 },

  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  rowLabel: { width: 110, color: '#6b7280', fontWeight: '800' },
  rowValue: { flex: 1, color: '#111827', fontWeight: '800', textAlign: 'right' },

  desc: { color: '#111827', lineHeight: 20 },

  errorWrap: { flex: 1, padding: 16, justifyContent: 'center', gap: 12 },
  secondaryButton: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  secondaryButtonText: { fontWeight: '900', color: '#111827' },
});

