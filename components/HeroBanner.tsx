'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie, getBackdropUrl, getPosterUrl, getYear, getRating } from '@/lib/tmdb';
import { useWatchlist } from '@/context/WatchlistContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const GENRE_MAP: Record<number, string> = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi',
  53: 'Thriller', 10752: 'War', 37: 'Western', 10759: 'Action & Adventure',
  10765: 'Sci-Fi & Fantasy', 10768: 'War & Politics', 10767: 'Talk', 10764: 'Reality',
};

interface HeroSlide { movie: Movie; mediaType: 'movie' | 'tv'; }

export default function HeroBanner({ slides }: { slides: HeroSlide[] }) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const { isInList, addToList, removeFromList } = useWatchlist();
  const { user } = useAuth();
  const router = useRouter();

  const slide = slides[current];
  const movie = slide?.movie;
  const inList = movie ? isInList(movie.id) : false;
  const title = movie?.title || movie?.name || '';
  const backdrop = getBackdropUrl(movie?.backdrop_path, 'original');
  const genres = (movie?.genre_ids || []).slice(0, 3).map(id => GENRE_MAP[id]).filter(Boolean);

  const goTo = useCallback((index: number) => {
    if (transitioning || index === current) return;
    setTransitioning(true);
    setTimeout(() => { setCurrent(index); setTransitioning(false); }, 350);
  }, [transitioning, current]);

  const goNext = useCallback(() => goTo((current + 1) % slides.length), [current, slides.length, goTo]);
  const goPrev = useCallback(() => goTo((current - 1 + slides.length) % slides.length), [current, slides.length, goTo]);

  const resetTimer = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = setInterval(goNext, 8000);
  }, [goNext]);

  useEffect(() => {
    resetTimer();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [resetTimer]);

  function handleWatchlist(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) { router.push('/'); return; }
    inList ? removeFromList(movie!.id) : addToList(movie!);
  }

  if (!slides.length || !movie) {
    return <div className="hero-v2-skeleton"><div className="hero-v2-skeleton-inner" /></div>;
  }

  return (
    <section className="hero-v2">
      {/* ── Backdrop ── */}
      <div className={`hero-v2-backdrop ${transitioning ? 'hv2-fade-out' : 'hv2-fade-in'}`}>
        <Image src={backdrop} alt={title} fill priority sizes="100vw" className="hero-v2-backdrop-img" />
      </div>

      {/* ── Gradients ── */}
      <div className="hero-v2-grad-left" />
      <div className="hero-v2-grad-bottom" />
      <div className="hero-v2-grad-top" />

      {/* ── Top-left badge ── */}
      <div className="hero-v2-top-badges">
        <span className="hero-v2-badge-trending">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
          New Trending
        </span>
        <span className="hero-v2-badge-type">
          {slide.mediaType === 'tv' ? 'Series' : 'Movie'}
        </span>
      </div>

      {/* ── Main Content (left side) ── */}
      <div className={`hero-v2-content ${transitioning ? 'hv2-slide-out' : 'hv2-slide-in'}`}>
        {/* Logo mark */}
        <div className="hero-v2-logo">
          <span className="hv2-logo-stream">Netflix</span><span className="hv2-logo-vault"> Pro</span>
        </div>

        <h1 className="hero-v2-title">{title}</h1>

        <p className="hero-v2-overview">
          {movie.overview?.slice(0, 180)}{(movie.overview?.length ?? 0) > 180 ? '...' : ''}
        </p>

        {/* Genre pills */}
        {genres.length > 0 && (
          <div className="hero-v2-genres">
            {genres.map(g => <span key={g} className="hero-v2-genre-pill">{g}</span>)}
            <span className="hero-v2-meta-pill">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/></svg>
              {getRating(movie.vote_average)}
            </span>
            <span className="hero-v2-meta-pill">{getYear(movie.release_date || movie.first_air_date)}</span>
          </div>
        )}

        {/* Action buttons */}
        <div className="hero-v2-actions">
          <Link
            href={`/watch/${slide.mediaType}/${movie.id}`}
            className="hero-v2-btn-watch"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
            Watch Now
          </Link>
          <button className="hero-v2-btn-download" onClick={handleWatchlist}>
            {inList ? (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                In My List
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                My List
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Right side: prev/next arrows stacked ── */}
      <div className="hero-v2-nav-group">
        <button className="hero-v2-nav-btn" onClick={() => { goPrev(); resetTimer(); }} aria-label="Previous">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15,18 9,12 15,6"/></svg>
        </button>
        <button className="hero-v2-nav-btn" onClick={() => { goNext(); resetTimer(); }} aria-label="Next">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9,18 15,12 9,6"/></svg>
        </button>
      </div>

      {/* ── Filmstrip thumbnails at bottom ── */}
      <div className="hero-v2-filmstrip">
        <div className="hero-v2-filmstrip-track">
          {slides.map((s, i) => {
            const thumbUrl = s.movie.backdrop_path
              ? `https://image.tmdb.org/t/p/w300${s.movie.backdrop_path}`
              : getPosterUrl(s.movie.poster_path, 'w185');
            return (
              <button
                key={s.movie.id}
                className={`hero-v2-thumb ${i === current ? 'active' : ''}`}
                onClick={() => { goTo(i); resetTimer(); }}
                aria-label={s.movie.title || s.movie.name}
              >
                <Image src={thumbUrl} alt={s.movie.title || s.movie.name || ''} fill sizes="160px" className="hero-v2-thumb-img" />
                {i === current && <div className="hero-v2-thumb-active-bar" />}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
