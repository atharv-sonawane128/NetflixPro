import { tmdb, getPosterUrl, getBackdropUrl, getYear, getRating } from '@/lib/tmdb';
import VideoPlayer from '@/components/VideoPlayer';
import Image from 'next/image';
import Link from 'next/link';
import MovieCard from '@/components/MovieCard';
import { notFound } from 'next/navigation';
import SaveToHistory from '@/components/SaveToHistory';

export const revalidate = 3600;

interface PageProps {
  params: Promise<{ type: string; id: string }>;
}

export default async function WatchPage({ params }: PageProps) {
  const { type, id } = await params;
  const tmdbId = parseInt(id);

  if (!['movie', 'tv'].includes(type) || isNaN(tmdbId)) notFound();

  const mediaType = type as 'movie' | 'tv';

  let details: {
    title?: string; name?: string; overview?: string;
    poster_path?: string; backdrop_path?: string;
    vote_average?: number; release_date?: string; first_air_date?: string;
    runtime?: number; number_of_seasons?: number;
    genres?: { id: number; name: string }[];
    seasons?: { season_number: number; episode_count: number; name: string }[];
    credits?: { cast: { id: number; name: string; character: string; profile_path: string | null }[] };
    similar?: { results: { id: number; title?: string; name?: string; poster_path: string | null; backdrop_path: string | null; vote_average: number; release_date?: string; first_air_date?: string; genre_ids?: number[]; media_type?: string; overview: string }[] };
  };

  try {
    details = mediaType === 'movie'
      ? await tmdb.getMovieDetails(tmdbId)
      : await tmdb.getTVDetails(tmdbId);
  } catch {
    notFound();
  }

  const title = details.title || details.name || '';
  const backdrop = getBackdropUrl(details.backdrop_path, 'w1280');
  const poster = getPosterUrl(details.poster_path, 'w342');
  const year = getYear(details.release_date || details.first_air_date);
  const rating = getRating(details.vote_average || 0);
  const cast = details.credits?.cast?.slice(0, 10) || [];
  const similar = details.similar?.results?.slice(0, 12) || [];
  const seasons = details.seasons?.filter(s => s.season_number > 0) || [];

  return (
    <div className="watch-page">
      {/* ── Backdrop header ── */}
      <div className="watch-backdrop-wrap">
        <Image src={backdrop} alt={title} fill priority sizes="100vw" className="watch-backdrop-img" />
        <div className="watch-backdrop-grad" />
      </div>

      <div className="watch-container">

        {/* ── Breadcrumb ── */}
        <div className="watch-breadcrumb">
          <Link href="/" className="breadcrumb-link">Home</Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
          <Link href={mediaType === 'tv' ? '/series' : '/movies'} className="breadcrumb-link">
            {mediaType === 'tv' ? 'TV Series' : 'Movies'}
          </Link>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9,18 15,12 9,6"/></svg>
          <span className="breadcrumb-current">{title}</span>
        </div>

        {/* ── Player ── */}
        <SaveToHistory movie={{ ...details, media_type: mediaType }} />
        <VideoPlayer tmdbId={tmdbId} mediaType={mediaType} seasons={seasons} />

        {/* ── Movie Info ── */}
        <div className="watch-info-row">
          <div className="watch-poster-col">
            <Image src={poster} alt={title} width={180} height={270} className="watch-poster-img" />
          </div>
          <div className="watch-details-col">
            <div className="watch-meta-badges">
              <span className="watch-badge-type">{mediaType === 'tv' ? '📺 TV Series' : '🎬 Movie'}</span>
              {(details.vote_average || 0) >= 8 && <span className="watch-badge-top">⭐ Top Rated</span>}
            </div>
            <h1 className="watch-title">{title}</h1>
            <div className="watch-meta">
              <span className="watch-rating">★ {rating}</span>
              <span className="watch-dot">·</span>
              <span>{year}</span>
              {details.runtime && (
                <><span className="watch-dot">·</span><span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span></>
              )}
              {details.number_of_seasons && (
                <><span className="watch-dot">·</span><span>{details.number_of_seasons} Season{details.number_of_seasons > 1 ? 's' : ''}</span></>
              )}
            </div>
            {details.genres && (
              <div className="watch-genres">
                {details.genres.map(g => <span key={g.id} className="watch-genre-pill">{g.name}</span>)}
              </div>
            )}
            <p className="watch-overview">{details.overview}</p>

            {/* Cast */}
            {cast.length > 0 && (
              <div className="watch-cast">
                <h3 className="watch-section-title">Cast</h3>
                <div className="watch-cast-list">
                  {cast.map(member => (
                    <div key={member.id} className="watch-cast-item">
                      <div className="watch-cast-avatar">
                        {member.profile_path
                          ? <Image src={getPosterUrl(member.profile_path, 'w92')} alt={member.name} fill sizes="44px" className="cast-img" />
                          : <span className="cast-placeholder">{member.name[0]}</span>
                        }
                      </div>
                      <div className="watch-cast-info">
                        <span className="watch-cast-name">{member.name}</span>
                        <span className="watch-cast-char">{member.character}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Similar Content ── */}
        {similar.length > 0 && (
          <div className="watch-similar">
            <h2 className="watch-section-title">More Like This</h2>
            <div className="watch-similar-grid">
              {similar.map(m => (
                <MovieCard key={m.id} movie={{ ...m, overview: m.overview || '' }} mediaType={mediaType} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
