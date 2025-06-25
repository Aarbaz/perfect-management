-- Vehicle Parking Management System Database Schema
-- Run this script in your MySQL database (XAMPP)

-- Create database if not exists
CREATE DATABASE IF NOT EXISTS vehicle_hspr;
USE vehicle_hspr;

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Vehicles table for parking entries
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_type ENUM('Car', 'Bike', 'Auto') NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(15) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('Paid', 'Unpaid') DEFAULT 'Unpaid',
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_vehicles_entry_date ON vehicles(entry_date);
CREATE INDEX idx_vehicles_vehicle_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_payment_status ON vehicles(payment_status);
CREATE INDEX idx_vehicles_customer_name ON vehicles(customer_name);

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password) VALUES 
('admin', 'admin@parking.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2i')
ON DUPLICATE KEY UPDATE username=username;

-- Insert sample vehicle data
INSERT INTO vehicles (vehicle_type, customer_name, mobile_number, amount, payment_status, entry_date) VALUES
('Car', 'John Doe', '1234567890', 50.00, 'Paid', CURDATE()),
('Bike', 'Jane Smith', '9876543210', 20.00, 'Unpaid', CURDATE()),
('Auto', 'Mike Johnson', '5555555555', 30.00, 'Paid', CURDATE()),
('Car', 'Sarah Wilson', '1111111111', 45.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('Bike', 'Tom Brown', '2222222222', 15.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('Auto', 'Lisa Davis', '3333333333', 25.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
('Car', 'David Miller', '4444444444', 60.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
('Bike', 'Emma Wilson', '5555555555', 18.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
('Auto', 'Chris Taylor', '6666666666', 35.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
('Car', 'Anna Garcia', '7777777777', 55.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 4 DAY));

-- Show tables
SHOW TABLES;

-- Show sample data
SELECT 'Users Table:' as Table_Name;
SELECT id, username, email, created_at FROM users;

SELECT 'Vehicles Table (Recent 5 entries):' as Table_Name;
SELECT id, vehicle_type, customer_name, mobile_number, amount, payment_status, entry_date 
FROM vehicles 
ORDER BY created_at DESC 
LIMIT 5; 