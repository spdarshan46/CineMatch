import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMovieDetails, getWishlist, saveToWishlist, deleteFromWishlist } from '../api/client';

export default function MovieDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: movie, isLoading, isError } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => getMovieDetails(id),
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
  });

  const isWishlisted = wishlist.some((w) => w.movieId === Number(id));

  const wishlistMutation = useMutation({
    mutationFn: () => (isWishlisted ? deleteFromWishlist(id) : saveToWishlist({ ...movie, movieId: Number(id) })),
    onSuccess: () => queryClient.invalidateQueries(['wishlist']),
  });

  if (isLoading) return <p style={{ color: '#94a3b8' }}>Loading movie details...</p>;
  if (isError || !movie) return <p style={{ color: '#f87171' }}>Failed to load movie information.</p>;

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        style={{
          background: '#1e293b',
          color: '#f8fafc',
          border: '1px solid #334155',
          padding: '8px 16px',
          borderRadius: '6px',
          cursor: 'pointer',
          marginBottom: '24px',
        }}
      >
        ← Back
      </button>

      <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
        <div style={{ width: '280px', height: '420px', borderRadius: '10px', overflow: 'hidden', background: '#334155' }}>
          {movie.posterUrl && (
            <img src={movie.posterUrl} alt={movie.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>

        <div style={{ flex: '1 1 400px' }}>
          <h1 style={{ margin: '0 0 8px 0', fontSize: '2rem' }}>{movie.title}</h1>
          {movie.tagline && (
            <p style={{ fontStyle: 'italic', color: '#94a3b8', margin: '0 0 16px 0' }}>"{movie.tagline}"</p>
          )}

          <div style={{ display: 'flex', gap: '16px', marginBottom: '20px', color: '#cbd5e1', fontSize: '0.9rem' }}>
            <span>★ {movie.rating} / 10 ({movie.voteCount} reviews)</span>
            <span>⏱ {movie.runtime ? `${movie.runtime} min` : 'Unknown duration'}</span>
            <span>📅 {movie.releaseDate || 'Unreleased'}</span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
            {movie.genres.map((g) => (
              <span
                key={g}
                style={{ padding: '4px 10px', background: '#334155', borderRadius: '16px', fontSize: '0.8rem' }}
              >
                {g}
              </span>
            ))}
          </div>

          <button
            onClick={() => wishlistMutation.mutate()}
            style={{
              padding: '10px 24px',
              borderRadius: '6px',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
              background: isWishlisted ? '#ef4444' : '#38bdf8',
              color: isWishlisted ? '#fff' : '#0f172a',
              marginBottom: '24px',
            }}
          >
            {isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          </button>

          <h3>Overview</h3>
          <p style={{ lineHeight: '1.6', color: '#cbd5e1' }}>{movie.overview}</p>
        </div>
      </div>
    </div>
  );
}