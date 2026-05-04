'use client';
import { useState, useCallback } from 'react';

interface Source {
  id: string;
  label: string;
  getMovieUrl: (id: number) => string;
  getTVUrl: (id: number, season: number, episode: number) => string;
}

const SOURCES: Source[] = [
  {
    id: 'vidsrc',
    label: 'VidSrc',
    getMovieUrl: (id) => `https://vidsrc.to/embed/movie/${id}`,
    getTVUrl: (id, s, e) => `https://vidsrc.to/embed/tv/${id}/${s}/${e}`,
  },
  {
    id: 'videasy',
    label: 'Videasy',
    getMovieUrl: (id) => `https://player.videasy.net/movie/${id}`,
    getTVUrl: (id, s, e) => `https://player.videasy.net/tv/${id}/${s}/${e}`,
  },
  {
    id: 'vidsrc2',
    label: 'VidSrc 2',
    getMovieUrl: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`,
    getTVUrl: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}`,
  },
];

interface Season {
  season_number: number;
  episode_count: number;
  name: string;
}

interface Props {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  seasons?: Season[];
}

export default function VideoPlayer({ tmdbId, mediaType, seasons = [] }: Props) {
  const [sourceIdx, setSourceIdx] = useState(0);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const source = SOURCES[sourceIdx];

  const iframeUrl = mediaType === 'movie'
    ? source.getMovieUrl(tmdbId)
    : source.getTVUrl(tmdbId, season, episode);

  const currentSeason = seasons.find(s => s.season_number === season);
  const episodeCount = currentSeason?.episode_count || 20;

  const handleSourceChange = useCallback((idx: number) => {
    setSourceIdx(idx);
    setLoading(true);
    setError(false);
  }, []);

  return (
    <div className="player-wrap">
      {/* ── Source Switcher ── */}
      <div className="player-source-bar">
        <span className="player-source-label">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5,3 19,12 5,21"/></svg>
          Source
        </span>
        <div className="player-source-btns">
          {SOURCES.map((s, i) => (
            <button
              key={s.id}
              className={`player-source-btn ${i === sourceIdx ? 'active' : ''}`}
              onClick={() => handleSourceChange(i)}
            >
              {s.label}
            </button>
          ))}
        </div>
        <span className="player-source-hint">If one source fails, try another →</span>
      </div>

      {/* ── TV Controls ── */}
      {mediaType === 'tv' && seasons.length > 0 && (
        <div className="player-tv-controls">
          <div className="player-tv-group">
            <label className="player-tv-label">Season</label>
            <div className="player-season-pills">
              {seasons
                .filter(s => s.season_number > 0)
                .map(s => (
                  <button
                    key={s.season_number}
                    className={`player-season-pill ${season === s.season_number ? 'active' : ''}`}
                    onClick={() => { setSeason(s.season_number); setEpisode(1); setLoading(true); }}
                  >
                    S{s.season_number}
                  </button>
                ))}
            </div>
          </div>
          <div className="player-tv-group">
            <label className="player-tv-label">Episode — {currentSeason?.name || `Season ${season}`}</label>
            <div className="player-episode-grid">
              {Array.from({ length: Math.min(episodeCount, 50) }, (_, i) => i + 1).map(ep => (
                <button
                  key={ep}
                  className={`player-ep-btn ${episode === ep ? 'active' : ''}`}
                  onClick={() => { setEpisode(ep); setLoading(true); }}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── iframe Player ── */}
      <div className="player-iframe-wrap">
        {loading && !error && (
          <div className="player-loading">
            <div className="player-spinner" />
            <p>Loading stream...</p>
          </div>
        )}
        {error && (
          <div className="player-error">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>This source failed. Try another one above.</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              {SOURCES.map((s, i) => (
                <button key={s.id} className="player-source-btn" onClick={() => handleSourceChange(i)}>{s.label}</button>
              ))}
            </div>
          </div>
        )}
        <iframe
          key={iframeUrl}
          src={iframeUrl}
          className="player-iframe"
          allowFullScreen
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="origin"
          onLoad={() => setLoading(false)}
          onError={() => { setLoading(false); setError(true); }}
          style={{ display: error ? 'none' : 'block' }}
        />
      </div>

      {/* ── Now Playing info ── */}
      {mediaType === 'tv' && (
        <div className="player-now-playing">
          <span className="player-now-label">Now Playing:</span>
          <span className="player-now-info">Season {season} · Episode {episode}</span>
          <span className="player-now-src">via {source.label}</span>
        </div>
      )}
    </div>
  );
}
