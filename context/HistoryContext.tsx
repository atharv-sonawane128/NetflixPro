'use client';
import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { ref, get, set } from 'firebase/database';
import { rtdb } from '@/lib/firebase';
import { useAuth } from './AuthContext';
import { Movie } from '@/lib/tmdb';

interface HistoryContextType {
  history: Movie[];
  addToHistory: (movie: Movie) => void;
  removeFromHistory: (movieId: number) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType>({} as HistoryContextType);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [history, setHistory] = useState<Movie[]>([]);

  useEffect(() => {
    if (user) {
      const dbRef = ref(rtdb, `users/${user.uid}/history`);
      get(dbRef).then((snap) => {
        if (snap.exists()) setHistory(snap.val() || []);
        else setHistory([]);
      });
    } else {
      try {
        const stored = localStorage.getItem('netflix_pro_history');
        if (stored) setHistory(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, [user]);

  const addToHistory = useCallback((movie: Movie) => {
    setHistory((prev) => {
      const filtered = prev.filter((m) => m.id !== movie.id);
      const updated = [movie, ...filtered].slice(0, 20); // Keep last 20
      if (user) {
        set(ref(rtdb, `users/${user.uid}/history`), updated);
      } else {
        localStorage.setItem('netflix_pro_history', JSON.stringify(updated));
      }
      return updated;
    });
  }, [user]);

  const removeFromHistory = useCallback((movieId: number) => {
    setHistory((prev) => {
      const updated = prev.filter((m) => m.id !== movieId);
      if (user) {
        set(ref(rtdb, `users/${user.uid}/history`), updated);
      } else {
        localStorage.setItem('netflix_pro_history', JSON.stringify(updated));
      }
      return updated;
    });
  }, [user]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    if (user) {
      set(ref(rtdb, `users/${user.uid}/history`), null);
    } else {
      localStorage.removeItem('netflix_pro_history');
    }
  }, [user]);

  return (
    <HistoryContext.Provider value={{ history, addToHistory, removeFromHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => useContext(HistoryContext);
