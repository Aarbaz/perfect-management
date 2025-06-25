import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthProvider';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!user) {
    return null;
  }

  return (
    <div className="sidebar bg-dark text-white" style={{ 
      width: '250px', 
      height: '100vh', 
      position: 'fixed', 
      left: 0, 
      top: 0,
      zIndex: 1000,
      boxShadow: '2px 0 5px rgba(0,0,0,0.1)'
    }}>
      <div className="p-3 border-bottom border-secondary">
        <h4 className="mb-0 text-center">
          <i className="fas fa-parking me-2"></i>
          Pefect System
        </h4>
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

      <nav className="p-3">
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

      <div className="position-absolute bottom-0 w-100 p-3 border-top border-secondary">
        <button 
          onClick={handleLogout}
          className="btn btn-outline-light w-100 d-flex align-items-center justify-content-center"
        >
          <i className="fas fa-sign-out-alt me-2"></i>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar; 