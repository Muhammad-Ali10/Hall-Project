const { body, validationResult } = require('express-validator');
const { parsePhoneNumber, isValidPhoneNumber } = require('libphonenumber-js');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array(),
    });
  }
  next();
};

exports.validateCustomerOTPLogin = [
  body('phone')
    .trim()
    .custom((value) => {
      if (!value) {
        throw new Error('Phone number is required');
      }
      
      // Validate using libphonenumber-js
      try {
        if (!isValidPhoneNumber(value)) {
          throw new Error('Invalid phone number format');
        }
        // Parse to ensure it's valid
        const phoneNumber = parsePhoneNumber(value);
        if (!phoneNumber.isValid()) {
          throw new Error('Invalid phone number');
        }
        return true;
      } catch (error) {
        if (error.message.includes('Invalid')) {
          throw new Error('Please enter a valid phone number with country code (e.g., +91 99451 18010)');
        }
        throw new Error('Invalid phone number format');
      }
    })
    .customSanitizer((value) => {
      // Normalize to E.164 format for storage
      try {
        const phoneNumber = parsePhoneNumber(value);
        return phoneNumber.format('E.164'); // Returns: +919945118010
      } catch (error) {
        // If parsing fails, return original (validation will catch it)
        return value;
      }
    })
    .withMessage('Invalid phone number'),
  handleValidationErrors,
];

exports.validateOTPVerification = [
  body('phone')
    .trim()
    .custom((value) => {
      if (!value) {
        throw new Error('Phone number is required');
      }
      
      // Validate using libphonenumber-js
      try {
        if (!isValidPhoneNumber(value)) {
          throw new Error('Invalid phone number format');
        }
        const phoneNumber = parsePhoneNumber(value);
        if (!phoneNumber.isValid()) {
          throw new Error('Invalid phone number');
        }
        return true;
      } catch (error) {
        if (error.message.includes('Invalid')) {
          throw new Error('Please enter a valid phone number with country code');
        }
        throw new Error('Invalid phone number format');
      }
    })
    .customSanitizer((value) => {
      // Normalize to E.164 format
      try {
        const phoneNumber = parsePhoneNumber(value);
        return phoneNumber.format('E.164');
      } catch (error) {
        return value;
      }
    })
    .withMessage('Invalid phone number'),
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  handleValidationErrors,
];

exports.validateHallRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('hallName')
    .trim()
    .notEmpty()
    .withMessage('Hall name is required'),
  body('phone')
    .trim()
    .custom((value) => {
      // Remove leading 0 or +92 if present
      const cleaned = value.replace(/^(\+92|0)/, '');
      // Validate: 10 digits starting with 3-9 (Pakistani mobile format)
      if (!/^[3-9]\d{9}$/.test(cleaned)) {
        throw new Error('Invalid phone number. Must be 10 digits starting with 3-9 (e.g., 3070057548)');
      }
      return true;
    })
    .withMessage('Invalid phone number'),
  body('ownerName')
    .trim()
    .notEmpty()
    .withMessage('Owner name is required'),
  body('ownerPhone')
    .trim()
    .custom((value) => {
      // Remove leading 0 or +92 if present
      const cleaned = value.replace(/^(\+92|0)/, '');
      // Validate: 10 digits starting with 3-9 (Pakistani mobile format)
      if (!/^[3-9]\d{9}$/.test(cleaned)) {
        throw new Error('Invalid owner phone number. Must be 10 digits starting with 3-9 (e.g., 3070057548)');
      }
      return true;
    })
    .withMessage('Invalid owner phone number'),
  body('address')
    .custom((value) => {
      // Handle both object and JSON string
      let addressObj = value;
      if (typeof value === 'string') {
        try {
          addressObj = JSON.parse(value);
        } catch (e) {
          throw new Error('Invalid address format');
        }
      }
      if (!addressObj || !addressObj.fullAddress || !addressObj.city) {
        throw new Error('Full address and city are required');
      }
      return true;
    })
    .withMessage('Address is required'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('capacity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Capacity must be at least 1'),
  body('description')
    .optional()
    .isLength({ min: 20 })
    .withMessage('Description must be at least 20 characters'),
  body('privacyPolicyAccepted')
    .custom((value) => {
      // Accept both boolean true and string 'true'
      if (value === true || value === 'true') {
        return true;
      }
      throw new Error('Privacy policy must be accepted');
    })
    .withMessage('Privacy policy must be accepted'),
  handleValidationErrors,
];

exports.validateHallLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

exports.validateServiceProviderRegistration = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('businessName')
    .trim()
    .notEmpty()
    .withMessage('Business name is required'),
  body('category')
    .isIn(['decoration', 'catering', 'photography', 'makeup', 'travel', 'other'])
    .withMessage('Invalid category'),
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Invalid phone number'),
  handleValidationErrors,
];

exports.validateEmailLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Invalid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

