import axios from 'axios';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const tmdbClient = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  timeout: 5000,
  headers: {
    Authorization: `Bearer ${process.env.TMDB_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export const normalizeMovie = (m) => ({
  id: m.id,
  title: m.title || 'Untitled',
  overview: m.overview || 'No overview available.',
  posterUrl: m.poster_path ? `${IMAGE_BASE_URL}/w500${m.poster_path}` : null,
  backdropUrl: m.backdrop_path ? `${IMAGE_BASE_URL}/w1280${m.backdrop_path}` : null,
  rating: m.vote_average ? Number(m.vote_average.toFixed(1)) : 0,
  voteCount: m.vote_count || 0,
  releaseDate: m.release_date || null,
  genres: m.genres ? m.genres.map((g) => g.name) : [],
});

export const tmdbService = {
  async discover({ sortBy = 'popularity.desc', genreId, page = 1 }) {
    const params = {
      sort_by: sortBy,
      page,
      include_adult: false,
    };
    if (genreId) params.with_genres = genreId;

    const res = await tmdbClient.get('/discover/movie', { params });
    return {
      page: res.data.page,
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
      results: res.data.results.map(normalizeMovie),
    };
  },

  async search({ query, page = 1 }) {
    const res = await tmdbClient.get('/search/movie', {
      params: { query, page, include_adult: false },
    });
    return {
      page: res.data.page,
      totalPages: res.data.total_pages,
      totalResults: res.data.total_results,
      results: res.data.results.map(normalizeMovie),
    };
  },

  async getMovieDetails(id) {
    const [details, credits] = await Promise.all([
      tmdbClient.get(`/movie/${id}`),
      tmdbClient.get(`/movie/${id}/credits`),
    ]);

    const normalized = normalizeMovie(details.data);
    return {
      ...normalized,
      runtime: details.data.runtime || null,
      tagline: details.data.tagline || '',
      cast: (credits.data.cast || []).slice(0, 8).map((c) => ({
        id: c.id,
        name: c.name,
        character: c.character,
        profileUrl: c.profile_path ? `${IMAGE_BASE_URL}/w185${c.profile_path}` : null,
      })),
    };
  },

  async getGenres() {
    const res = await tmdbClient.get('/genre/movie/list');
    return res.data.genres;
  },
};