const { body, validationResult } = require('express-validator');

exports.validateDriverData = [
  // Validate SSN format
  body('ssn')
    .matches(/^\d{3}-\d{2}-\d{4}$/)
    .withMessage('SSN must follow 123-45-6789 format'),
    
  // Validate email
  body('email')
    .isEmail()
    .normalizeEmail(),
    
  // Validate phone
  body('phoneNumber')
    .matches(/^\+1\d{10}$/)
    .withMessage('Phone must be +1 followed by 10 digits'),
    
  // Validate car year
  body('carDetails.year')
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 }),
    
  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    next();
  }
];

exports.validateDriverUpdate = [
  // Validate SSN format (only if provided)
  body('ssn')
    .optional()
    .matches(/^\d{3}-\d{2}-\d{4}$/)
    .withMessage('SSN must follow 123-45-6789 format'),

  // Validate email (only if provided)
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email format'),

  // Validate phone number (only if provided)
  body('phoneNumber')
    .optional()
    .matches(/^\+1\d{10}$/)
    .withMessage('Phone must be +1 followed by 10 digits'),

  // Validate car year (only if provided)
  body('carDetails.year')
    .optional()
    .isInt({ min: 2000, max: new Date().getFullYear() + 1 })
    .withMessage(`Car year must be between 2000 and ${new Date().getFullYear() + 1}`),

  // Handle validation errors
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array(),
      });
    }
    next();
  },
];