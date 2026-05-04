'use client';
import { useState, useEffect, useCallback } from 'react';
import { tmdb, Movie } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';

const TV_GENRES = [
  { id: 0, name: 'All' },
  { id: 10759, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 80, name: 'Crime' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 9648, name: 'Mystery' },
  { id: 10768, name: 'War' },
  { id: 16, name: 'Animation' },
  { id: 99, name: 'Documentary' },
];

export default function SeriesPage() {
  const [shows, setShows] = useState<Movie[]>([]);
  const [genre, setGenre] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchShows = useCallback(async (selectedGenre: number, selectedPage: number, reset = false) => {
    if (selectedPage === 1) setLoading(true); else setLoadingMore(true);
    try {
      let data;
      if (selectedGenre === 0) {
        data = await tmdb.getPopularTV(selectedPage);
      } else {
        data = await tmdb.getTVByGenre(selectedGenre, selectedPage);
      }
      const results: Movie[] = data.results || [];
      setShows((prev) => reset ? results : [...prev, ...results]);
      setHasMore(selectedPage < data.total_pages);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchShows(genre, 1, true);
  }, [genre, fetchShows]);

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchShows(genre, nextPage);
  }

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1 className="browse-title">TV Series</h1>
        <p className="browse-subtitle">Binge-watch your favourite shows</p>
      </div>

      <div className="filter-bar">
        <div className="genre-pills">
          {TV_GENRES.map((g) => (
            <button
              key={g.id}
              className={`genre-pill ${genre === g.id ? 'active' : ''}`}
              onClick={() => setGenre(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid-skeleton">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="card-skeleton" />
          ))}
        </div>
      ) : (
        <div className="movies-grid">
          {shows.map((show) => (
            <MovieCard key={show.id} movie={show} mediaType="tv" />
          ))}
        </div>
      )}

      {hasMore && !loading && (
        <div className="load-more-wrap">
          <button className="btn-load-more" onClick={loadMore} disabled={loadingMore}>
            {loadingMore ? <span className="spinner-sm" /> : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
}
