import './SkeletonCard.css';

export default function SkeletonCard() {
  return (
    <div className="skeleton-card" aria-hidden="true">
      <div className="skeleton-card__poster" />
      <div className="skeleton-card__body">
        <div className="skeleton-card__line skeleton-card__line--title" />
        <div className="skeleton-card__meta">
          <div className="skeleton-card__line skeleton-card__line--rating" />
          <div className="skeleton-card__line skeleton-card__line--year" />
        </div>
      </div>
    </div>
  );
}