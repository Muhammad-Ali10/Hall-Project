const { body, query, validationResult } = require('express-validator');

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

exports.validateHallUpdate = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().trim().matches(/^[6-9]\d{9}$/),
  body('capacity').optional().isInt({ min: 1 }),
  body('price').optional().isFloat({ min: 0 }),
  body('eventTypes').optional().isArray(),
  body('amenities').optional().isArray(),
  handleValidationErrors,
];

exports.validateHallSearch = [
  query('city').optional().trim(),
  query('search').optional().trim(),
  query('eventType').optional().isIn(['wedding', 'corporate', 'birthday', 'conference', 'exhibition', 'other']),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('minCapacity').optional().isInt({ min: 1 }),
  query('maxCapacity').optional().isInt({ min: 1 }),
  query('amenities').optional(),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('maxDistance').optional().isFloat({ min: 0 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('sortBy').optional().isIn(['price', 'capacity', 'rating', 'createdAt', 'distance']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  handleValidationErrors,
];

