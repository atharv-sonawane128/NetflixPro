'use client';
import { useHistory } from '@/context/HistoryContext';
import MovieCard from '@/components/MovieCard';

export default function ContinueWatchingRow() {
  const { history } = useHistory();

  if (!history || history.length === 0) return null;

  return (
    <section className="movie-row">
      <div className="row-header">
        <h2 className="row-title">Continue Watching</h2>
      </div>
      <div className="movie-row-scroll">
        {history.map((movie) => (
          <div key={`history-${movie.id}`} className="movie-row-item">
            <MovieCard movie={movie} mediaType={movie.media_type as 'movie' | 'tv' || 'movie'} showProgress={true} />
          </div>
        ))}
      </div>
    </section>
  );
}
