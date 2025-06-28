import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && isOpen && !event.target.closest('.sidebar') && !event.target.closest('.hamburger-btn')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isOpen]);

  // Close sidebar when route changes on mobile
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Hamburger Button for Mobile */}
      <button
        className="hamburger-btn d-md-none position-fixed"
        onClick={toggleSidebar}
        style={{
          top: '1rem',
          left: '1rem',
          zIndex: 1001,
          background: '#343a40',
          border: 'none',
          borderRadius: '5px',
          padding: '0.5rem',
          color: 'white',
          boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
        }}
      >
        <i className={`fas ${isOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </button>

      {/* Overlay for Mobile */}
      {isMobile && isOpen && (
        <div
          className="sidebar-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 999
          }}
          onClick={() => setIsOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`sidebar bg-dark text-white ${isMobile ? (isOpen ? 'sidebar-open' : 'sidebar-closed') : ''}`}
        style={{ 
          width: isMobile ? '280px' : '250px', 
          height: '100vh', 
          position: 'fixed', 
          left: isMobile ? (isOpen ? '0' : '-280px') : '0', 
          top: 0,
          zIndex: 1000,
          boxShadow: '2px 0 5px rgba(0,0,0,0.1)',
          transition: isMobile ? 'left 0.3s ease' : 'none',
          overflowY: 'auto'
        }}
      >
        <div className="p-3 border-bottom border-secondary">
          <div className="d-flex align-items-center justify-content-between">
            <h4 className="mb-0">
              <i className="fas fa-parking me-2"></i>
              Perfect System
            </h4>
            {isMobile && (
              <button
                onClick={() => setIsOpen(false)}
                className="btn btn-link text-white p-0"
                style={{ fontSize: '1.2rem' }}
              >
                <i className="fas fa-times"></i>
              </button>
            )}
          </div>
        </div>
        
        <div className="p-4 border-bottom border-secondary">
          <div className="d-flex align-items-center justify-content-center">
            <div style={{ width: 48, height: 48 }}>
              {user.profile_image ? (
                <img
                  src={user.profile_image.startsWith('/uploads') ? `http://localhost:8080${user.profile_image}` : user.profile_image}
                  alt={user.username + ' profile'}
                  className="rounded-circle border"
                  style={{ width: 48, height: 48, objectFit: 'cover', background: '#f0f0f0', border: '2px solid #495057' }}
                  onError={e => { e.target.onerror = null; e.target.src = '/default-avatar.png'; }}
                />
              ) : (
                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                  <i className="fas fa-user text-white fs-3"></i>
                </div>
              )}
            </div>
            <div className="ms-3 text-start">
              <div className="fw-bold text-white" style={{ fontSize: '1.1rem', lineHeight: 1 }}>{user.username}</div>
              <small className="text-muted">Administrator</small>
            </div>
          </div>
        </div>

        <nav className="p-3 flex-grow-1">
          <ul className="nav flex-column">
            <li className="nav-item mb-2">
              <Link 
                to="/dashboard" 
                className={`nav-link d-flex align-items-center p-2 rounded ${isActive('/dashboard') ? 'bg-primary text-white' : 'text-white-50'}`}
                style={{ textDecoration: 'none' }}
              >
                <i className="fas fa-tachometer-alt me-3"></i>
                Dashboard
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link 
                to="/data-entry" 
                className={`nav-link d-flex align-items-center p-2 rounded ${isActive('/data-entry') ? 'bg-primary text-white' : 'text-white-50'}`}
                style={{ textDecoration: 'none' }}
              >
                <i className="fas fa-plus-circle me-3"></i>
                Data Entry
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link 
                to="/reports" 
                className={`nav-link d-flex align-items-center p-2 rounded ${isActive('/reports') ? 'bg-primary text-white' : 'text-white-50'}`}
                style={{ textDecoration: 'none' }}
              >
                <i className="fas fa-chart-bar me-3"></i>
                Reports
              </Link>
            </li>
            <li className="nav-item mb-2">
              <Link 
                to="/profile" 
                className={`nav-link d-flex align-items-center p-2 rounded ${isActive('/profile') ? 'bg-primary text-white' : 'text-white-50'}`}
                style={{ textDecoration: 'none' }}
              >
                <i className="fas fa-user-circle me-2"></i>
                Profile
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-3 border-top border-secondary">
          <button 
            onClick={handleLogout}
            className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
          >
            <i className="fas fa-sign-out-alt me-2"></i>
            Logout
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar; 