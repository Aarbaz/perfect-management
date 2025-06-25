-- Sample Data for Vehicle Parking Management System
-- This file contains additional test data

USE vehicle_hspr;

-- Insert more sample vehicle data for testing
INSERT INTO vehicles (vehicle_type, customer_name, mobile_number, amount, payment_status, entry_date) VALUES
-- Today's entries
('Car', 'Robert Chen', '8888888888', 65.00, 'Paid', CURDATE()),
('Bike', 'Maria Rodriguez', '9999999999', 22.00, 'Unpaid', CURDATE()),
('Auto', 'James Lee', '1010101010', 28.00, 'Paid', CURDATE()),
('Car', 'Jennifer Kim', '2020202020', 70.00, 'Paid', CURDATE()),
('Bike', 'Michael Wang', '3030303030', 19.00, 'Unpaid', CURDATE()),

-- Yesterday's entries
('Auto', 'Amanda White', '4040404040', 32.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('Car', 'Daniel Martinez', '5050505050', 58.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('Bike', 'Sophie Anderson', '6060606060', 21.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('Auto', 'Kevin Thompson', '7070707070', 29.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),
('Car', 'Rachel Green', '8080808080', 52.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 1 DAY)),

-- 2 days ago
('Bike', 'Alex Turner', '9090909090', 17.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
('Auto', 'Nina Patel', '1212121212', 31.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
('Car', 'Sam Johnson', '1313131313', 63.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
('Bike', 'Emma Davis', '1414141414', 20.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),
('Auto', 'Chris Wilson', '1515151515', 27.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 2 DAY)),

-- 3 days ago
('Car', 'Lisa Brown', '1616161616', 48.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
('Bike', 'Tom Garcia', '1717171717', 18.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
('Auto', 'Sarah Miller', '1818181818', 33.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
('Car', 'David Taylor', '1919191919', 55.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),
('Bike', 'Anna Chen', '2020202020', 16.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 3 DAY)),

-- 4 days ago
('Auto', 'Mike Rodriguez', '2121212121', 26.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
('Car', 'Jennifer Lee', '2222222222', 67.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
('Bike', 'Robert Kim', '2323232323', 23.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
('Auto', 'Maria Wang', '2424242424', 34.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 4 DAY)),
('Car', 'James White', '2525252525', 49.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 4 DAY)),

-- 5 days ago
('Bike', 'Amanda Martinez', '2626262626', 19.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
('Auto', 'Daniel Anderson', '2727272727', 30.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
('Car', 'Sophie Thompson', '2828282828', 61.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
('Bike', 'Kevin Green', '2929292929', 24.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),
('Auto', 'Rachel Turner', '3030303030', 28.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 5 DAY)),

-- 6 days ago
('Car', 'Alex Patel', '3131313131', 53.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
('Bike', 'Nina Johnson', '3232323232', 21.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
('Auto', 'Sam Davis', '3333333333', 35.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
('Car', 'Emma Wilson', '3434343434', 59.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 6 DAY)),
('Bike', 'Chris Brown', '3535353535', 17.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 6 DAY)),

-- 7 days ago
('Auto', 'Lisa Garcia', '3636363636', 29.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
('Car', 'Tom Miller', '3737373737', 64.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
('Bike', 'Sarah Taylor', '3838383838', 22.00, 'Unpaid', DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
('Auto', 'David Chen', '3939393939', 31.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 7 DAY)),
('Car', 'Anna Rodriguez', '4040404040', 51.00, 'Paid', DATE_SUB(CURDATE(), INTERVAL 7 DAY));

-- Show statistics
SELECT 'Total Vehicles:' as Stat, COUNT(*) as Count FROM vehicles
UNION ALL
SELECT 'Cars:', COUNT(*) FROM vehicles WHERE vehicle_type = 'Car'
UNION ALL
SELECT 'Bikes:', COUNT(*) FROM vehicles WHERE vehicle_type = 'Bike'
UNION ALL
SELECT 'Autos:', COUNT(*) FROM vehicles WHERE vehicle_type = 'Auto'
UNION ALL
SELECT 'Paid:', COUNT(*) FROM vehicles WHERE payment_status = 'Paid'
UNION ALL
SELECT 'Unpaid:', COUNT(*) FROM vehicles WHERE payment_status = 'Unpaid'
UNION ALL
SELECT 'Total Amount:', SUM(amount) FROM vehicles
UNION ALL
SELECT 'Paid Amount:', SUM(amount) FROM vehicles WHERE payment_status = 'Paid'
UNION ALL
SELECT 'Unpaid Amount:', SUM(amount) FROM vehicles WHERE payment_status = 'Unpaid'; 