const { body, validationResult } = require('express-validator');

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

exports.validateBookingCreate = [
  body('hall')
    .notEmpty()
    .withMessage('Valid hall ID is required'),
  body('eventDate')
    .notEmpty()
    .withMessage('Valid event date is required')
    .custom((value) => {
      const eventDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (eventDate < today) {
        throw new Error('Event date cannot be in the past');
      }
      return true;
    }),
  body('eventType')
    .isIn(['wedding', 'corporate', 'birthday', 'conference', 'exhibition', 'other'])
    .withMessage('Invalid event type'),
  body('attendeeDetails')
    .custom((value) => {
      let parsed = value;
      if (typeof value === 'string') {
        try {
          parsed = JSON.parse(value);
        } catch (e) {
          throw new Error('Invalid attendee details format');
        }
      }
      if (!parsed.name || !parsed.phone) {
        throw new Error('Attendee name and phone are required');
      }
      if (!/^[6-9]\d{9}$/.test(parsed.phone)) {
        throw new Error('Invalid phone number');
      }
      return true;
    }),
  handleValidationErrors,
];

