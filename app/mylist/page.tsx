'use client';
import { useWatchlist } from '@/context/WatchlistContext';
import { useAuth } from '@/context/AuthContext';
import MovieCard from '@/components/MovieCard';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function MyListPage() {
  const { myList } = useWatchlist();
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.push('/');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="browse-page">
        <div className="grid-skeleton">
          {Array.from({ length: 12 }).map((_, i) => <div key={i} className="card-skeleton" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1 className="browse-title">My List</h1>
        <p className="browse-subtitle">{myList.length} title{myList.length !== 1 ? 's' : ''} saved</p>
      </div>

      {myList.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h2 className="empty-title">Your list is empty</h2>
          <p className="empty-desc">Add movies and shows by clicking the + button on any title card.</p>
          <Link href="/" className="btn-browse">Browse Content</Link>
        </div>
      ) : (
        <div className="movies-grid">
          {myList.map((movie) => (
            <MovieCard key={movie.id} movie={movie} mediaType={movie.media_type === 'tv' ? 'tv' : 'movie'} />
          ))}
        </div>
      )}
    </div>
  );
}
