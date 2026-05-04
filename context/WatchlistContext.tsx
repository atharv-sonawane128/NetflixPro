'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { ref, get, set } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Movie } from '@/lib/tmdb';

interface WatchlistContextType {
  myList: Movie[];
  addToList: (movie: Movie) => void;
  removeFromList: (movieId: number) => void;
  isInList: (movieId: number) => boolean;
}

const WatchlistContext = createContext<WatchlistContextType>({} as WatchlistContextType);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [myList, setMyList] = useState<Movie[]>([]);

  useEffect(() => {
    if (!user) { setMyList([]); return; }
    const dbRef = ref(rtdb, `users/${user.uid}/myList`);
    get(dbRef).then((snap) => {
      if (snap.exists()) setMyList(snap.val() || []);
    });
  }, [user]);

  const addToList = useCallback(async (movie: Movie) => {
    if (!user) return;
    setMyList((prev) => {
      const updated = [...prev, movie];
      set(ref(rtdb, `users/${user.uid}/myList`), updated);
      return updated;
    });
  }, [user]);

  const removeFromList = useCallback(async (movieId: number) => {
    if (!user) return;
    setMyList((prev) => {
      const updated = prev.filter((m) => m.id !== movieId);
      set(ref(rtdb, `users/${user.uid}/myList`), updated);
      return updated;
    });
  }, [user]);

  const isInList = useCallback((movieId: number) => myList.some((m) => m.id === movieId), [myList]);

  return (
    <WatchlistContext.Provider value={{ myList, addToList, removeFromList, isInList }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => useContext(WatchlistContext);
