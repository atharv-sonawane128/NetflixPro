'use client';
import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { tmdb, Movie, getPosterUrl, getBackdropUrl, getYear, getRating } from '@/lib/tmdb';
import { useWatchlist } from '@/context/WatchlistContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface MovieDetailModal {
  movie: Movie & {
    videos?: { results: { key: string; type: string; site: string }[] };
    credits?: { cast: { id: number; name: string; profile_path: string | null; character: string }[] };
    genres?: { id: number; name: string }[];
    runtime?: number;
    number_of_seasons?: number;
    seasons?: { id: number; name: string; season_number: number; episode_count: number }[];
  };
  mediaType: 'movie' | 'tv';
}

export default function MovieCard({ movie, mediaType = 'movie', showProgress = false }: { movie: Movie; mediaType?: 'movie' | 'tv'; showProgress?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const [modal, setModal] = useState<MovieDetailModal | null>(null);
  const { isInList, addToList, removeFromList } = useWatchlist();
  const { user } = useAuth();
  const router = useRouter();
  const inList = isInList(movie.id);
  const title = movie.title || movie.name || 'Unknown';
  const year = getYear(movie.release_date || movie.first_air_date);
  const rating = getRating(movie.vote_average);
  const poster = getPosterUrl(movie.poster_path, 'w342');
  const progressPercent = showProgress ? (movie.id % 60) + 20 : 0;

  async function openModal() {
    try {
      const type = movie.media_type === 'tv' ? 'tv' : mediaType;
      const details = type === 'tv'
        ? await tmdb.getTVDetails(movie.id)
        : await tmdb.getMovieDetails(movie.id);
      setModal({ movie: details, mediaType: type as 'movie' | 'tv' });
    } catch { /* ignore */ }
  }

  function handleWatchlist(e: React.MouseEvent) {
    e.stopPropagation();
    if (!user) { router.push('/auth'); return; }
    inList ? removeFromList(movie.id) : addToList(movie);
  }

  return (
    <>
      <div
        className={`movie-card ${hovered ? 'hovered' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={openModal}
      >
        <div className="card-poster">
          <Image src={poster} alt={title} fill sizes="(max-width: 640px) 45vw, 200px" className="poster-img" />
          <div className="card-overlay">
            <div className="card-actions">
              <Link
                href={`/watch/${movie.media_type === 'tv' ? 'tv' : mediaType}/${movie.id}`}
                className="card-play-btn"
                onClick={(e) => e.stopPropagation()}
                aria-label="Watch"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
              </Link>
              <button className={`card-list-btn ${inList ? 'in-list' : ''}`} onClick={handleWatchlist} aria-label="Add to list">
                {inList
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                }
              </button>
            </div>
            <div className="card-rating">
              <span className="star">★</span>
              <span>{rating}</span>
            </div>
          </div>
          {showProgress && (
            <div className="card-progress-bar">
              <div className="card-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          )}
        </div>
        <div className="card-info">
          <h3 className="card-title">{title}</h3>
          <div className="card-meta">
            <span className="card-year">{year}</span>
            <span className={`card-badge ${movie.vote_average >= 7 ? 'badge-green' : movie.vote_average >= 5 ? 'badge-yellow' : 'badge-red'}`}>
              {rating}
            </span>
          </div>
        </div>
      </div>

      {modal && <MovieModal data={modal} onClose={() => setModal(null)} />}
    </>
  );
}

function MovieModal({ data, onClose }: { data: MovieDetailModal; onClose: () => void }) {
  const { movie, mediaType } = data;
  const { isInList, addToList, removeFromList } = useWatchlist();
  const { user } = useAuth();
  const router = useRouter();
  const inList = isInList(movie.id);
  const title = movie.title || movie.name || '';
  const backdrop = getBackdropUrl(movie.backdrop_path, 'w1280');
  const trailer = movie.videos?.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = movie.credits?.cast.slice(0, 8) || [];
  const overlayRef = useRef<HTMLDivElement>(null);
  const [selectedSeason, setSelectedSeason] = useState(
    movie.seasons ? movie.seasons.find(s => s.season_number > 0)?.season_number || 1 : 1
  );
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [visibleEpisodesCount, setVisibleEpisodesCount] = useState(10);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    if (mediaType === 'tv' && movie.seasons && movie.seasons.length > 0) {
      setLoadingEpisodes(true);
      tmdb.getTVSeason(movie.id, selectedSeason).then(data => {
        setEpisodes(data.episodes || []);
        setLoadingEpisodes(false);
      }).catch(() => setLoadingEpisodes(false));
    }
  }, [selectedSeason, mediaType, movie.id, movie.seasons]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  }, [onClose]);

  function handleWatchlist() {
    if (!user) { router.push('/auth'); onClose(); return; }
    inList ? removeFromList(movie.id) : addToList(movie as Movie);
  }

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="modal-container">
        <button className="modal-close-btn" onClick={onClose} aria-label="Close">✕</button>

        {/* Backdrop / Trailer */}
        <div className="modal-media">
          {trailer ? (
            <iframe
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailer.key}`}
              className="modal-trailer"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <div className="modal-backdrop-wrap">
              <Image src={backdrop} alt={title} fill className="modal-backdrop-img" />
            </div>
          )}
          <div className="modal-media-gradient" />
          <div className="modal-media-info">
            <h2 className="modal-title">{title}</h2>
            <div className="modal-actions">
              <Link
                href={`/watch/${mediaType}/${movie.id}`}
                className="btn-play-modal"
                onClick={onClose}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                Watch Now
              </Link>
              <button className={`btn-list-modal ${inList ? 'active' : ''}`} onClick={handleWatchlist}>
                {inList
                  ? <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg> In My List</>
                  : <><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> My List</>
                }
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="modal-details">
          <div className="modal-meta-row">
            <span className="modal-rating">★ {getRating(movie.vote_average)}</span>
            <span className="modal-year">{getYear(movie.release_date || movie.first_air_date)}</span>
            {mediaType === 'movie' && movie.runtime && (
              <span className="modal-runtime">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            )}
            {mediaType === 'tv' && movie.number_of_seasons && (
              <span className="modal-seasons">{movie.number_of_seasons} Season{movie.number_of_seasons > 1 ? 's' : ''}</span>
            )}
          </div>

          {movie.genres && (
            <div className="modal-genres">
              {movie.genres.map((g) => (
                <span key={g.id} className="genre-tag">{g.name}</span>
              ))}
            </div>
          )}

          <p className="modal-overview">{movie.overview}</p>

          {cast.length > 0 && (
            <div className="modal-cast">
              <h4>Cast</h4>
              <div className="cast-list">
                {cast.map((member) => (
                  <div key={member.id} className="cast-member">
                    <div className="cast-avatar">
                      {member.profile_path
                        ? <Image src={getPosterUrl(member.profile_path, 'w92')} alt={member.name} fill className="cast-img" />
                        : <span className="cast-placeholder">{member.name[0]}</span>
                      }
                    </div>
                    <span className="cast-name">{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Episodes Section for TV Shows */}
          {mediaType === 'tv' && movie.seasons && movie.seasons.length > 0 && (
            <div className="modal-episodes-section">
              <div className="episodes-header">
                <h3>Episodes</h3>
                <select 
                  className="season-selector"
                  value={selectedSeason}
                  onChange={(e) => {
                    setSelectedSeason(Number(e.target.value));
                    setVisibleEpisodesCount(10);
                  }}
                >
                  {movie.seasons.filter(s => s.season_number > 0).map(s => (
                    <option key={s.id} value={s.season_number}>
                      Season {s.season_number}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="episodes-list">
                {loadingEpisodes ? (
                  <div className="episodes-loading"><div className="spinner-sm" /></div>
                ) : (
                  <>
                    {episodes.slice(0, visibleEpisodesCount).map(ep => (
                      <div key={ep.id} className="episode-item">
                        <div className="episode-number">{ep.episode_number}</div>
                        <div className="episode-img-wrap">
                          {ep.still_path ? (
                            <Image src={getPosterUrl(ep.still_path, 'w342')} alt={ep.name} fill className="episode-img" />
                          ) : (
                            <div className="episode-img-placeholder" />
                          )}
                        </div>
                        <div className="episode-details">
                          <div className="episode-title-row">
                            <span className="episode-title">{ep.name}</span>
                            {ep.runtime && <span className="episode-runtime">{ep.runtime}m</span>}
                          </div>
                          <p className="episode-overview">{ep.overview}</p>
                        </div>
                      </div>
                    ))}
                    {episodes.length > visibleEpisodesCount && (
                      <button 
                        className="btn-load-more" 
                        onClick={() => setVisibleEpisodesCount(prev => prev + 10)}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
