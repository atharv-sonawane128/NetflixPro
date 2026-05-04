import { tmdb, Movie } from '@/lib/tmdb';
import HeroBanner from '@/components/HeroBanner';
import MovieRow from '@/components/MovieRow';
import ContinueWatchingRow from '@/components/ContinueWatchingRow';

export const revalidate = 3600;

export default async function HomePage() {
  const [
    trending,
    bollywood,
    topRatedBollywood,
    tamilMovies,
    teluguMovies,
    newIndian,
    indianTV,
    hollywoodBlockbusters,
    hollywoodTopRated,
    hollywoodNew,
    hollywoodAction,
    americanTV,
    nowPlaying,
    upcoming,
  ] = await Promise.all([
    tmdb.getTrending('all', 'week'),
    tmdb.getBollywood(),
    tmdb.getTopRatedBollywood(),
    tmdb.getTamilMovies(),
    tmdb.getTeluguMovies(),
    tmdb.getNewIndianMovies(),
    tmdb.getIndianTV(),
    tmdb.getHollywoodBlockbusters(),
    tmdb.getHollywoodTopRated(),
    tmdb.getHollywoodNew(),
    tmdb.getHollywoodAction(),
    tmdb.getAmericanTV(),
    tmdb.getNowPlayingMovies(),
    tmdb.getUpcomingMovies(),
  ]);

  // Hero: mix of trending + top Bollywood + top Hollywood with backdrop
  const heroPool: Movie[] = [
    ...trending.results,
    ...bollywood.results,
    ...hollywoodBlockbusters.results,
  ]
    .filter((m: Movie, i: number, arr: Movie[]) =>
      m.backdrop_path && arr.findIndex((x: Movie) => x.id === m.id) === i
    )
    .slice(0, 10);

  const heroSlides = heroPool.map((movie: Movie) => ({
    movie,
    mediaType: (movie.media_type === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv',
  }));

  return (
    <div className="home-page">
      <HeroBanner slides={heroSlides} />

      <div className="rows-wrapper">
        <ContinueWatchingRow />

        {/* ── TRENDING ── */}
        <div className="rows-category-label">🌍 Trending Globally</div>
        <MovieRow
          title="Trending This Week"
          movies={trending.results.slice(0, 20)}
          emoji="🔥"
        />

        {/* ── INDIAN CINEMA ── */}
        <div className="rows-category-label">🇮🇳 Indian Cinema</div>

        <MovieRow
          title="Bollywood Hits"
          movies={bollywood.results.slice(0, 20)}
          mediaType="movie"
          emoji="🎬"
        />
        <MovieRow
          title="Top Rated Bollywood"
          movies={topRatedBollywood.results.slice(0, 20)}
          mediaType="movie"
          emoji="⭐"
        />
        <MovieRow
          title="New Indian Releases"
          movies={newIndian.results.slice(0, 20)}
          mediaType="movie"
          emoji="🆕"
        />
        <MovieRow
          title="Tamil Cinema"
          movies={tamilMovies.results.slice(0, 20)}
          mediaType="movie"
          emoji="🎭"
        />
        <MovieRow
          title="Telugu Blockbusters"
          movies={teluguMovies.results.slice(0, 20)}
          mediaType="movie"
          emoji="🏆"
        />
        <MovieRow
          title="Indian Web Series"
          movies={indianTV.results.slice(0, 20)}
          mediaType="tv"
          emoji="📺"
        />

        {/* ── HOLLYWOOD ── */}
        <div className="rows-category-label">🎥 Hollywood</div>

        <MovieRow
          title="Hollywood Blockbusters"
          movies={hollywoodBlockbusters.results.slice(0, 20)}
          mediaType="movie"
          emoji="🍿"
        />
        <MovieRow
          title="Hollywood Classics & Top Rated"
          movies={hollywoodTopRated.results.slice(0, 20)}
          mediaType="movie"
          emoji="🌟"
        />
        <MovieRow
          title="New Hollywood Releases"
          movies={hollywoodNew.results.slice(0, 20)}
          mediaType="movie"
          emoji="🚀"
        />
        <MovieRow
          title="Hollywood Action"
          movies={hollywoodAction.results.slice(0, 20)}
          mediaType="movie"
          emoji="💥"
        />
        <MovieRow
          title="American TV Shows"
          movies={americanTV.results.slice(0, 20)}
          mediaType="tv"
          emoji="📡"
        />

        {/* ── NOW PLAYING & UPCOMING ── */}
        <div className="rows-category-label">🎦 In Cinemas</div>
        <MovieRow
          title="Now Playing"
          movies={nowPlaying.results.slice(0, 20)}
          mediaType="movie"
          emoji="🎦"
        />
        <MovieRow
          title="Coming Soon"
          movies={upcoming.results.slice(0, 20)}
          mediaType="movie"
          emoji="📅"
        />

      </div>
    </div>
  );
}
