const { body, validationResult } = require('express-validator');

// Handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User registration validation
const validateRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Username must be between 3 and 50 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/\d/)
    .withMessage('Password must contain at least one number'),
  
  handleValidationErrors
];

// User login validation
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('Username is required'),
  
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  
  handleValidationErrors
];

// Vehicle entry validation
const validateVehicleEntry = [
  body('vehicle_type')
    .isIn(['Car', 'Bike', 'Auto'])
    .withMessage('Vehicle type must be Car, Bike, or Auto'),
  
  body('customer_name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Customer name must be between 2 and 100 characters'),
  
  body('mobile_number')
    .trim()
    .matches(/^[0-9+\-\s()]+$/)
    .withMessage('Please provide a valid mobile number'),
  
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  
  body('payment_status')
    .optional()
    .isIn(['Paid', 'Unpaid'])
    .withMessage('Payment status must be Paid or Unpaid'),
  
  body('entry_date')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date'),
  
  body('vehicle_number')
    .trim()
    .isLength({ min: 4, max: 20 })
    .withMessage('Vehicle number must be between 4 and 20 characters')
    .matches(/^[A-Za-z0-9-]+$/)
    .withMessage('Vehicle number must be alphanumeric (letters, numbers, hyphens only)'),
  
  handleValidationErrors
];

// Date range validation
const validateDateRange = [
  body('start_date')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),
  
  body('end_date')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date'),
  
  handleValidationErrors
];

module.exports = {
  validateRegistration,
  validateLogin,
  validateVehicleEntry,
  validateDateRange,
  handleValidationErrors
}; 