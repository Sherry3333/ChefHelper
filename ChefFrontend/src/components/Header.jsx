import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false); // desktop dropdown
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false); // mobile submenu
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // when click outside, close the menu
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
        setProfileOpen(false);
        setMobileProfileOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // when route changes, close the menu
  useEffect(() => { setMenuOpen(false); setProfileOpen(false); setMobileProfileOpen(false); }, [location]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
    setMobileProfileOpen(false);
    navigate('/login');
  }

  return (
    <header className="main-header">
      <Link to="/" className="logo">
        <img src={logo} alt="logo" />
      </Link>
      <button
        className={`hamburger-btn${menuOpen ? ' open' : ''}`}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        role="button"
        onClick={() => setMenuOpen(v => !v)}
      >
        {menuOpen ? (
          <span className="close-icon">&#10005;</span>
        ) : (
          <span className="hamburger-icon" />
        )}
      </button>
      <nav className={`main-nav${menuOpen ? ' open' : ''}`} ref={menuRef}>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        <Link to="/fridge-ai" className={location.pathname.startsWith('/fridge-ai') ? 'active' : ''}>Fridge AI</Link>
        <Link to="/my-recipes" className={location.pathname.startsWith('/my-recipes') ? 'active' : ''}>My Recipes</Link>
        {!isLoggedIn ? (
          <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
        ) : (
          <>
            {/* Desktop: Profile dropdown */}
            <div className="profile-menu-wrapper desktop-only">
              <button
                className={`profile-btn${profileOpen ? ' open' : ''}`}
                onClick={() => setProfileOpen(v => !v)}
                aria-label="Profile menu"
              >
                <span role="img" aria-label="profile">👤</span> Profile <span className="profile-arrow">▼</span>
              </button>
              {profileOpen && (
                <div className="profile-dropdown">
                  <button onClick={() => { setProfileOpen(false); navigate('/profile'); }} className="profile-menu-item">👤 View Profile</button>
                  <button onClick={() => { setProfileOpen(false); navigate('/settings'); }} className="profile-menu-item">⚙️ Settings</button>
                  <div className="profile-menu-divider" />
                  <button onClick={handleLogout} className="profile-menu-item logout">🚪 Logout</button>
                </div>
              )}
            </div>
            {/* Mobile: Profile as collapsible top-level menu item */}
            <div className="mobile-only profile-mobile-menu">
              <button
                className={`profile-mobile-btn${mobileProfileOpen ? ' open' : ''}`}
                onClick={() => setMobileProfileOpen(v => !v)}
                aria-label="Profile menu"
              >
                <span role="img" aria-label="profile">👤</span> Profile
                <span className="profile-arrow">{mobileProfileOpen ? '▲' : '▼'}</span>
              </button>
              {mobileProfileOpen && (
                <div className="profile-mobile-submenu">
                  <button onClick={() => { setMenuOpen(false); setMobileProfileOpen(false); navigate('/profile'); }} className="profile-menu-item">👤 View Profile</button>
                  <button onClick={() => { setMenuOpen(false); setMobileProfileOpen(false); navigate('/settings'); }} className="profile-menu-item">⚙️ Settings</button>
                  <div className="profile-menu-divider" />
                  <button onClick={handleLogout} className="profile-menu-item logout">🚪 Logout</button>
                </div>
              )}
            </div>
          </>
        )}
      </nav>
    </header>
  );
}