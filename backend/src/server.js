import 'dotenv/config'; // Loads .env before anything else imports
import express from 'express';
import cors from 'cors';
import movieRoutes from './routes/movieRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/movies', movieRoutes);
app.use('/api/wishlist', wishlistRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Error]', err.response?.data || err.message);
  const status = err.response?.status || 500;
  res.status(status).json({
    error: true,
    message: err.response?.data?.status_message || err.message || 'Internal Server Error',
  });
});

app.listen(PORT, () => {
  console.log(`Movie API server listening on port ${PORT}`);
});