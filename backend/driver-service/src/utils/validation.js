const { validationResult } = require('express-validator');

exports.validateDriverData = [
  // Validate ID format
  body('_id')
    .matches(/^DRIV-\d{8}$/)
    .withMessage('Driver ID must follow DRIV-12345678 format'),
    
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