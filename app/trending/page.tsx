'use client';
import { useState, useEffect } from 'react';
import { tmdb, Movie } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';

export default function TrendingPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [mediaType, setMediaType] = useState<'all' | 'movie' | 'tv'>('all');
  const [region, setRegion] = useState<'global' | 'IN'>('global');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const fetcher = region === 'IN' 
      ? tmdb.getTrendingRegion('IN', mediaType)
      : tmdb.getTrending(mediaType, 'day'); // default global trending to right now (day)
      
    fetcher
      .then((data) => setMovies(data.results))
      .finally(() => setLoading(false));
  }, [mediaType, region]);

  return (
    <div className="browse-page">
      <div className="trending-page-header">
        <div className="trending-title-wrap">
          <h1 className="browse-title">🔥 Trending</h1>
          <p className="browse-subtitle">What everyone is watching right now</p>
        </div>
        <div className="trending-controls">
          <div className="toggle-group">
            <button className={`toggle-btn ${region === 'global' ? 'active' : ''}`} onClick={() => setRegion('global')}>Global</button>
            <button className={`toggle-btn ${region === 'IN' ? 'active' : ''}`} onClick={() => setRegion('IN')}>India</button>
          </div>
          <div className="toggle-group">
            {(['all', 'movie', 'tv'] as const).map((t) => (
              <button key={t} className={`toggle-btn ${mediaType === t ? 'active' : ''}`} onClick={() => setMediaType(t)}>
                {t === 'all' ? 'All' : t === 'movie' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid-skeleton">
          {Array.from({ length: 20 }).map((_, i) => <div key={i} className="card-skeleton" />)}
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie, i) => (
            <div key={movie.id} className="trending-card-wrap">
              <span className="trending-rank">#{i + 1}</span>
              <MovieCard movie={movie} mediaType={movie.media_type === 'tv' ? 'tv' : 'movie'} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
