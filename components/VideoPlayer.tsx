'use client';
import { useState, useCallback, useEffect } from 'react';
import { tmdb, getPosterUrl } from '@/lib/tmdb';
import Image from 'next/image';

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
  const [sourceIdx, setSourceIdx] = useState(1); // 1 is Videasy
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const source = SOURCES[sourceIdx];

  const iframeUrl = mediaType === 'movie'
    ? source.getMovieUrl(tmdbId)
    : source.getTVUrl(tmdbId, season, episode);

  const currentSeason = seasons.find(s => s.season_number === season);
  
  const [episodesData, setEpisodesData] = useState<any[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [visibleEpisodesCount, setVisibleEpisodesCount] = useState(10);

  useEffect(() => {
    if (mediaType === 'tv') {
      setLoadingEpisodes(true);
      tmdb.getTVSeason(tmdbId, season).then(data => {
        setEpisodesData(data.episodes || []);
        setLoadingEpisodes(false);
      }).catch(() => setLoadingEpisodes(false));
    }
  }, [tmdbId, mediaType, season]);

  const handleSourceChange = useCallback((idx: number) => {
    setSourceIdx(idx);
    setLoading(true);
    setError(false);
  }, []);

  return (
    <div className="player-wrap">
      {/* ── iframe Player ── */}
      {/* ── iframe Player ── */}
      <div className="player-iframe-wrap">
        {/* ── Server Dropdown ── */}
        <div className="server-dropdown-container">
          <button 
            className="server-dropdown-btn" 
            onClick={() => setDropdownOpen(!dropdownOpen)}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5,3 19,12 5,21"/></svg>
            Server: {source.label}
          </button>
          {dropdownOpen && (
            <div className="server-dropdown-menu">
              {SOURCES.map((s, i) => (
                <button
                  key={s.id}
                  className={`server-dropdown-item ${i === sourceIdx ? 'active' : ''}`}
                  onClick={() => {
                    handleSourceChange(i);
                    setDropdownOpen(false);
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>

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

      {/* ── TV Controls (Below Player) ── */}
      {mediaType === 'tv' && seasons.length > 0 && (
        <div className="player-tv-controls-rich">
          <div className="episodes-header">
            <h3>Episodes</h3>
            <select 
              className="season-selector"
              value={season}
              onChange={(e) => {
                setSeason(Number(e.target.value));
                setEpisode(1);
                setLoading(true);
                setVisibleEpisodesCount(10);
              }}
            >
              {seasons.filter(s => s.season_number > 0).map(s => (
                <option key={s.season_number} value={s.season_number}>
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
                {episodesData.slice(0, visibleEpisodesCount).map(ep => (
                  <div 
                    key={ep.id} 
                    className={`episode-item ${episode === ep.episode_number ? 'playing' : ''}`}
                    onClick={() => { 
                      setEpisode(ep.episode_number); 
                      setLoading(true); 
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                  >
                    <div className="episode-number">{ep.episode_number}</div>
                    <div className="episode-img-wrap">
                      {ep.still_path ? (
                        <Image src={getPosterUrl(ep.still_path, 'w342')} alt={ep.name} fill className="episode-img" />
                      ) : (
                        <div className="episode-img-placeholder" />
                      )}
                      {episode === ep.episode_number && (
                        <div className="episode-playing-overlay">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5,3 19,12 5,21"/></svg>
                        </div>
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
                {episodesData.length > visibleEpisodesCount && (
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
  );
}
