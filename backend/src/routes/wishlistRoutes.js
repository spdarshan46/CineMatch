import { Router } from 'express';
import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import crypto from 'node:crypto';

// Initialize built-in SQLite database in your backend folder
const dbPath = path.resolve(process.cwd(), 'dev.db');
const db = new DatabaseSync(dbPath);

// Create table if it doesn't already exist
db.exec(`
  CREATE TABLE IF NOT EXISTS WishlistItem (
    id TEXT PRIMARY KEY,
    movieId INTEGER UNIQUE NOT NULL,
    title TEXT NOT NULL,
    overview TEXT,
    posterUrl TEXT,
    backdropUrl TEXT,
    rating REAL,
    releaseDate TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const router = Router();

router.get('/', (req, res, next) => {
  try {
    const stmt = db.prepare('SELECT * FROM WishlistItem ORDER BY createdAt DESC');
    const items = stmt.all();
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const { movieId, title, overview, posterUrl, backdropUrl, rating, releaseDate } = req.body;

    if (!movieId || !title) {
      return res.status(400).json({ error: 'movieId and title are required' });
    }

    const id = crypto.randomUUID();
    const numMovieId = Number(movieId);
    const numRating = Number(rating) || 0;

    const upsertStmt = db.prepare(`
      INSERT INTO WishlistItem (id, movieId, title, overview, posterUrl, backdropUrl, rating, releaseDate)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(movieId) DO UPDATE SET
        title = excluded.title,
        overview = excluded.overview,
        posterUrl = excluded.posterUrl,
        backdropUrl = excluded.backdropUrl,
        rating = excluded.rating,
        releaseDate = excluded.releaseDate
    `);

    upsertStmt.run(
      id,
      numMovieId,
      title,
      overview || '',
      posterUrl || null,
      backdropUrl || null,
      numRating,
      releaseDate || null
    );

    const getStmt = db.prepare('SELECT * FROM WishlistItem WHERE movieId = ?');
    const item = getStmt.get(numMovieId);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

router.delete('/:movieId', (req, res, next) => {
  try {
    const delStmt = db.prepare('DELETE FROM WishlistItem WHERE movieId = ?');
    delStmt.run(Number(req.params.movieId));
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;