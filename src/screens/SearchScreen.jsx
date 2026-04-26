import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SearchBar from '../components/SearchBar';
import EmptyState from '../components/EmptyState';
import LoadingIndicator from '../components/LoadingIndicator';
import ErrorState from '../components/ErrorState';
import BookCard from '../components/BookCard';

function tidyQuery(raw) {
  const text = String(raw ?? '');
  return text.replace(/\s+/g, ' ').trim();
}

function validateQuery(query) {
  const text = tidyQuery(query);
  if (!text) return 'Pencarian tidak boleh kosong.';
  if (text.length < 3) return 'Minimal 3 karakter.';
  return '';
}

function workIdFromKey(key) {
  const raw = String(key ?? '').trim();
  if (!raw) return '';
  const parts = raw.split('/').filter(Boolean);
  const idx = parts.indexOf('works');
  if (idx === -1) return '';
  return parts[idx + 1] ? String(parts[idx + 1]).trim() : '';
}

function mapDocToCard(doc) {
  const d = doc && typeof doc === 'object' ? doc : {};

  const title = typeof d.title === 'string' && d.title.trim() ? d.title.trim() : 'Untitled';
  const author =
    Array.isArray(d.author_name) && d.author_name.length
      ? String(d.author_name[0] ?? '').trim() || 'Unknown'
      : 'Unknown';

  const coverId = Number.isFinite(d.cover_i) ? d.cover_i : null;
  const workId = workIdFromKey(d.key);

  return { id: workId || `${title}-${author}`, workId, title, author, coverId };
}

async function searchBooks(query, signal) {
  const q = tidyQuery(query);
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}`;

  const res = await fetch(url, { method: 'GET', signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();

  const docs = Array.isArray(json?.docs) ? json.docs : [];
  return docs.map(mapDocToCard).filter((x) => x && typeof x === 'object' && x.id);
}

function withTimeout(signal, timeoutMs) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const abortFromUpstream = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', abortFromUpstream, { once: true });
  }

  return {
    signal: controller.signal,
    cleanup: () => {
      clearTimeout(timeoutId);
      if (signal) signal.removeEventListener('abort', abortFromUpstream);
    },
  };
}

function normalizeFetchError(err) {
  const message = err?.message ? String(err.message) : '';
  const lower = message.toLowerCase();
  if (lower.includes('aborted') || lower.includes('abort')) return 'Request timeout. Coba lagi.';
  if (lower.includes('network request failed')) return 'Koneksi bermasalah. Cek internet lalu coba lagi.';
  return message || 'Request failed';
}

export default function SearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [helperError, setHelperError] = useState('');

  const [items, setItems] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle | loading | ready | error
  const [remoteError, setRemoteError] = useState('');
  const [everSearched, setEverSearched] = useState(false);

  const abortRef = useRef(null);
  const tokenRef = useRef(0);

  const loading = phase === 'loading';
  const showList = items.length > 0 && phase !== 'error';

  useEffect(() => {
    return () => {
      abortRef.current?.abort?.();
    };
  }, []);

  const submitSearch = useCallback(async () => {
    const message = validateQuery(query);
    setHelperError(message);

    if (message) {
      setEverSearched(false);
      setItems([]);
      setRemoteError('');
      setPhase('idle');
      return;
    }

    setEverSearched(true);
    setRemoteError('');
    setPhase('loading');

    abortRef.current?.abort?.();
    const controller = new AbortController();
    abortRef.current = controller;

    const token = (tokenRef.current += 1);

    try {
      const TIMEOUT_MS = 12000;
      const { signal, cleanup } = withTimeout(controller.signal, TIMEOUT_MS);

      let result;
      try {
        result = await searchBooks(query, signal);
      } catch (e) {
        // Retry once on flaky device networks (common "Network request failed")
        const msg = String(e?.message ?? '');
        if (!signal.aborted && /network request failed/i.test(msg)) {
          result = await searchBooks(query, signal);
        } else {
          throw e;
        }
      } finally {
        cleanup();
      }

      if (token !== tokenRef.current) return;
      setItems(result);
      setPhase('ready');
    } catch (e) {
      if (controller.signal.aborted) return;
      if (token !== tokenRef.current) return;
      setItems([]);
      setRemoteError(normalizeFetchError(e));
      setPhase('error');
    }
  }, [query]);

  const onChange = useCallback((text) => {
    setQuery(text);
    if (helperError) setHelperError('');
    if (phase === 'error') {
      setRemoteError('');
      setPhase('idle');
    }
  }, [helperError, phase]);

  const contentEmpty = useMemo(() => {
    if (loading) return null;
    if (phase === 'error') return null;

    if (!everSearched) {
      return <EmptyState title="Cari Buku" message="Ketik minimal 3 karakter lalu tekan search." />;
    }

    return <EmptyState title="Tidak ditemukan" message="Coba kata kunci lain." />;
  }, [everSearched, loading, phase]);

  const renderItem = useCallback(
    ({ item }) => (
      <BookCard
        title={item.title}
        author={item.author}
        coverId={item.coverId}
        onPress={() => navigation.navigate('Detail', { workId: item.workId || item.id })}
      />
    ),
    [navigation],
  );

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <SearchBar value={query} onChangeText={onChange} onSubmit={submitSearch} disabled={loading} />
        {helperError ? <Text style={styles.helperError}>{helperError}</Text> : null}
      </View>

      {loading ? (
        <LoadingIndicator />
      ) : remoteError ? (
        <View style={styles.errorWrap}>
          <ErrorState message="Gagal mengambil data pencarian." />
          <Text style={styles.errorDetail}>{remoteError}</Text>
          <Pressable onPress={submitSearch} style={styles.retry}>
            <Text style={styles.retryText}>Coba Lagi</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={showList ? items : []}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={contentEmpty}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#ffffff' },
  header: { padding: 16, paddingBottom: 10, gap: 8 },
  helperError: { color: '#dc2626', fontWeight: '800' },

  listContent: { paddingHorizontal: 16, paddingBottom: 24, flexGrow: 1 },
  row: { gap: 12, paddingBottom: 12 },

  errorWrap: { flex: 1, padding: 16, justifyContent: 'center', gap: 10 },
  errorDetail: { textAlign: 'center', color: '#6b7280', fontWeight: '700' },
  retry: {
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  retryText: { fontWeight: '900', color: '#111827' },
});

