import { useState } from 'react';
import './MovieCard.css';

export default function MovieCard({ movie, onClick, isWishlisted, onToggleWishlist }) {
  const [imgError, setImgError] = useState(false);

  const showPoster = movie.posterUrl && !imgError;

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    onToggleWishlist(movie);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <article
      className="movie-card"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${movie.title}`}
    >
      <div className="movie-card__poster">
        {showPoster ? (
          <img
            className="movie-card__img"
            src={movie.posterUrl}
            alt={`${movie.title} poster`}
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="movie-card__placeholder" aria-hidden="true">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
            </svg>
            <span>No Poster</span>
          </div>
        )}

        <button
          type="button"
          className={`movie-card__wishlist ${isWishlisted ? 'movie-card__wishlist--active' : ''}`}
          onClick={handleWishlistClick}
          aria-label={isWishlisted ? `Remove ${movie.title} from wishlist` : `Add ${movie.title} to wishlist`}
          aria-pressed={isWishlisted}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={isWishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>

      <div className="movie-card__body">
        <h4 className="movie-card__title" title={movie.title}>
          {movie.title}
        </h4>
        <div className="movie-card__meta">
          <span className="movie-card__rating">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {movie.rating > 0 ? movie.rating.toFixed(1) : 'NR'}
          </span>
          <span className="movie-card__year">
            {movie.releaseDate ? movie.releaseDate.substring(0, 4) : 'N/A'}
          </span>
        </div>
      </div>
    </article>
  );
}