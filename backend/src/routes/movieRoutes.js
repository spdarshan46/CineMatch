import { Router } from 'express';
import { tmdbService } from '../services/tmdbService.js';
import { cacheMiddleware } from '../middleware/cacheMiddleware.js';

const router = Router();

router.get('/genres', cacheMiddleware(86400), async (req, res, next) => {
  try {
    const genres = await tmdbService.getGenres();
    res.json(genres);
  } catch (err) { next(err); }
});

router.get('/discover', cacheMiddleware(900), async (req, res, next) => {
  try {
    const { sortBy, genreId, page } = req.query;
    const data = await tmdbService.discover({ sortBy, genreId, page: Number(page) || 1 });
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/search', cacheMiddleware(300), async (req, res, next) => {
  try {
    const { q, page } = req.query;
    if (!q) return res.status(400).json({ message: 'Search query "q" is required' });
    const data = await tmdbService.search({ query: q, page: Number(page) || 1 });
    res.json(data);
  } catch (err) { next(err); }
});

router.get('/:id', cacheMiddleware(3600), async (req, res, next) => {
  try {
    const movie = await tmdbService.getMovieDetails(req.params.id);
    res.json(movie);
  } catch (err) { next(err); }
});

export default router;