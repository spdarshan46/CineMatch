import { Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import DiscoverPage from './pages/DiscoverPage';
import MovieDetailPage from './pages/MovieDetailPage';
import WishlistPage from './pages/WishlistPage';
import './App.css';

export default function App() {
  return (
    <div className="app">
      <Header />

      <main className="app__main">
        <Routes>
          <Route path="/" element={<DiscoverPage />} />
          <Route path="/movie/:id" element={<MovieDetailPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
        </Routes>
      </main>
    </div>
  );
}