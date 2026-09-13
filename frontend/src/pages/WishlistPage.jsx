import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWishlist, deleteFromWishlist } from '../api/client';
import MovieCard from '../components/MovieCard';

export default function WishlistPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: wishlist = [], isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
  });

  const removeMutation = useMutation({
    mutationFn: (id) => deleteFromWishlist(id),
    onSuccess: () => queryClient.invalidateQueries(['wishlist']),
  });

  if (isLoading) return <p style={{ color: '#94a3b8' }}>Loading your wishlist...</p>;

  return (
    <div>
      <h2 style={{ marginBottom: '20px' }}>Your Saved Wishlist ({wishlist.length})</h2>
      {wishlist.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
          <p>Your wishlist is currently empty.</p>
          <button
            onClick={() => navigate('/')}
            style={{ padding: '8px 16px', background: '#38bdf8', color: '#0f172a', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '12px' }}
          >
            Discover Movies
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {wishlist.map((item) => (
            <MovieCard
              key={item.movieId}
              movie={{ ...item, id: item.movieId }}
              onClick={() => navigate(`/movie/${item.movieId}`)}
              isWishlisted={true}
              onToggleWishlist={(m) => removeMutation.mutate(m.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}