import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

export const getMovies = async ({ query, genreId, sortBy, page = 1 }, signal) => {
  if (query) {
    const res = await api.get('/movies/search', { params: { q: query, page }, signal });
    return res.data;
  }
  const res = await api.get('/movies/discover', { params: { genreId, sortBy, page }, signal });
  return res.data;
};

export const getMovieDetails = async (id) => (await api.get(`/movies/${id}`)).data;
export const getGenres = async () => (await api.get('/movies/genres')).data;
export const getWishlist = async () => (await api.get('/wishlist')).data;
export const saveToWishlist = async (movie) => (await api.post('/wishlist', movie)).data;
export const deleteFromWishlist = async (movieId) => (await api.delete(`/wishlist/${movieId}`)).data;