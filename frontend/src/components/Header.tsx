import { Link, NavLink } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Header.css';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  // Header compresses on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll when the drawer is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Close the drawer when the viewport grows past the mobile breakpoint
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 640) setMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <Link to="/" className="header__logo" onClick={closeMenu}>
          <svg
            className="header__logo-mark"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <circle cx="12" cy="12" r="9" />
            <circle cx="12" cy="7" r="1.5" fill="currentColor" />
            <circle cx="12" cy="17" r="1.5" fill="currentColor" />
            <circle cx="7" cy="12" r="1.5" fill="currentColor" />
            <circle cx="17" cy="12" r="1.5" fill="currentColor" />
          </svg>
          <span className="header__logo-text">CineMatch</span>
        </Link>

        {/* Desktop nav */}
        <nav className="header__nav header__nav--desktop">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `header__link ${isActive ? 'header__link--active' : ''}`
            }
          >
            Discover
          </NavLink>
          <NavLink
            to="/wishlist"
            className={({ isActive }) =>
              `header__link ${isActive ? 'header__link--active' : ''}`
            }
          >
            My Wishlist
          </NavLink>
        </nav>

        {/* Mobile hamburger */}
        <button
          type="button"
          className={`header__burger ${menuOpen ? 'header__burger--open' : ''}`}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      {/* Mobile drawer */}
      <div
        className={`mobile-menu__backdrop ${menuOpen ? 'mobile-menu__backdrop--open' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />
      <nav
        id="mobile-menu"
        className={`mobile-menu ${menuOpen ? 'mobile-menu--open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`
          }
          onClick={closeMenu}
        >
          Discover
        </NavLink>
        <NavLink
          to="/wishlist"
          className={({ isActive }) =>
            `mobile-menu__link ${isActive ? 'mobile-menu__link--active' : ''}`
          }
          onClick={closeMenu}
        >
          My Wishlist
        </NavLink>
      </nav>
    </>
  );
}