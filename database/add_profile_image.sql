-- Migration script to add profile_image column to users table
-- Run this script if you have an existing database without the profile_image column

USE vehicle_hspr;

-- Add profile_image column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image VARCHAR(255) DEFAULT NULL;

-- Verify the column was added
DESCRIBE users; 