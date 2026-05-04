'use client';
import { useRef } from 'react';
import MovieCard from './MovieCard';
import { Movie } from '@/lib/tmdb';

interface Props {
  title: string;
  movies: Movie[];
  mediaType?: 'movie' | 'tv';
  emoji?: string;
}

export default function MovieRow({ title, movies, mediaType = 'movie', emoji }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);

  function scroll(dir: 'left' | 'right') {
    if (!rowRef.current) return;
    const amount = rowRef.current.clientWidth * 0.75;
    rowRef.current.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  }

  if (!movies.length) return null;

  return (
    <div className="movie-row-section">
      <div className="row-header">
        <h2 className="row-title">
          {emoji && <span className="row-emoji">{emoji}</span>}
          {title}
        </h2>
        <div className="row-nav">
          <button className="row-nav-btn" onClick={() => scroll('left')} aria-label="Scroll left">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>
          </button>
          <button className="row-nav-btn" onClick={() => scroll('right')} aria-label="Scroll right">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6"/></svg>
          </button>
        </div>
      </div>
      <div className="movie-row-scroll" ref={rowRef}>
        {movies.map((movie) => (
          <div key={movie.id} className="movie-row-item">
            <MovieCard movie={movie} mediaType={mediaType} />
          </div>
        ))}
      </div>
    </div>
  );
}
