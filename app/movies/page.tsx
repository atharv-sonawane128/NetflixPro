'use client';
import { useState, useEffect, useCallback } from 'react';
import { tmdb, Movie } from '@/lib/tmdb';
import MovieCard from '@/components/MovieCard';

const GENRES = [
  { id: 0, name: 'All' },
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 12, name: 'Adventure' },
  { id: 10749, name: 'Romance' },
  { id: 16, name: 'Animation' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
];

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'release_date.desc', label: 'Newest First' },
  { value: 'release_date.asc', label: 'Oldest First' },
];

export default function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [genre, setGenre] = useState(0);
  const [sort, setSort] = useState('popularity.desc');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchMovies = useCallback(async (selectedGenre: number, selectedSort: string, selectedPage: number, reset = false) => {
    if (selectedPage === 1) setLoading(true); else setLoadingMore(true);
    try {
      let data;
      if (selectedGenre === 0) {
        if (selectedSort === 'popularity.desc') {
          data = await tmdb.getPopularMovies(selectedPage);
        } else if (selectedSort === 'vote_average.desc') {
          data = await tmdb.getTopRatedMovies(selectedPage);
        } else if (selectedSort === 'release_date.desc' || selectedSort === 'release_date.asc') {
          data = await tmdb.getNowPlayingMovies(selectedPage);
        } else {
          data = await tmdb.getPopularMovies(selectedPage);
        }
      } else {
        data = await tmdb.getMoviesByGenre(selectedGenre, selectedPage, selectedSort);
      }
      const results: Movie[] = data.results || [];
      setMovies((prev) => reset ? results : [...prev, ...results]);
      setHasMore(selectedPage < data.total_pages);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchMovies(genre, sort, 1, true);
  }, [genre, sort, fetchMovies]);

  function loadMore() {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchMovies(genre, sort, nextPage);
  }

  return (
    <div className="browse-page">
      <div className="browse-header">
        <h1 className="browse-title">Movies</h1>
        <p className="browse-subtitle">Explore thousands of movies</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <div className="genre-pills">
          {GENRES.map((g) => (
            <button
              key={g.id}
              className={`genre-pill ${genre === g.id ? 'active' : ''}`}
              onClick={() => setGenre(g.id)}
            >
              {g.name}
            </button>
          ))}
        </div>
        <div className="filter-sort-row">
          <span className="filter-sort-label">Sort by</span>
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid-skeleton">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="card-skeleton" />
          ))}
        </div>
      ) : (
        <div className="movies-grid">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} mediaType="movie" />
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
