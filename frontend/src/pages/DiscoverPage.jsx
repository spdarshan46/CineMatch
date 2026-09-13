import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMovies, getGenres, getWishlist, saveToWishlist, deleteFromWishlist } from '../api/client';
import MovieCard from '../components/MovieCard';

export default function DiscoverPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const queryParam = searchParams.get('q') || '';
  const genreParam = searchParams.get('genre') || '';
  const sortParam = searchParams.get('sort') || 'popularity.desc';
  const pageParam = Number(searchParams.get('page')) || 1;

  const [inputVal, setInputVal] = useState(queryParam);

  useEffect(() => {
    setInputVal(queryParam);
  }, [queryParam]);

  // Debounced input search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (inputVal !== queryParam) {
        setSearchParams((prev) => {
          const next = new URLSearchParams(prev);
          if (inputVal.trim()) next.set('q', inputVal.trim());
          else next.delete('q');
          next.set('page', '1');
          return next;
        });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [inputVal]);

  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set(key, value);
      else next.delete(key);
      next.set('page', '1');
      return next;
    });
  };

  const { data: genres = [] } = useQuery({
    queryKey: ['genres'],
    queryFn: getGenres,
    staleTime: 1000 * 60 * 60,
  });

  const { data: wishlist = [] } = useQuery({
    queryKey: ['wishlist'],
    queryFn: getWishlist,
  });

  const { data, isLoading, isError, error, isPlaceholderData } = useQuery({
    queryKey: ['movies', { q: queryParam, genre: genreParam, sort: sortParam, page: pageParam }],
    queryFn: ({ signal }) =>
      getMovies({ query: queryParam, genreId: genreParam, sortBy: sortParam, page: pageParam }, signal),
    placeholderData: (prev) => prev,
  });

  const wishlistMutation = useMutation({
    mutationFn: (movie) => {
      const exists = wishlist.some((w) => w.movieId === movie.id);
      return exists ? deleteFromWishlist(movie.id) : saveToWishlist({ ...movie, movieId: movie.id });
    },
    onMutate: async (movie) => {
      await queryClient.cancelQueries({ queryKey: ['wishlist'] });
      const previous = queryClient.getQueryData(['wishlist']);
      const exists = previous?.some((w) => w.movieId === movie.id);

      queryClient.setQueryData(['wishlist'], (old = []) =>
        exists ? old.filter((w) => w.movieId !== movie.id) : [...old, { ...movie, movieId: movie.id }]
      );
      return { previous };
    },
    onError: (err, movie, context) => {
      queryClient.setQueryData(['wishlist'], context.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    },
  });

  const isWishlisted = (id) => wishlist.some((w) => w.movieId === id);

  return (
    <div>
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '24px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by movie title..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          style={{
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid #334155',
            background: '#1e293b',
            color: '#f8fafc',
            flex: '1 1 240px',
          }}
        />

        {!queryParam && (
          <>
            <select
              value={genreParam}
              onChange={(e) => setFilter('genre', e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#1e293b',
                color: '#f8fafc',
              }}
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>

            <select
              value={sortParam}
              onChange={(e) => setFilter('sort', e.target.value)}
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid #334155',
                background: '#1e293b',
                color: '#f8fafc',
              }}
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="primary_release_date.desc">Release Date (Newest)</option>
            </select>
          </>
        )}
      </div>

      {isLoading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '20px' }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{ height: '360px', background: '#1e293b', borderRadius: '10px', opacity: 0.5 }} />
          ))}
        </div>
      ) : isError ? (
        <div style={{ padding: '40px', background: '#1e293b', borderRadius: '10px', textAlign: 'center', color: '#f87171' }}>
          <h3>Unable to fetch movies</h3>
          <p>{error?.response?.data?.message || error.message || 'Make sure your backend server is running on port 5000.'}</p>
        </div>
      ) : data?.results?.length === 0 ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
          <h3>No titles found</h3>
          <p>Try searching for a different title or resetting your filter.</p>
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '20px',
              opacity: isPlaceholderData ? 0.6 : 1,
            }}
          >
            {data.results.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                onClick={() => navigate(`/movie/${m.id}`)}
                isWishlisted={isWishlisted(m.id)}
                onToggleWishlist={(item) => wishlistMutation.mutate(item)}
              />
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '36px' }}>
            <button
              disabled={pageParam <= 1}
              onClick={() => setFilter('page', String(pageParam - 1))}
              style={{
                padding: '8px 18px',
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '6px',
                cursor: pageParam <= 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </button>
            <span style={{ color: '#94a3b8' }}>
              Page {pageParam} of {data.totalPages}
            </span>
            <button
              disabled={pageParam >= data.totalPages}
              onClick={() => setFilter('page', String(pageParam + 1))}
              style={{
                padding: '8px 18px',
                background: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '6px',
                cursor: pageParam >= data.totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}