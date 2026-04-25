import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

function asId(value) {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return '';
}

function safeBook(input) {
  const book = input && typeof input === 'object' ? input : {};
  const id = asId(book.id ?? book.workId);
  if (!id) return null;

  return {
    id,
    title: typeof book.title === 'string' ? book.title : String(book.title ?? 'Untitled'),
    author: typeof book.author === 'string' ? book.author : String(book.author ?? 'Unknown'),
    coverId: Number.isFinite(book.coverId) ? book.coverId : null,
  };
}

export default create(
  persist(
    (set, get) => ({
      favorites: [],

      addFavorite: (book) => {
        const next = safeBook(book);
        if (!next) return;

        const current = get().favorites;
        const exists = current.some((b) => b.id === next.id);
        if (exists) return;

        set({ favorites: [next, ...current] });
      },

      removeFavorite: (id) => {
        const key = asId(id);
        if (!key) return;
        set((state) => ({ favorites: state.favorites.filter((b) => b.id !== key) }));
      },
    }),
    {
      name: 'favorite-store-v1',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ favorites: state.favorites }),
    },
  ),
);

