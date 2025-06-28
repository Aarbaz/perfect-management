import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthProvider';
import { toast } from 'react-toastify';
import '../styles/auth.css';

const RegisterPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (form.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
    } else if (form.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setErrors({});
    
    try {
      const res = await api.post('/api/auth/register', {
        username: form.username,
        email: form.email,
        password: form.password
      });
      
      await login(res.data.data.token);
      toast.success('Registration successful! Welcome!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Registration error:', err);
      
      const errorMessage = err.response?.data?.message || 'Registration failed. Please try again.';
      
      if (err.response?.status === 400) {
        if (errorMessage.includes('Username already exists')) {
          setErrors({ username: 'Username already exists' });
        } else if (errorMessage.includes('Email already exists')) {
          setErrors({ email: 'Email already exists' });
        } else {
          toast.error(errorMessage);
        }
      } else if (err.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (!err.response) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Left Side - Animated Image */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-left-icon">
            <i className="fas fa-user-plus"></i>
          </div>
          <h1 className="auth-left-title">Join Us Today</h1>
          <p className="auth-left-subtitle">
            Create your account and start managing your business efficiently. 
            Get access to powerful tools and analytics.
          </p>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Create Account</h2>
          <p className="auth-form-subtitle">Join our perfect management system</p>
          
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <input
                type="text"
                name="username"
                className={`form-input ${errors.username ? 'error' : ''}`}
                value={form.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
                autoFocus
              />
              <i className="fas fa-user form-icon"></i>
              {errors.username && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {errors.username}
                </div>
              )}
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                className={`form-input ${errors.email ? 'error' : ''}`}
                value={form.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
              />
              <i className="fas fa-envelope form-icon"></i>
              {errors.email && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {errors.email}
                </div>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
              <i className="fas fa-lock form-icon"></i>
              {errors.password && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {errors.password}
                </div>
              )}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
              <i className="fas fa-shield-alt form-icon"></i>
              {errors.confirmPassword && (
                <div className="error-message">
                  <i className="fas fa-exclamation-circle me-2"></i>
                  {errors.confirmPassword}
                </div>
              )}
            </div>

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner me-2"></span>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-plus me-2"></i>
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="auth-link-container">
            <span className="text-muted">Already have an account? </span>
            <Link to="/login" className="auth-link">
              <i className="fas fa-sign-in-alt me-1"></i>
              Sign In
            </Link>
          </div>

          {/* Features List */}
          <div className="demo-credentials">
            <h6><i className="fas fa-star me-2"></i>What you'll get</h6>
            <p><i className="fas fa-check me-2 text-success"></i>Business management</p>
            <p><i className="fas fa-check me-2 text-success"></i>Real-time analytics & reports</p>
            <p><i className="fas fa-check me-2 text-success"></i>Export data to Excel/PDF</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 