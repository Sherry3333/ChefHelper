import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';

export default function Header() {
  const { isLoggedIn, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // when click outside, close the menu
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [menuOpen]);

  // when route changes, close the menu
  useEffect(() => { setMenuOpen(false); }, [location]);

  function handleLogout() {
    logout();
    setMenuOpen(false);
    navigate('/login');
  }

  return (
    <header className="main-header">
      <Link to="/" className="logo">
        <img src={logo} alt="logo" />
      </Link>
      <nav>
        <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
        <Link to="/fridge-ai" className={location.pathname.startsWith('/fridge-ai') ? 'active' : ''}>Fridge AI</Link>
        <Link to="/my-recipes" className={location.pathname.startsWith('/my-recipes') ? 'active' : ''}>My Recipes</Link>
        {!isLoggedIn ? (
          <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
        ) : (
          <div ref={menuRef} className="profile-menu-wrapper">
            <button
              className={`profile-btn${menuOpen ? ' open' : ''}`}
              onClick={() => setMenuOpen(v => !v)}
            >
              <span role="img" aria-label="profile">👤</span> Profile <span className="profile-arrow">▼</span>
            </button>
            {menuOpen && (
              <div className="profile-dropdown">
                <button onClick={() => { setMenuOpen(false); navigate('/profile'); }} className="profile-menu-item">👤 View Profile</button>
                <button onClick={() => { setMenuOpen(false); navigate('/settings'); }} className="profile-menu-item">⚙️ Settings</button>
                <div className="profile-menu-divider" />
                <button onClick={handleLogout} className="profile-menu-item logout">🚪 Logout</button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}