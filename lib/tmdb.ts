// lib/tmdb.ts
// Works in both Server Components (process.env.TMDB_API_KEY) and client (NEXT_PUBLIC_)
const API_KEY =
  process.env.TMDB_API_KEY ||
  process.env.NEXT_PUBLIC_TMDB_API_KEY;

const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE = 'https://image.tmdb.org/t/p';

async function fetchTMDB(endpoint: string, params: Record<string, string> = {}) {
  if (!API_KEY) {
    throw new Error('TMDB API key is missing. Add TMDB_API_KEY to .env.local and restart the server.');
  }
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set('api_key', API_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error(`TMDB fetch failed: ${res.status} on ${endpoint}`);
  return res.json();
}

export const tmdb = {
  getTrending: (type: 'all' | 'movie' | 'tv' = 'all', time: 'day' | 'week' = 'week') =>
    fetchTMDB(`/trending/${type}/${time}`),

  getTrendingRegion: async (region: string, type: 'all' | 'movie' | 'tv' = 'all') => {
    const twoMonthsAgo = new Date(); 
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
    const minDate = twoMonthsAgo.toISOString().split('T')[0];
    
    const movieParams = { 
      with_origin_country: region, 
      sort_by: 'popularity.desc', 
      'primary_release_date.gte': minDate,
      'vote_count.gte': '5' 
    };
    
    const tvParams = { 
      with_origin_country: region, 
      sort_by: 'popularity.desc', 
      'first_air_date.gte': minDate,
      'vote_count.gte': '5' 
    };
    
    if (type === 'movie') return fetchTMDB('/discover/movie', movieParams);
    if (type === 'tv') return fetchTMDB('/discover/tv', tvParams);
    
    // For 'all', fetch both and merge
    const [movies, tv] = await Promise.all([
      fetchTMDB('/discover/movie', movieParams),
      fetchTMDB('/discover/tv', tvParams)
    ]);
    const merged = [...(movies.results || []), ...(tv.results || [])]
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 20);
    return { results: merged };
  },

  getPopularMovies: (page = 1) =>
    fetchTMDB('/movie/popular', { page: String(page) }),

  getTopRatedMovies: (page = 1) =>
    fetchTMDB('/movie/top_rated', { page: String(page) }),

  getNowPlayingMovies: (page = 1) =>
    fetchTMDB('/movie/now_playing', { page: String(page) }),

  getUpcomingMovies: (page = 1) =>
    fetchTMDB('/movie/upcoming', { page: String(page) }),

  getPopularTV: (page = 1) =>
    fetchTMDB('/tv/popular', { page: String(page) }),

  getTopRatedTV: (page = 1) =>
    fetchTMDB('/tv/top_rated', { page: String(page) }),

  getMoviesByGenre: (genreId: number, page = 1, sortBy = 'popularity.desc') =>
    fetchTMDB('/discover/movie', {
      with_genres: String(genreId),
      page: String(page),
      sort_by: sortBy,
    }),

  getTVByGenre: (genreId: number, page = 1) =>
    fetchTMDB('/discover/tv', {
      with_genres: String(genreId),
      page: String(page),
    }),

  getMovieDetails: (id: number) =>
    fetchTMDB(`/movie/${id}`, { append_to_response: 'videos,credits,similar' }),

  getTVDetails: (id: number) =>
    fetchTMDB(`/tv/${id}`, { append_to_response: 'videos,credits,similar' }),

  getTVSeason: (tvId: number, seasonNumber: number) =>
    fetchTMDB(`/tv/${tvId}/season/${seasonNumber}`),

  searchMulti: (query: string, page = 1) =>
    fetchTMDB('/search/multi', { query, page: String(page) }),

  getMovieGenres: () => fetchTMDB('/genre/movie/list'),

  getTVGenres: () => fetchTMDB('/genre/tv/list'),

  // ── Indian Cinema ──────────────────────────────────────────────
  // Bollywood: Hindi-language movies, sorted by popularity
  getBollywood: (page = 1) =>
    fetchTMDB('/discover/movie', {
      with_original_language: 'hi',
      region: 'IN',
      sort_by: 'popularity.desc',
      'vote_count.gte': '50',
      page: String(page),
    }),

  // Top-rated Bollywood
  getTopRatedBollywood: (page = 1) =>
    fetchTMDB('/discover/movie', {
      with_original_language: 'hi',
      region: 'IN',
      sort_by: 'vote_average.desc',
      'vote_count.gte': '200',
      page: String(page),
    }),

  // Tamil movies
  getTamilMovies: (page = 1) =>
    fetchTMDB('/discover/movie', {
      with_original_language: 'ta',
      sort_by: 'popularity.desc',
      'vote_count.gte': '50',
      page: String(page),
    }),

  // Telugu movies
  getTeluguMovies: (page = 1) =>
    fetchTMDB('/discover/movie', {
      with_original_language: 'te',
      sort_by: 'popularity.desc',
      'vote_count.gte': '50',
      page: String(page),
    }),

  // South Indian (Malayalam + Kannada)
  getSouthIndian: (page = 1) =>
    fetchTMDB('/discover/movie', {
      with_original_language: 'ml|kn',
      sort_by: 'popularity.desc',
      'vote_count.gte': '30',
      page: String(page),
    }),

  // Indian TV shows
  getIndianTV: (page = 1) =>
    fetchTMDB('/discover/tv', {
      with_original_language: 'hi',
      sort_by: 'popularity.desc',
      page: String(page),
    }),

  // New Indian releases (last 6 months)
  getNewIndianMovies: (page = 1) => {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return fetchTMDB('/discover/movie', {
      region: 'IN',
      sort_by: 'release_date.desc',
      'primary_release_date.gte': sixMonthsAgo.toISOString().split('T')[0],
      'vote_count.gte': '10',
      page: String(page),
    });
  },

  // ── Hollywood ─────────────────────────────────────────────────
  // Hollywood blockbusters (English, USA origin, high vote count)
  getHollywoodBlockbusters: (page = 1) =>
    fetchTMDB('/discover/movie', {
      with_original_language: 'en',
      region: 'US',
      sort_by: 'popularity.desc',
      'vote_count.gte': '500',
      page: String(page),
    }),

  // Hollywood top-rated classics & modern hits
  getHollywoodTopRated: (page = 1) =>
    fetchTMDB('/discover/movie', {
      with_original_language: 'en',
      region: 'US',
      sort_by: 'vote_average.desc',
      'vote_count.gte': '1000',
      page: String(page),
    }),

  // Hollywood new releases (last 3 months)
  getHollywoodNew: (page = 1) => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return fetchTMDB('/discover/movie', {
      with_original_language: 'en',
      region: 'US',
      sort_by: 'release_date.desc',
      'primary_release_date.gte': threeMonthsAgo.toISOString().split('T')[0],
      'vote_count.gte': '50',
      page: String(page),
    });
  },

  // Hollywood Action movies
  getHollywoodAction: (page = 1) =>
    fetchTMDB('/discover/movie', {
      with_original_language: 'en',
      with_genres: '28',
      sort_by: 'popularity.desc',
      'vote_count.gte': '300',
      page: String(page),
    }),

  // American TV shows
  getAmericanTV: (page = 1) =>
    fetchTMDB('/discover/tv', {
      with_original_language: 'en',
      sort_by: 'popularity.desc',
      page: String(page),
    }),
};

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  media_type?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export function getPosterUrl(path: string | null, size = 'w342') {
  return path ? `${IMAGE_BASE}/${size}${path}` : '/placeholder.jpg';
}

export function getBackdropUrl(path: string | null, size = 'w1280') {
  return path ? `${IMAGE_BASE}/${size}${path}` : '/placeholder-backdrop.jpg';
}

export function getYear(dateStr?: string) {
  return dateStr ? new Date(dateStr).getFullYear() : 'N/A';
}

export function getRating(vote: number) {
  return vote.toFixed(1);
}
