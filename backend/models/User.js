const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  // Create a new user
  static async create(username, email, password) {
    try {
      // Hash the password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      
      const [result] = await pool.execute(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );
      
      return {
        id: result.insertId,
        username,
        email,
        created_at: new Date()
      };
    } catch (error) {
      throw error;
    }
  }

  // Find user by username
  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE username = ?',
        [username]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Find user by ID (with password for verification)
  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, password, profile_image, created_at FROM users WHERE id = ?',
        [id]
      );
      
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }

  // Update user password
  static async updatePassword(userId, newPassword) {
    try {
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
      
      await pool.execute(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, userId]
      );
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Verify password
  static async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Get all users (for admin purposes)
  static async getAll() {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, created_at FROM users ORDER BY created_at DESC'
      );
      
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Delete user
  static async delete(userId) {
    try {
      const [result] = await pool.execute(
        'DELETE FROM users WHERE id = ?',
        [userId]
      );
      
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Update user name and profile image
  static async updateProfile(userId, { name, profile_image }) {
    try {
      const fields = [];
      const params = [];
      
      if (name) {
        fields.push('username = ?');
        params.push(name);
      }
      
      if (profile_image) {
        fields.push('profile_image = ?');
        params.push(profile_image);
      }
      
      if (fields.length === 0) {
        return false;
      }
      
      params.push(userId);
      
      await pool.execute(
        `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
        params
      );
      
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Get full user profile (including profile_image)
  static async getFullProfile(id) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, username, email, profile_image, created_at FROM users WHERE id = ?',
        [id]
      );
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User; 