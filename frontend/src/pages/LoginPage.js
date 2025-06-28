import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../utils/axios';
import { AuthContext } from '../context/AuthProvider';
import { toast } from 'react-toastify';
import '../styles/auth.css';

const LoginPage = () => {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
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
    }
    
    if (!form.password) {
      newErrors.password = 'Password is required';
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
      const res = await api.post('/api/auth/login', form);
      await login(res.data.data.token);
      toast.success('Login successful! Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      
      const errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
      
      if (err.response?.status === 401) {
        if (errorMessage.includes('Username not found')) {
          setErrors({ username: 'Username not found' });
          toast.error('Username not found. Please check your username.');
        } else if (errorMessage.includes('Incorrect password')) {
          setErrors({ password: 'Incorrect password' });
          toast.error('Incorrect password. Please check your password.');
        } else {
          toast.error('Invalid credentials. Please check your username and password.');
        }
      } else if (err.response?.status === 400) {
        toast.error(errorMessage);
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
            <i className="fas fa-car"></i>
          </div>
          <h1 className="auth-left-title">Perfect Management</h1>
          <p className="auth-left-subtitle">
            Welcome back! Sign in to manage your Perfect system with ease and efficiency.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-right">
        <div className="auth-form-container">
          <h2 className="auth-form-title">Welcome Back</h2>
          <p className="auth-form-subtitle">Sign in to your account</p>
          
          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group">
              <input
                type="text"
                name="username"
                className={`form-input ${errors.username ? 'error' : ''}`}
                value={form.username}
                onChange={handleChange}
                placeholder="Enter your username"
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
                type="password"
                name="password"
                className={`form-input ${errors.password ? 'error' : ''}`}
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
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

            <button
              type="submit"
              className="auth-submit-btn"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="loading-spinner me-2"></span>
                  Signing In...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="auth-link-container">
            <span className="text-muted">Don't have an account? </span>
            <Link to="/register" className="auth-link">
              <i className="fas fa-user-plus me-1"></i>
              Create Account
            </Link>
          </div>

          {/* Demo Credentials */}
          {/* <div className="demo-credentials">
            <h6><i className="fas fa-info-circle me-2"></i>Demo Account</h6>
            <p><strong>Username:</strong> admin</p>
            <p><strong>Password:</strong> admin123</p>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 