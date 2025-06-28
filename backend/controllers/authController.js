const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// Register a new user
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findByUsername(username);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Username already exists'
      });
    }

    // Check if email already exists
    const existingEmail = await User.findByEmail(email);
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Create new user
    const user = await User.create(username, email, password);

    // Generate JWT token
    const token = generateToken(user.id, user.username);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Username and password are required'
      });
    }

    // Find user by username
    const user = await User.findByUsername(username);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Username not found. Please check your username and try again.'
      });
    }

    // Verify password
    const isValidPassword = await User.verifyPassword(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect password. Please check your password and try again.'
      });
    }

    // Generate JWT token
    const token = generateToken(user.id, user.username);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again later.'
    });
  }
};

// Update profile (name, image)
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name } = req.body;
    let profile_image = null;
    
    if (req.file) {
      profile_image = `/uploads/${req.file.filename}`;
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (profile_image) updateData.profile_image = profile_image;
    
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'No data provided for update' 
      });
    }
    
    await User.updateProfile(userId, updateData);
    const user = await User.getFullProfile(userId);
    
    res.json({ 
      success: true, 
      message: 'Profile updated successfully', 
      data: { user } 
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password and new password are required' 
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    // Get user with password for verification
    const userWithPassword = await User.findByUsername(user.username);
    const isValid = await User.verifyPassword(currentPassword, userWithPassword.password);
    
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        message: 'Current password is incorrect' 
      });
    }
    
    await User.updatePassword(userId, newPassword);
    res.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
};

// Upload profile image (standalone)
const uploadProfileImage = [
  async (req, res) => {
    try {
      const userId = req.user.userId;
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No image uploaded' });
      }
      const profile_image = `/uploads/${req.file.filename}`;
      await User.updateProfile(userId, { profile_image });
      const user = await User.getFullProfile(userId);
      res.json({ success: true, message: 'Profile image updated', data: { user } });
    } catch (error) {
      console.error('Upload profile image error:', error);
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
];

// Update getProfile to return profile_image
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.getFullProfile(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  uploadProfileImage
}; 