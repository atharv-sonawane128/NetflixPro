'use client';
import { useEffect } from 'react';
import { useHistory } from '@/context/HistoryContext';
import { Movie } from '@/lib/tmdb';

export default function SaveToHistory({ movie }: { movie: Movie }) {
  const { addToHistory } = useHistory();

  useEffect(() => {
    // Add a slight delay to ensure it's not a mis-click, or just add immediately
    const timer = setTimeout(() => {
      addToHistory(movie);
    }, 3000); // 3 seconds before saving to history
    return () => clearTimeout(timer);
  }, [movie, addToHistory]);

  return null;
}
