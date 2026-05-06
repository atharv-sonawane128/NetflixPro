'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { tmdb, Movie } from '@/lib/tmdb';
import Image from 'next/image';
import { getPosterUrl } from '@/lib/tmdb';

const GENRES = [
  { id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' }, { id: 878, name: 'Sci-Fi' }, { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' }, { id: 10749, name: 'Romance' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchRef.current?.focus(), 100);
  }, [searchOpen]);

  async function handleSearch(query: string) {
    setSearchQuery(query);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (!query.trim()) { setSearchResults([]); return; }
    setSearching(true);
    searchTimeout.current = setTimeout(async () => {
      try {
        const data = await tmdb.searchMulti(query);
        setSearchResults(data.results.filter((r: Movie) => r.poster_path).slice(0, 8));
      } finally { setSearching(false); }
    }, 400);
  }

  function handleResultClick(movie: Movie) {
    setSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
    const type = movie.media_type === 'tv' ? 'tv' : 'movie';
    router.push(`/watch/${type}/${movie.id}`);
  }

  async function handleLogout() {
    await logout();
    router.push('/');
  }

  const initials = user?.displayName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || user?.email?.[0]?.toUpperCase() || 'U';

  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/movies', label: 'Movies' },
    { href: '/series', label: 'TV Series' },
    { href: '/trending', label: 'Trending' },
    { href: '/mylist', label: 'My List' },
  ];

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-container">
          {/* Logo */}
          <Link href="/" className="nav-logo">
            <span className="logo-sv">Netflix</span><span className="logo-vault"> Pro</span>
          </Link>

          {/* Desktop Nav Links */}
          <ul className="nav-links">
            {navLinks.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={`nav-link ${pathname === href ? 'active' : ''}`}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="nav-actions">
            {/* Search */}
            <div className={`nav-search-wrap ${searchOpen ? 'open' : ''}`}>
              <button className="nav-icon-btn" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
              </button>
              {searchOpen && (
                <div className="search-dropdown">
                  <div className="search-input-wrap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => handleSearch(e.target.value)}
                      placeholder="Search movies, shows..."
                      className="search-input"
                    />
                    {searchQuery && <button onClick={() => { setSearchQuery(''); setSearchResults([]); }} className="search-clear">✕</button>}
                  </div>
                  {(searching || searchResults.length > 0) && (
                    <div className="search-results">
                      {searching && <div className="search-loading"><div className="spinner-sm" /></div>}
                      {searchResults.map((movie) => (
                        <button key={movie.id} className="search-result-item" onClick={() => handleResultClick(movie)}>
                          <Image src={getPosterUrl(movie.poster_path, 'w92')} alt={movie.title || movie.name || ''} width={36} height={54} className="result-poster" />
                          <div className="result-info">
                            <span className="result-title">{movie.title || movie.name}</span>
                            <span className="result-type">{movie.media_type === 'tv' ? 'TV Series' : 'Movie'}</span>
                          </div>
                          <span className="result-rating">★ {movie.vote_average.toFixed(1)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell */}
            <button className="nav-icon-btn notif-bell" aria-label="Notifications">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              <span className="notif-dot" />
            </button>

            {/* User */}
            {user && (
              <div className="user-menu-wrap">
                <button className="user-avatar" onClick={() => setProfileOpen(!profileOpen)} aria-label="Profile">
                  {user.photoURL
                    ? <Image src={user.photoURL} alt="avatar" width={34} height={34} className="avatar-img" />
                    : <span className="avatar-initials">{initials}</span>
                  }
                </button>
                {profileOpen && (
                  <div className="profile-dropdown">
                    <div className="profile-header">
                      <div className="profile-avatar-lg">
                        {user.photoURL
                          ? <Image src={user.photoURL} alt="avatar" width={48} height={48} className="avatar-img" />
                          : <span className="avatar-initials-lg">{initials}</span>
                        }
                      </div>
                      <div>
                        <p className="profile-name">{user.displayName || 'User'}</p>
                        <p className="profile-email">{user.email}</p>
                      </div>
                    </div>
                    <hr className="profile-divider" />
                    <Link href="/mylist" className="profile-menu-item" onClick={() => setProfileOpen(false)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>
                      My List
                    </Link>
                    <button className="profile-menu-item logout" onClick={handleLogout}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger */}
            <button className={`hamburger ${mobileOpen ? 'open' : ''}`} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-menu-inner">
          {navLinks.map(({ href, label }) => (
            <Link key={href} href={href} className={`mobile-nav-link ${pathname === href ? 'active' : ''}`} onClick={() => setMobileOpen(false)}>
              {label}
            </Link>
          ))}
          <hr className="mobile-divider" />
          <div className="mobile-genres">
            <p className="mobile-section-title">Browse by Genre</p>
            <div className="genre-chips">
              {GENRES.map((g) => (
                <Link key={g.id} href={`/movies?genre=${g.id}&name=${g.name}`} className="genre-chip" onClick={() => setMobileOpen(false)}>
                  {g.name}
                </Link>
              ))}
            </div>
          </div>
          {user && (
            <button className="mobile-logout-btn" onClick={() => { handleLogout(); setMobileOpen(false); }}>Sign Out</button>
          )}
        </div>
      </div>
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
      {searchOpen && !searchQuery && <div className="search-overlay" onClick={() => setSearchOpen(false)} />}
    </>
  );
}
