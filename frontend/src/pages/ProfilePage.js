import React, { useEffect, useState, useRef } from 'react';
import api from '../utils/axios';
import { toast } from 'react-toastify';

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/auth/profile');
      setUser(res.data.data.user);
      setName(res.data.data.user.username);
      setPreview(res.data.data.user.profile_image);
    } catch (err) {
      console.error('Profile fetch error:', err);
      toast.error(err.response?.data?.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNameUpdate = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', name);
      
      const res = await api.put('/api/auth/profile', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      setUser(res.data.data.user);
      setName(res.data.data.user.username);
      setProfileImage(null); // Clear the file input
      toast.success('Profile updated successfully');
    } catch (err) {
      console.error('Profile update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleImageUpdate = async () => {
    if (!profileImage) {
      toast.error('Please select an image first');
      return;
    }
    
    setProfileLoading(true);
    try {
      const formData = new FormData();
      formData.append('profile_image', profileImage);
      
      const res = await api.put('/api/auth/profile', formData, { 
        headers: { 'Content-Type': 'multipart/form-data' } 
      });
      
      setUser(res.data.data.user);
      setPreview(res.data.data.user.profile_image);
      setProfileImage(null); // Clear the file input
      toast.success('Profile image updated successfully');
    } catch (err) {
      console.error('Image update error:', err);
      toast.error(err.response?.data?.message || 'Failed to update profile image');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (passwords.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }
    
    setPwLoading(true);
    try {
      const res = await api.put('/api/auth/password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword
      });
      
      toast.success('Password updated successfully');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error('Password change error:', err);
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div className="container py-4" style={{ maxWidth: 600 }}>
      <h2 className="mb-4">
        <i className="fas fa-user-circle me-2 text-primary"></i>Profile
      </h2>
      
      {/* Profile Information Card */}
      <div className="card shadow-sm mb-4">
        <div className="card-body text-center">
          <div className="mb-3">
            {preview ? (
              <img
                src={preview}
                alt="Profile"
                className="rounded-circle border"
                style={{ width: 100, height: 100, objectFit: 'cover' }}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <div
                className="rounded-circle border default-avatar"
                style={{ width: 100, height: 100 }}
              >
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
          </div>
          
          {/* Image Upload Section */}
          <div className="mb-3">
            <input
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              ref={fileInputRef}
              onChange={handleImageChange}
            />
            <button 
              className="btn btn-outline-primary btn-sm me-2" 
              onClick={() => fileInputRef.current.click()}
            >
              <i className="fas fa-camera me-1"></i> Select Image
            </button>
            {profileImage && (
              <button 
                className="btn btn-primary btn-sm" 
                onClick={handleImageUpdate}
                disabled={profileLoading}
              >
                {profileLoading ? (
                  <span className="spinner-border spinner-border-sm me-2"></span>
                ) : (
                  <i className="fas fa-upload me-1"></i>
                )}
                Upload Image
              </button>
            )}
          </div>
          
          {/* Name Update Form */}
          <form onSubmit={handleNameUpdate} className="mt-3">
            <div className="mb-3 text-start">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={e => setName(e.target.value)}
                minLength={2}
                maxLength={50}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary w-100"
              disabled={profileLoading}
            >
              {profileLoading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="fas fa-save me-2"></i>
              )}
              Update Profile
            </button>
          </form>
        </div>
      </div>
      
      {/* Password Change Card */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="mb-3">
            <i className="fas fa-key me-2 text-secondary"></i>Change Password
          </h5>
          <form onSubmit={handlePasswordChange}>
            <div className="mb-2">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control"
                value={passwords.currentPassword}
                onChange={e => setPasswords({ ...passwords, currentPassword: e.target.value })}
                required
              />
            </div>
            <div className="mb-2">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control"
                value={passwords.newPassword}
                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                minLength={6}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-control"
                value={passwords.confirmPassword}
                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                minLength={6}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-secondary w-100" 
              disabled={pwLoading}
            >
              {pwLoading ? (
                <span className="spinner-border spinner-border-sm me-2"></span>
              ) : (
                <i className="fas fa-save me-2"></i>
              )}
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 